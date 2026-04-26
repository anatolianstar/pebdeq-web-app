from flask import Blueprint, request, jsonify
from app import db
from app.models.models import User, DesktopLicense, DemoQuotaConfig
from app.utils.decorators import admin_required
from datetime import datetime

desktop_license_bp = Blueprint('desktop_license', __name__)


@desktop_license_bp.route('/license/login', methods=['POST'])
def license_login():
    """Desktop app login + license activation"""
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        machine_id = data.get('machine_id', '')
        product_key = data.get('product_key', 'movie-maker')

        # Validate product_key
        valid_products = ['movie-maker', 'desktop-pro', 'pebdeq-code']
        if product_key not in valid_products:
            return jsonify({'success': False, 'error': 'invalid_product'}), 400

        if not email or not password or not machine_id:
            return jsonify({'success': False, 'error': 'missing_fields'}), 400

        # Find user
        user = User.query.filter_by(email=email).first()
        if not user or not user.check_password(password):
            # Check if this is a Google OAuth user trying to login with wrong/no app password
            if user and user.google_id:
                from werkzeug.security import check_password_hash
                if check_password_hash(user.password_hash, 'google_oauth_user'):
                    return jsonify({'success': False, 'error': 'no_app_password'}), 401
            return jsonify({'success': False, 'error': 'invalid_credentials'}), 401

        # Find or create license
        license_entry = DesktopLicense.query.filter_by(
            user_id=user.id, product_key=product_key
        ).first()

        if not license_entry:
            # Auto-create license for the user
            if product_key == 'pebdeq-code':
                license_type = 'ollama'
                from datetime import timedelta
                expires_at = datetime.utcnow() + timedelta(days=7)
            else:
                license_type = 'demo'
                expires_at = None
            license_entry = DesktopLicense(
                user_id=user.id,
                product_key=product_key,
                license_type=license_type,
                machine_id=machine_id,
                status='active',
                max_machines=1,
                activated_at=datetime.utcnow(),
                expires_at=expires_at,
                last_verified_at=datetime.utcnow(),
                last_ip=request.remote_addr,
            )
            db.session.add(license_entry)
            db.session.commit()
        else:
            # Check license status
            if license_entry.status == 'revoked':
                return jsonify({'success': False, 'error': 'license_revoked'}), 403

            # Check if pro/basic license expired → revert to demo
            license_type = getattr(license_entry, 'license_type', 'demo') or 'demo'
            if license_type in ('pro', 'basic') and license_entry.expires_at and license_entry.expires_at < datetime.utcnow():
                license_entry.license_type = 'demo'
                license_entry.expires_at = None
                license_type = 'demo'

            if license_entry.status == 'expired':
                # Reactivate as demo
                license_entry.status = 'active'
                license_entry.license_type = 'demo'
                license_entry.expires_at = None

            # Check machine — multi-machine support
            max_machines = license_entry.max_machines or 1
            current_machines = [m.strip() for m in (license_entry.machine_id or '').split(',') if m.strip()]

            if machine_id in current_machines:
                # Already registered, just update
                pass
            elif len(current_machines) < max_machines:
                # Has room for another machine, add it
                current_machines.append(machine_id)
                license_entry.machine_id = ','.join(current_machines)
            else:
                # No room — machine limit reached
                return jsonify({'success': False, 'error': 'machine_limit'}), 403

            license_entry.last_verified_at = datetime.utcnow()
            license_entry.last_ip = request.remote_addr
            db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Login successful',
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
            },
            'license': {
                'status': license_entry.status,
                'license_type': getattr(license_entry, 'license_type', 'demo') or 'demo',
                'product': license_entry.product_key,
                'expires_at': license_entry.expires_at.isoformat() if license_entry.expires_at else None,
                'max_machines': license_entry.max_machines,
            }
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@desktop_license_bp.route('/license/verify', methods=['POST'])
def license_verify():
    """Verify license status (called periodically by desktop app)"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        machine_id = data.get('machine_id', '')
        product_key = data.get('product_key', 'movie-maker')

        if not user_id or not machine_id:
            return jsonify({'success': False, 'error': 'missing_fields'}), 400

        license_entry = DesktopLicense.query.filter_by(
            user_id=user_id, product_key=product_key
        ).first()

        if not license_entry:
            return jsonify({'success': False, 'error': 'no_license'}), 404

        if license_entry.status == 'revoked':
            return jsonify({'success': False, 'error': 'license_revoked'}), 403

        # Check if pro/basic license expired → revert to demo
        license_type = getattr(license_entry, 'license_type', 'demo') or 'demo'
        if license_type in ('pro', 'basic') and license_entry.expires_at and license_entry.expires_at < datetime.utcnow():
            license_entry.license_type = 'demo'
            license_entry.expires_at = None
            license_type = 'demo'

        if license_entry.status == 'expired':
            # Reactivate as demo
            license_entry.status = 'active'
            license_entry.license_type = 'demo'
            license_entry.expires_at = None
            license_type = 'demo'

        if license_entry.machine_id:
            current_machines = [m.strip() for m in license_entry.machine_id.split(',') if m.strip()]
            if machine_id not in current_machines:
                return jsonify({'success': False, 'error': 'machine_limit'}), 403
        else:
            return jsonify({'success': False, 'error': 'machine_limit'}), 403

        # Update last verified + save usage data from client
        license_entry.last_verified_at = datetime.utcnow()
        license_entry.last_ip = request.remote_addr
        license_entry.status = 'active'
        # Save daily usage and avatar count reported by desktop app
        import json
        daily_usage = data.get('daily_usage')
        if daily_usage and isinstance(daily_usage, dict):
            license_entry.daily_usage = json.dumps(daily_usage)
        avatar_count = data.get('avatar_count')
        if avatar_count is not None:
            license_entry.avatar_count = int(avatar_count)
        db.session.commit()

        user = User.query.get(user_id)
        current_license_type = getattr(license_entry, 'license_type', 'demo') or 'demo'

        # P-code: simplified response without demo_quotas/locked_sections/allowed_bg_models
        if license_entry.product_key == 'pebdeq-code':
            return jsonify({
                'success': True,
                'license': {
                    'status': 'active',
                    'license_type': current_license_type,
                    'product': license_entry.product_key,
                    'expires_at': license_entry.expires_at.isoformat() if license_entry.expires_at else None,
                    'max_machines': license_entry.max_machines,
                },
                'user': {
                    'email': user.email if user else '',
                    'first_name': user.first_name if user else '',
                }
            })

        # Demo quota limits — read from DB config, fallback to defaults
        default_quotas = {
            'projects_video': 10,
            'avatar_create': 5,
            'avatar_images': 50,
            'group_scene_images': 5,
            'group_scene_video': 1,
            'grok_chat_templates': 3,
            'image_studio': 50,
            'max_avatars': 10,
            'triposg_3d': 3,
            'tripo_api_3d': 0,
        }
        default_basic_quotas = {
            'projects_video': 30,
            'avatar_create': 15,
            'avatar_images': 100,
            'group_scene_images': 15,
            'group_scene_video': 5,
            'grok_chat_templates': 10,
            'image_studio': 100,
            'max_avatars': 20,
            'triposg_3d': 10,
            'tripo_api_3d': 5,
        }

        # Read quotas from DB — demo and basic have separate config keys
        quota_prefix = 'basic_' if current_license_type == 'basic' else ''
        fallback_quotas = default_basic_quotas if current_license_type == 'basic' else default_quotas
        try:
            configs = DemoQuotaConfig.query.filter_by(config_type='quota').all()
            if configs:
                tier_quotas = {}
                for c in configs:
                    key = c.config_key
                    if current_license_type == 'basic':
                        if key.startswith('basic_'):
                            real_key = key[6:]  # strip 'basic_' prefix
                            try:
                                tier_quotas[real_key] = int(c.config_value)
                            except (ValueError, TypeError):
                                tier_quotas[real_key] = fallback_quotas.get(real_key, 0)
                    else:
                        if not key.startswith('basic_'):
                            try:
                                tier_quotas[key] = int(c.config_value)
                            except (ValueError, TypeError):
                                tier_quotas[key] = fallback_quotas.get(key, 0)
                demo_quotas = tier_quotas if tier_quotas else fallback_quotas
            else:
                demo_quotas = fallback_quotas
        except Exception:
            demo_quotas = fallback_quotas

        # Locked sections — read from DB config (separate for demo and basic)
        default_demo_locked = ['pro_studio', 'voiceover', 'openai']
        default_basic_locked = ['openai']
        lock_key = 'basic_locked_sections' if current_license_type == 'basic' else 'locked_sections'
        fallback_locked = default_basic_locked if current_license_type == 'basic' else default_demo_locked
        locked_sections = fallback_locked
        try:
            lock_config = DemoQuotaConfig.query.filter_by(config_key=lock_key).first()
            if lock_config:
                locked_sections = [s.strip() for s in lock_config.config_value.split(',') if s.strip()]
        except Exception:
            pass

        # Allowed BG models — read from DB config
        all_bg_models = ['bria-rmbg', 'birefnet-general', 'birefnet-general-lite', 'birefnet-portrait',
                         'isnet-general-use', 'isnet-anime', 'u2net', 'u2net_human_seg', 'silueta']
        default_demo_bg = ['isnet-general-use', 'isnet-anime', 'u2net', 'u2net_human_seg', 'silueta']
        default_basic_bg = ['birefnet-general-lite', 'birefnet-portrait', 'isnet-general-use', 'isnet-anime', 'u2net', 'u2net_human_seg', 'silueta']
        allowed_bg_models = all_bg_models  # default: all
        if current_license_type != 'pro':
            bg_key = 'basic_allowed_bg_models' if current_license_type == 'basic' else 'allowed_bg_models'
            fallback_bg = default_basic_bg if current_license_type == 'basic' else default_demo_bg
            try:
                bg_config = DemoQuotaConfig.query.filter_by(config_key=bg_key).first()
                if bg_config:
                    allowed_bg_models = [s.strip() for s in bg_config.config_value.split(',') if s.strip()]
                else:
                    allowed_bg_models = fallback_bg
            except Exception:
                allowed_bg_models = fallback_bg

        # For pro users, no quotas or locks
        is_limited = current_license_type in ('demo', 'basic')

        return jsonify({
            'success': True,
            'license': {
                'status': 'active',
                'license_type': current_license_type,
                'product': license_entry.product_key,
                'expires_at': license_entry.expires_at.isoformat() if license_entry.expires_at else None,
                'max_machines': license_entry.max_machines,
                'demo_quotas': demo_quotas if is_limited else None,
                'locked_sections': locked_sections if is_limited else [],
                'allowed_bg_models': allowed_bg_models,
            },
            'user': {
                'email': user.email if user else '',
                'first_name': user.first_name if user else '',
            }
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@desktop_license_bp.route('/license/deactivate', methods=['POST'])
def license_deactivate():
    """Deactivate license on a machine (logout from desktop app)"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        machine_id = data.get('machine_id', '')
        product_key = data.get('product_key', 'movie-maker')

        license_entry = DesktopLicense.query.filter_by(
            user_id=user_id, product_key=product_key
        ).first()

        if license_entry and license_entry.machine_id:
            current_machines = [m.strip() for m in license_entry.machine_id.split(',') if m.strip()]
            if machine_id in current_machines:
                current_machines.remove(machine_id)
                license_entry.machine_id = ','.join(current_machines) if current_machines else None
                db.session.commit()

        return jsonify({'success': True, 'message': 'Machine deactivated'})

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500



# ==================== ADMIN ENDPOINTS ====================

@desktop_license_bp.route('/license/admin/list', methods=['GET'])
@admin_required
def admin_list_licenses():
    """List all licenses for admin — with pagination and search"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        search = request.args.get('search', '').strip().lower()
        per_page = min(per_page, 200)  # cap

        # Join with User to avoid N+1 queries
        query = db.session.query(DesktopLicense, User).join(
            User, DesktopLicense.user_id == User.id, isouter=True
        ).order_by(DesktopLicense.created_at.desc())

        # Server-side search
        if search:
            query = query.filter(
                db.or_(
                    User.email.ilike(f'%{search}%'),
                    User.first_name.ilike(f'%{search}%'),
                    User.last_name.ilike(f'%{search}%'),
                    DesktopLicense.machine_id.ilike(f'%{search}%'),
                    DesktopLicense.product_key.ilike(f'%{search}%'),
                )
            )

        total = query.count()
        items = query.offset((page - 1) * per_page).limit(per_page).all()

        result = []
        for lic, user in items:
            result.append({
                'id': lic.id,
                'user_id': lic.user_id,
                'user_email': user.email if user else '',
                'user_name': f"{user.first_name} {user.last_name}" if user else '',
                'product_key': lic.product_key,
                'license_type': getattr(lic, 'license_type', 'demo') or 'demo',
                'machine_id': lic.machine_id or '',
                'status': lic.status,
                'max_machines': lic.max_machines,
                'reset_count': lic.reset_count,
                'max_resets_per_year': lic.max_resets_per_year,
                'activated_at': lic.activated_at.isoformat() if lic.activated_at else None,
                'expires_at': lic.expires_at.isoformat() if lic.expires_at else None,
                'last_verified_at': lic.last_verified_at.isoformat() if lic.last_verified_at else None,
                'last_ip': lic.last_ip or '',
                'app_version': lic.app_version or '',
                'daily_usage': getattr(lic, 'daily_usage', None) or '{}',
                'avatar_count': getattr(lic, 'avatar_count', 0) or 0,
                'created_at': lic.created_at.isoformat() if lic.created_at else None,
            })
        return jsonify({
            'success': True,
            'licenses': result,
            'total': total,
            'page': page,
            'per_page': per_page,
            'pages': (total + per_page - 1) // per_page,
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@desktop_license_bp.route('/license/admin/<int:license_id>/reset-machine', methods=['POST'])
@admin_required
def admin_reset_machine(license_id):
    """Admin: reset machine ID(s) for a license"""
    try:
        lic = DesktopLicense.query.get(license_id)
        if not lic:
            return jsonify({'success': False, 'error': 'License not found'}), 404

        lic.machine_id = None
        lic.reset_count = (lic.reset_count or 0) + 1
        lic.last_reset_at = datetime.utcnow()
        db.session.commit()

        return jsonify({'success': True, 'message': 'Machine reset successful'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@desktop_license_bp.route('/license/admin/<int:license_id>/set-max-machines', methods=['POST'])
@admin_required
def admin_set_max_machines(license_id):
    """Admin: set max_machines for a license (multi-device support)"""
    try:
        data = request.get_json()
        max_machines = data.get('max_machines', 1)
        if not isinstance(max_machines, int) or max_machines < 1:
            return jsonify({'success': False, 'error': 'max_machines must be >= 1'}), 400

        lic = DesktopLicense.query.get(license_id)
        if not lic:
            return jsonify({'success': False, 'error': 'License not found'}), 404

        lic.max_machines = max_machines
        db.session.commit()

        return jsonify({'success': True, 'message': f'Max machines set to {max_machines}'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@desktop_license_bp.route('/license/admin/<int:license_id>/revoke', methods=['POST'])
@admin_required
def admin_revoke_license(license_id):
    """Admin: revoke a license"""
    try:
        lic = DesktopLicense.query.get(license_id)
        if not lic:
            return jsonify({'success': False, 'error': 'License not found'}), 404

        lic.status = 'revoked'
        lic.machine_id = None
        db.session.commit()

        return jsonify({'success': True, 'message': 'License revoked'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@desktop_license_bp.route('/license/admin/<int:license_id>/activate', methods=['POST'])
@admin_required
def admin_activate_license(license_id):
    """Admin: reactivate a revoked/expired license"""
    try:
        lic = DesktopLicense.query.get(license_id)
        if not lic:
            return jsonify({'success': False, 'error': 'License not found'}), 404

        lic.status = 'active'
        db.session.commit()

        return jsonify({'success': True, 'message': 'License activated'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@desktop_license_bp.route('/license/admin/<int:license_id>/set-type', methods=['POST'])
@admin_required
def admin_set_license_type(license_id):
    """Admin: set license_type (demo/pro) and optionally expires_at"""
    try:
        data = request.get_json()
        license_type = data.get('license_type', 'demo')
        expires_at = data.get('expires_at')

        lic = DesktopLicense.query.get(license_id)
        if not lic:
            return jsonify({'success': False, 'error': 'License not found'}), 404

        # Validate license_type based on product_key
        if lic.product_key == 'pebdeq-code':
            if license_type not in ('ollama', 'pro'):
                return jsonify({'success': False, 'error': 'pebdeq-code supports ollama or pro type'}), 400
        else:
            if license_type not in ('demo', 'basic', 'pro'):
                return jsonify({'success': False, 'error': 'license_type must be demo, basic or pro'}), 400

        lic.license_type = license_type
        if license_type == 'demo':
            lic.expires_at = None
        elif license_type == 'ollama':
            from datetime import timedelta
            lic.expires_at = datetime.utcnow() + timedelta(days=7)
        elif expires_at:
            lic.expires_at = datetime.fromisoformat(expires_at)

        lic.status = 'active'
        db.session.commit()

        return jsonify({'success': True, 'message': f'License type set to {license_type}'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@desktop_license_bp.route('/license/admin/<int:license_id>', methods=['DELETE'])
@admin_required
def admin_delete_license(license_id):
    """Admin: delete a license"""
    try:
        lic = DesktopLicense.query.get(license_id)
        if not lic:
            return jsonify({'success': False, 'error': 'License not found'}), 404

        db.session.delete(lic)
        db.session.commit()

        return jsonify({'success': True, 'message': 'License deleted'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@desktop_license_bp.route('/license/admin/create', methods=['POST'])
@admin_required
def admin_create_license():
    """Admin: manually create a license for a user"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        product_key = data.get('product_key', 'movie-maker')

        if not user_id:
            return jsonify({'success': False, 'error': 'user_id required'}), 400

        user = User.query.get(user_id)
        if not user:
            return jsonify({'success': False, 'error': 'User not found'}), 404

        # Check if already has license
        existing = DesktopLicense.query.filter_by(user_id=user_id, product_key=product_key).first()
        if existing:
            return jsonify({'success': False, 'error': 'User already has a license for this product'}), 409

        lic = DesktopLicense(
            user_id=user_id,
            product_key=product_key,
            license_type=data.get('license_type', 'demo'),
            status='active',
            max_machines=data.get('max_machines', 1),
        )

        expires = data.get('expires_at')
        if expires:
            lic.expires_at = datetime.fromisoformat(expires)

        db.session.add(lic)
        db.session.commit()

        return jsonify({'success': True, 'message': 'License created', 'license_id': lic.id})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500



# ==================== USER ENDPOINTS ====================
from app.utils.decorators import login_required as user_login_required

@desktop_license_bp.route('/license/my-licenses', methods=['GET'])
@user_login_required
def user_my_licenses():
    """Get current user's licenses"""
    try:
        from flask import g
        user_id = g.user_id
        licenses = DesktopLicense.query.filter_by(user_id=user_id).all()
        result = []
        for lic in licenses:
            # Multi-machine: virgülle ayrılmış ID'leri kısalt
            machine_display = None
            machine_count = 0
            if lic.machine_id:
                machines = [m.strip() for m in lic.machine_id.split(',') if m.strip()]
                machine_count = len(machines)
                machine_display = ', '.join(m[:12] + '...' for m in machines)
            result.append({
                'id': lic.id,
                'product_key': lic.product_key,
                'license_type': getattr(lic, 'license_type', 'demo') or 'demo',
                'machine_id': machine_display,
                'machine_count': machine_count,
                'max_machines': lic.max_machines or 1,
                'status': lic.status,
                'reset_count': lic.reset_count,
                'max_resets_per_year': lic.max_resets_per_year,
                'activated_at': lic.activated_at.isoformat() if lic.activated_at else None,
                'expires_at': lic.expires_at.isoformat() if lic.expires_at else None,
                'last_verified_at': lic.last_verified_at.isoformat() if lic.last_verified_at else None,
            })
        return jsonify({'success': True, 'licenses': result})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@desktop_license_bp.route('/license/my-licenses/<int:license_id>/reset-machine', methods=['POST'])
@user_login_required
def user_reset_machine(license_id):
    """User: reset their own machine (limited per year)"""
    try:
        from flask import g
        user_id = g.user_id

        lic = DesktopLicense.query.filter_by(id=license_id, user_id=user_id).first()
        if not lic:
            return jsonify({'success': False, 'error': 'License not found'}), 404

        # Check reset limit
        if lic.reset_count >= lic.max_resets_per_year:
            return jsonify({
                'success': False,
                'error': f'Yıllık sıfırlama limitine ulaştınız ({lic.max_resets_per_year}). Destek ile iletişime geçin.'
            }), 403

        lic.machine_id = None
        lic.reset_count = (lic.reset_count or 0) + 1
        lic.last_reset_at = datetime.utcnow()
        db.session.commit()

        return jsonify({'success': True, 'message': 'Machine reset successful', 'remaining_resets': lic.max_resets_per_year - lic.reset_count})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


# ==================== PUBLIC PRICING TIERS ENDPOINT ====================

@desktop_license_bp.route('/license/pricing-tiers', methods=['GET'])
def public_pricing_tiers():
    """Public: get pricing tier comparison data for landing page"""
    try:
        # Read all quota configs from DB
        configs = DemoQuotaConfig.query.all()
        config_map = {c.config_key: c.config_value for c in configs}

        # Quota keys to expose
        quota_keys = ['projects_video', 'avatar_create', 'avatar_images',
                      'group_scene_images', 'group_scene_video',
                      'grok_chat_templates', 'image_studio', 'max_avatars',
                      'triposg_3d', 'tripo_api_3d',
                      'music_generate', 'video_editor_projects', 'youtube_seo_metadata']

        # Default fallbacks
        demo_defaults = {
            'projects_video': 10, 'avatar_create': 5, 'avatar_images': 50,
            'group_scene_images': 5, 'group_scene_video': 1,
            'grok_chat_templates': 3, 'image_studio': 50, 'max_avatars': 10,
            'triposg_3d': 3, 'tripo_api_3d': 0,
            'music_generate': 3, 'video_editor_projects': 5, 'youtube_seo_metadata': 10,
        }
        basic_defaults = {
            'projects_video': 30, 'avatar_create': 15, 'avatar_images': 100,
            'group_scene_images': 15, 'group_scene_video': 5,
            'grok_chat_templates': 10, 'image_studio': 100, 'max_avatars': 20,
            'triposg_3d': 10, 'tripo_api_3d': 5,
            'music_generate': 30, 'video_editor_projects': 20, 'youtube_seo_metadata': 50,
        }

        demo_quotas = {}
        basic_quotas = {}
        for k in quota_keys:
            try:
                demo_quotas[k] = int(config_map.get(k, demo_defaults.get(k, 0)))
            except (ValueError, TypeError):
                demo_quotas[k] = demo_defaults.get(k, 0)
            try:
                basic_quotas[k] = int(config_map.get(f'basic_{k}', basic_defaults.get(k, 0)))
            except (ValueError, TypeError):
                basic_quotas[k] = basic_defaults.get(k, 0)

        # Locked sections
        demo_locked = [s.strip() for s in config_map.get('locked_sections', 'pro_studio,voiceover,openai').split(',') if s.strip()]
        basic_locked = [s.strip() for s in config_map.get('basic_locked_sections', 'openai').split(',') if s.strip()]

        # Pricing info from config (admin-editable)
        pricing = {
            'demo': {
                'price': config_map.get('pricing_demo_price', '0'),
                'real_price': config_map.get('pricing_demo_real_price', '0'),
                'period': config_map.get('pricing_demo_period', ''),
                'title': config_map.get('pricing_demo_title', 'Demo'),
                'subtitle': config_map.get('pricing_demo_subtitle', ''),
                'quotas': demo_quotas,
                'locked_sections': demo_locked,
            },
            'basic': {
                'price': config_map.get('pricing_basic_price', '9.99'),
                'real_price': config_map.get('pricing_basic_real_price', '19.99'),
                'period': config_map.get('pricing_basic_period', '/mo'),
                'title': config_map.get('pricing_basic_title', 'Basic'),
                'subtitle': config_map.get('pricing_basic_subtitle', ''),
                'quotas': basic_quotas,
                'locked_sections': basic_locked,
            },
            'pro': {
                'price': config_map.get('pricing_pro_price', '24.99'),
                'real_price': config_map.get('pricing_pro_real_price', '49.99'),
                'period': config_map.get('pricing_pro_period', '/mo'),
                'title': config_map.get('pricing_pro_title', 'Pro'),
                'subtitle': config_map.get('pricing_pro_subtitle', ''),
                'quotas': {k: -1 for k in quota_keys},  # -1 = unlimited
                'locked_sections': [],
            },
        }

        return jsonify({'success': True, 'tiers': pricing})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


# ==================== DEMO QUOTA CONFIG ENDPOINTS ====================

@desktop_license_bp.route('/license/admin/demo-config', methods=['GET'])
@admin_required
def admin_get_demo_config():
    """Admin: get all demo quota/permission configs"""
    try:
        configs = DemoQuotaConfig.query.order_by(DemoQuotaConfig.config_type, DemoQuotaConfig.config_key).all()
        result = []
        for c in configs:
            result.append({
                'id': c.id,
                'config_key': c.config_key,
                'config_value': c.config_value,
                'label': c.label or c.config_key,
                'config_type': c.config_type,
                'updated_at': c.updated_at.isoformat() if c.updated_at else None,
            })
        return jsonify({'success': True, 'configs': result})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@desktop_license_bp.route('/license/admin/demo-config', methods=['PUT'])
@admin_required
def admin_update_demo_config():
    """Admin: update demo quota/permission configs (batch)"""
    try:
        data = request.get_json()
        configs = data.get('configs', [])

        for item in configs:
            config_key = item.get('config_key')
            config_value = str(item.get('config_value', ''))
            label = item.get('label')

            if not config_key:
                continue

            existing = DemoQuotaConfig.query.filter_by(config_key=config_key).first()
            if existing:
                existing.config_value = config_value
                if label:
                    existing.label = label
                existing.updated_at = datetime.utcnow()
            else:
                new_config = DemoQuotaConfig(
                    config_key=config_key,
                    config_value=config_value,
                    label=label or config_key,
                    config_type=item.get('config_type', 'quota'),
                )
                db.session.add(new_config)

        db.session.commit()
        return jsonify({'success': True, 'message': 'Demo config updated'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@desktop_license_bp.route('/license/admin/demo-config/<int:config_id>', methods=['DELETE'])
@admin_required
def admin_delete_demo_config(config_id):
    """Admin: delete a demo config entry"""
    try:
        c = DemoQuotaConfig.query.get(config_id)
        if not c:
            return jsonify({'success': False, 'error': 'Config not found'}), 404
        db.session.delete(c)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Config deleted'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
