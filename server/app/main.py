from __future__ import annotations

from fastapi import FastAPI, HTTPException, Query

from .database import DATA_DIR, get_connection
from .models import MonthlyRideCount, ZoneToZoneRideResponse
from .queries import fetch_zone_to_zone_monthly_counts

app = FastAPI(
    title="Taxi Analytics API",
    description="APIs for exploring NYC taxi trip data",
    version="0.1.0",
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/rides/by-month", response_model=ZoneToZoneRideResponse)
def rides_by_month(
    zone_src: int = Query(..., alias="zone_src", ge=1, description="Pickup zone ID"),
    zone_dst: int = Query(..., alias="zone_dst", ge=1, description="Drop-off zone ID"),
) -> ZoneToZoneRideResponse:
    try:
        conn = get_connection()
    except FileNotFoundError as error:
        raise HTTPException(status_code=500, detail=str(error)) from error

    rows = fetch_zone_to_zone_monthly_counts(conn, zone_src=zone_src, zone_dst=zone_dst)

    results = [MonthlyRideCount(month=month, ride_count=count) for month, count in rows]

    return ZoneToZoneRideResponse(zone_src=zone_src, zone_dst=zone_dst, results=results)


@app.get("/config")
def config() -> dict[str, str]:
    return {"data_directory": str(DATA_DIR)}
