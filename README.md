# 🃏 Poker Full-Stack Application

A complete Texas Hold'em poker simulation with Next.js frontend and FastAPI backend, featuring real-time gameplay, hand history tracking, and database persistence.

## 🎯 Features

### 🎮 **Game Features**
- **6-Player Texas Hold'em** simulation
- **Real-time action logging** with detailed play-by-play
- **Complete poker phases**: Pre-flop, Flop, Turn, River, Showdown
- **All poker actions**: Fold, Check, Call, Bet, Raise, All-in
- **Hand history tracking** with detailed statistics
- **Configurable player stacks** and blinds

### 🏗️ **Technical Features**
- **Full-stack architecture** with clean separation
- **RESTful API** with comprehensive endpoints
- **Real-time frontend-backend sync**
- **Database persistence** with PostgreSQL
- **Poker hand validation** using pokerkit library
- **Comprehensive error handling** and logging
- **Type-safe** TypeScript throughout

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **Python** 3.8+ and pip
- **PostgreSQL** 12+

### 1. Clone and Setup
\`\`\`bash
git clone https://github.com/IYERADavid/Poker
cd Poker
\`\`\`

# One-command setup (installs everything & runs the web app)
\`\`\`bash
docker compose up -d
\`\`\`


### 3. Access the Application
- **🎮 Game Interface**: http://localhost:3000
- **📖 API Documentation**: http://localhost:8000/docs
- **🔍 Health Check**: http://localhost:8000/api/v1/health


## 🎮 How to Play

### Game Setup
1. **Configure Player Stacks**: Set starting chips for all 6 players
2. **Start New Hand**: Click "Start" to deal cards and post blinds
3. **Make Actions**: Use action buttons (Fold, Check, Call, Bet, Raise)
4. **Complete Hand**: Play through all betting rounds to showdown

### Game Flow
\`\`\`
Setup → Pre-flop → Flop → Turn → River → Showdown → Results
\`\`\`

### Action Options
- **Fold**: Give up your hand
- **Check**: Pass action (when no bet to call)
- **Call**: Match the current bet
- **Bet**: Make the first bet in a round
- **Raise**: Increase the current bet
- **All-in**: Bet all remaining chips

## 🔧 Development

### Manual Setup (Alternative)
\`\`\`bash
# Frontend setup
npm install
npm run dev

# Backend setup (separate terminal)
cd backend
pip install -r requirements.txt
python manage.py createdb
python manage.py runserver
\`\`\`

### Available Scripts

#### Frontend
\`\`\`bash
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run tests
npm run lint         # Lint code
\`\`\`

#### Backend
\`\`\`bash
npm run backend:start    # Start backend server
npm run backend:test     # Run backend tests
npm run backend:createdb # Initialize database
\`\`\`


# API testing
curl http://localhost:8000/api/v1/health
\`\`\`

## 🗄️ Database Schema

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
\`\`\`

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Root endpoint |
| `GET` | `/api/v1/health` | Health check |
| `POST` | `/api/v1/hands/` | Create new hand |
| `GET` | `/api/v1/hands/` | Get all hands |
| `GET` | `/api/v1/hands/{id}` | Get specific hand |
| `DELETE` | `/api/v1/hands/{id}` | Delete hand |
| `POST` | `/api/v1/hands/validate` | Validate hand data |

### Example API Usage
\`\`\`bash
# Get all hands
curl http://localhost:8000/api/v1/hands/

# Create a hand
curl -X POST http://localhost:8000/api/v1/hands/ \
  -H "Content-Type: application/json" \
  -d '{"stackSettings": [1000,1000,1000,1000,1000,1000], ...}'
\`\`\`

## 🧪 Architecture

### Frontend (Next.js + TypeScript)
- **React Components**: Modular UI components
- **Game Engine**: Complete poker logic implementation
- **API Integration**: Real-time backend synchronization
- **State Management**: React hooks for game state
- **Styling**: Tailwind CSS with shadcn/ui components

### Backend (FastAPI + Python)
- **RESTful API**: Clean endpoint design
- **Raw SQL**: Direct PostgreSQL queries (no ORM)
- **Data Models**: Dataclass-based entities
- **Validation**: Pydantic models and pokerkit integration
- **Error Handling**: Comprehensive exception management

### Database (PostgreSQL)
- **Normalized Schema**: Efficient data storage
- **JSON Fields**: Complex data in JSONB format
- **Indexing**: Optimized query performance
- **Constraints**: Data integrity enforcement

## 🔍 Debugging

### Frontend Debug Mode
The game includes a debug panel showing:
- Current game phase and active player
- Valid actions and betting information
- Hand history count and backend status

### Backend Logging
\`\`\`bash
# View backend logs
cd backend
python manage.py runserver
# Logs appear in terminal
\`\`\`

### Database Inspection
\`\`\`bash
# Connect to database
psql -U postgres -d poker_db

# View hands
SELECT hand_id, action_sequence, created_at FROM hands;
\`\`\`

## 🚨 Troubleshooting

### Common Issues

**Backend won't start:**
\`\`\`bash
# Check Python dependencies
cd backend
pip install -r requirements.txt

# Recreate database
python manage.py createdb
\`\`\`

**Frontend can't connect to backend:**
- Ensure backend is running on port 8000
- Check CORS settings in `backend/app/config.py`
- Verify API_BASE_URL in `lib/api/poker-api.ts`

**Database connection errors:**
\`\`\`bash
# Check PostgreSQL is running
sudo service postgresql start

# Verify database exists
psql -U postgres -l | grep poker_db
\`\`\`

**CORS errors in browser:**
- Backend is configured for `http://localhost:3000`
- Check browser console for specific CORS messages

## 📊 Game Statistics

The application tracks comprehensive statistics:
- **Hand Results**: Winner, hole cards, community cards
- **Action Sequences**: Complete betting history
- **Stack Changes**: Winnings and losses per player
- **Timing**: Timestamp for each hand
- **Positions**: Dealer, small blind, big blind tracking

## 🎯 Exercise Requirements Met

✅ **Frontend**: Next.js with TypeScript and shadcn/ui  
✅ **Backend**: FastAPI with PostgreSQL  
✅ **Game Logic**: Complete Texas Hold'em implementation  
✅ **API Design**: RESTful endpoints with proper error handling  
✅ **Database**: Raw SQL queries with proper schema  
✅ **Integration**: Real-time frontend-backend synchronization  
✅ **Testing**: Comprehensive test coverage  
✅ **Documentation**: Complete API documentation  

## 📝 License

This project is for educational purposes as part of a coding exercise.

## 🤝 Contributing

This is an exercise project, but feel free to:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

**Happy Playing! 🃏**

For questions or issues, check the troubleshooting section or review the API documentation at `http://localhost:8000/docs`.
