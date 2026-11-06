-- 吐き戻しを記録タイプに追加
ALTER TYPE record_type ADD VALUE IF NOT EXISTS 'spitup';

-- 時間帯別メモ（赤ちゃん×日付×時間で1件、家族で共有）
CREATE TABLE hourly_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  baby_id UUID NOT NULL REFERENCES babies(id) ON DELETE CASCADE,
  recorded_date DATE NOT NULL,
  recorded_hour INTEGER NOT NULL CHECK (recorded_hour >= 0 AND recorded_hour <= 23),
  note TEXT NOT NULL CHECK (char_length(note) BETWEEN 1 AND 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT hourly_notes_unique UNIQUE (baby_id, recorded_date, recorded_hour)
);

CREATE TRIGGER hourly_notes_updated_at
  BEFORE UPDATE ON hourly_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

ALTER TABLE hourly_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hourly_notes_select" ON hourly_notes FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM baby_members
    WHERE baby_members.baby_id = hourly_notes.baby_id
    AND baby_members.user_id = auth.uid()
  ));

CREATE POLICY "hourly_notes_insert" ON hourly_notes FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM baby_members
      WHERE baby_members.baby_id = hourly_notes.baby_id
      AND baby_members.user_id = auth.uid()
    )
  );

CREATE POLICY "hourly_notes_update" ON hourly_notes FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM baby_members
    WHERE baby_members.baby_id = hourly_notes.baby_id
    AND baby_members.user_id = auth.uid()
  ))
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM baby_members
      WHERE baby_members.baby_id = hourly_notes.baby_id
      AND baby_members.user_id = auth.uid()
    )
  );

CREATE POLICY "hourly_notes_delete" ON hourly_notes FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM baby_members
    WHERE baby_members.baby_id = hourly_notes.baby_id
    AND baby_members.user_id = auth.uid()
  ));
