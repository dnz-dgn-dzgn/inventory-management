<template>
  <div class="app">
    <header class="top-nav">
      <div class="nav-container">
        <div class="logo">
          <h1>{{ t('nav.companyName') }}</h1>
          <span class="subtitle">{{ t('nav.subtitle') }}</span>
        </div>
        <button
          type="button"
          class="menu-toggle"
          :aria-expanded="menuOpen ? 'true' : 'false'"
          aria-controls="main-nav"
          :aria-label="menuOpen ? t('nav.menuClose') : t('nav.menu')"
          @click="menuOpen = !menuOpen"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path v-if="!menuOpen" d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path v-else d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <span class="menu-toggle-label">{{ t('nav.menu') }}</span>
        </button>
        <nav id="main-nav" class="nav-tabs" :class="{ open: menuOpen }">
          <router-link to="/" :class="{ active: $route.path === '/' }">
            {{ t('nav.overview') }}
          </router-link>
          <router-link to="/inventory" :class="{ active: $route.path === '/inventory' }">
            {{ t('nav.inventory') }}
          </router-link>
          <router-link to="/orders" :class="{ active: $route.path === '/orders' }">
            {{ t('nav.orders') }}
          </router-link>
          <router-link to="/spending" :class="{ active: $route.path === '/spending' }">
            {{ t('nav.finance') }}
          </router-link>
          <router-link to="/demand" :class="{ active: $route.path === '/demand' }">
            {{ t('nav.demandForecast') }}
          </router-link>
          <router-link to="/restocking" :class="{ active: $route.path === '/restocking' }">
            {{ t('nav.restocking') }}
          </router-link>
          <router-link to="/reports" :class="{ active: $route.path === '/reports' }">
            {{ t('nav.reports') }}
          </router-link>
          <router-link to="/game" :class="{ active: $route.path === '/game' }">
            {{ t('nav.game') }}
          </router-link>
        </nav>
        <LanguageSwitcher />
        <ThemeSwitcher />
        <ProfileMenu
          @show-profile-details="showProfileDetails = true"
          @show-tasks="showTasks = true"
        />
      </div>
    </header>
    <FilterBar />
    <main class="main-content">
      <router-view />
    </main>

    <ProfileDetailsModal
      :is-open="showProfileDetails"
      @close="showProfileDetails = false"
    />

    <TasksModal
      :is-open="showTasks"
      :tasks="tasks"
      @close="showTasks = false"
      @add-task="addTask"
      @delete-task="deleteTask"
      @toggle-task="toggleTask"
    />
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { api } from './api'
import { useAuth } from './composables/useAuth'
import { useI18n } from './composables/useI18n'
import FilterBar from './components/FilterBar.vue'
import ProfileMenu from './components/ProfileMenu.vue'
import ProfileDetailsModal from './components/ProfileDetailsModal.vue'
import TasksModal from './components/TasksModal.vue'
import LanguageSwitcher from './components/LanguageSwitcher.vue'
import ThemeSwitcher from './components/ThemeSwitcher.vue'

export default {
  name: 'App',
  components: {
    FilterBar,
    ProfileMenu,
    ProfileDetailsModal,
    TasksModal,
    LanguageSwitcher,
    ThemeSwitcher
  },
  setup() {
    const { currentUser } = useAuth()
    const { t } = useI18n()
    const route = useRoute()

    // Small screens: the eight tabs live behind a menu button. The menu closes
    // on every navigation, on Escape and when the window grows back to desktop
    // width, so it can never stay open (and covering the page) by accident.
    const menuOpen = ref(false)
    watch(() => route.path, () => { menuOpen.value = false })
    const closeMenuOnEscape = (event) => {
      if (event.key === 'Escape') menuOpen.value = false
    }
    const closeMenuOnWide = () => {
      if (window.innerWidth > 768) menuOpen.value = false
    }
    onMounted(() => {
      window.addEventListener('keydown', closeMenuOnEscape)
      window.addEventListener('resize', closeMenuOnWide)
    })
    onBeforeUnmount(() => {
      window.removeEventListener('keydown', closeMenuOnEscape)
      window.removeEventListener('resize', closeMenuOnWide)
    })
    const showProfileDetails = ref(false)
    const showTasks = ref(false)
    const apiTasks = ref([])

    // Merge mock tasks from currentUser with API tasks
    const tasks = computed(() => {
      return [...currentUser.value.tasks, ...apiTasks.value]
    })

    const loadTasks = async () => {
      try {
        apiTasks.value = await api.getTasks()
      } catch (err) {
        console.error('Failed to load tasks:', err)
      }
    }

    const addTask = async (taskData) => {
      try {
        const newTask = await api.createTask(taskData)
        // Add new task to the beginning of the array
        apiTasks.value.unshift(newTask)
      } catch (err) {
        console.error('Failed to add task:', err)
      }
    }

    const deleteTask = async (taskId) => {
      try {
        // Check if it's a mock task (from currentUser)
        const isMockTask = currentUser.value.tasks.some(t => t.id === taskId)

        if (isMockTask) {
          // Remove from mock tasks
          const index = currentUser.value.tasks.findIndex(t => t.id === taskId)
          if (index !== -1) {
            currentUser.value.tasks.splice(index, 1)
          }
        } else {
          // Remove from API tasks
          await api.deleteTask(taskId)
          apiTasks.value = apiTasks.value.filter(t => t.id !== taskId)
        }
      } catch (err) {
        console.error('Failed to delete task:', err)
      }
    }

    const toggleTask = async (taskId) => {
      try {
        // Check if it's a mock task (from currentUser)
        const mockTask = currentUser.value.tasks.find(t => t.id === taskId)

        if (mockTask) {
          // Toggle mock task status
          mockTask.status = mockTask.status === 'pending' ? 'completed' : 'pending'
        } else {
          // Toggle API task
          const updatedTask = await api.toggleTask(taskId)
          const index = apiTasks.value.findIndex(t => t.id === taskId)
          if (index !== -1) {
            apiTasks.value[index] = updatedTask
          }
        }
      } catch (err) {
        console.error('Failed to toggle task:', err)
      }
    }

    onMounted(loadTasks)

    // The filter bar sticks right below the header. The header height is not
    // fixed: below 1500px the tabs wrap onto a second row and every theme sizes
    // the header differently. Publish the real height as --header-height so the
    // filter bar never slides under it.
    let headerObserver = null
    onMounted(() => {
      const header = document.querySelector('.top-nav')
      if (!header) return
      const publish = () => {
        document.documentElement.style.setProperty('--header-height', header.offsetHeight + 'px')
      }
      publish()
      if (typeof ResizeObserver !== 'undefined') {
        headerObserver = new ResizeObserver(publish)
        headerObserver.observe(header)
      }
    })
    onBeforeUnmount(() => {
      if (headerObserver) headerObserver.disconnect()
    })

    return {
      t,
      menuOpen,
      showProfileDetails,
      showTasks,
      tasks,
      addTask,
      deleteTask,
      toggleTask
    }
  }
}
</script>

<style>
/* Design tokens: colours are role-based variables (not value-based).
   Visual themes override these variables via [data-theme="..."] selectors. */
:root {
  --success-ink-2: #166534;
  --ink-2: #334155;
  --ink-3: #475569;
  --ink: #0f172a;
  --ink-soft: #1e293b;
  --muted: #64748b;
  --muted-2: #94a3b8;
  --line: #e2e8f0;
  --line-strong: #cbd5e1;
  --surface-sunken: #f1f5f9;
  --surface-subtle: #f8fafc;
  --surface: #ffffff;
  --on-accent: #ffffff;
  --accent: #3b82f6;
  --accent-strong: #2563eb;
  --accent-ink: #1e40af;
  --accent-tint: #eff6ff;
  --accent-tint-2: #dbeafe;
  --accent-light: #60a5fa;
  --accent-line-2: #93c5fd;
  --accent-line: #bfdbfe;
  --danger: #ef4444;
  --danger-strong: #dc2626;
  --danger-ink: #991b1b;
  --danger-tint: #fef2f2;
  --danger-tint-2: #fee2e2;
  --danger-line: #fecaca;
  --success: #10b981;
  --success-strong: #059669;
  --success-ink: #065f46;
  --success-tint: #d1fae5;
  --success-tint-2: #ecfdf5;
  --success-tint-3: #f0fdf4;
  --success-line: #a7f3d0;
  --success-tint-4: #dcfce7;
  --success-line-2: #86efac;
  --success-strong-2: #16a34a;
  --warning: #f59e0b;
  --warning-strong: #d97706;
  --warning-ink: #92400e;
  --warning-tint: #fffbeb;
  --warning-tint-2: #fef3c7;
  --warning-line: #fed7aa;
  --warning-line-2: #fcd34d;
  --orange-strong: #ea580c;
  --violet: #8b5cf6;
  --violet-tint: #f5f3ff;
  --violet-line: #c4b5fd;
  --brand-from: #667eea;
  --brand-to: #764ba2;
  --indigo-ink: #3730a3;
  --indigo-tint: #e0e7ff;
  --shadow-color-xs: rgba(0, 0, 0, 0.05);
  --shadow-color-sm: rgba(0, 0, 0, 0.06);
  --shadow-color-md: rgba(0, 0, 0, 0.08);
  --shadow-color-lg: rgba(0, 0, 0, 0.1);
  --shadow-color-xl: rgba(0, 0, 0, 0.15);
  --shadow-color-2xl: rgba(0, 0, 0, 0.3);
  --overlay: rgba(0, 0, 0, 0.5);
  --muted-alpha: rgba(100, 116, 139, 0.3);
  --accent-strong-ring: rgba(37, 99, 235, 0.2);
  --accent-ring-soft: rgba(59, 130, 246, 0.1);
  --accent-ring: rgba(59, 130, 246, 0.3);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: var(--surface-subtle);
  color: var(--ink-soft);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.top-nav {
  background: var(--surface);
  border-bottom: 1px solid var(--line);
  box-shadow: 0 1px 3px 0 var(--shadow-color-xs);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1600px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  padding: 0 2rem;
  height: 70px;
}

.nav-container > .nav-tabs {
  margin-left: auto;
  margin-right: 1rem;
}

.nav-container > .language-switcher {
  margin-right: 1rem;
}

.logo {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
}

.logo h1 {
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--ink);
  letter-spacing: -0.025em;
}

.subtitle {
  font-size: 0.813rem;
  color: var(--muted);
  font-weight: 400;
  padding-left: 0.75rem;
  border-left: 1px solid var(--line);
}

.nav-tabs {
  display: flex;
  gap: 0.25rem;
}

/* The header is a single non-wrapping row of eight tabs plus three switchers.
   Below 1500px it no longer fits and pushed the profile menu off screen, so the
   page scrolled sideways. The row may now wrap: the logo and the switchers stay
   on the first line, the tabs drop to a second full-width line. */
@media (max-width: 1500px) {
  .nav-container {
    padding: 0.5rem 1rem;
    height: auto;
    min-height: 70px;
    flex-wrap: wrap;
    row-gap: 0.25rem;
  }
  .nav-container > .nav-tabs {
    order: 5;
    flex: 1 0 100%;
    margin: 0;
  }
  .nav-container > .language-switcher {
    margin-left: auto;
    margin-right: 0.5rem;
  }
  .nav-tabs a {
    white-space: nowrap;
  }
}

/* The menu button only exists on small screens */
.menu-toggle {
  display: none;
}

/* Phones and small tablets: logo and switchers on top, the eight tabs behind a
   menu button that opens them as a vertical list. */
@media (max-width: 768px) {
  .nav-container {
    padding: 0.5rem 0.75rem;
    column-gap: 0.5rem;
  }
  .logo {
    flex: 1 1 auto;
    min-width: 0;
  }
  .logo h1 {
    font-size: 1.125rem;
    line-height: 1.2;
  }
  /* The tagline would wrap to three lines; the product name is enough here */
  .logo .subtitle {
    display: none;
  }
  .nav-container > .language-switcher,
  .nav-container > .theme-switcher {
    margin: 0;
  }
  .menu-toggle {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    order: 3;
    padding: 0.5rem 0.75rem;
    min-height: 44px;
    border: 1px solid var(--line);
    border-radius: 6px;
    background: var(--surface);
    color: var(--ink);
    font: inherit;
    font-weight: 500;
    cursor: pointer;
  }
  .menu-toggle:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
  /* Closed by default; shown as a full-width vertical list when opened */
  .nav-container > .nav-tabs {
    display: none;
    order: 10;
    flex: 1 0 100%;
    flex-direction: column;
    gap: 0;
    padding: 0.25rem 0 0.5rem;
    border-top: 1px solid var(--line);
  }
  .nav-container > .nav-tabs.open {
    display: flex;
  }
  .nav-tabs a {
    padding: 0.875rem 0.5rem;
    min-height: 44px;
    font-size: 1rem;
    border-radius: 0;
  }
  .nav-tabs a.active::after {
    display: none;
  }
  .nav-tabs a.active {
    box-shadow: inset 3px 0 0 var(--accent);
  }
  .main-content {
    padding: 1rem 0.75rem;
  }
}

.nav-tabs a {
  padding: 0.625rem 1.25rem;
  color: var(--muted);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.938rem;
  border-radius: 6px;
  transition: all 0.2s ease;
  position: relative;
}

.nav-tabs a:hover {
  color: var(--ink);
  background: var(--surface-sunken);
}

.nav-tabs a.active {
  color: var(--accent-strong);
  background: var(--accent-tint);
}

.nav-tabs a.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--accent-strong);
}

.main-content {
  flex: 1;
  max-width: 1600px;
  width: 100%;
  margin: 0 auto;
  padding: 1.5rem 2rem;
}

.page-header {
  margin-bottom: 1.5rem;
}

.page-header h2 {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--ink);
  margin-bottom: 0.375rem;
  letter-spacing: -0.025em;
}

.page-header p {
  color: var(--muted);
  font-size: 0.938rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: var(--surface);
  padding: 1.25rem;
  border-radius: 10px;
  border: 1px solid var(--line);
  transition: all 0.2s ease;
}

.stat-card:hover {
  border-color: var(--line-strong);
  box-shadow: 0 4px 12px var(--shadow-color-sm);
}

.stat-label {
  color: var(--muted);
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.625rem;
}

.stat-value {
  font-size: 2.25rem;
  font-weight: 700;
  color: var(--ink);
  letter-spacing: -0.025em;
}

.stat-card.warning .stat-value {
  color: var(--orange-strong);
}

.stat-card.success .stat-value {
  color: var(--success-strong);
}

.stat-card.danger .stat-value {
  color: var(--danger-strong);
}

.stat-card.info .stat-value {
  color: var(--accent-strong);
}

.card {
  background: var(--surface);
  border-radius: 10px;
  padding: 1.25rem;
  border: 1px solid var(--line);
  margin-bottom: 1.25rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.875rem;
  border-bottom: 1px solid var(--line);
}

.card-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--ink);
  letter-spacing: -0.025em;
}

.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: var(--surface-subtle);
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
}

th {
  text-align: left;
  padding: 0.5rem 0.75rem;
  font-weight: 600;
  color: var(--ink-3);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

td {
  padding: 0.5rem 0.75rem;
  border-top: 1px solid var(--surface-sunken);
  color: var(--ink-2);
  font-size: 0.875rem;
}

tbody tr {
  transition: background-color 0.15s ease;
}

tbody tr:hover {
  background: var(--surface-subtle);
}

.badge {
  display: inline-block;
  padding: 0.313rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.badge.success {
  background: var(--success-tint);
  color: var(--success-ink);
}

.badge.warning {
  background: var(--warning-line);
  color: var(--warning-ink);
}

.badge.danger {
  background: var(--danger-line);
  color: var(--danger-ink);
}

.badge.info {
  background: var(--accent-tint-2);
  color: var(--accent-ink);
}

.badge.increasing {
  background: var(--success-tint);
  color: var(--success-ink);
}

.badge.decreasing {
  background: var(--danger-line);
  color: var(--danger-ink);
}

.badge.stable {
  background: var(--indigo-tint);
  color: var(--indigo-ink);
}

.badge.high {
  background: var(--danger-line);
  color: var(--danger-ink);
}

.badge.medium {
  background: var(--warning-line);
  color: var(--warning-ink);
}

.badge.low {
  background: var(--accent-tint-2);
  color: var(--accent-ink);
}

.loading {
  text-align: center;
  padding: 3rem;
  color: var(--muted);
  font-size: 0.938rem;
}

.error {
  background: var(--danger-tint);
  border: 1px solid var(--danger-line);
  color: var(--danger-ink);
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  font-size: 0.938rem;
}
</style>
