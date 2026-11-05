<template>
  <div class="theme-switcher">
    <button
      class="theme-button"
      type="button"
      aria-haspopup="menu"
      :aria-label="t('theme.label')"
      :aria-expanded="isDropdownOpen ? 'true' : 'false'"
      @click="toggleDropdown"
      @keydown="handleKeydown"
      @blur="handleBlur"
    >
      <span
        class="theme-swatch"
        :style="{ background: swatches[currentTheme] }"
        aria-hidden="true"
      ></span>
      <span class="theme-label">{{ currentLabel }}</span>
      <svg
        class="chevron"
        :class="{ 'chevron-open': isDropdownOpen }"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
      >
        <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </button>

    <div v-if="isDropdownOpen" class="dropdown-menu" role="menu" :aria-label="t('theme.label')">
      <button
        v-for="(theme, index) in themes"
        :key="theme.id"
        type="button"
        class="dropdown-item"
        :class="{ active: currentTheme === theme.id, highlighted: highlightedIndex === index }"
        role="menuitemradio"
        :aria-checked="currentTheme === theme.id ? 'true' : 'false'"
        @mousedown.prevent
        @click="selectTheme(theme.id)"
      >
        <span
          class="theme-swatch"
          :style="{ background: swatches[theme.id] }"
          aria-hidden="true"
        ></span>
        <span class="theme-name">{{ t(theme.labelKey) }}</span>
        <svg
          v-if="currentTheme === theme.id"
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          class="check-icon"
        >
          <path d="M4 9L7.5 12.5L14 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useI18n } from '../composables/useI18n'
import { useTheme } from '../composables/useTheme'

export default {
  name: 'ThemeSwitcher',
  setup() {
    const { t } = useI18n()
    const { currentTheme, themes, setTheme } = useTheme()

    const isDropdownOpen = ref(false)
    const highlightedIndex = ref(0)

    // Swatch colours are the only hard-coded colours; they preview each theme
    const swatches = {
      default: '#3b82f6',
      atelier: '#e8431a',
      signal: '#c6ff3d'
    }

    const currentLabel = computed(() => {
      const theme = themes.find((th) => th.id === currentTheme.value)
      return theme ? t(theme.labelKey) : ''
    })

    const openDropdown = () => {
      const idx = themes.findIndex((th) => th.id === currentTheme.value)
      highlightedIndex.value = idx >= 0 ? idx : 0
      isDropdownOpen.value = true
    }

    const toggleDropdown = () => {
      if (isDropdownOpen.value) {
        isDropdownOpen.value = false
      } else {
        openDropdown()
      }
    }

    const handleBlur = () => {
      // Delay so a click on a menu item registers before the menu closes
      setTimeout(() => {
        isDropdownOpen.value = false
      }, 200)
    }

    const selectTheme = (id) => {
      setTheme(id)
      isDropdownOpen.value = false
    }

    const handleKeydown = (event) => {
      const count = themes.length
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          if (!isDropdownOpen.value) openDropdown()
          else highlightedIndex.value = (highlightedIndex.value + 1) % count
          break
        case 'ArrowUp':
          event.preventDefault()
          if (!isDropdownOpen.value) openDropdown()
          else highlightedIndex.value = (highlightedIndex.value - 1 + count) % count
          break
        case 'Enter':
        case ' ':
          // Handled here (not via native click) so the highlighted item is chosen
          event.preventDefault()
          if (isDropdownOpen.value) selectTheme(themes[highlightedIndex.value].id)
          else openDropdown()
          break
        case 'Escape':
          if (isDropdownOpen.value) {
            event.preventDefault()
            isDropdownOpen.value = false
          }
          break
      }
    }

    return {
      t,
      themes,
      currentTheme,
      currentLabel,
      swatches,
      isDropdownOpen,
      highlightedIndex,
      toggleDropdown,
      handleBlur,
      handleKeydown,
      selectTheme
    }
  }
}
</script>

<style scoped>
.theme-switcher {
  position: relative;
  margin-right: 1rem;
}

.theme-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  font-size: 0.875rem;
  color: var(--ink-2);
}

.theme-button:hover {
  background: var(--surface-subtle);
  border-color: var(--line-strong);
}

.theme-swatch {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 2px;
  flex-shrink: 0;
}

.theme-label {
  font-weight: 500;
}

.chevron {
  color: var(--muted);
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.chevron-open {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  min-width: 160px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 10px;
  box-shadow: 0 10px 25px var(--shadow-color-lg);
  z-index: 1000;
  overflow: hidden;
}

.dropdown-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s ease;
  font-family: inherit;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--ink-2);
}

.dropdown-item:hover,
.dropdown-item.highlighted {
  background: var(--surface-subtle);
}

.dropdown-item.active {
  background: var(--accent-tint);
  color: var(--accent-strong);
}

.theme-name {
  flex: 1;
}

.check-icon {
  color: var(--accent-strong);
  flex-shrink: 0;
}
</style>
