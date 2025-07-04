#!/usr/bin/env python3
"""
Management script for the poker backend
"""
import sys
import subprocess
import psycopg2
from app.config import settings

def create_table():
    """Create the database table"""
    try:
        conn = psycopg2.connect(settings.DATABASE_URL)
        
        with conn.cursor() as cursor:
            # Create hands table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS hands (
                    id SERIAL PRIMARY KEY,
                    hand_id VARCHAR(36) UNIQUE NOT NULL,
                    stack_settings JSONB NOT NULL,
                    dealer_position INTEGER NOT NULL,
                    small_blind_position INTEGER NOT NULL,
                    big_blind_position INTEGER NOT NULL,
                    hole_cards JSONB NOT NULL,
                    action_sequence TEXT NOT NULL,
                    winnings JSONB NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    
                    CONSTRAINT valid_positions CHECK (
                        dealer_position >= 0 AND dealer_position < 6 AND
                        small_blind_position >= 0 AND small_blind_position < 6 AND
                        big_blind_position >= 0 AND big_blind_position < 6
                    )
                )
            """)
            
            # Create indexes
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_hands_hand_id ON hands(hand_id)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_hands_created_at ON hands(created_at)")
            
            conn.commit()
            print("✅ Table created successfully")
        
        conn.close()
        
    except Exception as e:
        print(f"❌ Error creating database: {e}")
        sys.exit(1)

def run_server():
    """Run the FastAPI server"""
    subprocess.run([
        "uvicorn", "app.main:app", 
        "--reload", 
        "--host", "0.0.0.0", 
        "--port", "8000"
    ])

def run_tests():
    """Run the test suite"""
    subprocess.run(["pytest", "-v"])

def main():
    if len(sys.argv) < 2:
        print("Usage: python manage.py [command]")
        print("Commands:")
        print("  createTable  - Create database table")
        print("  runServer - Start the FastAPI server")
        print("  test      - Run tests")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "createTable":
        create_table()
    elif command == "runServer":
        run_server()
    elif command == "test":
        run_tests()
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)

if __name__ == "__main__":
    main()
