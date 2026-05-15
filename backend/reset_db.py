import MySQLdb
from pathlib import Path

env = {}
for line in Path('.env').read_text(encoding='utf-8').splitlines():
    line = line.strip()
    if line and '=' in line and not line.startswith('#'):
        k, v = line.split('=', 1)
        env[k] = v

conn = MySQLdb.connect(
    host=env['DB_HOST'],
    user=env['DB_USER'],
    passwd=env['DB_PASSWORD'],
    port=int(env.get('DB_PORT', '3306')),
)

cursor = conn.cursor()
db_name = env['DB_NAME']

# Drop database if exists
cursor.execute(f'DROP DATABASE IF EXISTS `{db_name}`')
print(f'✓ Dropped database {db_name}')

# Create new database
cursor.execute(f'CREATE DATABASE `{db_name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci')
print(f'✓ Created database {db_name}')

cursor.close()
conn.close()
