-- =====================================================
-- Option 1: Extend StudentInEvent Table (Simpler Approach)
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Add session_id column to StudentInEvent table
ALTER TABLE "StudentInEvent" 
ADD COLUMN session_id UUID REFERENCES "EventSession"(session_id) ON DELETE CASCADE;

-- Step 2: Add index for better performance
CREATE INDEX idx_studentinevent_session_id ON "StudentInEvent"(session_id);

-- Step 3: Update unique constraint to include session_id
-- First drop existing unique constraint
ALTER TABLE "StudentInEvent" 
DROP CONSTRAINT IF EXISTS unique_student_event;

-- Add new unique constraint that allows:
-- - One record per student per event (when session_id is NULL)
-- - One record per student per session (when session_id is NOT NULL)
ALTER TABLE "StudentInEvent"
ADD CONSTRAINT unique_student_event_session UNIQUE(event_id, student_id, session_id);

-- Step 4: Add check constraint to ensure data integrity
-- Either session_id is NULL (event registration) OR session_id belongs to the event
ALTER TABLE "StudentInEvent"
ADD CONSTRAINT check_session_belongs_to_event 
CHECK (
    session_id IS NULL OR 
    session_id IN (
        SELECT session_id FROM "EventSession" es 
        WHERE es.event_id = "StudentInEvent".event_id
    )
);

-- =====================================================
-- Data Migration (if needed)
-- =====================================================

-- If you want to convert existing event registrations to session-specific:
-- This example creates session registrations for all existing event registrations
/*
DO $$
DECLARE
    event_reg RECORD;
    session_rec RECORD;
BEGIN
    -- For each existing StudentInEvent record
    FOR event_reg IN 
        SELECT * FROM "StudentInEvent" WHERE session_id IS NULL
    LOOP
        -- Create registration for each session in that event
        FOR session_rec IN 
            SELECT session_id FROM "EventSession" 
            WHERE event_id = event_reg.event_id
        LOOP
            INSERT INTO "StudentInEvent" (event_id, student_id, session_id, status)
            VALUES (
                event_reg.event_id, 
                event_reg.student_id, 
                session_rec.session_id, 
                event_reg.status
            )
            ON CONFLICT (event_id, student_id, session_id) DO NOTHING;
        END LOOP;
    END LOOP;
END $$;
*/

-- =====================================================
-- Update SessionCheckIn to work with new structure
-- =====================================================

-- SessionCheckIn will now join through StudentInEvent with specific session_id
-- The existing student_in_event_id in SessionCheckIn should now reference
-- StudentInEvent records that have session_id NOT NULL

-- Add constraint to ensure SessionCheckIn only references session-specific registrations
ALTER TABLE "SessionCheckIn"
ADD CONSTRAINT check_sessioncheckin_has_session
CHECK (
    student_in_event_id IN (
        SELECT student_in_event_id FROM "StudentInEvent" 
        WHERE session_id IS NOT NULL
    )
);

-- =====================================================
-- Verification Queries
-- =====================================================

-- Check table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'StudentInEvent' 
ORDER BY ordinal_position;

-- Check constraints
SELECT conname, contype 
FROM pg_constraint 
WHERE conrelid = 'StudentInEvent'::regclass;

-- =====================================================
-- Example Usage After Changes
-- =====================================================

-- Example 1: Student registers for entire event (old way - optional)
/*
INSERT INTO "StudentInEvent" (event_id, student_id, session_id, status)
VALUES ('event-uuid', 'student-uuid', NULL, 'registered');
*/

-- Example 2: Student registers for specific session (new way)
/*
INSERT INTO "StudentInEvent" (event_id, student_id, session_id, status)
VALUES ('event-uuid', 'student-uuid', 'session-uuid', 'registered');
*/

-- Example 3: Check-in only works for session-specific registrations
/*
INSERT INTO "SessionCheckIn" (session_id, student_in_event_id, checkin_time, method)
SELECT 
    es.session_id,
    sie.student_in_event_id,
    NOW(),
    'QR'
FROM "StudentInEvent" sie
JOIN "EventSession" es ON sie.session_id = es.session_id
WHERE sie.student_id = 'student-uuid' 
  AND es.session_id = 'session-uuid'
  AND sie.session_id IS NOT NULL; -- Only session-specific registrations
*/