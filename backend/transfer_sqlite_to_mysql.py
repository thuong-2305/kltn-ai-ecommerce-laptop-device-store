from pathlib import Path
import sqlite3
import MySQLdb
from typing import Dict, List

ROOT = Path(__file__).resolve().parent
SOURCE_DB = Path(r"c:\Users\Windows\Desktop\weblaptop\weblaptop\db.sqlite3")
ENV_FILE = ROOT / ".env"
EXCLUDED_TABLES = {"django_migrations", "sqlite_sequence", "django_session"}

def load_env(path: Path) -> Dict[str, str]:
    values: Dict[str, str] = {}
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        values[key.strip()] = value.strip().strip('"').strip("'")
    return values

def sqlite_tables(conn: sqlite3.Connection) -> List[str]:
    rows = conn.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
    ).fetchall()
    return [row[0] for row in rows]

def mysql_tables(conn: MySQLdb.Connection) -> List[str]:
    with conn.cursor() as cursor:
        cursor.execute("SHOW TABLES")
        return [row[0] for row in cursor.fetchall()]

def sqlite_columns(conn: sqlite3.Connection, table: str) -> List[str]:
    rows = conn.execute(f'PRAGMA table_info("{table}")').fetchall()
    return [row[1] for row in rows]

def mysql_columns(conn: MySQLdb.Connection, table: str) -> List[str]:
    with conn.cursor() as cursor:
        cursor.execute(f'SHOW COLUMNS FROM `{table}`')
        return [row[0] for row in cursor.fetchall()]

def mysql_column_types(conn: MySQLdb.Connection, table: str) -> Dict[str, str]:
    with conn.cursor() as cursor:
        cursor.execute(f'SHOW COLUMNS FROM `{table}`')
        return {row[0]: str(row[1]).lower() for row in cursor.fetchall()}

def main() -> None:
    if not SOURCE_DB.exists():
        raise FileNotFoundError(f"Source database not found: {SOURCE_DB}")
    if not ENV_FILE.exists():
        raise FileNotFoundError(f"Environment file not found: {ENV_FILE}")

    env = load_env(ENV_FILE)
    
    print("=" * 100)
    print("DATABASE TRANSFER: SQLite → MySQL")
    print("=" * 100)
    print(f"Source: {SOURCE_DB}")
    print(f"Target: {env['DB_NAME']} @ {env['DB_HOST']}")
    print()

    mysql_conn = MySQLdb.connect(
        host=env.get("DB_HOST", "localhost"),
        user=env["DB_USER"],
        passwd=env["DB_PASSWORD"],
        db=env["DB_NAME"],
        port=int(env.get("DB_PORT", "3306")),
        charset="utf8mb4",
        use_unicode=True,
    )
    mysql_conn.autocommit(False)

    sqlite_conn = sqlite3.connect(str(SOURCE_DB))
    sqlite_conn.row_factory = sqlite3.Row

    source_tables = [table for table in sqlite_tables(sqlite_conn) if table not in EXCLUDED_TABLES]
    target_tables = set(mysql_tables(mysql_conn))
    common_tables = [table for table in source_tables if table in target_tables]

    print(f"Found {len(common_tables)} common tables to copy")
    print()

    with mysql_conn.cursor() as cursor:
        # Disable foreign key checks temporarily
        cursor.execute("SET FOREIGN_KEY_CHECKS=0")
        
        # Step 1: Delete old data
        print("Step 1: Cleaning up old data...")
        for table in reversed(common_tables):  # Reverse to respect FK constraints
            try:
                cursor.execute(f"DELETE FROM `{table}`")
                print(f"  ✓ Cleared {table}")
            except Exception as e:
                print(f"  ⚠ Error clearing {table}: {e}")
        
        print()
        print("Step 2: Transferring data...")
        
        # Step 2: Transfer data
        for table in common_tables:
            source_cols = sqlite_columns(sqlite_conn, table)
            target_cols = mysql_columns(mysql_conn, table)
            target_types = mysql_column_types(mysql_conn, table)
            columns = [column for column in source_cols if column in target_cols]

            if not columns:
                print(f"  ⚠ Skipping {table}: no shared columns")
                continue

            rows = sqlite_conn.execute(f'SELECT * FROM "{table}"').fetchall()
            if not rows:
                print(f"  ○ {table}: 0 rows")
                continue

            placeholders = ", ".join(["%s"] * len(columns))
            column_sql = ", ".join(f"`{column}`" for column in columns)
            insert_sql = f"INSERT INTO `{table}` ({column_sql}) VALUES ({placeholders})"
            
            data = []
            for row in rows:
                values = []
                for column in columns:
                    value = row[column]
                    # Handle empty JSON strings
                    if target_types.get(column, "").startswith("json") and value == "":
                        value = None
                    values.append(value)
                data.append(tuple(values))
            
            cursor.executemany(insert_sql, data)
            print(f"  ✓ {table:<40} {len(rows):>5} rows")

            # Update auto_increment if id column exists
            if "id" in columns:
                try:
                    max_id = max((row["id"] for row in rows), default=0)
                    if max_id > 0:
                        cursor.execute(f"ALTER TABLE `{table}` AUTO_INCREMENT = {max_id + 1}")
                except:
                    pass

        # Re-enable foreign key checks
        cursor.execute("SET FOREIGN_KEY_CHECKS=1")

    mysql_conn.commit()
    sqlite_conn.close()
    
    # Verify transfer
    print()
    print("Step 3: Verifying transfer...")
    mysql_conn2 = MySQLdb.connect(
        host=env.get("DB_HOST", "localhost"),
        user=env["DB_USER"],
        passwd=env["DB_PASSWORD"],
        db=env["DB_NAME"],
        port=int(env.get("DB_PORT", "3306")),
        charset="utf8mb4",
        use_unicode=True,
    )
    with mysql_conn2.cursor() as cursor:
        total_rows = 0
        for table in sorted(common_tables):
            cursor.execute(f"SELECT COUNT(*) FROM `{table}`")
            count = cursor.fetchone()[0]
            total_rows += count
    mysql_conn2.close()
    
    print(f"  ✓ Total rows in MySQL: {total_rows}")
    
    print()
    print("=" * 100)
    print("✅ Database transfer completed successfully!")
    print("=" * 100)

if __name__ == "__main__":
    main()
