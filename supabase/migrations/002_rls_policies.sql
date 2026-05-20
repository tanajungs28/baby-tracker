-- Row Level Security の有効化

ALTER TABLE babies ENABLE ROW LEVEL SECURITY;
ALTER TABLE records ENABLE ROW LEVEL SECURITY;

-- babies テーブルの RLS ポリシー
CREATE POLICY "babies_select_own" ON babies
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "babies_insert_own" ON babies
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "babies_update_own" ON babies
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "babies_delete_own" ON babies
  FOR DELETE USING (auth.uid() = user_id);

-- records テーブルの RLS ポリシー
CREATE POLICY "records_select_own" ON records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "records_insert_own" ON records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "records_update_own" ON records
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "records_delete_own" ON records
  FOR DELETE USING (auth.uid() = user_id);
