<script setup lang="ts">
import { ref } from 'vue';
import TroughItem from './components/TroughItem.vue'
import Trough from './types/Trough.ts'

const trough = ref(new Trough({ name: "Trough 1" }));
</script>

<template>
  <TroughItem :trough="trough" />
</template>
