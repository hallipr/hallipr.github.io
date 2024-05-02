<template>
  <h2>Multipliers</h2>
  <div>
    <label>Maturation:</label> <input type="number" v-model="multipliers.maturation" /><br />
    <label>Consumption:</label> <input type="number" v-model="multipliers.consumption" />
  </div>

  <hr />

  <h2>Troughs</h2>
  <button @click="addTrough">Add Trough</button>
  <div v-for="trough in troughs" :key="trough.id">
    <h3>{{ trough.name }}</h3>
    <button @click="addCreature(trough)">Add Entry</button>
    <div v-for="entry in trough.entries" :key="entry.id">
      <span>
        {{ entry.count }}
        <select v-model="entry.species">
          <option disabled value="">Please Select</option>
          <option v-for="species in data.species" :value="species">{{ species.name }}</option>
        </select>
        - A: {{ round(entry.checkedAge, 2) }}@{{ entry.checkTime.toRelative() }}
        => {{ round(entry.getAgeAtTime(DateTime.now()), 2) }}
      </span>
    </div>
    <hr />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { DateTime } from 'luxon'
import { Trough, TroughEntry, Multipliers } from './types'
import data from './arkData.ts'
import { round } from './utils'


const troughs = ref<Trough[]>([])
const multipliers = ref<Multipliers>({ maturation: 1, consumption: 1 })

function addTrough() {
  troughs.value.push(new Trough(troughs.value.length, `Trough ${troughs.value.length + 1}`))
}

// function addFood(trough: Trough){
//   const id = trough.foodStacks.length

//   trough.food.push(new FoodEntry({ id, food:null, count: Math.floor(Math.random() * 100) }))
// }

function addCreature(trough: Trough) {
  let values = Object.values(data.species)
  const species = values[Math.floor(Math.random() * values.length)]
  const id = trough.entries.length

  const fourHoursAgo = DateTime.now().minus({ hours: 4 })

  trough.entries.push(new TroughEntry(
    id,
    species,
    multipliers.value,
    Math.floor(Math.random() * 100),
    Math.random(),
    0,
    fourHoursAgo.plus({ hours: Math.random() })))
}

addTrough()
</script>