const { sameOrigin, sendJson, sessionCookie } = require("../_auth");

module.exports = function logout(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { error: "Method not allowed." });
  }
  if (!sameOrigin(req)) return sendJson(res, 403, { error: "Request not allowed." });
  return sendJson(res, 200, { authenticated: false }, { "Set-Cookie": sessionCookie("", 0) });
};
