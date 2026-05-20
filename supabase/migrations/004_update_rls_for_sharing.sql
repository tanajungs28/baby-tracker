-- baby_members テーブルの RLS
ALTER TABLE baby_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "baby_members_select" ON baby_members
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "baby_members_insert" ON baby_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- babies: SELECT を baby_members 経由に変更
DROP POLICY IF EXISTS "babies_select_own" ON babies;
CREATE POLICY "babies_select_via_members" ON babies
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM baby_members
      WHERE baby_members.baby_id = babies.id
      AND baby_members.user_id = auth.uid()
    )
  );

-- records: 全ポリシーを baby_members 経由に変更
DROP POLICY IF EXISTS "records_select_own" ON records;
CREATE POLICY "records_select_via_members" ON records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM baby_members
      WHERE baby_members.baby_id = records.baby_id
      AND baby_members.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "records_insert_own" ON records;
CREATE POLICY "records_insert_via_members" ON records
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM baby_members
      WHERE baby_members.baby_id = records.baby_id
      AND baby_members.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "records_update_own" ON records;
CREATE POLICY "records_update_via_members" ON records
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM baby_members
      WHERE baby_members.baby_id = records.baby_id
      AND baby_members.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "records_delete_own" ON records;
CREATE POLICY "records_delete_via_members" ON records
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM baby_members
      WHERE baby_members.baby_id = records.baby_id
      AND baby_members.user_id = auth.uid()
    )
  );
