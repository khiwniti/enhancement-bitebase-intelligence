#!/usr/bin/env python3
"""
Fix database format to match API expectations
- Convert string IDs to UUIDs
- Add proper timestamps
- Ensure data quality scores are set
"""

import sqlite3
import uuid
from datetime import datetime


def fix_database_format():
    """Fix existing database records to match API schema expectations"""
    
    # Connect to database
    conn = sqlite3.connect('bitebase_intelligence.db')
    cursor = conn.cursor()
    
    try:
        # Get all restaurants
        cursor.execute("SELECT id, name FROM restaurants")
        restaurants = cursor.fetchall()
        
        print(f"Found {len(restaurants)} restaurants to fix")
        
        now = datetime.utcnow().isoformat()
        
        for old_id, name in restaurants:
            print(f"Fixing restaurant: {name} (ID: {old_id})")
            
            # Generate new UUID if ID is not a proper UUID
            new_id = old_id
            try:
                # Try to parse as UUID
                uuid.UUID(str(old_id))
                print(f"  ✓ ID is already a valid UUID: {old_id}")
            except (ValueError, TypeError):
                # Generate new UUID
                new_id = str(uuid.uuid4())
                print(f"  → Converting ID from '{old_id}' to '{new_id}'")
            
            # Update the record with proper values
            cursor.execute("""
                UPDATE restaurants SET 
                    id = ?,
                    created_at = COALESCE(created_at, ?),
                    updated_at = COALESCE(updated_at, ?),
                    data_quality_score = COALESCE(data_quality_score, 0.8),
                    total_reviews = COALESCE(total_reviews, 0),
                    is_active = COALESCE(is_active, 1)
                WHERE id = ?
            """, (new_id, now, now, old_id))
            
            print(f"  → Updated record with UUID and timestamps")
        
        # Commit all changes
        conn.commit()
        print("✅ Successfully fixed all database records!")
        
        # Verify the changes
        cursor.execute("SELECT id, name, created_at, data_quality_score FROM restaurants LIMIT 3")
        sample_records = cursor.fetchall()
        print("\n📋 Sample updated records:")
        for record in sample_records:
            print(f"  {record[1]}: ID={record[0][:8]}..., created_at={record[2]}, quality={record[3]}")
        
    except Exception as e:
        print(f"❌ Error fixing database: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    fix_database_format()