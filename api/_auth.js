const crypto = require("node:crypto");

const SESSION_SECONDS = 60 * 60 * 24 * 7;
const COOKIE_NAME = "greenleaf_session";

function sendJson(res, status, value, headers = {}) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store, max-age=0");
  for (const [name, content] of Object.entries(headers)) res.setHeader(name, content);
  res.end(JSON.stringify(value));
}

function configured() {
  return typeof process.env.AUTH_EMAIL === "string"
    && process.env.AUTH_EMAIL.length > 0
    && typeof process.env.AUTH_PASSWORD_HASH === "string"
    && typeof process.env.SESSION_SECRET === "string"
    && Buffer.byteLength(process.env.SESSION_SECRET, "utf8") >= 32;
}

function parsePasswordHash(encoded) {
  const parts = encoded.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") throw new Error("Invalid password hash format");
  const salt = Buffer.from(parts[1], "base64url");
  const key = Buffer.from(parts[2], "base64url");
  if (salt.length < 16 || key.length !== 64) throw new Error("Invalid password hash parameters");
  return { salt, key };
}

function verifyPassword(password, encoded) {
  const { salt, key } = parsePasswordHash(encoded);
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, key.length, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }, (error, derived) => {
      if (error) return reject(error);
      resolve(crypto.timingSafeEqual(key, derived));
    });
  });
}

function safeEqualText(left, right) {
  const a = Buffer.from(left, "utf8");
  const b = Buffer.from(right, "utf8");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function readJsonBody(req) {
  if (req.body && typeof req.body === "object") return Promise.resolve(req.body);
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (Buffer.byteLength(body, "utf8") > 8192) reject(new Error("Request body too large"));
    });
    req.on("end", () => {
      try { resolve(JSON.parse(body)); } catch { reject(new Error("Invalid JSON")); }
    });
    req.on("error", reject);
  });
}

function sameOrigin(req) {
  const origin = req.headers.origin;
  const host = req.headers.host;
  if (!origin || !host) return false;
  try { return new URL(origin).host.toLowerCase() === host.toLowerCase(); }
  catch { return false; }
}

function createSessionToken() {
  const payload = Buffer.from(JSON.stringify({ sub: "authorized", exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS })).toString("base64url");
  const signature = crypto.createHmac("sha256", process.env.SESSION_SECRET).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

function validSessionToken(token) {
  if (!configured() || typeof token !== "string") return false;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra !== undefined) return false;
  const expected = crypto.createHmac("sha256", process.env.SESSION_SECRET).update(payload).digest();
  let received;
  try { received = Buffer.from(signature, "base64url"); } catch { return false; }
  if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) return false;
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return session.sub === "authorized" && Number.isInteger(session.exp) && session.exp > Math.floor(Date.now() / 1000);
  } catch { return false; }
}

function getCookie(req, name = COOKIE_NAME) {
  const header = req.headers.cookie || "";
  for (const piece of header.split(";")) {
    const separator = piece.indexOf("=");
    if (separator < 0) continue;
    if (piece.slice(0, separator).trim() === name) return piece.slice(separator + 1).trim();
  }
  return "";
}

function sessionCookie(token, maxAge = SESSION_SECONDS) {
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;
}

module.exports = { COOKIE_NAME, configured, createSessionToken, getCookie, parsePasswordHash, readJsonBody, safeEqualText, sameOrigin, sendJson, sessionCookie, validSessionToken, verifyPassword };
