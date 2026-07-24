# FocusPath

Monorepo for FocusPath: React/Vite frontend + Express/Mongoose backend.

## Structure

- [`frontend/`](frontend) — React + Vite + TypeScript client
- [`server/`](server) — Express + Mongoose API

## Getting started

```bash
cp .env.example .env   # fill in MONGO_URI, JWT_SECRET, OPENAI_API_KEY, ADMIN_EMAIL, ADMIN_PASSWORD
npm install
npm run install:all
npm run dev
```

There is a single `.env` at the repo root, shared by both `frontend` (Vite reads it via `envDir`) and `server` (loaded explicitly via `dotenv.config({ path: ... })`).

`npm run dev` starts both the frontend (Vite) and the server (nodemon) concurrently.

Other scripts:

- `npm run build` — builds both frontend and server
- `npm --prefix server run seed:admin` — creates an admin user from `ADMIN_EMAIL`/`ADMIN_PASSWORD` in `.env` (no-op if it already exists). Note: the `User` model has no role/admin flag yet, this just seeds a regular account you can log in with.
