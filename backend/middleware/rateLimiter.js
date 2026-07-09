// Simple in-memory rate limiter middleware
// Not suitable for multi-instance production: use Redis-backed limiter in production

module.exports = function createRateLimiter({ windowMs = 5 * 60 * 1000, max = 5 } = {}) {
  const hits = new Map();

  return (req, res, next) => {
    try {
      const key = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      const now = Date.now();
      const entry = hits.get(key);

      if (!entry) {
        hits.set(key, { count: 1, start: now });
        return next();
      }

      if (now - entry.start > windowMs) {
        // reset window
        hits.set(key, { count: 1, start: now });
        return next();
      }

      entry.count += 1;
      if (entry.count > max) {
        const retryAfter = Math.ceil((windowMs - (now - entry.start)) / 1000);
        res.setHeader('Retry-After', String(retryAfter));
        return res.status(429).json({ message: `Too many requests. Try again in ${retryAfter} seconds.` });
      }

      return next();
    } catch (err) {
      // fail open
      return next();
    }
  };
};