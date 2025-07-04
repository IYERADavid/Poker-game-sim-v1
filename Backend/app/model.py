from dataclasses import dataclass, asdict
from typing import Dict, List, Any, Optional
from datetime import datetime
import json

@dataclass
class HandPositions:
    dealer: int
    small_blind: int
    big_blind: int

@dataclass
class HandRecord:
    """Hand record entity - matches frontend HandResult interface"""
    hand_id: str
    stack_settings: List[int]
    positions: HandPositions
    hole_cards: Dict[int, str]  # player_id -> cards (e.g., "AhKs")
    action_sequence: str
    winnings: Dict[int, int]  # player_id -> amount won/lost
    timestamp: datetime
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "hand_id": self.hand_id,
            "stack_settings": self.stack_settings,
            "positions": asdict(self.positions),
            "hole_cards": self.hole_cards,
            "action_sequence": self.action_sequence,
            "winnings": self.winnings,
            "timestamp": self.timestamp.isoformat()
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'HandRecord':
        """Create from dictionary"""
        return cls(
            hand_id=data["hand_id"],
            stack_settings=data["stack_settings"],
            positions=HandPositions(**data["positions"]),
            hole_cards=data["hole_cards"],
            action_sequence=data["action_sequence"],
            winnings=data["winnings"],
            timestamp=datetime.fromisoformat(data["timestamp"])
        )

@dataclass
class HandCreateRequest:
    """Request model for creating a hand"""
    stack_settings: List[int]
    positions: Dict[str, int]
    hole_cards: Dict[str, str]
    action_sequence: str
    winnings: Dict[str, int]

@dataclass
class HandValidationRequest:
    """Request model for hand validation"""
    hole_cards: Dict[str, str]
    community_cards: List[str]
    action_sequence: str
