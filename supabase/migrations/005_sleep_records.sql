CREATE TABLE sleep_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  baby_id UUID NOT NULL REFERENCES babies(id) ON DELETE CASCADE,
  person TEXT NOT NULL CHECK (person IN ('papa', 'mama')),
  recorded_date DATE NOT NULL,
  recorded_hour INTEGER NOT NULL CHECK (recorded_hour >= 0 AND recorded_hour <= 23),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (baby_id, person, recorded_date, recorded_hour)
);

ALTER TABLE sleep_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sleep_select" ON sleep_records FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM baby_members
    WHERE baby_members.baby_id = sleep_records.baby_id
    AND baby_members.user_id = auth.uid()
  ));

CREATE POLICY "sleep_insert" ON sleep_records FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM baby_members
      WHERE baby_members.baby_id = sleep_records.baby_id
      AND baby_members.user_id = auth.uid()
    )
  );

CREATE POLICY "sleep_delete" ON sleep_records FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM baby_members
    WHERE baby_members.baby_id = sleep_records.baby_id
    AND baby_members.user_id = auth.uid()
  ));
