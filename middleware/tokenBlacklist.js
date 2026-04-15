const crypto = require('crypto');
const logger = require('../libraries/logger');

/**
 * In-memory refresh token blacklist with automatic TTL cleanup.
 * For production scale, migrate to Redis.
 */
class TokenBlacklist {
  constructor() {
    this.blacklist = new Map(); // jti -> expiry timestamp
    
    // Cleanup expired entries every 10 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 10 * 60 * 1000);
    // Prevent the interval from keeping the process alive
    if (this.cleanupInterval.unref) this.cleanupInterval.unref();
  }

  /**
   * Generate a unique JWT ID
   */
  generateJti() {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Add a token's jti to the blacklist
   * @param {string} jti - JWT ID to blacklist
   * @param {number} expiresAt - Unix timestamp when the token expires (auto-cleanup)
   */
  add(jti, expiresAt) {
    if (!jti) return;
    this.blacklist.set(jti, expiresAt);
    logger.info(`Token blacklisted: ${jti.substring(0, 8)}...`);
  }

  /**
   * Check if a token's jti is blacklisted
   * @param {string} jti - JWT ID to check
   * @returns {boolean}
   */
  isBlacklisted(jti) {
    if (!jti) return false;
    return this.blacklist.has(jti);
  }

  /**
   * Remove expired entries from the blacklist
   */
  cleanup() {
    const now = Math.floor(Date.now() / 1000);
    let cleaned = 0;
    for (const [jti, expiresAt] of this.blacklist.entries()) {
      if (expiresAt <= now) {
        this.blacklist.delete(jti);
        cleaned++;
      }
    }
    if (cleaned > 0) {
      logger.info(`Token blacklist cleanup: removed ${cleaned} expired entries`);
    }
  }

  /**
   * Get current blacklist size (for monitoring)
   */
  get size() {
    return this.blacklist.size;
  }
}

module.exports = new TokenBlacklist();
