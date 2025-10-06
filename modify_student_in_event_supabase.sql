-- =====================================================
-- Script to Modify StudentInEvent Table (Option 1)
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Add session_id column to StudentInEvent table
ALTER TABLE "StudentInEvent" 
ADD COLUMN session_id UUID REFERENCES "EventSession"(session_id) ON DELETE CASCADE;

-- Step 2: Add index for better performance
CREATE INDEX idx_studentinevent_session_id ON "StudentInEvent"(session_id);

-- Step 3: Update unique constraint to include session_id
-- First drop the old constraint
ALTER TABLE "StudentInEvent" 
DROP CONSTRAINT IF EXISTS "StudentInEvent_EventId_StudentId_key";

-- Add new unique constraint that allows:
-- - One record per (event_id, student_id) when session_id IS NULL (event registration)
-- - One record per (event_id, student_id, session_id) when session_id IS NOT NULL (session registration)
CREATE UNIQUE INDEX unique_student_event_session 
ON "StudentInEvent" (event_id, student_id, COALESCE(session_id, '00000000-0000-0000-0000-000000000000'::uuid));

-- Step 4: Add check constraint to ensure session belongs to the event
ALTER TABLE "StudentInEvent"
ADD CONSTRAINT check_session_belongs_to_event 
CHECK (
    session_id IS NULL OR 
    EXISTS (
        SELECT 1 FROM "EventSession" es 
        WHERE es.session_id = "StudentInEvent".session_id 
        AND es.event_id = "StudentInEvent".event_id
    )
);

-- =====================================================
-- Verification Queries (Optional - Run to check)
-- =====================================================

-- Check if column was added successfully
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'StudentInEvent' 
ORDER BY ordinal_position;

-- Check constraints
SELECT conname, contype 
FROM pg_constraint 
WHERE conrelid = 'StudentInEvent'::regclass;

-- =====================================================
-- Sample Data Structure After Changes
-- =====================================================

-- Example 1: Student registers for entire event (existing behavior)
/*
INSERT INTO "StudentInEvent" (event_id, student_id, session_id, status)
VALUES (
    'event-123',
    'student-456', 
    NULL,  -- NULL means registered for entire event
    'registered'
);
*/

-- Example 2: Student registers for specific session only
/*
INSERT INTO "StudentInEvent" (event_id, student_id, session_id, status)
VALUES (
    'event-123',
    'student-456', 
    'session-789',  -- Specific session
    'registered'
);
*/

-- =====================================================
-- Business Logic Explanation
-- =====================================================

/*
After this change, StudentInEvent can represent:

1. EVENT REGISTRATION (session_id = NULL):
   - Student registered for the entire event
   - Can attend any session in that event
   - Existing behavior

2. SESSION REGISTRATION (session_id = specific_id):
   - Student registered for specific session only
   - Can only check-in to that specific session
   - New behavior for stricter control

For Check-in validation:
- If StudentInEvent has session_id = NULL → can check-in to any session in the event
- If StudentInEvent has session_id = X → can only check-in to session X
- If no StudentInEvent record exists → cannot check-in at all
*/