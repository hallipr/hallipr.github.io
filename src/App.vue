<template>
  <h1>Multipliers</h1>
  <div>
    <label>Maturation: <input type="number" v-model="multipliers.maturation" /></label>
    <label>Consumption: <input type="number" v-model="multipliers.consumption" /></label>
  </div>

  <hr />

  <button @click="addTrough">Add Trough</button>
  <div v-for="trough in troughs" :key="trough.id">
    <div>
      <span>{{ trough.name }}</span> - <button @click="addCreature(trough)">Add Entry</button>
    </div>
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
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { DateTime } from 'luxon'
import * as Neutralino from "@neutralinojs/lib"
import { Trough, TroughEntry, Multipliers } from './types'
import data from './arkData.ts'
import { round } from './utils'


const troughs = ref<Trough[]>([])
const multipliers = ref<Multipliers>({ maturation: 1, consumption: 1 })

function addTrough() {
  Neutralino.filesystem.writeFile('troughs.json', JSON.stringify(troughs.value))
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