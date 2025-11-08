# BioSphere — Research & Learning Hub

[![version](https://img.shields.io/badge/version-1.0.0-blue)](backend/package.json)
[![node](https://img.shields.io/badge/node-%3E=_18-brightgreen)](https://nodejs.org/)

A static website (frontend) with a Node.js + Express backend that provides user authentication (email/username/password + Google OAuth), JWT access/refresh tokens, and basic account management backed by MongoDB.

This README helps developers get the project running locally, understand the architecture, and find where to contribute or get help.

---

## Quick summary

- Frontend: static HTML/CSS/JS in the repository root and `assets/` (no build step). Designed with Bootstrap and vendor JS libs.
- Backend: Node.js (ES modules) in `backend/` — Express API, Mongoose models, JWT-based auth, Google OAuth (Passport), cookie handling.
- Data: MongoDB (external URI required in `.env`).

---

## Key features

- Local static website for the BioSphere project.
- User registration and login (username + email, password).
- Google OAuth sign-in (creates user if missing).
- JWT-based access and refresh tokens; refresh token stored on user document and in httpOnly cookie.
- API endpoints for profile, change password, logout, token refresh.

---

## Repo layout (important files)

- `/index.html`, `/login.html`, `/signup.html`, etc. — static frontend pages
- `/assets/` — CSS, JS and vendor libraries
- `/backend/` — Express app
  - `backend/src/app.js` — Express app and middleware
  - `backend/src/index.js` — server entry (starts the app)
  - `backend/src/routes/` — routes (user.routes.js, healthcheck.routes.js)
  - `backend/src/controllers/` — request handlers
  - `backend/src/models/user.models.js` — Mongoose user model and token helpers
  - `backend/package.json` — backend dependencies & scripts
- `backend/.env` — environment file (not checked into VCS) — see `.env.example` below

---

## Prerequisites

- Node.js 18+ (LTS recommended)
- npm (comes with Node)
- A MongoDB URI (Atlas or local)
- Google OAuth credentials (if you want Google sign-in): create OAuth client in Google Cloud Console and set callback URL

---

## Environment variables

Create a `.env` file inside `backend/` (copy from `.env.example` if you add one). At minimum configure:

```properties
PORT=8000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.example.mongodb.net/dbname
SESSION_SECRET=some_long_random_string
ACCESS_TOKEN_SECRET=<jwt-access-secret>
REFRESH_TOKEN_SECRET=<jwt-refresh-secret>
GOOGLE_CLIENT_ID=<google-client-id>
GOOGLE_CLIENT_SECRET=<google-client-secret>
GOOGLE_CALLBACK_URL=http://localhost:8000/api/v1/users/auth/google/callback
CORS_ORIGIN=http://127.0.0.1:5501
FRONTEND_URL=http://127.0.0.1:5501/index.html
NODE_ENV=development
```

Notes:
- `CORS_ORIGIN` is used by the backend to allow browser requests from the frontend origin. It can be a comma-separated list (e.g. `http://127.0.0.1:5501,https://example.com`).
- `FRONTEND_URL` is used as the redirect target after successful OAuth.
- Keep secrets out of source control.

---

## Install & run (backend)

Open PowerShell in the repository root and run:

```powershell
cd backend
npm install
# start in development with nodemon
npm run dev
# or run in production mode
npm start
```

The backend will read `.env` and listen on `PORT` (default `7000` or `8000` if set in `.env`).

## Run the frontend (static pages)

The frontend is static HTML. You can open `index.html` directly in the browser or use a lightweight static server (recommended so `fetch`/CORS behaves like a hosted site):

- VS Code Live Server extension (recommended)
- Or use `npx http-server . -p 5501`

Example with `http-server`:

```powershell
# from repository root
npx http-server . -p 5501
# open http://127.0.0.1:5501 in your browser
```

If you run the frontend on a port other than the one in `CORS_ORIGIN`, update `CORS_ORIGIN` accordingly.

---

## Common developer tasks

- Register a new user (backend):

```bash
curl -X POST https://localhost:8000/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Alice","email":"alice@example.com","username":"alice","password":"secret","role":"user"}'
```

- Login (example):

```bash
curl -X POST https://localhost:8000/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","username":"alice","password":"secret"}'
```

- Healthcheck:

```bash
curl http://localhost:8000/api/v1/healthcheck
```

---

## API overview (selected endpoints)

All backend routes are under `/api/v1`

- `GET /api/v1/healthcheck` — service health
- `POST /api/v1/users/register` — register a user
- `POST /api/v1/users/login` — login (returns cookies and tokens)
- `POST /api/v1/users/refresh-token` — refresh access token
- `POST /api/v1/users/logout` — logout (requires auth)
- `POST /api/v1/users/auth/google` — start Google OAuth flow
- `GET /api/v1/users/auth/google/callback` — Google OAuth callback
- `GET /api/v1/users/current-user` — get current user (requires auth)
- `POST /api/v1/users/change-password` — change password (requires auth)

For full details, consult the controllers in `backend/src/controllers/`.

---

## Important developer notes & debugging tips

- CORS vs Postman: Postman does not enforce CORS — the browser does. If requests work in Postman but fail in the browser, check CORS headers (Access-Control-Allow-Origin) and server `CORS_ORIGIN` configuration.
- Cookies & sameSite: when using cookies across origins (backend != frontend), set `sameSite: 'none'` and `secure: true` in production (HTTPS required). For local development you may use `sameSite: 'lax'` and `secure: false`.
- OAuth callback: ensure `GOOGLE_CALLBACK_URL` in your `.env` matches the callback set in Google Cloud Console exactly (including scheme and port).
- Sessions vs JWT: this project uses JWTs and sets httpOnly cookies. The code also contains express-session setup — if you use stateless JWTs you can remove express-session to avoid server-side session storage.

---

## Where to get help

- Open an issue in this repository describing the problem and steps to reproduce.
- Include backend logs (`backend` terminal output) and browser DevTools Console + Network output when reporting CORS / cookie issues.

---

## Contributing

Contributions are welcome. If the repository does not yet include a `CONTRIBUTING.md`, please open an issue first to discuss major changes. Small fixes and documentation improvements can be submitted as pull requests.

Guidelines:
- Fork the repository and open a PR against `master`.
- Keep changes focused.


---

## Maintainers

- Primary maintainer: `diya05arora` (GitHub account associated with the repo owner)

If you want to be listed as a co-maintainer, open an issue or PR.

---

## Acknowledgements

Built with Bootstrap and several open-source JS libraries included under `assets/vendor/`.

---

If you want, I can also:
- Add a `backend/.env.example` with the recommended variables (I can create that file),
- Add a `CONTRIBUTING.md` stub in `docs/` and link to it,
- Add small `Makefile` / `package.json` root scripts to start both frontend and backend for convenience.

