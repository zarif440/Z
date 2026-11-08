# Greenleaf website

Responsive static frontend with serverless sign-in and a server-rendered, session-gated dashboard on Vercel. The account is configured only with Vercel environment variables; no credentials are committed to the repository.

## Configure the authorized account

1. Generate a strong password hash locally. The script reads the password from standard input and prints only a salted scrypt hash. In Bash:

   ```sh
   read -s -p 'New account password: ' AUTH_PASSWORD; printf '\n'; printf '%s' "$AUTH_PASSWORD" | node scripts/hash-password.js; unset AUTH_PASSWORD
   ```

   Choose a unique password with at least 12 characters. Copy the printed `scrypt$...` value, not the password.

2. In Vercel, open **Project → Settings → Environment Variables** and add these server-only variables for the required deployment environments:
   - `AUTH_EMAIL`: the one authorized account's email address.
   - `AUTH_PASSWORD_HASH`: the complete scrypt hash from step 1.
   - `SESSION_SECRET`: a randomly generated secret with at least 32 bytes, for example `openssl rand -base64 48`.

   Do not prefix these variables with `NEXT_PUBLIC_` or `VITE_`, and do not commit them in source files or expose them to client bundles.

3. Redeploy after setting the variables. The API returns a configuration error and will not authenticate if any required setting is missing or malformed. For local Vercel development, put the values in `.env.local` (which must remain untracked).

## Authentication behavior

- `/api/auth/login` checks the single configured email and scrypt password hash server-side. Wrong credentials return an explicit 401 error. A successful response sets a seven-day, signed `HttpOnly`, `Secure`, `SameSite=Strict` session cookie.
- Both `/dashboard` and `/dashboard.html` are rewritten to a Vercel serverless handler. That handler verifies the signed cookie before it reads and returns `dashboard.html`; unauthenticated requests are redirected to `/`. The page is served with private, no-store cache headers.
- `/api/auth/logout` expires the session cookie. `/api/auth/session` provides a no-store session status response.
- The password is only transmitted to the same-origin HTTPS login endpoint for verification; it is not placed in local storage, cookies, logs, or frontend configuration. The cookie contains a signed session payload, not the password.
- The signed stateless session expires after seven days. Rotating `SESSION_SECRET` invalidates all existing sessions. For brute-force protection at scale, configure Vercel Firewall/rate limiting for `/api/auth/login`.

## Run and verify

Run the built-in end-to-end handler test with `node --test test/auth-flow.test.js`. It exercises invalid and successful login, session checks, protected dashboard access, direct-filename rewrite configuration, logout, and denial after logout. To exercise the deployed-style routes locally, use `vercel dev` after configuring environment variables; a regular static file server cannot run or validate the serverless authentication handlers.
