export async function generateResume(level, data) {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ level, data }),
  })
  if (!res.ok) throw new Error('Resume generation failed')
  return res.json()
}
