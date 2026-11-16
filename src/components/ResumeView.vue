<script setup>
import { computed } from 'vue'

const props = defineProps({ resume: Object, source: Object })

const info = computed(() => props.source?.info ?? {})
const education = computed(() => props.source?.education ?? [])
const location = computed(() => [info.value.city, info.value.state].filter(Boolean).join(', '))
const jobs = computed(() => props.resume.jobs ?? [])
const technologies = computed(() => props.resume.technologies ?? [])
</script>

<template>
  <article class="page resume">
    <header class="masthead">
      <div class="left">
        <div>{{ location }}</div>
        <div>{{ info.email }}</div>
      </div>
      <h1>{{ info.name }}</h1>
      <div class="right">
        <div>{{ info.phone }}</div>
      </div>
    </header>

    <p class="summary">{{ resume.summary }}</p>

    <section>
      <h2>Work Experience</h2>
      <div v-for="(job, i) in jobs" :key="i" class="job">
        <div class="row strong">
          <span>{{ job.title }}</span>
          <span>{{ job.company }}</span>
          <span>{{ job.dates }}</span>
        </div>
        <div class="row">
          <span>{{ job.team }}</span>
          <span>{{ job.location }}</span>
          <span></span>
        </div>
        <p v-if="job.summary" class="job-summary">{{ job.summary }}</p>
        <ul v-if="job.bullets?.length">
          <li v-for="(b, j) in job.bullets" :key="j">{{ b }}</li>
        </ul>
        <p v-if="job.technologies?.length" class="tech">
          <strong>Technologies:</strong> {{ job.technologies.join(', ') }}
        </p>
      </div>
    </section>

    <section v-if="education.length">
      <h2>Education and Certifications</h2>
      <ul>
        <li v-for="(e, i) in education" :key="i" class="edu">
          <span><strong>{{ e.title }},</strong> {{ e.origin }}</span>
          <span>{{ e.year }}</span>
        </li>
      </ul>
    </section>

    <section v-if="technologies.length">
      <h2>Technologies and Languages</h2>
      <p>{{ technologies.join(', ') }}</p>
    </section>
  </article>
</template>
