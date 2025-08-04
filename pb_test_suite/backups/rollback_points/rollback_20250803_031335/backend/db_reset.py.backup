#!/usr/bin/env python

"""
Simple script to reset database
Usage: python db_reset.py
"""

from run import reset_database, init_database, create_default_site_settings

if __name__ == '__main__':
    print("⚠️  WARNING: This operation will delete all data in the database! ⚠️")
    confirm = input("Are you sure you want to reset the database? (y/N): ")

    if confirm.lower() in ['y', 'yes']:
        reset_database()
        init_database()
        create_default_site_settings()
        print("\n✅ Database successfully reset and reinitialized!")
    else:
        print("\n❌ Database reset operation cancelled.")
