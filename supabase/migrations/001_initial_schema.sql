-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- babies テーブル
CREATE TABLE IF NOT EXISTS babies (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  birth_date  DATE NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- records テーブル
CREATE TYPE record_type AS ENUM (
  'breastfeeding',
  'pumping',
  'formula',
  'pee',
  'poop'
);

CREATE TABLE IF NOT EXISTS records (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  baby_id        UUID NOT NULL REFERENCES babies(id) ON DELETE CASCADE,
  recorded_date  DATE NOT NULL,
  recorded_hour  INT NOT NULL CHECK (recorded_hour >= 0 AND recorded_hour <= 23),
  type           record_type NOT NULL,
  count          INT,
  amount_ml      INT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT records_unique UNIQUE (user_id, baby_id, recorded_date, recorded_hour, type)
);

-- updated_at 自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER records_updated_at
  BEFORE UPDATE ON records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- インデックス
CREATE INDEX idx_records_user_date ON records (user_id, recorded_date);
CREATE INDEX idx_records_baby_date ON records (baby_id, recorded_date);
CREATE INDEX idx_babies_user ON babies (user_id);
