import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

# Ensure sys.path contains root of ai-service
current_dir = Path(__file__).resolve().parent
if str(current_dir) not in sys.path:
    sys.path.insert(0, str(current_dir))

from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "UP", "service": "ai-price-prediction"}

def test_predict_price():
    payload = {
        "crop": "Onion",
        "variety": "Nasik Red",
        "market": "Nashik APMC",
        "currentPrice": 3200.0,
        "days": 7
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["crop"] == "Onion"
    assert data["currentPrice"] == 3200.0
    assert len(data["predictions"]) == 3
    assert data["trend"] in ["INCREASING", "DECREASING", "STABLE"]
    assert data["confidence"] > 0.5
