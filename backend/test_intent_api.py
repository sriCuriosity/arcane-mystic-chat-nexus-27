import pytest
from fastapi.testclient import TestClient
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from intent_api import app

client = TestClient(app)

def test_classify_intent_valid_prompt():
    response = client.post("/classify-intent", json={"prompt": "I want to improve my grammar", "threshold": 0.5})
    assert response.status_code == 200
    data = response.json()
    assert "matched_intention" in data
    assert "confidence" in data
    assert "recommended_tools" in data
    assert "is_fallback" in data
    assert "alternative_intentions" in data
    # alternative_intentions should be a list of dicts with 'intention' as str and 'score' as float
    for alt in data["alternative_intentions"]:
        assert isinstance(alt["intention"], str)
        assert isinstance(alt["score"], float)

def test_classify_intent_fallback():
    response = client.post("/classify-intent", json={"prompt": "Unrelated gibberish text", "threshold": 0.99})
    assert response.status_code == 200
    data = response.json()
    assert data["matched_intention"] is None
    assert data["is_fallback"] is True
    assert isinstance(data["confidence"], float)
    assert data["recommended_tools"] == []
    assert data["alternative_intentions"] == []

def test_classify_intent_default_threshold():
    response = client.post("/classify-intent", json={"prompt": "Create memes"})
    assert response.status_code == 200
    data = response.json()
    assert data["matched_intention"] is not None or data["is_fallback"] is True
