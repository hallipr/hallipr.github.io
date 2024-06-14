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
    <table>
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
    <table>
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
        <td>{{entry.count}}</td>
        <td>
            <select v-model="entry.species">
              <option v-for="species in Object.values(data.species)" :key="species.name" :value="species">{{ species.name }}</option>
            </select>
        </td>
        <td>
          <div class="tooltip">{{ entry.getCheckedAgePercent().toFixed(2) }}%
            <span class="tooltiptext">{{ entry.checkTime.toRelative() }}</span>
          </div>
        </td>
        <td>{{ entry.getAgePercentAtTime(now).toFixed(2) }}%</td>
        <td>{{ entry.getTimeToJuvenile(now).toFormat('d.hh.mm.ss') }}</td>
        <td>{{ entry.getTimeToAdult(now).toFormat('d.hh.mm.ss') }}</td>
        <td></td><!-- {{entry.foodToJuvenile}}</td> -->
        <td></td><!-- {{entry.foodToAdult}}</td> -->
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
</style>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { DateTime } from 'luxon'
import { Trough } from './types'
import type { Multipliers } from './types'
import data from './arkData'

const troughs = reactive([] as Trough[])
const now = ref(DateTime.now())

const multipliers = ref<Multipliers>({ maturation: 1, consumption: 1 })

function addTrough() {
  troughs.push(new Trough(troughs.length, `Trough ${troughs.length + 1}`, multipliers.value))
}

addTrough()

setInterval(() => {
  now.value = DateTime.now()
}, 1000);
</script>
