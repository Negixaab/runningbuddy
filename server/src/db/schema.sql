-- RunSphere Database Schema
-- This script defines the tables for the gamified running application.
-- It's designed for PostgreSQL and uses the PostGIS extension for spatial data.

-- Enable the UUID and PostGIS extensions.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Table for storing user information and authentication details.
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Store hashed passwords, never plaintext.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    current_streak INTEGER DEFAULT 0 NOT NULL
);

-- Table for logging every run an individual user completes.
CREATE TABLE runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- If a user is deleted, their runs are also deleted.
    distance_km DECIMAL(10, 3) NOT NULL CHECK (distance_km >= 0),
    duration_seconds INTEGER NOT NULL CHECK (duration_seconds >= 0),
    elevation_meters INTEGER,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Storing the path as a PostGIS GEOMETRY type. SRID 4326 is for WGS 84 (standard lat/long).
    path GEOMETRY(LineString, 4326)
);

-- Table to define all available challenges in the application.
CREATE TABLE challenges (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL, -- e.g., 'daily_run', 'distance_milestone', 'elevation_gain'
    goal_value DECIMAL(10, 3) NOT NULL,
    goal_unit VARCHAR(20) NOT NULL, -- e.g., 'km', 'meters', 'runs'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Junction table to track user progress on specific challenges.
CREATE TABLE user_challenges (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    challenge_id INTEGER NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    progress DECIMAL(10, 3) DEFAULT 0.0,
    status VARCHAR(50) DEFAULT 'in_progress' NOT NULL, -- e.g., 'in_progress', 'completed'
    assigned_date DATE DEFAULT CURRENT_DATE, -- Useful for daily/weekly challenges
    completed_at TIMESTAMP WITH TIME ZONE,
    -- A user can attempt the same type of challenge on different days (e.g. daily challenges)
    UNIQUE(user_id, challenge_id, assigned_date)
);

-- Table for storing recommended running tracks.
CREATE TABLE tracks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    distance_km DECIMAL(5, 2),
    difficulty VARCHAR(50),
    description TEXT,
    image_url VARCHAR(255),
    -- Storing the route as a PostGIS GEOMETRY type.
    route GEOMETRY(LineString, 4326)
);

-- Add indexes for frequently queried columns to improve performance.
CREATE INDEX idx_runs_user_id ON runs(user_id);
CREATE INDEX idx_user_challenges_user_id ON user_challenges(user_id);
CREATE INDEX idx_user_challenges_challenge_id ON user_challenges(challenge_id);

-- Add SPATIAL indexes using GIST for the geometry columns. This is crucial for performance.
CREATE INDEX idx_runs_path ON runs USING GIST (path);
CREATE INDEX idx_tracks_route ON tracks USING GIST (route);

-- You can add some initial data for testing purposes if needed.
-- Example:
-- INSERT INTO tracks (name, location, distance_km, difficulty, description)
-- VALUES ('Forest Research Institute (FRI) Loop', 'Dehradun, Uttarakhand', 6.5, 'Easy', 'A beautiful, flat loop with lush greenery...');

