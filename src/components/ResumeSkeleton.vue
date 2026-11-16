<template>
  <article class="page skeleton" aria-busy="true" aria-label="Generating resume">
    <div class="bar w40 center tall"></div>
    <div class="bar w100"></div>
    <div class="bar w80"></div>
    <div class="bar w25 head"></div>
    <template v-for="n in 3" :key="n">
      <div class="bar w100"></div>
      <div class="bar w90 indent"></div>
      <div class="bar w85 indent"></div>
      <div class="bar w70 indent"></div>
    </template>
    <div class="bar w25 head"></div>
    <div class="bar w60"></div>
  </article>
</template>
