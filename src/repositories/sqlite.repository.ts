import { Database } from 'bun:sqlite'

export const db = new Database(process.cwd() + '/sqlite/db.sqlite')

db.run('PRAGMA journal_mode = WAL;')

db.run(`CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY,
  displayName TEXT NOT NULL,
  phoneNumber VARCHAR(30),
  email NVARCHAR(255),
  googleId VARCHAR(64) NOT NULL,
  googleEtag VARCHAR(64) NOT NULL,
  notionId VARCHAR(64) NOT NULL
);`)

db.run(`CREATE TABLE IF NOT EXISTS google_tokens (
  id INTEGER PRIMARY KEY,
  userId NVARCHAR(255) NOT NULL UNIQUE,
  tokens TEXT NOT NULL
);`)

db.run(`CREATE INDEX IF NOT EXISTS google_tokens_index ON google_tokens (userId);`)

// TODO: figure out whether it's useful to do my own activity log table