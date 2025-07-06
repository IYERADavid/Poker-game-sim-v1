from fastapi import APIRouter, HTTPException, status
from typing import List, Dict, Any
import uuid
from datetime import datetime
import json
import logging

from ...model import HandRecord, HandCreateRequest, HandValidationRequest, HandPositions
from ...database import db

# Import pokerkit for hand validation
try:
    from pokerkit import Card
    POKERKIT_AVAILABLE = True
except ImportError:
    POKERKIT_AVAILABLE = False
    logging.warning("pokerkit not available - hand validation will be simplified")

router = APIRouter(prefix="/api/v1", tags=["hands"])

@router.post("/hands/", response_model=Dict[str, Any])
async def create_hand(request: HandCreateRequest):
    """Create a new hand record"""
    try:
        # Validate pokerkit is available
        if not POKERKIT_AVAILABLE:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="pokerkit library is not available"
            )

        used_cards = set()

        for player_id_str, card_str in request.hole_cards.items():
            if len(card_str) != 4:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Hole cards for player {player_id_str} must be 4 characters like 'AsKd'"
                )
            try:
                # Parse the two cards for this player
                card1 = Card(card_str[0], card_str[1])
                card2 = Card(card_str[2], card_str[3])

            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid card format for player {player_id_str}: {card_str} ({e})"
                )
            
            for card in (card1, card2):
                if card in used_cards:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Duplicate card detected: {card}"
                    )
                used_cards.add(card)

        # Generate unique hand ID
        hand_id = str(uuid.uuid4())
        
        # Convert request to HandRecord
        positions = HandPositions(
            dealer=request.positions["dealer"],
            small_blind=request.positions["small_blind"],
            big_blind=request.positions["big_blind"]
        )
        
        # Convert string keys to int keys for consistency
        hole_cards = {int(k): v for k, v in request.hole_cards.items()}
        winnings = {int(k): v for k, v in request.winnings.items()}
        
        hand_record = HandRecord(
            hand_id=hand_id,
            stack_settings=request.stack_settings,
            positions=positions,
            hole_cards=hole_cards,
            action_sequence=request.action_sequence,
            winnings=winnings,
            timestamp=datetime.now()
        )
        
        # Calculate total winnings for validation
        total_winnings = sum(winnings.values())
        if abs(total_winnings) > 1:  # Allow for small rounding errors
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Winnings must sum to zero, got {total_winnings}"
            )
        
        # Insert into database
        query = """
        INSERT INTO hands (
            hand_id, stack_settings, dealer_position, small_blind_position, 
            big_blind_position, hole_cards, action_sequence, winnings, created_at
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        params = (
            hand_record.hand_id,
            json.dumps(hand_record.stack_settings),
            hand_record.positions.dealer,
            hand_record.positions.small_blind,
            hand_record.positions.big_blind,
            json.dumps(hand_record.hole_cards),
            hand_record.action_sequence,
            json.dumps(hand_record.winnings),
            hand_record.timestamp
        )
        
        rows_affected = db.execute_command(query, params)
        
        if rows_affected == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create hand record"
            )
        
        return {
            "hand_id": hand_id,
            "message": "Hand created successfully",
            "data": hand_record.to_dict()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error creating hand: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/hands/", response_model=List[Dict[str, Any]])
async def get_all_hands():
    """Get all hand records"""
    try:
        query = """
        SELECT hand_id, stack_settings, dealer_position, small_blind_position,
               big_blind_position, hole_cards, action_sequence, winnings, created_at
        FROM hands 
        ORDER BY created_at DESC
        """
        
        rows = db.execute_query(query)
        
        hands = []
        for row in rows:
            hand_data = {
                "handId": row["hand_id"],
                "stackSettings": row["stack_settings"],
                "positions": {
                    "dealer": row["dealer_position"],
                    "smallBlind": row["small_blind_position"],
                    "bigBlind": row["big_blind_position"]
                },
                "holeCards": row["hole_cards"],
                "actionSequence": row["action_sequence"],
                "winnings": row["winnings"],
                "timestamp": row["created_at"].isoformat()
            }
            hands.append(hand_data)
        
        return hands
        
    except Exception as e:
        logging.error(f"Error fetching hands: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/hands/{hand_id}", response_model=Dict[str, Any])
async def get_hand(hand_id: str):
    """Get a specific hand by ID"""
    try:
        query = """
        SELECT hand_id, stack_settings, dealer_position, small_blind_position,
               big_blind_position, hole_cards, action_sequence, winnings, created_at
        FROM hands 
        WHERE hand_id = %s
        """
        
        rows = db.execute_query(query, (hand_id,))
        
        if not rows:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Hand {hand_id} not found"
            )
        
        row = rows[0]
        return {
            "handId": row["hand_id"],
            "stackSettings": row["stack_settings"],
            "positions": {
                "dealer": row["dealer_position"],
                "smallBlind": row["small_blind_position"],
                "bigBlind": row["big_blind_position"]
            },
            "holeCards": row["hole_cards"],
            "actionSequence": row["action_sequence"],
            "winnings": row["winnings"],
            "timestamp": row["created_at"].isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error fetching hand {hand_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.delete("/hands/{hand_id}")
async def delete_hand(hand_id: str):
    """Delete a specific hand"""
    try:
        query = "DELETE FROM hands WHERE hand_id = %s"
        rows_affected = db.execute_command(query, (hand_id,))
        
        if rows_affected == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Hand {hand_id} not found"
            )
        
        return {"message": f"Hand {hand_id} deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error deleting hand {hand_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Test database connection
        db.execute_query("SELECT 1")
        return {
            "status": "healthy",
            "database": "connected",
            "pokerkit": "available" if POKERKIT_AVAILABLE else "not available"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }
