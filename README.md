# Z<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="#f3f6f4">
  <meta name="description" content="A private sign-in interface demo with an optional, consent-based location preview.">
  <title>Sign in</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #f3f6f4;
      --panel: #fff;
      --ink: #17251e;
      --muted: #64736a;
      --line: #d7e0da;
      --accent: #176b4d;
      --accent-hover: #10583e;
      --accent-ink: #fff;
      --soft: #eaf3ed;
      --error: #b3261e;
      --success: #176b4d;
      --shadow: 0 24px 70px rgb(21 48 34 / 10%);
      --radius: 22px;
      font-synthesis: none;
    }

    :root[data-theme="dark"] {
      color-scheme: dark;
      --bg: #101713;
      --panel: #19231d;
      --ink: #edf4ef;
      --muted: #a4b2a9;
      --line: #34443a;
      --accent: #65d4a7;
      --accent-hover: #85e2bb;
      --accent-ink: #0b2117;
      --soft: #20352a;
      --error: #ff958c;
      --success: #81ddb2;
      --shadow: 0 24px 70px rgb(0 0 0 / 28%);
    }

    @media (prefers-color-scheme: dark) {
      :root:not([data-theme="light"]) {
        color-scheme: dark;
        --bg: #101713;
        --panel: #19231d;
        --ink: #edf4ef;
        --muted: #a4b2a9;
        --line: #34443a;
        --accent: #65d4a7;
        --accent-hover: #85e2bb;
        --accent-ink: #0b2117;
        --soft: #20352a;
        --error: #ff958c;
        --success: #81ddb2;
        --shadow: 0 24px 70px rgb(0 0 0 / 28%);
      }
    }

    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }

    html {
      min-width: 320px;
      scroll-padding-top: env(safe-area-inset-top, 0px);
    }

    body {
      min-height: 100vh;
      min-height: 100svh;
      margin: 0;
      padding: max(24px, env(safe-area-inset-top, 0px))
        max(20px, env(safe-area-inset-right, 0px))
        max(24px, env(safe-area-inset-bottom, 0px))
        max(20px, env(safe-area-inset-left, 0px));
      display: grid;
      place-items: center;
      background:
        radial-gradient(ellipse at 10% 12%, rgb(91 183 131 / 13%), transparent 34rem),
        radial-gradient(ellipse at 95% 90%, rgb(79 145 171 / 10%), transparent 32rem),
        var(--bg);
      color: var(--ink);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      line-height: 1.55;
      transition: background-color 180ms ease, color 180ms ease;
    }

    button,
    input {
      font: inherit;
    }

    button {
      color: inherit;
    }

    .shell {
      width: min(100%, 470px);
      animation: rise-in 500ms cubic-bezier(.2, .75, .25, 1) both;
    }

    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 18px;
      padding-inline: 4px;
    }

    .brand {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      color: var(--ink);
      font-size: .96rem;
      font-weight: 700;
      letter-spacing: -.02em;
    }

    .brand-mark {
      display: grid;
      width: 34px;
      height: 34px;
      place-items: center;
      border-radius: 11px;
      background: var(--accent);
      color: var(--accent-ink);
    }

    .theme-toggle,
    .password-toggle {
      border: 0;
      background: transparent;
      color: var(--muted);
      cursor: pointer;
    }

    .theme-toggle {
      min-height: 42px;
      padding: 8px 11px;
      border: 1px solid var(--line);
      border-radius: 12px;
      background: var(--panel);
      font-size: .85rem;
      font-weight: 600;
      transition: border-color 160ms ease, transform 160ms ease;
    }

    .theme-toggle:hover {
      border-color: var(--accent);
      transform: translateY(-1px);
    }

    .card {
      overflow: hidden;
      padding: clamp(24px, 7vw, 38px);
      border: 1px solid var(--line);
      border-radius: var(--radius);
      background: var(--panel);
      box-shadow: var(--shadow);
      transition: background-color 180ms ease, border-color 180ms ease;
    }

    .eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 14px;
      color: var(--accent);
      font-size: .76rem;
      font-weight: 750;
      letter-spacing: .1em;
      text-transform: uppercase;
    }

    .eyebrow::before {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: currentColor;
      content: "";
    }

    h1 {
      margin: 0;
      font-size: clamp(1.8rem, 7vw, 2.25rem);
      line-height: 1.15;
      letter-spacing: -.045em;
    }

    .intro {
      margin: 12px 0 24px;
      color: var(--muted);
      font-size: .98rem;
    }

    .demo-notice {
      margin: 0 0 24px;
      padding: 12px 14px;
      border: 1px solid var(--line);
      border-radius: 12px;
      background: var(--soft);
      color: var(--ink);
      font-size: .86rem;
    }

    .field {
      margin: 0 0 18px;
    }

    label {
      display: block;
      margin: 0 0 7px;
      font-size: .9rem;
      font-weight: 650;
    }

    .input-wrap {
      position: relative;
    }

    input {
      width: 100%;
      min-height: 50px;
      padding: 12px 14px;
      border: 1px solid var(--line);
      border-radius: 12px;
      outline: none;
      background: var(--panel);
      color: var(--ink);
      transition: border-color 160ms ease, box-shadow 160ms ease;
    }

    input::placeholder {
      color: var(--muted);
      opacity: .8;
    }

    input:focus-visible,
    button:focus-visible,
    a:focus-visible {
      outline: 3px solid color-mix(in srgb, var(--accent) 45%, transparent);
      outline-offset: 3px;
    }

    input:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 14%, transparent);
    }

    .password-input {
      padding-right: 76px;
    }

    .password-toggle {
      position: absolute;
      top: 50%;
      right: 8px;
      padding: 7px 9px;
      border-radius: 8px;
      font-size: .82rem;
      font-weight: 650;
      transform: translateY(-50%);
    }

    .password-toggle:hover {
      background: var(--soft);
      color: var(--ink);
    }

    .primary-button,
    .secondary-button {
      width: 100%;
      min-height: 50px;
      border-radius: 12px;
      cursor: pointer;
      font-weight: 700;
      transition: background-color 160ms ease, border-color 160ms ease, transform 160ms ease;
    }

    .primary-button {
      margin-top: 4px;
      border: 0;
      background: var(--accent);
      color: var(--accent-ink);
    }

    .primary-button:hover {
      background: var(--accent-hover);
      transform: translateY(-1px);
    }

    .secondary-button {
      border: 1px solid var(--line);
      background: var(--panel);
      color: var(--ink);
    }

    .secondary-button:hover {
      border-color: var(--accent);
      background: var(--soft);
      transform: translateY(-1px);
    }

    .status {
      min-height: 1.6em;
      margin: 12px 0 0;
      color: var(--muted);
      font-size: .9rem;
    }

    .status[data-kind="error"] {
      color: var(--error);
    }

    .status[data-kind="success"] {
      color: var(--success);
    }

    .divider {
      height: 1px;
      margin: 28px 0 22px;
      border: 0;
      background: var(--line);
    }

    .location-heading {
      margin: 0;
      font-size: 1.08rem;
      letter-spacing: -.02em;
    }

    .location-copy {
      margin: 7px 0 16px;
      color: var(--muted);
      font-size: .9rem;
    }

    .privacy-note {
      margin: 11px 0 0;
      color: var(--muted);
      font-size: .78rem;
    }

    .location-status {
      min-height: 1.6em;
      margin: 12px 0 0;
      color: var(--muted);
      font-size: .88rem;
    }

    .location-status[data-kind="error"] {
      color: var(--error);
    }

    .location-status[data-kind="success"] {
      color: var(--success);
    }

    .coordinates {
      margin-top: 16px;
      padding: 14px;
      border: 1px solid var(--line);
      border-radius: 12px;
      background: var(--soft);
    }

    .coordinates p {
      margin: 0;
      font-size: .88rem;
      overflow-wrap: anywhere;
    }

    .coordinates p + p {
      margin-top: 5px;
    }

    .map-frame {
      display: block;
      width: 100%;
      height: 245px;
      margin-top: 12px;
      border: 1px solid var(--line);
      border-radius: 10px;
      background: var(--bg);
    }

    .map-link {
      display: inline-block;
      margin-top: 10px;
      color: var(--accent);
      font-size: .86rem;
      font-weight: 650;
    }

    .footer {
      margin: 16px 4px 0;
      color: var(--muted);
      font-size: .77rem;
      text-align: center;
    }

    [hidden] {
      display: none !important;
    }

    @keyframes rise-in {
      from {
        opacity: 0;
        transform: translateY(12px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (max-width: 420px) {
      body {
        place-items: start center;
        padding-top: max(16px, env(safe-area-inset-top, 0px));
      }

      .shell {
        margin-block: auto;
      }

      .card {
        border-radius: 18px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      *,
      *::before,
      *::after {
        scroll-behavior: auto !important;
        animation-duration: .01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: .01ms !important;
      }
    }
  </style>
</head>
<body>
  <main class="shell">
    <header class="topbar">
      <div class="brand" aria-label="Greenleaf">
        <span class="brand-mark" aria-hidden="true">G</span>
        <span>Greenleaf</span>
      </div>
      <button class="theme-toggle" id="themeToggle" type="button" aria-pressed="false">
        Use dark mode
      </button>
    </header>

    <section class="card" aria-labelledby="pageTitle">
      <p class="eyebrow">Welcome back</p>
      <h1 id="pageTitle">Sign in</h1>
      <p class="intro">Enter your details to continue.</p>

      <p class="demo-notice">
        <strong>Demo only:</strong> authentication is not connected. Do not enter a real password.
        This page does not submit or save credentials.
      </p>

      <form id="loginForm" novalidate>
        <div class="field">
          <label for="name">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            autocomplete="username"
            placeholder="Your name"
            required
            minlength="2"
            maxlength="80"
            autofocus
          >
        </div>

        <div class="field">
          <label for="password">Password</label>
          <div class="input-wrap">
            <input
              class="password-input"
              id="password"
              name="password"
              type="password"
              autocomplete="current-password"
              placeholder="Enter a password"
              required
              minlength="8"
              maxlength="128"
              aria-describedby="passwordHelp"
            >
            <button
              class="password-toggle"
              id="passwordToggle"
              type="button"
              aria-controls="password"
              aria-pressed="false"
            >Show</button>
          </div>
          <span class="privacy-note" id="passwordHelp">Demo field only. No password is sent anywhere.</span>
        </div>

        <button class="primary-button" type="submit">Continue</button>
        <p class="status" id="loginStatus" role="status" aria-live="polite"></p>
      </form>

      <hr class="divider">

      <section aria-labelledby="locationTitle">
        <h2 class="location-heading" id="locationTitle">Optional location preview</h2>
        <p class="location-copy">
          Share your location only if you choose. Your browser will ask for permission after you click
          the button. If you allow it, this page displays your coordinates and loads an OpenStreetMap
          preview centered on them.
        </p>
        <button class="secondary-button" id="shareLocation" type="button">Share location</button>
        <p class="location-status" id="locationStatus" role="status" aria-live="polite"></p>
        <div class="coordinates" id="locationResult" hidden>
          <p><strong>Latitude:</strong> <span id="latitude"></span></p>
          <p><strong>Longitude:</strong> <span id="longitude"></span></p>
          <iframe
            class="map-frame"
            id="map"
            title="Map preview of the shared location"
            loading="lazy"
            referrerpolicy="no-referrer"
            hidden
          ></iframe>
          <a class="map-link" id="mapLink" target="_blank" rel="noopener noreferrer" hidden>
            Open map in a new tab
          </a>
        </div>
        <p class="privacy-note">
          Location is not sent to this page’s backend because there is no backend. After you allow
          sharing, OpenStreetMap receives a map request containing the displayed coordinates.
          If you deny permission, this page does not show or send your location.
        </p>
      </section>
    </section>

    <p class="footer">A static demo interface · No authentication backend configured</p>
  </main>

  <script>
    "use strict";

    const byId = (id) => document.getElementById(id);
    const loginForm = byId("loginForm");
    const nameInput = byId("name");
    const passwordInput = byId("password");
    const loginStatus = byId("loginStatus");
    const passwordToggle = byId("passwordToggle");
    const themeToggle = byId("themeToggle");
    const locationButton = byId("shareLocation");
    const locationStatus = byId("locationStatus");
    const locationResult = byId("locationResult");
    const mapFrame = byId("map");
    const mapLink = byId("mapLink");

    function setStatus(element, message, kind = "") {
      element.textContent = message;
      if (kind) {
        element.dataset.kind = kind;
      } else {
        delete element.dataset.kind;
      }
    }

    passwordToggle.addEventListener("click", () => {
      const shouldShow = passwordInput.type === "password";
      passwordInput.type = shouldShow ? "text" : "password";
      passwordToggle.textContent = shouldShow ? "Hide" : "Show";
      passwordToggle.setAttribute("aria-pressed", String(shouldShow));
    });

    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      setStatus(loginStatus, "");

      const name = nameInput.value.trim();
      if (name.length < 2) {
        nameInput.setCustomValidity("Enter a name with at least 2 characters.");
        nameInput.reportValidity();
        setStatus(loginStatus, "Please enter a name with at least 2 characters.", "error");
        nameInput.focus();
        return;
      }
      nameInput.setCustomValidity("");

      if (!passwordInput.value) {
        passwordInput.setCustomValidity("Enter a password.");
        passwordInput.reportValidity();
        setStatus(loginStatus, "Please enter a password.", "error");
        passwordInput.focus();
        return;
      }
      if (passwordInput.value.length < 8) {
        passwordInput.setCustomValidity("Use at least 8 characters for this demo field.");
        passwordInput.reportValidity();
        setStatus(loginStatus, "The demo password field requires at least 8 characters.", "error");
        passwordInput.focus();
        return;
      }
      passwordInput.setCustomValidity("");

      // No authentication service is configured. Do not read, submit, or store the password.
      passwordInput.value = "";
      setStatus(
        loginStatus,
        "Sign-in is unavailable: no authentication backend is configured. No credentials were submitted.",
        "error"
      );
    });

    nameInput.addEventListener("input", () => nameInput.setCustomValidity(""));
    passwordInput.addEventListener("input", () => passwordInput.setCustomValidity(""));

    function applyTheme(theme) {
      document.documentElement.dataset.theme = theme;
      const isDark = theme === "dark";
      themeToggle.textContent = isDark ? "Use light mode" : "Use dark mode";
      themeToggle.setAttribute("aria-pressed", String(isDark));
      document.querySelector('meta[name="theme-color"]')
        .setAttribute("content", isDark ? "#101713" : "#f3f6f4");
    }

    const savedTheme = (() => {
      try {
        return localStorage.getItem("login-demo-theme");
      } catch {
        return null;
      }
    })();

    applyTheme(savedTheme === "dark" ? "dark" : "light");

    themeToggle.addEventListener("click", () => {
      const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      applyTheme(nextTheme);
      try {
        localStorage.setItem("login-demo-theme", nextTheme);
      } catch {
        // Theme still works for this page view when storage is unavailable.
      }
    });

    function showLocation(position) {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      const latText = latitude.toFixed(6);
      const lonText = longitude.toFixed(6);

      byId("latitude").textContent = latText;
      byId("longitude").textContent = lonText;
      locationResult.hidden = false;

      // The map request is created only after the visitor clicks Share location
      // and the browser returns a position, meaning permission was granted.
      const pad = 0.01;
      const west = (longitude - pad).toFixed(6);
      const east = (longitude + pad).toFixed(6);
      const south = Math.max(-90, latitude - pad).toFixed(6);
      const north = Math.min(90, latitude + pad).toFixed(6);
      const mapUrl = new URL("https://www.openstreetmap.org/export/embed.html");
      mapUrl.searchParams.set("bbox", `${west},${south},${east},${north}`);
      mapUrl.searchParams.set("layer", "mapnik");
      mapUrl.searchParams.set("marker", `${latText},${lonText}`);

      mapFrame.src = mapUrl.toString();
      mapFrame.hidden = false;
      mapLink.href = `https://www.openstreetmap.org/?mlat=${encodeURIComponent(latText)}&mlon=${encodeURIComponent(lonText)}#map=16/${encodeURIComponent(latText)}/${encodeURIComponent(lonText)}`;
      mapLink.hidden = false;

      setStatus(locationStatus, "Location shared with this page for the map preview.", "success");
      locationButton.disabled = false;
      locationButton.textContent = "Refresh location";
    }

    function handleLocationError(error) {
      locationResult.hidden = true;
      mapFrame.removeAttribute("src");
      mapFrame.hidden = true;
      mapLink.removeAttribute("href");
      mapLink.hidden = true;

      let message = "Location could not be retrieved. No map was loaded.";
      if (error && error.code === error.PERMISSION_DENIED) {
        message = "Permission was denied. This page did not display or send your location.";
      } else if (error && error.code === error.POSITION_UNAVAILABLE) {
        message = "Your location is unavailable. No map was loaded.";
      } else if (error && error.code === error.TIMEOUT) {
        message = "The location request timed out. No map was loaded.";
      }
      setStatus(locationStatus, message, "error");
      locationButton.disabled = false;
      locationButton.textContent = "Share location";
    }

    locationButton.addEventListener("click", () => {
      setStatus(locationStatus, "");
      if (!("geolocation" in navigator)) {
        setStatus(locationStatus, "Location is not supported by this browser.", "error");
        return;
      }

      locationButton.disabled = true;
      locationButton.textContent = "Waiting for permission…";
      setStatus(locationStatus, "Your browser may ask you to allow location access.");

      // This is the only place the page requests browser geolocation.
      navigator.geolocation.getCurrentPosition(showLocation, handleLocationError, {
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 0
      });
    });
  </script>
</body>
</html>
