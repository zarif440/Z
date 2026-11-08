const { once } = require("node:events");
const { Writable } = require("node:stream");
const { test } = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");

const login = require("../api/auth/login");
const logout = require("../api/auth/logout");
const session = require("../api/auth/session");
const dashboard = require("../api/dashboard");
const vercelConfig = require("../vercel.json");

class MockResponse extends Writable {
  constructor() {
    super();
    this.statusCode = 200;
    this.headers = {};
    this.chunks = [];
  }

  setHeader(name, value) {
    this.headers[name.toLowerCase()] = value;
  }

  getHeader(name) {
    return this.headers[name.toLowerCase()];
  }

  _write(chunk, encoding, callback) {
    this.chunks.push(Buffer.from(chunk));
    callback();
  }

  get body() {
    return Buffer.concat(this.chunks).toString("utf8");
  }
}

function request(method, { body, cookie = "" } = {}) {
  return {
    method,
    body,
    headers: {
      host: "example.test",
      origin: "https://example.test",
      "content-type": "application/json",
      cookie
    }
  };
}

async function invoke(handler, req) {
  const res = new MockResponse();
  await handler(req, res);
  if (!res.writableFinished) await once(res, "finish");
  return res;
}

test("server-side login, protected dashboard, and logout flow", async () => {
  const previous = {
    AUTH_EMAIL: process.env.AUTH_EMAIL,
    AUTH_PASSWORD_HASH: process.env.AUTH_PASSWORD_HASH,
    SESSION_SECRET: process.env.SESSION_SECRET
  };
  const salt = crypto.randomBytes(16);
  const password = "correct horse battery staple";
  const hash = crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  Object.assign(process.env, {
    AUTH_EMAIL: "musarrat@example.test",
    AUTH_PASSWORD_HASH: `scrypt$${salt.toString("base64url")}$${hash.toString("base64url")}`,
    SESSION_SECRET: crypto.randomBytes(48).toString("base64")
  });

  try {
    const directDashboardRewrite = vercelConfig.rewrites.find((route) => route.source === "/dashboard.html");
    assert.equal(directDashboardRewrite?.destination, "/api/dashboard", "the HTML filename must also use the protected server route");

    const denied = await invoke(dashboard, request("GET"));
    assert.equal(denied.statusCode, 302);
    assert.equal(denied.getHeader("location"), "/");

    const badLogin = await invoke(login, request("POST", {
      body: { email: "musarrat@example.test", password: "wrong password" }
    }));
    assert.equal(badLogin.statusCode, 401);
    assert.equal(badLogin.getHeader("set-cookie"), undefined);

    const goodLogin = await invoke(login, request("POST", {
      body: { email: "musarrat@example.test", password }
    }));
    assert.equal(goodLogin.statusCode, 200);
    const setCookie = goodLogin.getHeader("set-cookie");
    assert.match(setCookie, /HttpOnly/);
    assert.match(setCookie, /Secure/);
    assert.match(setCookie, /SameSite=Strict/);
    const cookie = setCookie.split(";")[0];

    const activeSession = await invoke(session, request("GET", { cookie }));
    assert.equal(activeSession.statusCode, 200);
    assert.deepEqual(JSON.parse(activeSession.body), { authenticated: true });

    const allowed = await invoke(dashboard, request("GET", { cookie }));
    assert.equal(allowed.statusCode, 200);
    assert.match(allowed.getHeader("cache-control"), /no-store/);
    assert.match(allowed.body, /logoutButton/);

    const signedOut = await invoke(logout, request("POST", { cookie }));
    assert.equal(signedOut.statusCode, 200);
    assert.match(signedOut.getHeader("set-cookie"), /Max-Age=0/);

    const expiredSession = await invoke(session, request("GET", { cookie: signedOut.getHeader("set-cookie").split(";")[0] }));
    assert.equal(expiredSession.statusCode, 401);
    assert.deepEqual(JSON.parse(expiredSession.body), { authenticated: false });

    const deniedAfterLogout = await invoke(dashboard, request("GET", {
      cookie: signedOut.getHeader("set-cookie").split(";")[0]
    }));
    assert.equal(deniedAfterLogout.statusCode, 302);
    assert.equal(deniedAfterLogout.getHeader("location"), "/");
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});
