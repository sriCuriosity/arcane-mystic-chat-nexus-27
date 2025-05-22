from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List, Dict
import random

app = FastAPI()

# Enable CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PromptInput(BaseModel):
    prompt: str

@app.post("/classify-intent")
async def classify_intent(data: PromptInput):
    prompt = data.prompt.lower()

    # Dummy classification logic
    if any(word in prompt for word in ["learn", "study", "prepare", "revise"]):
        return {
            "intention": "study_optimization",
            "matched_intention": "Study Optimization",
            "confidence": round(random.uniform(0.7, 0.95), 2),
            "recommended_tools": [
                {"name": "Notion"},
                {"name": "Anki"},
                {"name": "Pomofocus"},
                {"name": "Quizlet"}
            ]
        }
    else:
        return {
            "intention": None,
            "matched_intention": None,
            "confidence": round(random.uniform(0.2, 0.5), 2),
            "recommended_tools": []
        }
