import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import Dashboard from './views/Dashboard.vue'
import Inventory from './views/Inventory.vue'
import Orders from './views/Orders.vue'
import Demand from './views/Demand.vue'
import Spending from './views/Spending.vue'
import Reports from './views/Reports.vue'
import Restocking from './views/Restocking.vue'
import Backlog from './views/Backlog.vue'
import './composables/useTheme'
import './themes.css'
import '@fontsource-variable/fraunces'
import '@fontsource-variable/instrument-sans'
import '@fontsource-variable/space-grotesk'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import '@fontsource/ibm-plex-mono/600.css'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Dashboard },
    { path: '/inventory', component: Inventory },
    { path: '/orders', component: Orders },
    { path: '/demand', component: Demand },
    { path: '/spending', component: Spending },
    { path: '/reports', component: Reports },
    { path: '/restocking', component: Restocking },
    // Reachable by URL only: Backlog.vue was never mounted before, and there is
    // deliberately no nav entry (the Dashboard already shows the same shortages)
    { path: '/backlog', component: Backlog },
    // Loaded on demand: the game engine and sprites are only needed on this page
    { path: '/game', component: () => import('./views/Game.vue') }
  ]
})

const app = createApp(App)
app.use(router)
app.mount('#app')
