#!/usr/bin/env python3

from app import create_app, db
from app.models.models import User

app = create_app()

with app.app_context():
    print("Users in database:")
    users = User.query.all()
    
    if not users:
        print("  No users found in database")
    else:
        for user in users:
            print(f"  {user.email} - {user.username} - Admin: {user.is_admin}")
    
    print(f"\nTotal users: {len(users)}") 