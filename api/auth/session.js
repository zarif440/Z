const { getCookie, sendJson, validSessionToken } = require("../_auth");

module.exports = function session(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return sendJson(res, 405, { authenticated: false });
  }
  const authenticated = validSessionToken(getCookie(req));
  return sendJson(res, authenticated ? 200 : 401, { authenticated });
};
