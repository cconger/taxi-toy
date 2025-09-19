from __future__ import annotations

from datetime import date
from typing import List

from pydantic import BaseModel, Field


class MonthlyRideCount(BaseModel):
    month: date = Field(description="Calendar month of ride activity")
    ride_count: int = Field(ge=0, description="Number of rides during the month")


class ZoneToZoneRideResponse(BaseModel):
    zone_src: int = Field(ge=1)
    zone_dst: int = Field(ge=1)
    results: List[MonthlyRideCount]
