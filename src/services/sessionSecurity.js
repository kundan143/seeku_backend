const crypto = require("crypto");
const { client } = require("./redisClient");
const logger = require("./dailyLogService");

// Login is pure stateless JWT (10h expiry, verified by signature alone in jwtTokenValiadtion.js) -
// there was no way to kill an already-issued token before it naturally expired. This adds two
// Redis-backed checks on top of that signature check, both fail-soft: if Redis is unreachable,
// every check here resolves to "not revoked / not blocked", so an outage degrades back to the
// pre-existing stateless-JWT behavior rather than locking everyone out or leaving a security gap
// unnoticed as an app-breaking error.
const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

// Called on logout, with the token's remaining lifetime (seconds until its `exp`) as the TTL - the
// blocklist entry disappears on its own the moment the token would have expired anyway, so it
// never needs manual cleanup.
exports.revokeToken = async function (token, ttlSeconds) {
  if (!client.isReady || ttlSeconds <= 0) return;
  try {
    await client.set(`revoked-token:${hashToken(token)}`, "1", { EX: ttlSeconds });
  } catch (e) {
    logger.error({ message: "Failed to revoke token", error: e.message });
  }
};

exports.isTokenRevoked = async function (token) {
  if (!client.isReady) return false;
  try {
    return (await client.exists(`revoked-token:${hashToken(token)}`)) === 1;
  } catch (e) {
    logger.error({ message: "Token revocation check failed", error: e.message });
    return false;
  }
};

// Set the moment an account is locked (Employee Master's lock icon, or the auto-lock after 3 bad
// password attempts) so every OTHER still-valid token that user holds (any device, any tab) stops
// working on their very next request - not just their next login attempt. No TTL: cleared
// explicitly by unblockUser when the account is unlocked / password reset.
exports.blockUser = async function (userId) {
  if (!client.isReady) return;
  try {
    await client.set(`blocked-user:${userId}`, "1");
  } catch (e) {
    logger.error({ message: "Failed to set user block flag", userId, error: e.message });
  }
};

exports.unblockUser = async function (userId) {
  if (!client.isReady) return;
  try {
    await client.del(`blocked-user:${userId}`);
  } catch (e) {
    logger.error({ message: "Failed to clear user block flag", userId, error: e.message });
  }
};

exports.isUserBlocked = async function (userId) {
  if (!client.isReady) return false;
  try {
    return (await client.exists(`blocked-user:${userId}`)) === 1;
  } catch (e) {
    logger.error({ message: "User block check failed", error: e.message });
    return false;
  }
};

// IP-based login throttle - separate from and in addition to the existing per-account lock after 3
// bad attempts (which only protects one known account). This catches the case that misses:
// spraying many different/guessed emails from one IP, or just hammering the login endpoint.
const LOGIN_RATE_LIMIT_MAX_ATTEMPTS = 10;
const LOGIN_RATE_LIMIT_WINDOW_SECONDS = 15 * 60;

exports.checkLoginRateLimit = async function (ip) {
  if (!client.isReady || !ip) return { allowed: true };
  try {
    const key = `login-attempts-ip:${ip}`;
    const count = await client.get(key);
    if (count && Number(count) >= LOGIN_RATE_LIMIT_MAX_ATTEMPTS) {
      const retryAfterSeconds = await client.ttl(key);
      return { allowed: false, retryAfterSeconds: Math.max(retryAfterSeconds, 1) };
    }
    return { allowed: true };
  } catch (e) {
    logger.error({ message: "Login rate limit check failed", error: e.message });
    return { allowed: true };
  }
};

exports.recordLoginFailure = async function (ip) {
  if (!client.isReady || !ip) return;
  try {
    const key = `login-attempts-ip:${ip}`;
    const count = await client.incr(key);
    if (count === 1) {
      await client.expire(key, LOGIN_RATE_LIMIT_WINDOW_SECONDS);
    }
  } catch (e) {
    logger.error({ message: "Failed to record login failure", error: e.message });
  }
};

exports.resetLoginRateLimit = async function (ip) {
  if (!client.isReady || !ip) return;
  try {
    await client.del(`login-attempts-ip:${ip}`);
  } catch (e) {
    logger.error({ message: "Failed to reset login rate limit", error: e.message });
  }
};
