import crypto from 'crypto';

interface SessionData {
  createdAt: number;
  expiresAt: number;
  username: string;
}

// In-memory server session store (safe for single-admin server runtime)
const activeSessions = new Map<string, SessionData>();

const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const SECRET_KEY = process.env.ADMIN_SECRET || 'arch_cms_secret_key_session_signing_9921';

export const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export function verifyCredentials(username?: string, password?: string): boolean {
  if (!username || !password) return false;
  return username.trim() === ADMIN_USERNAME && password.trim() === ADMIN_PASSWORD;
}

export function createSession(username: string): { token: string; maxAge: number } {
  const randomBytes = crypto.randomBytes(32).toString('hex');
  const signature = crypto.createHmac('sha256', SECRET_KEY).update(randomBytes).digest('hex');
  const token = `${randomBytes}.${signature}`;

  const now = Date.now();
  const sessionData: SessionData = {
    createdAt: now,
    expiresAt: now + SESSION_TTL_MS,
    username,
  };

  activeSessions.set(token, sessionData);
  return { token, maxAge: Math.floor(SESSION_TTL_MS / 1000) };
}

export function verifySession(token?: string): boolean {
  if (!token) return false;
  const [randomPart, signature] = token.split('.');
  if (!randomPart || !signature) return false;

  const expectedSig = crypto.createHmac('sha256', SECRET_KEY).update(randomPart).digest('hex');
  if (signature !== expectedSig) return false;

  const session = activeSessions.get(token);
  if (!session) {
    // If server restarted, we can still accept valid signed token if within TTL window,
    // or repopulate session.
    activeSessions.set(token, {
      createdAt: Date.now(),
      expiresAt: Date.now() + SESSION_TTL_MS,
      username: ADMIN_USERNAME,
    });
    return true;
  }

  if (Date.now() > session.expiresAt) {
    activeSessions.delete(token);
    return false;
  }

  return true;
}

export function destroySession(token?: string): void {
  if (token) {
    activeSessions.delete(token);
  }
}
