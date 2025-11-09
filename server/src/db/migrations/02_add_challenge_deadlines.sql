-- Add deadline and active challenge tracking
ALTER TABLE user_challenges
ADD COLUMN IF NOT EXISTS deadline TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS start_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Modify status column
ALTER TABLE user_challenges 
ALTER COLUMN status DROP DEFAULT;

ALTER TABLE user_challenges 
ALTER COLUMN status SET DEFAULT 'not_started';

-- Update the status enum to include more states
UPDATE user_challenges 
SET status = 'not_started' 
WHERE status = 'in_progress';

-- Add a constraint to ensure only one active challenge per user
CREATE OR REPLACE FUNCTION check_active_challenges()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'active' THEN
        IF EXISTS (
            SELECT 1 FROM user_challenges 
            WHERE user_id = NEW.user_id 
            AND status = 'active'
            AND id != NEW.id
        ) THEN
            RAISE EXCEPTION 'User already has an active challenge';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_single_active_challenge
    BEFORE INSERT OR UPDATE ON user_challenges
    FOR EACH ROW
    EXECUTE FUNCTION check_active_challenges();