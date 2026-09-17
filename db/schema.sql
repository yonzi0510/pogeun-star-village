-- 포근별 마을: 부모 앱 ↔ 아이 앱 연동용 D1 스키마.
-- Cloudflare 대시보드의 D1 콘솔(쿼리 실행 탭)에 그대로 붙여넣어 실행하면 된다.

CREATE TABLE IF NOT EXISTS families (
  code TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS praise_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  family_code TEXT NOT NULL,
  message TEXT NOT NULL,
  tier TEXT NOT NULL,
  tokens INTEGER NOT NULL,
  starlight INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_praise_events_family ON praise_events (family_code, id);
