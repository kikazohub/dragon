import { db } from "./db";
import type { Dragon } from "./dragon";

export interface User {
  id: number;
  username: string;
  passwordHash: string;
  createdAt: string;
}

interface UserRow {
  id: number;
  email: string | null;
  name: string | null;
  username: string | null;
  password_hash: string;
  created_at: string;
}

interface BaseDragonRow {
  id: number;
  user_id: number;
  name: string;
  personality: string;
  element: string;
  egg_color: string;
  physical: string;
  stage: string;
  level: number;
  xp: number;
  bond: number;
  last_synced_day: number;
  last_seen_at: string | null;
  created_at: string;
  hatched_at: string | null;
}

export interface MemoryRow {
  id: number;
  content: string;
  created_at: string;
}

export interface MessageRow {
  role: string;
  content: string;
  created_at: string;
}

function rowToUser(row: UserRow | undefined): User | null {
  if (!row) return null;
  return {
    id: row.id,
    username: row.username ?? "",
    passwordHash: row.password_hash,
    createdAt: row.created_at,
  };
}

function rowToDragon(row: BaseDragonRow): Dragon {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    personality: row.personality,
    element: row.element,
    eggColor: row.egg_color,
    physical: row.physical,
    stage: row.stage,
    level: row.level,
    xp: row.xp,
    bond: row.bond,
    lastSyncedDay: row.last_synced_day,
    lastSeenAt: row.last_seen_at,
    createdAt: row.created_at,
    hatchedAt: row.hatched_at,
  };
}

export function getUserById(id: number): User | null {
  return rowToUser(db.prepare(`SELECT * FROM users WHERE id=?`).get(id) as UserRow | undefined);
}

export function getUserByUsername(username: string): User | null {
  return rowToUser(
    db
      .prepare(`SELECT * FROM users WHERE lower(username) = lower(?)`)
      .get(username) as UserRow | undefined
  );
}

export function createUser(username: string, passwordHash: string): number {
  const res = db
    .prepare(`INSERT INTO users (username, name, password_hash) VALUES (?,?,?)`)
    .run(username, username, passwordHash);
  return Number(res.lastInsertRowid);
}

export function getDragonByUser(userId: number): Dragon | null {
  const row = db.prepare(`SELECT * FROM dragons WHERE user_id=?`).get(userId) as
    | BaseDragonRow
    | undefined;
  return row ? rowToDragon(row) : null;
}

export function getDragonById(id: number): Dragon | null {
  const row = db.prepare(`SELECT * FROM dragons WHERE id=?`).get(id) as
    | BaseDragonRow
    | undefined;
  return row ? rowToDragon(row) : null;
}

export function createDragon(
  userId: number,
  name: string,
  personality: string,
  element: string,
  eggColor: string,
  physical: string
): number {
  const res = db
    .prepare(
      `INSERT INTO dragons (user_id, name, personality, element, egg_color, physical) VALUES (?,?,?,?,?,?)`
    )
    .run(userId, name, personality, element, eggColor, physical);
  return Number(res.lastInsertRowid);
}

export function updateDragonProfile(
  dragonId: number,
  name: string,
  personality: string,
  element: string,
  physical: string
): void {
  db.prepare(
    `UPDATE dragons SET name=?, personality=?, element=?, physical=? WHERE id=?`
  ).run(name, personality, element, physical, dragonId);
}

// ── Memories ──

export function addMemory(dragonId: number, content: string): void {
  db.prepare(`INSERT INTO memories (dragon_id, content) VALUES (?,?)`).run(dragonId, content);
}

export function getMemories(dragonId: number, limit = 12): MemoryRow[] {
  return db
    .prepare(`SELECT id, content, created_at FROM memories WHERE dragon_id=? ORDER BY id DESC LIMIT ?`)
    .all(dragonId, limit) as MemoryRow[];
}

export function getMemoriesCount(dragonId: number): number {
  const row = db.prepare(`SELECT COUNT(*) as n FROM memories WHERE dragon_id=?`).get(dragonId) as
    | { n: number }
    | undefined;
  return row?.n ?? 0;
}

// ── Messages ──

export function addMessage(dragonId: number, role: "user" | "dragon", content: string): void {
  db.prepare(`INSERT INTO messages (dragon_id, role, content) VALUES (?,?,?)`).run(
    dragonId,
    role,
    content
  );
}

export function getMessages(dragonId: number, limit = 30): MessageRow[] {
  return db
    .prepare(`SELECT role, content, created_at FROM messages WHERE dragon_id=? ORDER BY id DESC LIMIT ?`)
    .all(dragonId, limit) as MessageRow[];
}

export function getMessagesCount(dragonId: number): number {
  const row = db.prepare(`SELECT COUNT(*) as n FROM messages WHERE dragon_id=?`).get(dragonId) as
    | { n: number }
    | undefined;
  return row?.n ?? 0;
}