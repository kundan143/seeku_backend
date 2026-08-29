const { createClient } = require("redis");
const logger = require("./dailyLogService");

// Cache-aside layer over Redis. Every helper here is fail-soft: if Redis is unreachable or the
// client hasn't finished connecting yet, reads/writes are no-ops (get resolves to null, set/del
// resolve to false) and getOrSetCache falls back to calling the fetcher directly - a cache outage
// degrades to "no caching", never to a broken app. Callers should never need a try/catch around
// these calls.
const client = createClient({ url: process.env.REDIS_URL || "redis://127.0.0.1:6379" });
exports.client = client;

client.on("error", (err) => {
  logger.error({ message: "Redis client error", error: err.message });
});

exports.connectRedis = async function () {
  try {
    await client.connect();
    logger.info({ message: "Redis connected" });
  } catch (e) {
    logger.error({ message: "Redis connection failed - continuing without cache", error: e.message });
  }
};

exports.cacheGet = async function (key) {
  if (!client.isReady) return null;
  try {
    const raw = await client.get(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    logger.error({ message: "Redis get failed", key, error: e.message });
    return null;
  }
};

exports.cacheSet = async function (key, value, ttlSeconds) {
  if (!client.isReady) return false;
  try {
    await client.set(key, JSON.stringify(value), { EX: ttlSeconds });
    return true;
  } catch (e) {
    logger.error({ message: "Redis set failed", key, error: e.message });
    return false;
  }
};

exports.cacheDel = async function (key) {
  if (!client.isReady) return false;
  try {
    await client.del(key);
    return true;
  } catch (e) {
    logger.error({ message: "Redis del failed", key, error: e.message });
    return false;
  }
};

// Returns the cached value for `key` if present, otherwise calls `fetchFn`, caches its result for
// `ttlSeconds`, and returns it. `fetchFn`'s result is cached as-is, so callers should only pass
// something that failed to compute up through a thrown error, not a wrapped error response.
exports.getOrSetCache = async function (key, ttlSeconds, fetchFn) {
  const cached = await exports.cacheGet(key);
  if (cached !== null) return cached;

  const fresh = await fetchFn();
  await exports.cacheSet(key, fresh, ttlSeconds);
  return fresh;
};
