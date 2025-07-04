# Poker Game Backend

FastAPI backend for the poker game application.

## Features

- ✅ **FastAPI** with async support
- ✅ **PostgreSQL** with raw SQL queries
- ✅ **Repository pattern** with dataclasses
- ✅ **pokerkit** integration for hand validation
- ✅ **RESTful API** with proper error handling
- ✅ **Comprehensive testing**

## Quick Start

1. **Install dependencies:**
\`\`\`bash
pip install -r requirements.txt
\`\`\`

2. **Set up database:**
\`\`\`bash
python manage.py createdb
\`\`\`

3. **Run server:**
\`\`\`bash
python manage.py runserver
\`\`\`

4. **Run tests:**
\`\`\`bash
python manage.py test
\`\`\`

## API Endpoints

- `GET /` - Root endpoint
- `GET /api/v1/health` - Health check
- `POST /api/v1/hands/` - Create hand
- `GET /api/v1/hands/` - Get all hands
- `GET /api/v1/hands/{hand_id}` - Get specific hand
- `DELETE /api/v1/hands/{hand_id}` - Delete hand
- `POST /api/v1/hands/validate` - Validate hand data

## Documentation

Visit `http://localhost:8000/docs` for interactive API documentation.

## Database Schema

\`\`\`sql
CREATE TABLE hands (
    id SERIAL PRIMARY KEY,
    hand_id VARCHAR(36) UNIQUE NOT NULL,
    stack_settings JSONB NOT NULL,
    dealer_position INTEGER NOT NULL,
    small_blind_position INTEGER NOT NULL,
    big_blind_position INTEGER NOT NULL,
    hole_cards JSONB NOT NULL,
    action_sequence TEXT NOT NULL,
    winnings JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
