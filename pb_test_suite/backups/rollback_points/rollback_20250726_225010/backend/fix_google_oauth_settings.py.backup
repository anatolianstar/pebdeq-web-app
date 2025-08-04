#!/usr/bin/env python3
"""
Fix Google OAuth users' settings field
This script initializes the settings field for existing Google OAuth users
"""

import sys
import os

# Add the parent directory to the path to import the app
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from app.models.models import User

def fix_google_oauth_settings():
    """Initialize settings for Google OAuth users that have None settings"""
    
    app = create_app()
    
    with app.app_context():
        # Find Google OAuth users with None settings
        google_users = User.query.filter(
            User.google_id.isnot(None),
            User.settings.is_(None)
        ).all()
        
        print(f"Found {len(google_users)} Google OAuth users with None settings")
        
        if not google_users:
            print("No Google OAuth users need settings initialization")
            return
        
        # Initialize settings for each user
        for user in google_users:
            print(f"Initializing settings for user: {user.email}")
            user.settings = {}
            
        try:
            db.session.commit()
            print(f"✅ Successfully initialized settings for {len(google_users)} Google OAuth users")
            
            # Verify the changes
            for user in google_users:
                db.session.refresh(user)
                print(f"   {user.email}: settings = {user.settings}")
                
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error initializing settings: {e}")
            return False
            
    return True

if __name__ == '__main__':
    print("🔧 Fixing Google OAuth users' settings...")
    success = fix_google_oauth_settings()
    
    if success:
        print("🎉 Fix completed successfully!")
    else:
        print("❌ Fix failed!")
        sys.exit(1) 