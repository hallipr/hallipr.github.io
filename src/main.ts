/* eslint-disable vue/no-reserved-component-names */
/* eslint-disable vue/multi-word-component-names */
import { createApp } from 'vue'
import App from './App.vue'

import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown'
import Toast from 'primevue/toast'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ColumnGroup from 'primevue/columngroup'
import Row from 'primevue/row'

import './assets/main.css'
import 'primevue/resources/themes/saga-blue/theme.css'
import 'primevue/resources/primevue.min.css'
import 'primeicons/primeicons.css'

const app = createApp(App)
app.use(PrimeVue)
app.use(ToastService)

app.component('Dropdown', Dropdown)
app.component('Button', Button)
app.component('Toast', Toast)

app.component('DataTable', DataTable)
app.component('ColumnGroup', ColumnGroup)
app.component('Column', Column)
app.component('Row', Row)

app.mount('#app')
