# MyResume Web

A Vue 3 (Vite) app that pulls resume data from the MyResume API
(`https://resume.sola-llon.ch/api/v1`) and uses Claude to generate a resume at a chosen level of detail.
A small Express server proxies the Claude calls so the API key never reaches the browser.

See `docs/architecture.md` for design notes and `docs/openapi.yaml` for the MyResume API.

## Prerequisites

- Node.js 20.6+ (the `server` script uses `node --env-file`)
- An Anthropic API key

```bash
npm install
cp server/.env.example server/.env   # then set ANTHROPIC_API_KEY
```

`server/.env` options:

| Variable            | Required | Default             | Notes                          |
| ------------------- | -------- | ------------------- | ------------------------------ |
| `ANTHROPIC_API_KEY` | yes      |                     |                                |
| `CLAUDE_MODEL`      | no       | `claude-sonnet-5-5` |                                |
| `PORT`              | no       | `3002`              | Vite's proxy expects 3002      |
| `RATE_LIMIT_PER_MIN`| no       | `20`                | Per-client cap on `/api/generate` |

## Running locally (two servers)

In development the frontend and the API server run separately. Vite serves the app with hot reload
and proxies `/api` requests to the Express server.

Terminal 1, the API server (http://localhost:3002):

```bash
npm run server
```

Terminal 2, the Vite dev server (http://localhost:5173):

```bash
npm run dev
```

Open http://localhost:5173. Make sure `dist/` is not what you're testing: the Express server also serves
`dist/` if it exists, but in dev you should use the Vite URL.

## Running remotely (one server)

In production a single Express server serves both the built app and the `/api/generate` endpoint.

```bash
npm run build   # builds the SPA into dist/
npm start       # node server/index.js; serves dist/ and the API on $PORT (default 3002)
```

Set `ANTHROPIC_API_KEY` (and optionally `PORT`, `CLAUDE_MODEL`) in the host's environment, since
`npm start` does not read `server/.env`. The `Procfile` (`web: npm start`) is set up for Heroku-style
hosts; make sure `npm run build` runs during deploy so `dist/` exists (Heroku's Node buildpack runs it
automatically). The server trusts one proxy hop so rate limiting sees the real client IP.

To try the production setup locally:

```bash
npm run build
node --env-file=server/.env server/index.js   # then open http://localhost:3002
```
