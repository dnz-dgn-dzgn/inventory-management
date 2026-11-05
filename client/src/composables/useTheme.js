import { ref } from 'vue'

export const themes = [
  { id: 'default', labelKey: 'theme.default' },
  { id: 'atelier', labelKey: 'theme.atelier' },
  { id: 'signal', labelKey: 'theme.signal' }
]

const STORAGE_KEY = 'app-theme'
const isValid = (id) => themes.some((th) => th.id === id)

const apply = (id) => {
  if (typeof document === 'undefined') return
  // 'default' removes the attribute so the default look stays byte-identical
  if (id === 'default') {
    delete document.documentElement.dataset.theme
  } else {
    document.documentElement.dataset.theme = id
  }
}

const readSaved = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return isValid(saved) ? saved : 'default'
  } catch (e) {
    return 'default'
  }
}

const currentTheme = ref(readSaved())
// Apply at module load so there is no flash of the default theme
apply(currentTheme.value)

const setTheme = (id) => {
  if (!isValid(id)) return
  currentTheme.value = id
  apply(id)
  try {
    localStorage.setItem(STORAGE_KEY, id)
  } catch (e) {
    // storage unavailable: theme still applies for this session
  }
}

export function useTheme() {
  return { currentTheme, themes, setTheme }
}
