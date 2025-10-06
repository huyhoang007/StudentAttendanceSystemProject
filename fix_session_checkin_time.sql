-- Update check-in time window for session to allow current check-in
-- Session ID: 9d9bfff2-80c7-42ba-aefb-7324d5dd1d23
-- Current issue: Check-in window was Oct 1, 8:00-8:05 AM but now is Oct 3

-- Option 1: Extend check-in window to cover current time (Oct 3, 2025)
UPDATE EventSession 
SET checkin_start_time = '2025-10-03 00:00:00',  -- Start from today midnight
    checkin_end_time = '2025-10-03 23:59:59'     -- End at today midnight
WHERE session_id = '9d9bfff2-80c7-42ba-aefb-7324d5dd1d23';

-- Option 2: Remove time restriction (allow check-in anytime)
-- UPDATE EventSession 
-- SET checkin_start_time = NULL,
--     checkin_end_time = NULL
-- WHERE session_id = '9d9bfff2-80c7-42ba-aefb-7324d5dd1d23';

-- Verify the update
SELECT session_id, title, start_time, end_time, checkin_start_time, checkin_end_time 
FROM EventSession 
WHERE session_id = '9d9bfff2-80c7-42ba-aefb-7324d5dd1d23';