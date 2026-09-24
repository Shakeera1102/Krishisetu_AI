import sys
import os
from pathlib import Path

# Add current directory and parent directory to sys.path
current_dir = Path(__file__).resolve().parent
parent_dir = current_dir.parent
for path in [str(current_dir), str(parent_dir)]:
    if path not in sys.path:
        sys.path.insert(0, path)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

try:
    from app.schemas import PredictionRequest, PredictionResponse
    from app.model import model_instance
except ImportError:
    from schemas import PredictionRequest, PredictionResponse
    from model import model_instance

app = FastAPI(
    title="KrishiSetu AI Price Prediction Service",
    description="FastAPI Machine Learning Microservice for Agricultural Price Trajectories (SIH26132)",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "UP", "service": "ai-price-prediction"}

@app.post("/predict", response_model=PredictionResponse)
def predict_price(request: PredictionRequest):
    return model_instance.predict(request)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
