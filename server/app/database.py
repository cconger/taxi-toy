from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Final

import duckdb
from duckdb import DuckDBPyConnection

DATA_DIR: Final[Path] = Path(__file__).resolve().parents[2] / "data"
TRIP_FILES_PATTERN: Final[str] = "yellow_tripdata_*.parquet"
VIEW_NAME: Final[str] = "taxi_trips"


def _build_dataset_glob() -> str:
    pattern_path = DATA_DIR / TRIP_FILES_PATTERN
    return str(pattern_path)


def _initialise_connection() -> DuckDBPyConnection:
    if not DATA_DIR.exists():
        msg = f"Expected data directory at {DATA_DIR}"
        raise FileNotFoundError(msg)

    if not any(DATA_DIR.glob(TRIP_FILES_PATTERN)):
        msg = f"No Parquet trip files found matching '{TRIP_FILES_PATTERN}' in {DATA_DIR}"
        raise FileNotFoundError(msg)

    conn = duckdb.connect()
    dataset_glob = _build_dataset_glob()
    conn.execute(
        f"""
        CREATE OR REPLACE VIEW {VIEW_NAME} AS
        SELECT * FROM read_parquet('{dataset_glob}')
        """
    )
    return conn


@lru_cache(maxsize=1)
def get_connection() -> DuckDBPyConnection:
    """Return a shared DuckDB connection with the taxi trips view ready."""
    return _initialise_connection()
