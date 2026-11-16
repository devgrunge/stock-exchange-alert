import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { DEFAULT_CONFIG } from '@repo/shared';
import type { AssetConfig, AlertState, Ticker, PushSubscriptionPayload } from '@repo/shared';
import { env } from './env';

export interface PushSubscriptionRow {
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: number;
}

interface AssetConfigRow {
  ticker: string;
  drop_alert_enabled: number;
  rise_alert_enabled: number;
}

interface AlertStateRow {
  ticker: string;
  trade_date: string;
  drop_alerted: number;
  rise_alerted: number;
}

let db: Database.Database | undefined;

export function initDb(): Database.Database {
  if (db) return db;

  if (env.databasePath !== ':memory:') {
    fs.mkdirSync(path.dirname(env.databasePath), { recursive: true });
  }

  db = new Database(env.databasePath);
  db.pragma('journal_mode = WAL');

  migrate();

  db.exec(`
    CREATE TABLE IF NOT EXISTS asset_config (
      ticker TEXT PRIMARY KEY,
      drop_alert_enabled INTEGER NOT NULL DEFAULT 1,
      rise_alert_enabled INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS alert_state (
      ticker TEXT PRIMARY KEY,
      trade_date TEXT NOT NULL DEFAULT '',
      drop_alerted INTEGER NOT NULL DEFAULT 0,
      rise_alerted INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS push_subscription (
      endpoint TEXT PRIMARY KEY,
      p256dh TEXT NOT NULL,
      auth TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
  `);

  seed();
  return db;
}

function getDb(): Database.Database {
  return db ?? initDb();
}

/**
 * Recreates the config/state tables if they still use the legacy
 * "purchase price / target price" schema from before the intraday change.
 */
function migrate(): void {
  const d = getDb();
  const cols = d.prepare('PRAGMA table_info(asset_config)').all() as { name: string }[];
  const legacy = cols.some((c) => c.name === 'purchase_price' || c.name === 'target_price');
  if (legacy) {
    d.exec('DROP TABLE IF EXISTS asset_config; DROP TABLE IF EXISTS alert_state;');
  }
}

function seed(): void {
  const insertConfig = getDb().prepare(
    `INSERT INTO asset_config (ticker, drop_alert_enabled, rise_alert_enabled)
     VALUES (?, ?, ?)
     ON CONFLICT(ticker) DO NOTHING`,
  );
  const insertState = getDb().prepare(
    `INSERT INTO alert_state (ticker) VALUES (?) ON CONFLICT(ticker) DO NOTHING`,
  );

  const tx = getDb().transaction(() => {
    for (const cfg of DEFAULT_CONFIG) {
      insertConfig.run(cfg.ticker, cfg.dropAlertEnabled ? 1 : 0, cfg.riseAlertEnabled ? 1 : 0);
      insertState.run(cfg.ticker);
    }
  });
  tx();
}

function rowToConfig(row: AssetConfigRow): AssetConfig {
  return {
    ticker: row.ticker as Ticker,
    dropAlertEnabled: row.drop_alert_enabled === 1,
    riseAlertEnabled: row.rise_alert_enabled === 1,
  };
}

export function getConfig(): AssetConfig[] {
  const rows = getDb()
    .prepare('SELECT * FROM asset_config ORDER BY ticker')
    .all() as AssetConfigRow[];
  return rows.map(rowToConfig);
}

export function getConfigFor(ticker: Ticker): AssetConfig | undefined {
  const row = getDb()
    .prepare('SELECT * FROM asset_config WHERE ticker = ?')
    .get(ticker) as AssetConfigRow | undefined;
  return row ? rowToConfig(row) : undefined;
}

export function updateConfig(
  ticker: Ticker,
  patch: Partial<Omit<AssetConfig, 'ticker'>>,
): AssetConfig {
  const current = getConfigFor(ticker);
  const merged: AssetConfig = {
    ticker,
    dropAlertEnabled: patch.dropAlertEnabled ?? current?.dropAlertEnabled ?? true,
    riseAlertEnabled: patch.riseAlertEnabled ?? current?.riseAlertEnabled ?? true,
  };

  getDb()
    .prepare(
      `INSERT INTO asset_config (ticker, drop_alert_enabled, rise_alert_enabled)
       VALUES (?, ?, ?)
       ON CONFLICT(ticker) DO UPDATE SET
         drop_alert_enabled = excluded.drop_alert_enabled,
         rise_alert_enabled = excluded.rise_alert_enabled`,
    )
    .run(ticker, merged.dropAlertEnabled ? 1 : 0, merged.riseAlertEnabled ? 1 : 0);

  return merged;
}

export function getAlertState(ticker: Ticker): AlertState {
  const row = getDb()
    .prepare('SELECT * FROM alert_state WHERE ticker = ?')
    .get(ticker) as AlertStateRow | undefined;

  return {
    ticker,
    tradeDate: row?.trade_date ?? '',
    dropAlerted: row?.drop_alerted === 1,
    riseAlerted: row?.rise_alerted === 1,
  };
}

/** Resets both flags and records the new trading day. */
export function resetAlertState(ticker: Ticker, tradeDate: string): void {
  getDb()
    .prepare('UPDATE alert_state SET trade_date = ?, drop_alerted = 0, rise_alerted = 0 WHERE ticker = ?')
    .run(tradeDate, ticker);
}

export function setDropAlerted(ticker: Ticker, value: boolean): void {
  getDb()
    .prepare('UPDATE alert_state SET drop_alerted = ? WHERE ticker = ?')
    .run(value ? 1 : 0, ticker);
}

export function setRiseAlerted(ticker: Ticker, value: boolean): void {
  getDb()
    .prepare('UPDATE alert_state SET rise_alerted = ? WHERE ticker = ?')
    .run(value ? 1 : 0, ticker);
}

export function listSubscriptions(): PushSubscriptionRow[] {
  return getDb()
    .prepare('SELECT * FROM push_subscription ORDER BY created_at')
    .all() as PushSubscriptionRow[];
}

export function addSubscription(payload: PushSubscriptionPayload): void {
  getDb()
    .prepare(
      `INSERT INTO push_subscription (endpoint, p256dh, auth, created_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(endpoint) DO UPDATE SET p256dh = excluded.p256dh, auth = excluded.auth`,
    )
    .run(payload.endpoint, payload.keys.p256dh, payload.keys.auth, Date.now());
}

export function removeSubscription(endpoint: string): void {
  getDb().prepare('DELETE FROM push_subscription WHERE endpoint = ?').run(endpoint);
}
