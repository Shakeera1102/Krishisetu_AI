from pydantic import BaseModel, Field
from typing import List, Optional

class PredictionRequest(BaseModel):
    crop: str = Field(default="Onion", description="Crop name")
    variety: Optional[str] = Field(default="Nasik Red", description="Crop variety")
    market: Optional[str] = Field(default="Nashik APMC", description="Mandi name")
    currentPrice: Optional[float] = Field(default=3200.0, description="Current modal price in ₹/quintal")
    days: Optional[int] = Field(default=7, description="Number of forecast days")

class PredictionPoint(BaseModel):
    daysAhead: int
    predictedPrice: float

class FactorImpact(BaseModel):
    name: str
    impact: str

class PredictionResponse(BaseModel):
    crop: str
    variety: Optional[str]
    market: Optional[str]
    currentPrice: float
    predictions: List[PredictionPoint]
    trend: str # 'INCREASING', 'DECREASING', 'STABLE'
    confidence: float
    recommendation: str
    disclaimer: str
    factors: List[FactorImpact]
