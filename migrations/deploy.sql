-- Production DDL Schema Blueprints (migrations/deploy.sql)
BEGIN;

CREATE TABLE IF NOT EXISTS users (
    user_id VARCHAR(64) PRIMARY KEY,
    display_name VARCHAR(128) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS grid_nodes (
    node_id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    classification VARCHAR(64) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    base_radius_meters INTEGER DEFAULT 100,
    is_shielded BOOLEAN DEFAULT FALSE,
    shield_last_cleared_at TIMESTAMP WITH TIME ZONE,
    shield_expires_at TIMESTAMP WITH TIME ZONE,
    secured_by_user_id VARCHAR(64) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS landmark_sync_logs (
    sync_id VARCHAR(64) PRIMARY KEY,
    landmark_id VARCHAR(64) NOT NULL,
    completed_by_user VARCHAR(64) DEFAULT 'local_operator',
    synchronized_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    http_status_code INTEGER DEFAULT 200,
    delivery_status VARCHAR(32) NOT NULL,
    payload_json JSONB
);

CREATE INDEX IF NOT EXISTS idx_nodes_geo ON grid_nodes (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_sync_chronological ON landmark_sync_logs (synchronized_at DESC);

COMMIT;
