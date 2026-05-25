-- sleep_records を1時間単位から10分単位に移行

ALTER TABLE sleep_records ADD COLUMN recorded_minute INTEGER;

-- 既存データを6スロット（10分×6）に展開
CREATE TEMP TABLE sleep_backup AS
SELECT user_id, baby_id, person, recorded_date, recorded_hour, created_at, updated_at
FROM sleep_records;

DELETE FROM sleep_records;

INSERT INTO sleep_records (user_id, baby_id, person, recorded_date, recorded_minute, created_at, updated_at)
SELECT b.user_id, b.baby_id, b.person, b.recorded_date,
       b.recorded_hour * 60 + s.n,
       b.created_at, b.updated_at
FROM sleep_backup b
CROSS JOIN (VALUES (0),(10),(20),(30),(40),(50)) AS s(n);

ALTER TABLE sleep_records ALTER COLUMN recorded_minute SET NOT NULL;

ALTER TABLE sleep_records
  DROP CONSTRAINT sleep_records_baby_id_person_recorded_date_recorded_hour_key;

ALTER TABLE sleep_records DROP COLUMN recorded_hour;

ALTER TABLE sleep_records
  ADD CONSTRAINT sleep_records_minute_unique
  UNIQUE (baby_id, person, recorded_date, recorded_minute);

ALTER TABLE sleep_records
  ADD CONSTRAINT sleep_records_minute_check
  CHECK (recorded_minute >= 0 AND recorded_minute <= 1430 AND recorded_minute % 10 = 0);
