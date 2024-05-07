<script setup lang="ts">
import { ref } from 'vue'
import type { Ref } from 'vue'
import { DateTime } from 'luxon'
import { Trough, TroughEntry } from './types'
import type { Multipliers } from './types'
import type { DataTableCellEditCompleteEvent } from 'primevue/datatable'
import data from './arkData'

const troughs: Ref<Trough[]> = ref([] as Trough[])
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

  trough.entries.push(
    new TroughEntry(
      id,
      species,
      multipliers.value,
      Math.floor(Math.random() * 100),
      Math.random(),
      0,
      fourHoursAgo.plus({ hours: Math.random() })
    )
  )
}

function onCellEditComplete(event: DataTableCellEditCompleteEvent) {
  let { data, newValue, field } = event

  switch (field) {
    default:
      data[field] = newValue
      break
  }
}

addTrough()
</script>

<template>
  <Greet />

  <hr />

  <h2>Multipliers</h2>
  <div>
    <label>Maturation:</label> <input type="number" v-model="multipliers.maturation" /><br />
    <label>Consumption:</label> <input type="number" v-model="multipliers.consumption" />
  </div>

  <hr />

  <h2>Troughs</h2>
  <Button @click="addTrough">Add Trough</Button>
  <div v-for="trough in troughs" :key="trough.id">
    <h3>{{ trough.name }}</h3>
    <Button @click="addCreature(trough)">Add Entry</Button>
    <DataTable
      :value="trough.entries"
      tableStyle="min-width: 50rem"
      dataKey="id"
      editMode="cell"
      @cell-edit-complete="onCellEditComplete"
    >
      <ColumnGroup type="header">
        <Row>
          <Column header="" :colspan="2" />
          <Column header="Age" :colspan="2" />
          <Column header="Time to" :colspan="2" />
          <Column header="Food to" :colspan="2" />
        </Row>
        <Row>
          <Column sortable field="count" header="Count"></Column>
          <Column sortable field="species" header="Species"></Column>
          <Column sortable field="checkedAge" header="Checked"></Column>
          <Column sortable field="currentAge" header="Current"></Column>
          <Column sortable field="timeToJuvenile" header="Juvenile"></Column>
          <Column sortable field="timeToAdult" header="Adult"></Column>
          <Column sortable field="foodToJuveline" header="Juvenile"></Column>
          <Column sortable field="foodToAdult" header="Adult"></Column>
        </Row>
      </ColumnGroup>
      <Column field="count"></Column>
      <Column field="species">
        <template #body="slotProps">
          {{ slotProps.data.species.name }}
        </template>
        <template #editor="slotProps">
          <Dropdown
            v-model="slotProps.data.species"
            :options="Object.values(data.species)"
            optionLabel="name"
            placeholder="Select a species"
            class="w-full md:w-14rem"
          />
        </template>
      </Column>
      <Column field="checkedAge"></Column>
      <Column field="currentAge"></Column>
      <Column field="timeToJuvenile"></Column>
      <Column field="timeToAdult"></Column>
      <Column field="foodToJuveline"></Column>
      <Column field="foodToAdult"></Column>
    </DataTable>
    <hr />
  </div>
</template>
