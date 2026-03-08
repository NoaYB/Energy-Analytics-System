-- Query that returns device_ids where the average current in the last 24 hours
-- is at least 20% higher than the historical average for the same device
WITH HistoricalAvg AS (
    -- Calculate the historical average current for each device
    SELECT device_id, AVG(current) AS hist_avg
    FROM device_logs
    WHERE current IS NOT NULL
    GROUP BY device_id
),
RecentAvg AS (
    -- Calculate the average current per device in the last 24 hours
    SELECT device_id, AVG(current) AS recent_avg
    FROM device_logs
    WHERE `timestamp` >= NOW() - INTERVAL 24 HOUR
    AND current IS NOT NULL
    GROUP BY device_id
)
-- Join the two aggregates and return devices with abnormal increase
SELECT r.device_id
FROM RecentAvg r
JOIN HistoricalAvg h ON r.device_id = h.device_id
WHERE r.recent_avg >= (1.20 * h.hist_avg);
/*
==============================================================
Indexing Strategy for a Table with 10 Million Rows
==============================================================

To ensure the query runs efficiently on a large dataset, we need to focus on the
main operations performed by the query: filtering by time and grouping by device_id.

Covering indexes are used so the database engine can retrieve all required
information directly from the index without accessing the base table,
which significantly improves performance.

Index for the RecentAvg calculation:
------------------------------------
CREATE INDEX idx_timestamp_device_current
ON device_logs (`timestamp`, device_id, current);

Explanation:
This part of the query filters rows from the last 24 hours using the timestamp column.
Placing timestamp as the first column allows MySQL to perform an efficient range scan
and quickly locate the relevant rows.

Adding device_id and current turns the index into a covering index, allowing the
database engine to perform the GROUP BY operation and compute AVG(current)
directly from the index without reading the table rows.

Architectural consideration for large production systems:
=========================================================
Even with appropriate indexes, computing historical aggregates directly from
millions of raw records can still be expensive.

In production, this is often improved by partitioning the logs table by time
and maintaining a summary table with precomputed daily or hourly aggregates.

This reduces the amount of scanned data for recent queries and allows
historical calculations to run on a much smaller aggregated dataset,
improving performance and scalability.
*/