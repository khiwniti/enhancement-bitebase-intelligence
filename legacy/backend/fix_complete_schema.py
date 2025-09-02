#!/usr/bin/env python3
"""
Comprehensive database schema migration for BiteBase Intelligence
Adds all missing columns to match SQLAlchemy Restaurant model definition
"""

import sqlite3
import sys
import os
from datetime import datetime

# Change to backend directory where database is located
os.chdir('/home/user/enhancement-bitebase-intelligence/backend')

db_path = './bitebase_intelligence.db'

if not os.path.exists(db_path):
    print(f"❌ Database file not found: {db_path}")
    sys.exit(1)

# Define all missing columns that need to be added
missing_columns = [
    ('city', 'VARCHAR(100)', True, None),
    ('area', 'VARCHAR(100)', False, None),
    ('country', 'VARCHAR(100)', True, None),
    ('postal_code', 'VARCHAR(20)', False, None),
    ('cuisine_types', 'JSON', True, None),
    ('category', 'VARCHAR(50)', True, None),
    ('website', 'VARCHAR(500)', False, None),
    ('is_active', 'BOOLEAN', False, True),
    ('opening_date', 'DATETIME', False, None),
    ('closing_date', 'DATETIME', False, None),
    ('average_rating', 'FLOAT', False, None),
    ('total_reviews', 'INTEGER', False, 0),
    ('estimated_revenue', 'FLOAT', False, None),
    ('employee_count', 'INTEGER', False, None),
    ('seating_capacity', 'INTEGER', False, None),
    ('data_source', 'VARCHAR(100)', False, None),
    ('data_quality_score', 'FLOAT', False, 0.0),
    ('updated_at', 'DATETIME', False, None)
]

# Index definitions for new columns
indexes_to_create = [
    'CREATE INDEX IF NOT EXISTS ix_restaurants_city ON restaurants (city);',
    'CREATE INDEX IF NOT EXISTS ix_restaurants_area ON restaurants (area);',
    'CREATE INDEX IF NOT EXISTS ix_restaurants_country ON restaurants (country);',
    'CREATE INDEX IF NOT EXISTS ix_restaurants_category ON restaurants (category);',
    'CREATE INDEX IF NOT EXISTS ix_restaurants_is_active ON restaurants (is_active);'
]

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print("🚀 Starting comprehensive database schema migration...")
    print("=" * 60)
    
    # Get current schema before migration
    cursor.execute("PRAGMA table_info(restaurants);")
    current_columns = cursor.fetchall()
    current_column_names = [col[1] for col in current_columns]
    
    print(f"📊 Current schema has {len(current_columns)} columns")
    print(f"🎯 Adding {len(missing_columns)} missing columns")
    
    migration_count = 0
    
    # Add each missing column
    for col_name, col_type, not_null, default in missing_columns:
        if col_name not in current_column_names:
            # Build ALTER TABLE statement
            alter_sql = f"ALTER TABLE restaurants ADD COLUMN {col_name} {col_type}"
            
            # Add default value if specified
            if default is not None:
                if isinstance(default, bool):
                    default_value = 1 if default else 0
                elif isinstance(default, str):
                    default_value = f"'{default}'"
                else:
                    default_value = default
                alter_sql += f" DEFAULT {default_value}"
            elif not not_null:
                alter_sql += " DEFAULT NULL"
                
            try:
                cursor.execute(alter_sql)
                migration_count += 1
                nullable = "NOT NULL" if not_null else "NULL"
                default_str = f"DEFAULT {default}" if default is not None else "DEFAULT NULL"
                print(f"  ✅ Added: {col_name} {col_type} {nullable} {default_str}")
            except Exception as e:
                print(f"  ❌ Failed to add {col_name}: {e}")
        else:
            print(f"  ⏭️  Skipped: {col_name} (already exists)")
    
    # Create indexes for new columns
    print(f"\n🔍 Creating indexes for performance...")
    for index_sql in indexes_to_create:
        try:
            cursor.execute(index_sql)
            index_name = index_sql.split('IF NOT EXISTS ')[1].split(' ON')[0]
            print(f"  ✅ Created index: {index_name}")
        except Exception as e:
            print(f"  ❌ Failed to create index: {e}")
    
    # Commit all changes
    conn.commit()
    
    # Verify final schema
    cursor.execute("PRAGMA table_info(restaurants);")
    final_columns = cursor.fetchall()
    
    print(f"\n📈 Migration Summary:")
    print(f"  • Columns added: {migration_count}")
    print(f"  • Final column count: {len(final_columns)}")
    print(f"  • Indexes created: {len(indexes_to_create)}")
    
    print(f"\n✅ Schema migration completed successfully!")
    print("=" * 60)
    
    # Show final schema for verification
    print(f"\n📋 Final restaurants table schema:")
    for col in final_columns:
        nullable = "NOT NULL" if col[3] else "NULL"
        default = f"DEFAULT {col[4]}" if col[4] is not None else ""
        print(f"  {col[1]:20} {col[2]:15} {nullable:8} {default}")
    
    conn.close()
    
except Exception as e:
    print(f"❌ Migration failed: {e}")
    if 'conn' in locals():
        conn.rollback()
        conn.close()
    sys.exit(1)

print(f"\n🎉 Database schema is now aligned with SQLAlchemy Restaurant model!")