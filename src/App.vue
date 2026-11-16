<script setup>
import { ref, watch, onMounted } from 'vue'
import PersonSelect from './components/PersonSelect.vue'
import RangeSelect from './components/RangeSelect.vue'
import DetailSlider from './components/DetailSlider.vue'
import ResumeView from './components/ResumeView.vue'
import ResumeSkeleton from './components/ResumeSkeleton.vue'
import {
  RANGES,
  DEFAULT_RANGE,
  fetchPeople,
  fetchPersonData,
  fetchJobs,
} from './api/myresume.js'
import { DEFAULT_PERSON_NAME } from './config/constants.js'
import { generateResume } from './api/generate.js'

const LEVELS = ['overview', 'detailed', 'technical']

const people = ref([])
const personId = ref('')
const range = ref(DEFAULT_RANGE)
const levelIndex = ref(0)
const loading = ref(true)
const error = ref('')
const source = ref(null) // raw MyResume data
const resume = ref(null) // Claude-generated content
const cache = new Map() // `${personId}:${level}` -> generated content
let requestSeq = 0

async function build() {
  const seq = ++requestSeq
  const level = LEVELS[levelIndex.value]
  const key = `${personId.value}:${range.value}:${level}`
  error.value = ''
  try {
    if (cache.has(key) && source.value) {
      resume.value = cache.get(key)
      loading.value = false
      return
    }
    loading.value = true
    const id = personId.value
    const r = range.value
    let data = source.value
    if (!data || data.personId !== id) {
      data = { personId: id, range: null, jobs: [], ...(await fetchPersonData(id)) }
    }
    if (data.range !== r) {
      data = { ...data, range: r, jobs: await fetchJobs(data.resume, r) }
    }
    if (seq !== requestSeq) return
    source.value = data
    const generated = await generateResume(level, {
      highlights: source.value.highlights,
      jobs: source.value.jobs,
    })
    if (seq !== requestSeq) return // a newer request superseded this one
    cache.set(key, generated)
    resume.value = generated
  } catch (e) {
    if (seq === requestSeq) error.value = e.message
  } finally {
    if (seq === requestSeq) loading.value = false
  }
}

onMounted(async () => {
  try {
    people.value = await fetchPeople()
    const preferred = people.value.find((p) => p.name === DEFAULT_PERSON_NAME) ?? people.value[0]
    if (!preferred) throw new Error('No people returned by the API')
    personId.value = preferred.uuid
  } catch (e) {
    error.value = e.message
    loading.value = false
  }
})
watch([levelIndex, range], () => personId.value && build())
watch(personId, (id) => {
  source.value = null
  if (id) build()
})
</script>

<template>
  <header class="controls">
    <PersonSelect v-model="personId" :people="people" />
    <RangeSelect v-model="range" :options="RANGES" />
    <DetailSlider v-model="levelIndex" :labels="['Overview', 'Detailed', 'Technical']" />
  </header>
  <main>
    <ResumeSkeleton v-if="loading" />
    <p v-else-if="error" class="error">{{ error }}</p>
    <ResumeView v-else-if="resume" :resume="resume" :source="source" />
  </main>
</template>
