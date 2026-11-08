const { createReadStream } = require("node:fs");
const { join } = require("node:path");
const { getCookie, sendJson, validSessionToken } = require("./_auth");

module.exports = function dashboard(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return sendJson(res, 405, { error: "Method not allowed." });
  }
  if (!validSessionToken(getCookie(req))) {
    res.statusCode = 302;
    res.setHeader("Cache-Control", "no-store, max-age=0");
    res.setHeader("Location", "/");
    return res.end();
  }

  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "private, no-store, max-age=0");
  res.setHeader("X-Content-Type-Options", "nosniff");
  return createReadStream(join(process.cwd(), "dashboard.html")).pipe(res);
};
