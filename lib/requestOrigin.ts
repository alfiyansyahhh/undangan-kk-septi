/** Next dev can reconstruct request.url with localhost even for LAN requests. */
export function sameOrigin(request: Request, development = process.env.NODE_ENV === "development", trustedDevOrigin = process.env.DEV_APP_ORIGIN) {
  const origin = request.headers.get("origin");
  if (!origin || origin === "null") return false;
  const target = new URL(request.url);
  if (origin === target.origin) return true;
  if (!development) return false;
  try {
    const source = new URL(origin);
    if (source.origin !== origin || !["http:", "https:"].includes(source.protocol)) return false;
    // Dev tunnels can rewrite Origin/Host to HTTP localhost while Next builds
    // an HTTPS request URL. Allow that exact loopback destination only in dev.
    const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(source.hostname);
    if (loopback && source.protocol === "http:" && target.protocol === "https:" &&
      source.host === target.host && source.host === request.headers.get("host")) return true;
    // An explicitly configured tunnel may terminate HTTPS and rewrite Host.
    if (trustedDevOrigin) {
      try {
        if (source.origin === new URL(trustedDevOrigin).origin) return true;
      } catch { /* Invalid configuration must not disable origin checks. */ }
    }
    // Match the browser's destination Host, including its port. Do not trust
    // forwarded headers or accept an arbitrary Origin just because this is dev.
    return source.origin === origin &&
      (source.protocol === "http:" || source.protocol === "https:") &&
      source.protocol === target.protocol &&
      source.host === request.headers.get("host");
  } catch { return false; }
}
