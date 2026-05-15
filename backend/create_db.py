import MySQLdb
from pathlib import Path

env = {}
for line in Path('.env').read_text(encoding='utf-8').splitlines():
    line = line.strip()
    if line and '=' in line and not line.startswith('#'):
        k, v = line.split('=', 1)
        env[k] = v

# Connect to MySQL server (without database)
conn = MySQLdb.connect(
    host=env['DB_HOST'],
    user=env['DB_USER'],
    passwd=env['DB_PASSWORD'],
    port=int(env.get('DB_PORT', '3306')),
)

cursor = conn.cursor()

# Create database if not exists
db_name = env['DB_NAME']
cursor.execute(f'CREATE DATABASE IF NOT EXISTS `{db_name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci')
print(f'✓ Database {db_name} created/verified')

cursor.close()
conn.close()
