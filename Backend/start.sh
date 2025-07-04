#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Run the command to create the database table
echo "Creating database tables..."
python manage.py createTable

# Start the FastAPI server
echo "Starting FastAPI server..."
python manage.py runServer