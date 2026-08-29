// Single source of truth for "what is the caller's real IP" - used by both activity logging
// (OP_UserActivityLog.js) and login rate limiting (sessionSecurity.js). Previously the login rate
// limiter used Express's raw `req.ip`, which - without `app.set('trust proxy', ...)` - is just the
// immediate TCP peer: behind a reverse proxy that's the proxy itself (always the same loopback
// address for every request), which would have silently pooled every real visitor into one shared
// rate-limit bucket. Reading X-Forwarded-For directly here sidesteps that regardless of Express's
// trust-proxy setting.
//
// If this keeps resolving to ::1 / 127.0.0.1 in production, the reverse proxy in front of Node
// isn't forwarding the client's IP - add to its config:
//   proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
//   proxy_set_header X-Real-IP $remote_addr;
// ::1 / ::ffff:127.0.0.1 are normalized to 127.0.0.1 below only so a genuinely direct local
// request (dev testing on the same machine) reads clearly as loopback instead of raw IPv6 syntax -
// it does not change what's ultimately a same-machine request into a different one.
function normalize(ip) {
  if (!ip) return ip;
  if (ip === "::1") return "127.0.0.1";
  if (ip.startsWith("::ffff:")) return ip.slice(7);
  return ip;
}

module.exports = function clientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) return normalize(forwarded.split(",")[0].trim());
  const realIp = req.headers["x-real-ip"];
  if (realIp) return normalize(realIp);
  return normalize(req.socket?.remoteAddress) || null;
};
