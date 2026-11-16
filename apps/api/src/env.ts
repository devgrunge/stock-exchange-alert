import 'dotenv/config';

function optional(key: string, fallback = ''): string {
  return process.env[key] ?? fallback;
}

function number(key: string, fallback: number): number {
  const raw = process.env[key];
  if (!raw) return fallback;
  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

export const env = {
  port: number('PORT', 3001),
  host: optional('HOST', '0.0.0.0'),
  databasePath: optional('DATABASE_PATH', './data/alert.db'),
  brapiToken: optional('BRAPI_TOKEN'),
  vapidPublicKey: optional('VAPID_PUBLIC_KEY'),
  vapidPrivateKey: optional('VAPID_PRIVATE_KEY'),
  vapidSubject: optional('VAPID_SUBJECT', 'mailto:admin@example.com'),
  webOrigin: optional('WEB_ORIGIN', 'http://localhost:5173'),
  checkIntervalMs: number('CHECK_INTERVAL_MS', 15 * 60 * 1000),
  timeZone: optional('TZ', 'America/Sao_Paulo'),
  authUsername: optional('AUTH_USERNAME'),
  authPasswordHash: optional('AUTH_PASSWORD_HASH'),
  jwtSecret: optional('JWT_SECRET'),
  jwtExpiresIn: optional('JWT_EXPIRES_IN', '30d'),
};

export const pushConfigured =
  env.vapidPublicKey !== '' && env.vapidPrivateKey !== '';

export const authConfigured =
  env.authUsername !== '' && env.authPasswordHash !== '' && env.jwtSecret !== '';
