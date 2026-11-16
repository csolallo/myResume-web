<script setup>
defineProps({ labels: Array })
const model = defineModel()
</script>

<template>
  <div class="field slider">
    <span>Level of detail</span>
    <input type="range" min="0" :max="labels.length - 1" step="1" v-model.number="model" />
    <div class="ticks">
      <span v-for="(l, i) in labels" :key="l" :class="{ active: i === model }">{{ l }}</span>
    </div>
  </div>
</template>
