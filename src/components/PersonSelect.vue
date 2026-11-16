<script setup>
defineProps({ people: Array })
const model = defineModel()
</script>

<template>
  <label class="field">
    Person
    <select v-model="model">
      <option v-for="p in people" :key="p.uuid" :value="p.uuid">{{ p.name }}</option>
    </select>
  </label>
</template>
