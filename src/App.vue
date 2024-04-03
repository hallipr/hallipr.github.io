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
    <div v-for="entry in trough.creatures" :key="entry.id">
      <span>
        {{ entry.count }}
        <select v-model="entry.species">
          <option disabled value="">Please Select</option>
          <option v-for="species in data.species" :value="species">{{ species.name }}</option>
        </select>
        - A: {{ round(entry.checkedAge, 2) }}@{{ entry.checkTime.toRelative() }}
        => {{ round(entry.getCurrentAge(multipliers), 2) }}
      </span>
    </div>
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
  troughs.value.push(new Trough({ id: troughs.value.length, name: `Trough ${troughs.value.length + 1}` }))
}

// function addFood(trough: Trough){
//   const id = trough.foodStacks.length

//   trough.food.push(new FoodEntry({ id, food:null, count: Math.floor(Math.random() * 100) }))
// }

function addCreature(trough: Trough) {
  const species = data.species[Math.floor(Math.random() * data.species.length)]
  const id = trough.creatures.length

  const fourHoursAgo = DateTime.now().minus({ hours: 4 })

  trough.creatures.push(new TroughEntry({ 
    id, 
    species, 
    count: Math.floor(Math.random() * 100),
    checkedAge: Math.random(),
    checkTime: fourHoursAgo.plus({ hours: Math.random() }) }))
}

addTrough()
</script>./types/Types.ts./arkData.ts./Types.ts./Utils.ts