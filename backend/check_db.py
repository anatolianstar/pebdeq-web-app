import sqlite3

try:
    conn = sqlite3.connect('instance/pebdeq.db')
    cursor = conn.cursor()
    cursor.execute('SELECT google_oauth_enabled, google_oauth_client_id, google_oauth_client_secret FROM site_settings LIMIT 1')
    row = cursor.fetchone()
    
    if row:
        print(f'google_oauth_enabled: {row[0]}')
        print(f'google_oauth_client_id: {row[1]}')
        print(f'google_oauth_client_secret: {row[2] if row[2] else "NULL"}')
    else:
        print('No site_settings record found')
    
    conn.close()
except Exception as e:
    print(f'Error: {e}') 