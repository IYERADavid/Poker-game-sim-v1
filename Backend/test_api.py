import pytest
import json
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    """Test health check endpoint"""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data

def test_create_hand():
    """Test creating a hand"""
    hand_data = {
        "stack_settings": [1000, 1000, 1000, 1000, 1000, 1000],
        "positions": {
            "dealer": 0,
            "smallBlind": 1,
            "bigBlind": 2
        },
        "hole_cards": {
            "0": "AhKs",
            "1": "QdJc",
            "2": "TsT9h",
            "3": "8h7d",
            "4": "6c5s",
            "5": "4h3d"
        },
        "action_sequence": "f f f f f",
        "winnings": {
            "0": 60,
            "1": -20,
            "2": -40,
            "3": 0,
            "4": 0,
            "5": 0
        }
    }
    
    response = client.post("/api/v1/hands/", json=hand_data)
    assert response.status_code == 200
    data = response.json()
    assert "hand_id" in data
    assert data["message"] == "Hand created successfully"

def test_get_hands():
    """Test getting all hands"""
    response = client.get("/api/v1/hands/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_validate_hand():
    """Test hand validation"""
    validation_data = {
        "hole_cards": {
            "0": "AhKs",
            "1": "QdJc"
        },
        "community_cards": ["Tc", "9h", "8s"],
        "action_sequence": "c c x x"
    }
    
    response = client.post("/api/v1/hands/validate", json=validation_data)
    assert response.status_code == 200
    data = response.json()
    assert "valid" in data

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
