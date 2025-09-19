# Taxi Backend

FastAPI + DuckDB backend used to query NYC taxi trip data exposed from the `data/` directory.

## Setup

```bash
cd server
python -m pip install -e .
```

## Running locally

```bash
uvicorn app.main:app --reload
```

Then open http://127.0.0.1:8000/docs to interact with the API.

## Available endpoints

- `GET /rides/by-month?zone_src=<id>&zone_dst=<id>` — monthly ride counts between pickup and drop-off zones.
- `GET /health` — simple health check.
- `GET /config` — returns the data directory path that the backend is reading from.
