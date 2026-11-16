# MyResume-web: Technologies and Architecture

A single page app (SPA) that renders an online resume for a person from the MyResume API. Claude writes the resume content at a chosen level of detail, and the layout follows the Pragmatic Engineer resume template.

## Technologies

| Area | Technology | Purpose |
|---|---|---|
| Frontend framework | Vue 3 (`<script setup>`, Composition API) | UI components and state |
| Build / dev server | Vite 8 with `@vitejs/plugin-vue` | Dev server with hot reload, production bundle in `dist/` |
| Backend | Node.js (>= 20) and Express 5 | Proxy for Claude calls; serves the built SPA in production |
| LLM | Claude via `@anthropic-ai/sdk` (default model `claude-sonnet-5-5`, override with `CLAUDE_MODEL`) | Generates resume content as structured JSON |
| Rate limiting | `express-rate-limit` | Limits requests to `/api/generate`, which spends credits |
| Data source | MyResume REST API (`https://resume.sola-llon.ch/api/v1`, spec in `docs/openapi.yaml`) | Person info, education, highlights, jobs, companies, tags |
| Hosting | Heroku (Node buildpack, `Procfile`) | Single dyno serving SPA and API |
| Styling | Plain CSS (`src/style.css`) | Recreates the template: blue section headings, three-column job rows, print styles |

## Architecture

```
 Browser (Vue SPA)
 │
 ├── GET  https://resume.sola-llon.ch/api/v1/...   (direct, CORS allows *)
 │        person info, education, highlights, resume id, jobs + companies
 │
 └── POST /api/generate  { level, data }
          │
          ▼
 Express server (server/index.js)
   ├── rate limit, body size cap
   ├── builds prompt for the chosen level (server/prompts.js)
   ├── Claude API call (key from ANTHROPIC_API_KEY, server side only)
   └── returns parsed JSON
          │
          ▼
 Browser renders the JSON with the template layout
```

### Request flow

1. **Load:** `App.vue` calls `fetchResumeData` (`src/api/myresume.js`). It fetches info, education, highlights and the resume id in parallel, then fetches the jobs and joins each job to its company by `company_id`.
2. **Filter:** `filterJobs` applies the time span (current only, last 5 or 10 years, everything). A job is kept if it is current or ended inside the window. The API's `since` parameter is not used because it is unreliable.
3. **Generate:** `generateResume` (`src/api/generate.js`) posts `{ level, data: { highlights, jobs } }` to `/api/generate`. Contact info and education stay in the browser.
4. **Claude:** the server inserts the data and the level's rules into a prompt and asks for one JSON object: a summary, jobs with dates, team and location, and bullets or a per-job summary, plus technologies.
5. **Render:** `ResumeView.vue` shows the JSON together with the header and education the browser already holds. `ResumeSkeleton.vue` shows while steps 1 to 4 run.

### Detail levels

| Level | Output per job |
|---|---|
| Overview | One summary paragraph covering all accomplishments, no bullets, no technologies |
| Detailed | Every accomplishment as a bullet, no technologies |
| Technical | Every accomplishment as a bullet, plus the job's technologies (from project tags) and a top-level technology list |

Jobs with no accomplishments fall back to one bullet per project description.

### State and caching

- The slider, the time span dropdown and the person dropdown live in `App.vue`. Changing any of them rebuilds the resume.
- Generated results are cached in memory per person, time span and level, so returning to an earlier choice is instant. The cache is lost on refresh.
- A request counter drops responses that arrive after a newer request, so fast slider moves cannot show stale results.

## Project layout

```
src/
  App.vue                     state, data loading, caching
  api/myresume.js             MyResume client, job/company join, range filter
  api/generate.js             call to the proxy
  components/
    PersonSelect.vue          person dropdown (single person)
    RangeSelect.vue           time span dropdown
    DetailSlider.vue          3-step detail slider
    ResumeView.vue            resume layout
    ResumeSkeleton.vue        loading placeholder
  style.css                   template-inspired styles
server/
  index.js                    Express app, Claude call, static serving
  prompts.js                  per-level prompt rules
  .env.example                ANTHROPIC_API_KEY, optional CLAUDE_MODEL, PORT, RATE_LIMIT_PER_MIN
docs/                         this document and the MyResume OpenAPI spec
Procfile                      web: npm start
```

## Running and deploying

- **Local development:** run `npm run server` (proxy on :3002) and `npm run dev` (Vite on :5173). Vite forwards `/api` to the proxy (`vite.config.js`).
- **Production:** `npm run build` creates `dist/`, and `npm start` serves it together with the API on `PORT`. On Heroku the buildpack runs the build automatically, and the `Procfile` only starts the server.

## Security notes

- The Claude key exists only on the server (`server/.env` locally, Heroku config in production). `.env` and `prompts/` are gitignored.
- `/api/generate` is rate limited (20 requests per minute per client by default) and the request body is capped at 256 KB.
- The endpoint still trusts the data the browser sends. A stricter design would have the server fetch the MyResume data itself from a person id.
- Calls to Claude are made from the server, never the browser.

## Known limitations

- The API has no LinkedIn or GitHub fields, so the header shows only location, email and phone.
- Template sections without an API source (Projects, Interests) are not rendered.
- Technical level over long time spans can take 10 seconds or more to generate.
