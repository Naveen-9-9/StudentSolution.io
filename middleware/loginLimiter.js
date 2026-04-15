const logger = require('../libraries/logger');

/**
 * Per-email login attempt limiter.
 * Tracks failed login attempts and locks accounts after MAX_ATTEMPTS.
 * Uses in-memory Map with automatic TTL cleanup.
 */
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;  // Clean every 5 minutes

// Map<email, { attempts: number, lockedUntil: Date | null, lastAttempt: Date }>
const attempts = new Map();

// Periodic cleanup of expired entries
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [email, data] of attempts.entries()) {
    // Remove entries where lockout has expired and no recent activity
    if (data.lockedUntil && data.lockedUntil.getTime() < now) {
      attempts.delete(email);
    }
    // Remove stale entries (no activity for 30 minutes)
    if (now - data.lastAttempt.getTime() > 30 * 60 * 1000) {
      attempts.delete(email);
    }
  }
}, CLEANUP_INTERVAL_MS);

if (cleanupInterval.unref) cleanupInterval.unref();

/**
 * Check if an email is currently locked out.
 * @param {string} email
 * @returns {{ locked: boolean, remainingMs: number }}
 */
function checkLockout(email) {
  if (!email) return { locked: false, remainingMs: 0 };
  const key = email.toLowerCase();
  const data = attempts.get(key);
  
  if (!data || !data.lockedUntil) {
    return { locked: false, remainingMs: 0 };
  }
  
  const remaining = data.lockedUntil.getTime() - Date.now();
  if (remaining <= 0) {
    // Lockout expired — reset
    attempts.delete(key);
    return { locked: false, remainingMs: 0 };
  }
  
  return { locked: true, remainingMs: remaining };
}

/**
 * Record a failed login attempt.
 * @param {string} email
 * @returns {{ locked: boolean, attemptsLeft: number, lockoutMinutes: number }}
 */
function recordFailedAttempt(email) {
  if (!email) return { locked: false, attemptsLeft: MAX_ATTEMPTS, lockoutMinutes: 0 };
  const key = email.toLowerCase();
  let data = attempts.get(key);
  
  if (!data) {
    data = { attempts: 0, lockedUntil: null, lastAttempt: new Date() };
  }
  
  data.attempts += 1;
  data.lastAttempt = new Date();
  
  if (data.attempts >= MAX_ATTEMPTS) {
    data.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
    attempts.set(key, data);
    logger.warn(`Account locked after ${MAX_ATTEMPTS} failed attempts: ${key}`);
    return { locked: true, attemptsLeft: 0, lockoutMinutes: 15 };
  }
  
  attempts.set(key, data);
  return { 
    locked: false, 
    attemptsLeft: MAX_ATTEMPTS - data.attempts, 
    lockoutMinutes: 0 
  };
}

/**
 * Clear failed attempts on successful login.
 * @param {string} email
 */
function clearAttempts(email) {
  if (!email) return;
  attempts.delete(email.toLowerCase());
}

module.exports = { checkLockout, recordFailedAttempt, clearAttempts };
