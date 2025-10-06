-- =====================================================
-- Script to Remove session_id Column from StudentInEvent
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Drop the foreign key constraint first (if exists)
ALTER TABLE "StudentInEvent" 
DROP CONSTRAINT IF EXISTS "StudentInEvent_session_id_fkey";

-- Step 2: Drop the index on session_id (if exists)
DROP INDEX IF EXISTS idx_studentinevent_session_id;

-- Step 3: Drop the session_id column
ALTER TABLE "StudentInEvent" 
DROP COLUMN IF EXISTS session_id;

-- Step 4: Recreate the original unique constraint
-- Drop the complex constraint if it exists
DROP INDEX IF EXISTS unique_student_event_session;

-- Add back the simple unique constraint
ALTER TABLE "StudentInEvent" 
ADD CONSTRAINT unique_student_event UNIQUE (event_id, student_id);

-- =====================================================
-- Verification Queries (Optional - Run to check)
-- =====================================================

-- Check if session_id column was removed
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'StudentInEvent' 
ORDER BY ordinal_position;

-- Check constraints
SELECT conname, contype 
FROM pg_constraint 
WHERE conrelid = 'StudentInEvent'::regclass;

-- =====================================================
-- Final Table Structure Should Be:
-- =====================================================
/*
CREATE TABLE "StudentInEvent" (
    student_in_event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES "Event"(event_id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES "Student"(student_id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'registered', -- registered, cancelled, attended
    UNIQUE(event_id, student_id) -- One registration per student per event
);
*/