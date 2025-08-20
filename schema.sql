-- Qada Tracker Database Setup
-- This SQL script sets up the database for tracking missed Salah (qada prayers)

-- 1. Drop existing work-related tables if they exist
DROP TABLE IF EXISTS work_sessions CASCADE;
DROP VIEW IF EXISTS user_stats CASCADE;

-- 2. Create the qada_settings table for user configuration
CREATE TABLE IF NOT EXISTS qada_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  start_date DATE,
  end_date DATE,
  number_of_days INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure either date range OR number of days is provided
  CONSTRAINT check_date_or_days CHECK (
    (start_date IS NOT NULL AND end_date IS NOT NULL AND number_of_days IS NULL) OR
    (start_date IS NULL AND end_date IS NULL AND number_of_days IS NOT NULL)
  ),
  CONSTRAINT check_valid_date_range CHECK (
    start_date IS NULL OR end_date IS NULL OR start_date <= end_date
  ),
  CONSTRAINT check_positive_days CHECK (
    number_of_days IS NULL OR number_of_days > 0
  )
);

-- 3. Create the qada_progress table for tracking daily Salah completion
CREATE TABLE IF NOT EXISTS qada_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  day_number INTEGER NOT NULL,
  fajr_completed BOOLEAN DEFAULT FALSE,
  dhuhr_completed BOOLEAN DEFAULT FALSE,
  asr_completed BOOLEAN DEFAULT FALSE,
  maghrib_completed BOOLEAN DEFAULT FALSE,
  isha_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one record per user per day
  UNIQUE(user_id, day_number),
  
  -- Ensure positive day numbers
  CONSTRAINT check_positive_day_number CHECK (day_number > 0)
);

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_qada_settings_user_id ON qada_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_qada_progress_user_id ON qada_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_qada_progress_day_number ON qada_progress(day_number);
CREATE INDEX IF NOT EXISTS idx_qada_progress_user_day ON qada_progress(user_id, day_number);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE qada_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE qada_progress ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for qada_settings
-- Policy: Users can only see their own settings
CREATE POLICY "Users can view own settings" ON qada_settings
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can only insert their own settings
CREATE POLICY "Users can insert own settings" ON qada_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only update their own settings
CREATE POLICY "Users can update own settings" ON qada_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can only delete their own settings
CREATE POLICY "Users can delete own settings" ON qada_settings
  FOR DELETE USING (auth.uid() = user_id);

-- 7. Create RLS policies for qada_progress
-- Policy: Users can only see their own progress
CREATE POLICY "Users can view own progress" ON qada_progress
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can only insert their own progress
CREATE POLICY "Users can insert own progress" ON qada_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only update their own progress
CREATE POLICY "Users can update own progress" ON qada_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can only delete their own progress
CREATE POLICY "Users can delete own progress" ON qada_progress
  FOR DELETE USING (auth.uid() = user_id);

-- 8. Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 9. Create triggers to automatically update updated_at
CREATE TRIGGER update_qada_settings_updated_at
  BEFORE UPDATE ON qada_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_qada_progress_updated_at
  BEFORE UPDATE ON qada_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 10. Create useful views for statistics
CREATE OR REPLACE VIEW user_qada_stats AS
SELECT 
  user_id,
  COUNT(*) as total_days,
  SUM(CASE WHEN fajr_completed THEN 1 ELSE 0 END) as fajr_completed_count,
  SUM(CASE WHEN dhuhr_completed THEN 1 ELSE 0 END) as dhuhr_completed_count,
  SUM(CASE WHEN asr_completed THEN 1 ELSE 0 END) as asr_completed_count,
  SUM(CASE WHEN maghrib_completed THEN 1 ELSE 0 END) as maghrib_completed_count,
  SUM(CASE WHEN isha_completed THEN 1 ELSE 0 END) as isha_completed_count,
  SUM((fajr_completed::int + dhuhr_completed::int + asr_completed::int + maghrib_completed::int + isha_completed::int)) as total_prayers_completed,
  COUNT(*) * 5 as total_prayers_required,
  ROUND(
    (SUM((fajr_completed::int + dhuhr_completed::int + asr_completed::int + maghrib_completed::int + isha_completed::int))::decimal / (COUNT(*) * 5) * 100), 
    2
  ) as completion_percentage
FROM qada_progress
GROUP BY user_id;

-- Ensure the view runs with the invoking user's permissions so RLS on base tables applies
ALTER VIEW public.user_qada_stats SET (security_invoker = true);

-- Grant explicit access to the authenticated role; rely on RLS for row filtering
GRANT SELECT ON public.user_qada_stats TO authenticated;

-- 11. Create a function to get or create progress for a specific day
CREATE OR REPLACE FUNCTION get_or_create_day_progress(p_user_id UUID, p_day_number INTEGER)
RETURNS qada_progress
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  progress_record qada_progress;
BEGIN
  -- Try to get existing record
  SELECT * INTO progress_record 
  FROM qada_progress 
  WHERE user_id = p_user_id AND day_number = p_day_number;
  
  -- If no record exists, create one
  IF NOT FOUND THEN
    INSERT INTO qada_progress (user_id, day_number)
    VALUES (p_user_id, p_day_number)
    RETURNING * INTO progress_record;
  END IF;
  
  RETURN progress_record;
END;
$$;

-- 12. Enable email authentication (already enabled by default in Supabase)
-- Email authentication is enabled by default in Supabase
-- Users can sign up with email/password without additional configuration

-- 13. Sample data for testing (uncomment to use)
/*
-- Example user settings using number of days
INSERT INTO qada_settings (user_id, number_of_days) 
VALUES ('your-test-user-id', 30);

-- Example progress for first few days
INSERT INTO qada_progress (user_id, day_number, fajr_completed, dhuhr_completed) 
VALUES 
  ('your-test-user-id', 1, true, true),
  ('your-test-user-id', 2, true, false),
  ('your-test-user-id', 3, false, true);
*/

-- 14. Useful queries for the application

-- Get user settings
/*
SELECT * FROM qada_settings WHERE user_id = 'user-id-here';
*/

-- Get user progress for all days
/*
SELECT * FROM qada_progress 
WHERE user_id = 'user-id-here' 
ORDER BY day_number;
*/

-- Get completion statistics for a user
/*
SELECT * FROM user_qada_stats WHERE user_id = 'user-id-here';
*/

-- Check if all prayers are completed for a specific day
/*
SELECT 
  day_number,
  (fajr_completed AND dhuhr_completed AND asr_completed AND maghrib_completed AND isha_completed) as all_completed
FROM qada_progress 
WHERE user_id = 'user-id-here' AND day_number = 1;
*/
