from __future__ import annotations

from datetime import date
from typing import List, Tuple

from duckdb import DuckDBPyConnection


def fetch_zone_to_zone_monthly_counts(
    conn: DuckDBPyConnection,
    zone_src: int,
    zone_dst: int,
) -> List[Tuple[date, int]]:
    """Return ride counts per month for the given pickup and dropoff zones."""
    query = """
        SELECT
            date_trunc('month', tpep_pickup_datetime)::DATE AS month,
            COUNT(*) AS ride_count
        FROM taxi_trips
        WHERE PULocationID = ?
          AND DOLocationID = ?
        GROUP BY month
        ORDER BY month
    """
    rows = conn.execute(query, [zone_src, zone_dst]).fetchall()
    return [(row[0], row[1]) for row in rows]
