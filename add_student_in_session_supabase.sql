-- =====================================================
-- Script to Add StudentInSession Table to Supabase
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Create StudentInSession table
CREATE TABLE "StudentInSession" (
    student_in_session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES "EventSession"(session_id) ON DELETE CASCADE,
    student_in_event_id UUID NOT NULL REFERENCES "StudentInEvent"(student_in_event_id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'registered', -- registered, cancelled, attended
    registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Prevent duplicate registration for same session by same student
    CONSTRAINT unique_student_session UNIQUE(session_id, student_in_event_id)
);

-- Step 2: Add indexes for better performance
CREATE INDEX idx_studentinsession_session_id ON "StudentInSession"(session_id);
CREATE INDEX idx_studentinsession_student_in_event_id ON "StudentInSession"(student_in_event_id);
CREATE INDEX idx_studentinsession_status ON "StudentInSession"(status);

-- Step 3: Add new column to SessionCheckIn table
ALTER TABLE "SessionCheckIn" 
ADD COLUMN student_in_session_id UUID REFERENCES "StudentInSession"(student_in_session_id) ON DELETE CASCADE;

-- Step 4: Create index for new foreign key
CREATE INDEX idx_sessioncheckin_student_in_session_id ON "SessionCheckIn"(student_in_session_id);

-- Step 5: Update existing SessionCheckIn records (if any exist)
-- This creates StudentInSession records for existing check-ins
-- and updates the SessionCheckIn records to reference them
DO $$
DECLARE
    checkin_record RECORD;
    new_student_in_session_id UUID;
BEGIN
    -- For each existing SessionCheckIn, create a corresponding StudentInSession
    FOR checkin_record IN 
        SELECT DISTINCT sc.session_id, sc.student_in_event_id, sc.checkin_id
        FROM "SessionCheckIn" sc
        WHERE sc.student_in_session_id IS NULL
    LOOP
        -- Insert or get existing StudentInSession record
        INSERT INTO "StudentInSession" (session_id, student_in_event_id, status, registered_at)
        VALUES (checkin_record.session_id, checkin_record.student_in_event_id, 'attended', NOW())
        ON CONFLICT (session_id, student_in_event_id) 
        DO UPDATE SET status = 'attended'
        RETURNING student_in_session_id INTO new_student_in_session_id;
        
        -- Update SessionCheckIn to reference the StudentInSession
        UPDATE "SessionCheckIn"
        SET student_in_session_id = new_student_in_session_id
        WHERE session_id = checkin_record.session_id 
          AND student_in_event_id = checkin_record.student_in_event_id
          AND student_in_session_id IS NULL;
    END LOOP;
END $$;

-- Step 6: Make student_in_session_id NOT NULL after data migration
ALTER TABLE "SessionCheckIn" 
ALTER COLUMN student_in_session_id SET NOT NULL;

-- Step 7: Remove old foreign key constraint and column
ALTER TABLE "SessionCheckIn" 
DROP COLUMN student_in_event_id;

-- Step 8: Add unique constraint to prevent duplicate check-ins
ALTER TABLE "SessionCheckIn"
ADD CONSTRAINT unique_session_checkin UNIQUE(session_id, student_in_session_id);

-- =====================================================
-- Verification Queries (Optional - Run to check)
-- =====================================================

-- Check if StudentInSession table was created successfully
SELECT COUNT(*) as student_in_session_count FROM "StudentInSession";

-- Check SessionCheckIn table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'SessionCheckIn' 
ORDER BY ordinal_position;

-- Check if constraints were added properly
SELECT conname, contype 
FROM pg_constraint 
WHERE conrelid = 'StudentInSession'::regclass;

-- =====================================================
-- Sample Insert Queries for Testing
-- =====================================================

-- Example: Register a student for a specific session
-- (Replace with actual UUIDs from your database)
/*
INSERT INTO "StudentInSession" (session_id, student_in_event_id, status)
VALUES (
    'your-session-id-here',
    'your-student-in-event-id-here', 
    'registered'
);
*/

-- Example: Check-in a student who is registered for the session
/*
INSERT INTO "SessionCheckIn" (session_id, student_in_session_id, checkin_time, method, location)
VALUES (
    'your-session-id-here',
    'your-student-in-session-id-here',
    NOW(),
    'QR',
    'Room 101'
);
*/