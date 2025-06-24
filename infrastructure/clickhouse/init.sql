-- Initialize ClickHouse database for analytics

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS analytics;

-- Use the analytics database
USE analytics;

-- Review events table for analytics
CREATE TABLE IF NOT EXISTS review_events (
    id UUID,
    event_type String,
    session_id UUID,
    project_id UUID,
    user_id UUID,
    timestamp DateTime64(3),
    metadata String,
    created_at DateTime64(3) DEFAULT now64()
) ENGINE = MergeTree()
ORDER BY (timestamp, event_type)
PARTITION BY toYYYYMM(timestamp);

-- Review metrics table for aggregated data
CREATE TABLE IF NOT EXISTS review_metrics (
    id UUID,
    project_id UUID,
    session_id UUID,
    metric_name String,
    metric_value Float64,
    metric_unit String,
    timestamp DateTime64(3),
    created_at DateTime64(3) DEFAULT now64()
) ENGINE = MergeTree()
ORDER BY (timestamp, metric_name)
PARTITION BY toYYYYMM(timestamp);

-- User activity table
CREATE TABLE IF NOT EXISTS user_activity (
    id UUID,
    user_id UUID,
    activity_type String,
    session_id UUID,
    project_id UUID,
    duration_seconds UInt32,
    timestamp DateTime64(3),
    created_at DateTime64(3) DEFAULT now64()
) ENGINE = MergeTree()
ORDER BY (timestamp, user_id)
PARTITION BY toYYYYMM(timestamp);

-- AI suggestions table
CREATE TABLE IF NOT EXISTS ai_suggestions (
    id UUID,
    session_id UUID,
    user_id UUID,
    suggestion_type String,
    code_language String,
    suggestion_text String,
    accepted Boolean,
    timestamp DateTime64(3),
    created_at DateTime64(3) DEFAULT now64()
) ENGINE = MergeTree()
ORDER BY (timestamp, suggestion_type)
PARTITION BY toYYYYMM(timestamp);

-- Performance metrics table
CREATE TABLE IF NOT EXISTS performance_metrics (
    id UUID,
    service_name String,
    metric_name String,
    metric_value Float64,
    tags String,
    timestamp DateTime64(3),
    created_at DateTime64(3) DEFAULT now64()
) ENGINE = MergeTree()
ORDER BY (timestamp, service_name, metric_name)
PARTITION BY toYYYYMM(timestamp);

-- Create materialized views for common aggregations

-- Daily review counts
CREATE MATERIALIZED VIEW IF NOT EXISTS daily_review_counts
ENGINE = SummingMergeTree()
ORDER BY (date, project_id)
AS SELECT
    toDate(timestamp) as date,
    project_id,
    count() as review_count
FROM review_events
WHERE event_type = 'review_started'
GROUP BY date, project_id;

-- User activity summary
CREATE MATERIALIZED VIEW IF NOT EXISTS user_activity_summary
ENGINE = SummingMergeTree()
ORDER BY (date, user_id)
AS SELECT
    toDate(timestamp) as date,
    user_id,
    count() as activity_count,
    sum(duration_seconds) as total_duration
FROM user_activity
GROUP BY date, user_id;

-- AI suggestion acceptance rates
CREATE MATERIALIZED VIEW IF NOT EXISTS ai_suggestion_rates
ENGINE = SummingMergeTree()
ORDER BY (date, suggestion_type)
AS SELECT
    toDate(timestamp) as date,
    suggestion_type,
    count() as total_suggestions,
    sum(if(accepted, 1, 0)) as accepted_suggestions
FROM ai_suggestions
GROUP BY date, suggestion_type; 