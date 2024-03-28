<template>
  <div class="divide-y divide-slate-100">
    <header class="bg-white space-y-4 p-4 sm:px-8 sm:py-6 lg:p-4 xl:px-8 xl:py-6">
      <div class="flex items-center justify-between">
        <h2 class="font-semibold text-slate-900">Troughs</h2>
        <button @click="addTrough"
          class="hover:bg-blue-400 group flex items-center rounded-md bg-blue-500 text-white text-sm font-medium pl-2 pr-3 py-2 shadow-sm">
          <svg width="20" height="20" fill="currentColor" class="mr-2" aria-hidden="true">
            <path d="M10 5a1 1 0 0 1 1 1v3h3a1 1 0 1 1 0 2h-3v3a1 1 0 1 1-2 0v-3H6a1 1 0 1 1 0-2h3V6a1 1 0 0 1 1-1Z" />
          </svg>
          New
        </button>
      </div>
    </header>
    <List>
      <ListItem v-for="movie in movies" :key="movie.id" :movie="movie" />
    </List>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import List from './List.vue'
  import ListItem from './ListItem.vue'

  defineProps(['movies'])

  const addTrough = () => {
    movies.value.push({
      id: movies.value.length + 1,
      title: 'New Trough',
      description: 'This is a new trough',
      image: 'https://via.placeholder.com/150',
    })
  }
</script>