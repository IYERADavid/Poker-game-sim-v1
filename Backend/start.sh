#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Wait for Postgres using a Python one-liner
echo "⏳ Waiting for the database to be ready..."
until python -c "
import psycopg2
import time
import sys

try:
    conn = psycopg2.connect(
        dbname='poker_db',
        user='postgres',
        password='password',
        host='db',
        port='5432'
    )
    conn.close()
except Exception:
    sys.exit(1)
"; do
  echo "❌ Database not ready yet. Retrying..."
  sleep 2
done

echo "✅ Database is ready!"

# Run the command to create the database table
echo "Creating database tables..."
python manage.py createTable

# Start the FastAPI server
echo "Starting FastAPI server..."
python manage.py runServer