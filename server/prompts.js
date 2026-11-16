export const LEVELS = ['overview', 'detailed', 'technical']

const LEVEL_RULES = {
  overview:
    'For each job, write ONE short paragraph (2-3 sentences) in "summary" that summarizes ALL of the job\'s accomplishments across its projects, and set "bullets" to []. Do not include technologies.',
  detailed:
    'For each job, list EVERY accomplishment verbatim (light grammar fixes only). Do not summarize, merge, or drop any. Do not include technologies.',
  technical:
    'For each job, list EVERY accomplishment verbatim (light grammar fixes only), and also set "technologies" to the de-duplicated list of technologies (tags) used in that job.',
}

export function buildPrompt(level, data) {
  return `You are generating the content of an online resume from structured data.
Detail level: ${level}.

Rules:
- ${LEVEL_RULES[level]}
- If a job has no accomplishments at all, use its projects' descriptions instead: one concise bullet per project, naming the project. Every job must have at least one bullet (or a summary at the overview level).
- Keep jobs in the same order as the input. Use only facts present in the input; never invent employers, dates, numbers or technologies.
- "summary" is a 2-3 sentence professional summary written from the career highlights.
- Return ONLY a JSON object, no prose and no code fences, with this shape:
{
  "summary": string,
  "jobs": [
    { "title": string, "company": string, "team": string, "location": string,
      "dates": string, "summary": string, "bullets": string[], "technologies": string[] }
  ],
  "technologies": string[]
}
- "dates" like "Sep 2018 – Present" or "2017 – 2018". "team" is the project/team name(s) joined with ", ". "location" is "City, ST" or "".
- "summary" on each job is "" unless the level is overview. "bullets" is [] at the overview level.
- "technologies" on each job is [] unless the level is technical. Top-level "technologies" is [] unless the level is technical, where it is the de-duplicated list across all jobs.

Input data:
${JSON.stringify(data)}`
}
