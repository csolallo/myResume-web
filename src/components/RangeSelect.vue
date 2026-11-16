<script setup>
defineProps({ options: Array })
const model = defineModel()
</script>

<template>
  <label class="field">
    Time span
    <select v-model="model">
      <option v-for="o in options" :key="o.value" :value="o.value">{{ o.label }}</option>
    </select>
  </label>
</template>
