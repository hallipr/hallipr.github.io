<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{ msg: string }>()

const count = ref(0)

function doSomething() {
  console.log(props)
}
</script>

<template>
  <h1>{{ msg }}</h1>

  <div class="card">
    <button type="button" @click="count++">count is {{ count }}</button>
  </div>

  <p class="read-the-docs">Click on the Vite and Vue logos to learn more</p>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
