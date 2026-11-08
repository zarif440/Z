const { configured, createSessionToken, parsePasswordHash, readJsonBody, safeEqualText, sameOrigin, sendJson, sessionCookie, verifyPassword } = require("../_auth");

module.exports = async function login(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { error: "Method not allowed." });
  }
  if (!sameOrigin(req)) return sendJson(res, 403, { error: "Request not allowed." });
  if (!req.headers["content-type"]?.toLowerCase().startsWith("application/json")) {
    return sendJson(res, 415, { error: "Expected a JSON request." });
  }
  if (!configured()) return sendJson(res, 503, { error: "Sign-in is not configured. Contact the site administrator." });

  let credentials;
  try {
    credentials = await readJsonBody(req);
    parsePasswordHash(process.env.AUTH_PASSWORD_HASH);
  } catch {
    return sendJson(res, 400, { error: "Invalid sign-in request." });
  }
  const email = typeof credentials.email === "string" ? credentials.email.trim().toLowerCase() : "";
  const password = typeof credentials.password === "string" ? credentials.password : "";
  if (!email || password.length === 0 || Buffer.byteLength(password, "utf8") > 256) {
    return sendJson(res, 401, { error: "Incorrect email or password." });
  }

  try {
    const authorizedEmail = process.env.AUTH_EMAIL.trim().toLowerCase();
    const emailMatches = safeEqualText(email, authorizedEmail);
    const passwordMatches = await verifyPassword(password, process.env.AUTH_PASSWORD_HASH);
    if (!emailMatches || !passwordMatches) return sendJson(res, 401, { error: "Incorrect email or password." });
    res.setHeader("Set-Cookie", sessionCookie(createSessionToken()));
    return sendJson(res, 200, { authenticated: true });
  } catch {
    return sendJson(res, 503, { error: "Sign-in is temporarily unavailable. Contact the site administrator." });
  }
};
