const BASE = 'https://resume.sola-llon.ch/api/v1'

async function get(path) {
  const res = await fetch(BASE + path, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`MyResume API ${res.status} for ${path}`)
  return res.json()
}

export function fetchPeople() {
  return get('/people')
}

export async function fetchPersonData(personId) {
  const [info, education, highlights, { resume }] = await Promise.all([
    get(`/person/${personId}/info`),
    get(`/person/${personId}/education`),
    get(`/person/${personId}/highlights`),
    get(`/person/${personId}/resume`),
  ])
  return { info, education, highlights, resume }
}

// mm/dd/yyyy, as the API expects for `since`.
function formatSince(date) {
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${mm}/${dd}/${date.getFullYear()}`
}

function sinceFor(range) {
  if (range === 'all') return null
  const d = new Date()
  if (range !== 'current') d.setFullYear(d.getFullYear() - Number(range))
  return formatSince(d)
}

// Fetch jobs active since the range's start date and join them to companies.
export async function fetchJobs(resumeId, range) {
  const since = sinceFor(range)
  const qs = since ? `?since=${encodeURIComponent(since)}` : ''
  const { companies, jobs } = await get(`/resume/${resumeId}/jobs${qs}`)
  const byId = new Map(companies.map((c) => [c.id, c]))
  return jobs.map((j) => {
    const c = byId.get(j.company_id) ?? {}
    return {
      title: j.title,
      company: c.name ?? '',
      city: c.city ?? '',
      state: c.state ?? '',
      start_date: j.start_date,
      end_date: j.end_date,
      projects: j.projects.map((p) => ({
        name: p.name,
        description: p.description,
        accomplishments: p.accomplishments.map((a) => a.description),
        tags: p.tags.map((t) => t.name),
      })),
    }
  })
}

export const RANGES = [
  { value: 'current', label: 'Current only' },
  { value: '5', label: 'Last 5 years' },
  { value: '10', label: 'Last 10 years' },
  { value: 'all', label: 'Everything' },
]
export const DEFAULT_RANGE = '5'
