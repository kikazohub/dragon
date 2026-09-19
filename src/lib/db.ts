import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

export const db = new Database(path.join(dataDir, "dragon.db"));
db.pragma("busy_timeout = 8000");
db.pragma("foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE,
  name TEXT,
  username TEXT,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS dragons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  personality TEXT NOT NULL DEFAULT 'curioso',
  element TEXT NOT NULL DEFAULT 'fuego',
  egg_color TEXT NOT NULL DEFAULT 'soft',
  physical TEXT NOT NULL DEFAULT '{}',
  stage TEXT NOT NULL DEFAULT 'egg',
  level INTEGER NOT NULL DEFAULT 1,
  xp INTEGER NOT NULL DEFAULT 0,
  bond INTEGER NOT NULL DEFAULT 0,
  last_synced_day INTEGER NOT NULL DEFAULT 0,
  last_seen_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  hatched_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_dragons_user ON dragons(user_id);

CREATE TABLE IF NOT EXISTS care_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dragon_id INTEGER NOT NULL REFERENCES dragons(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  day INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_care_dragon_day ON care_log(dragon_id, kind, day);

CREATE TABLE IF NOT EXISTS memories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dragon_id INTEGER NOT NULL REFERENCES dragons(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_memories_dragon ON memories(dragon_id);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dragon_id INTEGER NOT NULL REFERENCES dragons(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_messages_dragon ON messages(dragon_id);

CREATE TABLE IF NOT EXISTS timeline_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dragon_id INTEGER NOT NULL REFERENCES dragons(id) ON DELETE CASCADE,
  day INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_timeline_dragon_day ON timeline_events(dragon_id, day);
`);

const userCols = (
  db.prepare("PRAGMA table_info(users)").all() as { name: string }[]
).map((c) => c.name);

if (!userCols.includes("username")) {
  db.exec("ALTER TABLE users ADD COLUMN username TEXT;");
  db.prepare("UPDATE users SET username=? WHERE email=? AND username IS NULL").run(
    "Erinnon",
    "kikazoatp@gmail.com"
  );
  db.prepare("UPDATE users SET username=? WHERE email=? AND username IS NULL").run(
    "Iza",
    "izadorara.reyes95@gmail.com"
  );
  db.exec(
    `UPDATE users SET username = CASE
       WHEN name IS NOT NULL AND name <> '' THEN name
       ELSE 'user' || id END
     WHERE username IS NULL;`
  );
}
db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(lower(username));");

export function dayFromDate(dateStr: string): number {
  const created = new Date(dateStr + "Z").getTime();
  return Math.floor((Date.now() - created) / 86_400_000);
}