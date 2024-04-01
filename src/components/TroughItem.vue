<template>
  <h1>{{ trough.name }}</h1>

  <div class="card">
    <button type="button" @click="doSomething">count is {{ trough.entries.length }}</button>
  </div>
</template>

<script setup lang="ts">
import Trough from '../types/Trough.ts'
import data from '../types/arkData.ts'

const props = defineProps<{ trough: Trough }>()

function doSomething() {
  props.trough.entries.push({
    Species: data.species[0],
    CheckedAge: 0.04,
    CheckTime: new Date(Date.now()),
    Count: 1,
    CurrentAge: 0.30
  })
}
</script>