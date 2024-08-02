<template>
  <h2>Multipliers</h2>
  <div>
    <label>Maturation:</label> <input type="number" v-model="multipliers.maturation" /><br />
    <label>Consumption:</label> <input type="number" v-model="multipliers.consumption" />
  </div>

  <hr />

  <h2>Troughs</h2>
  <button @click="addTrough">Add Trough</button>
  <hr />
  <div v-for="trough in troughs" :key="trough.id">
    <h3>{{ trough.name }}</h3>
    <h4>Food <button @click="trough.addFood(data.food['Raw Meat'])">Add</button></h4>
    <table class="borders">
      <thead>
        <tr>
          <th id="t_{{trough.id}}_f1b">Food</th>
          <th id="t_{{trough.id}}_f1a">Stacks</th>
          <th id="t_{{trough.id}}_f1c">Spoil Time</th>
          <th id="t_{{trough.id}}_f1d">Stack Size</th>
        </tr>
      </thead>
      <tr v-for="entry in trough.foodStacks" :key="entry.food.name">
        <td>
            <select v-model="entry.food">
              <option v-for="food in Object.values(data.food)" :key="food.name" :value="food">{{ food.name }}</option>
            </select>
        </td>
        <td><input v-model="entry.stacks" type="number" min="0" /></td>
        <td>{{ entry.food.spoilTime?.toFormat('hh:mm:ss') }}</td>
        <td>{{ entry.food.stackSize }}</td>
      </tr>
    </table>
    <hr />
    <h4>Entries <button @click="trough.addCreature(Object.values(data.species))">Add</button></h4>
    <table class="borders">
      <thead>
        <tr>
          <th colspan="2"></th>
          <th id="t_{{trough.id}}_e1a" colspan="2">Age</th>
          <th id="t_{{trough.id}}_e1b" colspan="2">Time to</th>
          <th id="t_{{trough.id}}_e1c" colspan="2">Food to</th>
        </tr>
        <tr>
          <th id="t_{{trough.id}}_e2a">Count</th>
          <th id="t_{{trough.id}}_e2b">Species</th>
          <th id="t_{{trough.id}}_e2c">Checked</th>
          <th id="t_{{trough.id}}_e2d">Current</th>
          <th id="t_{{trough.id}}_e2e">Juvenile</th>
          <th id="t_{{trough.id}}_e2f">Adult</th>
          <th id="t_{{trough.id}}_e2g">Juvenile</th>
          <th id="t_{{trough.id}}_e2h">Adult</th>
        </tr>
      </thead>
      <tr v-for="entry in trough.entries" :key="entry.id">
        <td><input v-model="entry.count" type="number" min="0" /></td>
        <td>
            <select v-model="entry.species">
              <option v-for="species in Object.values(data.species)" :key="species.name" :value="species">{{ species.name }}</option>
            </select>
        </td>
        <td>
          <div class="tooltip"><input :value="entry.checkedAge * 100" @change="(event: any) => setAge(entry, event.target.value)" type="number" min="0" max="100" step="0.1" stop_clock="true"  />
            <span class="tooltiptext">{{ entry.checkTime.toRelative() }}</span>
          </div>
        </td>
        <td>{{ (Math.floor(entry.getAgeAtTime(now) * 10000) / 100).toFixed(2) }}%</td>
        <td>{{ entry.getTimeToJuvenile(now).toFormat('d.hh:mm:ss') }}</td>
        <td>{{ entry.getTimeToAdult(now).toFormat('d.hh:mm:ss') }}</td>
        <td>{{ getFoodToJuvenile(now, entry, trough).toFixed(0) }}</td>
        <td>{{ getFoodToAdult(now, entry, trough).toFixed(0) }}</td>
      </tr>
    </table>
    <hr />
  </div>
</template>

<style scoped>
.tooltip {
  position: relative;
  display: inline-block;
  border-bottom: 1px dotted var(--color-text);
}

.tooltip .tooltiptext {
  visibility: hidden;
  background-color: var(--color-background-mute);
  color: var(--color-text);
  border-radius: 6px;
  padding: 3px;

  /* Position the tooltip */
  position: fixed;
  left: calc(var(--mouse-x, 0) * 1px - 1em);
  top: calc(var(--mouse-y, 0) * 1px - 2.5em);

  z-index: 1;
}

.tooltip:hover .tooltiptext {
  visibility: visible;
}

.borders td, .borders th {
  border: 1px solid white;
}

.borders {
  border-collapse: collapse;
}
</style>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { DateTime } from 'luxon'
import Trough from './types/Trough'
import type Multipliers from './types/Multipliers'
import type TroughEntry from './types/TroughEntry'
import data from './ArkData.js'

const troughs = reactive([] as Trough[])
const now = ref(DateTime.now())

const multipliers = ref<Multipliers>({ maturation: 1, consumption: 1 })

function addTrough() {
  troughs.push(new Trough(troughs.length, `Trough ${troughs.length + 1}`, multipliers.value))
}

function setAge(entry: TroughEntry, value: string) {
  let agePct = Number.parseFloat(value) / 100;
  entry.checkedAge = agePct;
  entry.checkTime = DateTime.now();
}

function getFoodToJuvenile(fromTime: DateTime, entry: TroughEntry, trough: Trough)
{
  const nextFood = entry.getNextFood(fromTime, trough.foodStacks.map(x => x.food.name))
  const foodPoints = entry.getFoodToJuvenile(fromTime);
  return foodPoints / (nextFood?.pointsPerPiece || 0);
}

function getFoodToAdult(fromTime: DateTime, entry: TroughEntry, trough: Trough)
{
  const nextFood = entry.getNextFood(fromTime, trough.foodStacks.map(x => x.food.name))
  const foodPoints = entry.getFoodToAdult(fromTime);
  return foodPoints / (nextFood?.pointsPerPiece || 0);
}

addTrough()

setInterval(() => {
  try {
    if (document.activeElement?.getAttribute("type") === "number") {
      // if a number field is focused, don't process a clock tick
      return;
    }
    now.value = DateTime.now()
  }
  catch {
    // nothing to do here
  }
}, 1000);
</script>
