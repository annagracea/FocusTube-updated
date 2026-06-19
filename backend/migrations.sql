-- Run this to add new tables needed for FocusTube v2

-- Users table (for real auth)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add created_at to allowlisted_channels if missing
ALTER TABLE allowlisted_channels ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Watch Later table
CREATE TABLE IF NOT EXISTS watch_later (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    video_id VARCHAR(50) NOT NULL,
    video_title TEXT,
    thumbnail TEXT,
    channel_title VARCHAR(255),
    channel_id VARCHAR(100),
    published_at TIMESTAMPTZ,
    saved_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, video_id)
);

-- Add watched_at to watch_history if missing
ALTER TABLE watch_history ADD COLUMN IF NOT EXISTS watched_at TIMESTAMPTZ DEFAULT NOW();
