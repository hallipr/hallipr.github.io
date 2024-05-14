/* eslint-disable vue/no-reserved-component-names */
/* eslint-disable vue/multi-word-component-names */
import { createApp } from 'vue'
import App from './App.vue'

import './assets/main.css'

const app = createApp(App)
app.mount('#app')

const root = document.documentElement;
 
document.addEventListener('mousemove', evt => {
    const x = evt.clientX;
    const y = evt.clientY;
 
    root.style.setProperty('--mouse-x', x.toString());
    root.style.setProperty('--mouse-y', y.toString());
});