#!/usr/bin/env python3

from app import create_app, db
from app.models.models import User

app = create_app()

with app.app_context():
    print("Setting up test users to match existing database...")
    
    # Check if the actual admin user exists
    actual_admin = User.query.filter_by(email='admin@pebdeq.com').first()
    
    if actual_admin:
        print(f"✅ Main admin user exists: {actual_admin.email}")
        print(f"   Username: {actual_admin.username}")
        print(f"   Is Admin: {actual_admin.is_admin}")
    else:
        print("❌ Main admin user not found!")
    
    # Check if old test users exist and remove them to avoid confusion
    old_test_admin = User.query.filter_by(email='test_admin@example.com').first()
    old_test_user = User.query.filter_by(email='test_user@example.com').first()
    
    if old_test_admin:
        print("🧹 Removing old test admin user...")
        db.session.delete(old_test_admin)
    
    if old_test_user:
        print("🧹 Removing old test user...")
        db.session.delete(old_test_user)
    
    # Create NEW test users that don't conflict with existing ones
    new_test_user_email = 'test_user_new@pebdeq.com'
    new_test_user = User.query.filter_by(email=new_test_user_email).first()
    
    if not new_test_user:
        # Create test regular user with known password
        new_test_user = User(
            username='test_user_new',
            email=new_test_user_email,
            first_name='Test',
            last_name='User',
            phone='0987654321',
            address='Test User Address',
            is_admin=False
        )
        new_test_user.set_password('TestUser123!')
        db.session.add(new_test_user)
        print(f"✅ Created new test user: {new_test_user_email}")
    else:
        print(f"✅ Test user already exists: {new_test_user_email}")
    
    try:
        db.session.commit()
        print("\n✅ Test user setup completed!")
        
        # Show final status
        print("\nFinal user status:")
        admin = User.query.filter_by(email='admin@pebdeq.com').first()
        test_user = User.query.filter_by(email=new_test_user_email).first()
        mystery_user = User.query.filter_by(email='qDY9XWV4@test.com').first()
        
        if admin:
            print(f"  ✅ Main Admin: {admin.email} - Password: adminx999")
        if test_user:
            print(f"  ✅ Test User: {test_user.email} - Password: TestUser123!")
        if mystery_user:
            print(f"  ❓ Mystery User: {mystery_user.email} - Password: UNKNOWN")
            
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error setting up test users: {e}") 