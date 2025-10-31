-- Enable RLS
ALTER TABLE autobiography_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE autobiography_chapter_progress ENABLE ROW LEVEL SECURITY;

-- autobiography_entries policies
CREATE POLICY "Users can view own entries"
ON autobiography_entries FOR SELECT
USING (auth.uid()::text = "userId");

CREATE POLICY "Anyone can view public entries"
ON autobiography_entries FOR SELECT
USING ("isPublic" = true);

CREATE POLICY "Users can create own entries"
ON autobiography_entries FOR INSERT
WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update own entries"
ON autobiography_entries FOR UPDATE
USING (auth.uid()::text = "userId");

CREATE POLICY "Users can delete own entries"
ON autobiography_entries FOR DELETE
USING (auth.uid()::text = "userId");

-- autobiography_chapter_progress policies
CREATE POLICY "Users can view own progress"
ON autobiography_chapter_progress FOR SELECT
USING (auth.uid()::text = "userId");

CREATE POLICY "Users can insert own progress"
ON autobiography_chapter_progress FOR INSERT
WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update own progress"
ON autobiography_chapter_progress FOR UPDATE
USING (auth.uid()::text = "userId");
