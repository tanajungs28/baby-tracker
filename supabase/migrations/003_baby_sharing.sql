-- babies に invite_code カラムを追加
ALTER TABLE babies ADD COLUMN IF NOT EXISTS invite_code TEXT UNIQUE;

-- baby_members テーブル（ユーザーと赤ちゃんの多対多）
CREATE TABLE IF NOT EXISTS baby_members (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  baby_id    UUID NOT NULL REFERENCES babies(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(baby_id, user_id)
);

-- 招待コード生成関数
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    code := upper(substring(md5(random()::text || clock_timestamp()::text) FROM 1 FOR 6));
    SELECT EXISTS(SELECT 1 FROM babies WHERE invite_code = code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- babies 挿入前: invite_code を自動生成
CREATE OR REPLACE FUNCTION before_baby_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invite_code IS NULL THEN
    NEW.invite_code := generate_invite_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER babies_before_insert
  BEFORE INSERT ON babies
  FOR EACH ROW
  EXECUTE FUNCTION before_baby_insert();

-- babies 挿入後: オーナーを baby_members に自動追加
CREATE OR REPLACE FUNCTION after_baby_insert()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO baby_members (baby_id, user_id, role)
  VALUES (NEW.id, NEW.user_id, 'owner')
  ON CONFLICT (baby_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER babies_after_insert
  AFTER INSERT ON babies
  FOR EACH ROW
  EXECUTE FUNCTION after_baby_insert();

-- 既存の babies に invite_code と baby_members を追加（バックフィル）
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT id, user_id FROM babies WHERE invite_code IS NULL LOOP
    UPDATE babies SET invite_code = generate_invite_code() WHERE id = r.id;
    INSERT INTO baby_members (baby_id, user_id, role)
    VALUES (r.id, r.user_id, 'owner')
    ON CONFLICT DO NOTHING;
  END LOOP;
END;
$$;

-- 招待コードでメンバー参加するRPC関数（SECURITY DEFINERでRLSをバイパス）
CREATE OR REPLACE FUNCTION join_baby_by_code(p_invite_code TEXT)
RETURNS JSON AS $$
DECLARE
  v_baby_id   UUID;
  v_baby_name TEXT;
BEGIN
  SELECT id, name INTO v_baby_id, v_baby_name
  FROM babies
  WHERE upper(invite_code) = upper(trim(p_invite_code));

  IF v_baby_id IS NULL THEN
    RAISE EXCEPTION 'invalid_code';
  END IF;

  INSERT INTO baby_members (baby_id, user_id, role)
  VALUES (v_baby_id, auth.uid(), 'member')
  ON CONFLICT (baby_id, user_id) DO NOTHING;

  RETURN json_build_object('baby_id', v_baby_id, 'baby_name', v_baby_name);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
