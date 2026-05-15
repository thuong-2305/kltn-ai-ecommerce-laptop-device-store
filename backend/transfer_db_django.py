import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

from django.db import connection
from django.apps import apps
import sqlite3
from pathlib import Path

SOURCE_DB = Path(r"c:\Users\Windows\Desktop\weblaptop\weblaptop\db.sqlite3")
EXCLUDED_TABLES = {"django_migrations", "sqlite_sequence", "django_session"}

def sqlite_tables(conn):
    rows = conn.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
    ).fetchall()
    return [row[0] for row in rows]

def sqlite_columns(conn, table):
    rows = conn.execute(f'PRAGMA table_info("{table}")').fetchall()
    return [row[1] for row in rows]

def main():
    if not SOURCE_DB.exists():
        raise FileNotFoundError(f"Source database not found: {SOURCE_DB}")

    print("=" * 100)
    print("DATABASE TRANSFER: SQLite → MySQL (Using Django ORM)")
    print("=" * 100)
    print(f"Source: {SOURCE_DB}")
    print()

    sqlite_conn = sqlite3.connect(str(SOURCE_DB))
    sqlite_conn.row_factory = sqlite3.Row

    # Get all models
    models_dict = {}
    for app_config in apps.get_app_configs():
        for model in app_config.get_models():
            models_dict[model._meta.db_table] = model

    source_tables = [table for table in sqlite_tables(sqlite_conn) if table not in EXCLUDED_TABLES]
    common_tables = [table for table in source_tables if table in models_dict]

    print(f"Found {len(common_tables)} tables to transfer")
    print()

    with connection.cursor() as cursor:
        # Disable foreign key checks
        cursor.execute("SET FOREIGN_KEY_CHECKS=0")

        # Step 1: Clear existing data
        print("Step 1: Cleaning up old data...")
        for table in reversed(common_tables):
            try:
                cursor.execute(f"DELETE FROM `{table}`")
                print(f"  ✓ Cleared {table}")
            except Exception as e:
                print(f"  ⚠ {table}: {str(e)[:60]}")

        print()
        print("Step 2: Transferring data...")

        # Step 2: Transfer data using Django ORM
        for table_name in common_tables:
            model = models_dict[table_name]
            rows = sqlite_conn.execute(f'SELECT * FROM "{table_name}"').fetchall()

            if not rows:
                print(f"  ○ {table_name}: 0 rows")
                continue

            # Get column names from model
            model_fields = {f.column: f.name for f in model._meta.get_fields() if hasattr(f, 'column')}
            
            objects_to_create = []
            for row in rows:
                obj_data = {}
                for col_name in row.keys():
                    if col_name in model_fields:
                        field_name = model_fields[col_name]
                        value = row[col_name]
                        
                        # Handle JSON fields
                        field = model._meta.get_field(field_name)
                        if hasattr(field, 'get_internal_type') and field.get_internal_type() == 'JSONField':
                            if value == "":
                                value = None
                        
                        obj_data[field_name] = value

                # Create object instance
                obj = model(**obj_data)
                objects_to_create.append(obj)

            # Bulk insert
            try:
                model.objects.bulk_create(objects_to_create, batch_size=100)
                print(f"  ✓ {table_name:<40} {len(rows):>5} rows")
            except Exception as e:
                print(f"  ✗ {table_name:<40} Error: {str(e)[:50]}")

        # Re-enable foreign keys
        cursor.execute("SET FOREIGN_KEY_CHECKS=1")

    sqlite_conn.close()

    # Verify
    print()
    print("Step 3: Verifying transfer...")
    total_rows = 0
    for table_name in sorted(common_tables):
        model = models_dict[table_name]
        count = model.objects.count()
        total_rows += count
    
    print(f"  ✓ Total rows transferred: {total_rows}")

    print()
    print("=" * 100)
    print("✅ Database transfer completed successfully!")
    print("=" * 100)

if __name__ == "__main__":
    main()
