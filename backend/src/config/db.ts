import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, '../../data/db.sqlite');

export let db: Database<sqlite3.Database, sqlite3.Statement>;

export async function initDb() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });

  // Create tables if not exists
  await db.exec(`
    CREATE TABLE IF NOT EXISTS slack_connections (
      id TEXT PRIMARY KEY,
      team_id TEXT,
      team_name TEXT,
      access_token TEXT,
      refresh_token TEXT,
      scope TEXT,
      token_expires_at INTEGER,
      created_at INTEGER,
      updated_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS scheduled_messages (
      id TEXT PRIMARY KEY,
      connection_id TEXT,
      channel_id TEXT,
      text TEXT,
      send_at INTEGER,
      status TEXT,
      attempts INTEGER DEFAULT 0,
      last_error TEXT,
      created_at INTEGER,
      updated_at INTEGER,
      FOREIGN KEY(connection_id) REFERENCES slack_connections(id)
    );
  `);

  console.log('SQLite DB initialized at', DB_PATH);
}
