'use strict';

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_DIR = process.env.DB_DIR || path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'monitor.db');

fs.mkdirSync(DB_DIR, { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS watches (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    chat_id      TEXT    NOT NULL,
    city         TEXT    NOT NULL,
    subdomain    TEXT    NOT NULL,
    keyword      TEXT    NOT NULL,
    min_price    INTEGER,
    max_price    INTEGER,
    status       TEXT    NOT NULL DEFAULT 'active',
    digest_mode  INTEGER NOT NULL DEFAULT 0,
    created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS seen_listings (
    watch_id   INTEGER NOT NULL,
    listing_id TEXT    NOT NULL,
    seen_at    TEXT    NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (watch_id, listing_id),
    FOREIGN KEY (watch_id) REFERENCES watches(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS digest_queue (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    watch_id   INTEGER NOT NULL,
    chat_id    TEXT    NOT NULL,
    title      TEXT,
    price      TEXT,
    link       TEXT,
    listing_id TEXT,
    queued_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (watch_id) REFERENCES watches(id) ON DELETE CASCADE
  );
`);

const stmts = {
  addWatch: db.prepare(`
    INSERT INTO watches (chat_id, city, subdomain, keyword, min_price, max_price)
    VALUES (@chat_id, @city, @subdomain, @keyword, @min_price, @max_price)
  `),

  getWatchesByChat: db.prepare(
    `SELECT * FROM watches WHERE chat_id = ? ORDER BY id`
  ),

  getAllActiveWatches: db.prepare(
    `SELECT * FROM watches WHERE status = 'active'`
  ),

  getWatch: db.prepare(
    `SELECT * FROM watches WHERE id = ? AND chat_id = ?`
  ),

  deleteWatch: db.prepare(
    `DELETE FROM watches WHERE id = ? AND chat_id = ?`
  ),

  pauseWatch: db.prepare(
    `UPDATE watches SET status = 'paused' WHERE id = ? AND chat_id = ?`
  ),

  resumeWatch: db.prepare(
    `UPDATE watches SET status = 'active' WHERE id = ? AND chat_id = ?`
  ),

  toggleDigest: db.prepare(`
    UPDATE watches
    SET digest_mode = CASE WHEN digest_mode = 0 THEN 1 ELSE 0 END
    WHERE id = ? AND chat_id = ?
  `),

  isListingSeen: db.prepare(
    `SELECT 1 FROM seen_listings WHERE watch_id = ? AND listing_id = ?`
  ),

  markListingSeen: db.prepare(
    `INSERT OR IGNORE INTO seen_listings (watch_id, listing_id) VALUES (?, ?)`
  ),

  queueDigestItem: db.prepare(`
    INSERT INTO digest_queue (watch_id, chat_id, title, price, link, listing_id)
    VALUES (@watch_id, @chat_id, @title, @price, @link, @listing_id)
  `),

  getDigestItemsByChat: db.prepare(
    `SELECT dq.*, w.keyword, w.city
     FROM digest_queue dq
     JOIN watches w ON w.id = dq.watch_id
     WHERE dq.chat_id = ?
     ORDER BY dq.watch_id, dq.queued_at`
  ),

  getDistinctDigestChats: db.prepare(
    `SELECT DISTINCT chat_id FROM digest_queue`
  ),

  clearDigestForChat: db.prepare(
    `DELETE FROM digest_queue WHERE chat_id = ?`
  ),
};

module.exports = { db, stmts };
