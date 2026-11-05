<template>
  <div class="restocking">
    <div class="page-header">
      <h2>{{ t('restocking.title') }}</h2>
      <p>{{ t('restocking.description') }}</p>
    </div>

    <div class="card">
      <div class="budget-row">
        <label class="budget-label" for="budget-slider">{{ t('restocking.budgetLabel') }}</label>
        <div class="budget-value">{{ money(budget) }}</div>
      </div>
      <input
        id="budget-slider"
        v-model.number="budget"
        class="budget-slider"
        type="range"
        min="0"
        max="50000"
        step="500"
      />
      <div class="budget-scale">
        <span>{{ money(0) }}</span>
        <span>{{ money(50000) }}</span>
      </div>
    </div>

    <div v-if="error" class="error">{{ error }}</div>

    <div class="card">
      <div class="card-header">
        <h3 class="card-title">{{ t('restocking.recommendations') }} ({{ items.length }})</h3>
        <button
          class="place-order-btn"
          type="button"
          :disabled="items.length === 0 || submitting || loading"
          @click="placeOrder"
        >
          {{ submitting ? t('restocking.submitting') : t('restocking.placeOrder') }}
        </button>
      </div>

      <div v-if="orderError" class="error">{{ orderError }}</div>
      <div v-if="orderResult" class="success-message">
        {{ t('restocking.orderSuccess', {
          id: orderResult.id,
          total: money(orderResult.total_value),
          date: formatDate(orderResult.expected_delivery)
        }) }}
      </div>

      <div v-if="loading && !loaded" class="loading">{{ t('common.loading') }}</div>
      <div v-else-if="items.length === 0 && loaded" class="empty-state">{{ t('restocking.empty') }}</div>
      <div v-else :class="['table-container', { stale: loading }]">
        <table>
          <thead>
            <tr>
              <th>{{ t('restocking.table.sku') }}</th>
              <th>{{ t('restocking.table.name') }}</th>
              <th>{{ t('restocking.table.trend') }}</th>
              <th class="num">{{ t('restocking.table.quantity') }}</th>
              <th class="num">{{ t('restocking.table.unitCost') }}</th>
              <th class="num">{{ t('restocking.table.lineTotal') }}</th>
              <th class="num">{{ t('restocking.table.leadTime') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item.sku">
              <td><strong>{{ item.sku }}</strong></td>
              <td>{{ translateProductName(item.name) }}</td>
              <td>
                <span :class="['badge', item.trend]">{{ trendLabel(item.trend) }}</span>
              </td>
              <td class="num">{{ item.quantity }} / {{ item.needed }}</td>
              <td class="num">{{ money(item.unit_cost, 2) }}</td>
              <td class="num"><strong>{{ money(item.line_total, 2) }}</strong></td>
              <td class="num">{{ t('restocking.days', { count: item.lead_time_days }) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="loaded" class="summary">
        <div class="summary-item">
          <span class="summary-label">{{ t('restocking.totalCost') }}</span>
          <span class="summary-value">{{ money(totalCost, 2) }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">{{ t('restocking.remaining') }}</span>
          <span class="summary-value">{{ money(remaining, 2) }}</span>
        </div>
      </div>
    </div>

    <p class="sample-note">{{ t('restocking.sampleNote') }}</p>
  </div>
</template>

<script>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { api } from '../api'
import { useI18n } from '../composables/useI18n'
import { formatCurrencyWithDecimals } from '../utils/currency'

export default {
  name: 'Restocking',
  setup() {
    const { t, currentLocale, currentCurrency, translateProductName } = useI18n()

    const budget = ref(5000)
    const items = ref([])
    const totalCost = ref(0)
    const remaining = ref(0)
    const loading = ref(false)
    const loaded = ref(false)
    const error = ref(null)

    const submitting = ref(false)
    const orderResult = ref(null)
    const orderError = ref(null)

    const money = (amount, decimals = 0) =>
      formatCurrencyWithDecimals(amount, currentCurrency.value, decimals)

    const trendLabel = (trend) => {
      const key = `trends.${trend}`
      const label = t(key)
      // t() returns the key itself when no translation exists; fall back to the raw value
      return label === key ? trend : label
    }

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return dateString
      return date.toLocaleDateString(currentLocale.value === 'ja' ? 'ja-JP' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    // Only the newest request may update state, so a slow earlier response
    // cannot overwrite the result of the current slider position.
    let requestId = 0
    const loadRecommendations = async () => {
      const myId = ++requestId
      loading.value = true
      error.value = null
      try {
        const data = await api.getRestockRecommendations(budget.value)
        if (myId !== requestId) return
        items.value = data.items
        totalCost.value = data.total_cost
        remaining.value = data.remaining
        loaded.value = true
      } catch (err) {
        if (myId !== requestId) return
        error.value = t('restocking.loadError')
        console.error('Load error:', err)
      } finally {
        if (myId === requestId) loading.value = false
      }
    }

    // Debounce slider dragging (~300 ms) before hitting the API
    let debounceTimer = null
    watch(budget, () => {
      orderResult.value = null
      orderError.value = null
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(loadRecommendations, 300)
    })

    const placeOrder = async () => {
      if (items.value.length === 0 || submitting.value) return
      submitting.value = true
      orderError.value = null
      orderResult.value = null
      try {
        // Only sku and quantity are sent; the server owns prices
        const payload = items.value.map(i => ({ sku: i.sku, quantity: i.quantity }))
        orderResult.value = await api.createRestockOrder(payload)
      } catch (err) {
        const detail = err.response && err.response.data && err.response.data.detail
        orderError.value = t('restocking.orderError') + (typeof detail === 'string' ? ': ' + detail : '')
        console.error('Order error:', err)
      } finally {
        submitting.value = false
      }
    }

    onMounted(loadRecommendations)
    onBeforeUnmount(() => clearTimeout(debounceTimer))

    return {
      t,
      budget,
      items,
      totalCost,
      remaining,
      loading,
      loaded,
      error,
      submitting,
      orderResult,
      orderError,
      money,
      trendLabel,
      formatDate,
      placeOrder,
      translateProductName
    }
  }
}
</script>

<style scoped>
.budget-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0.75rem;
}

.budget-label {
  color: var(--muted);
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.budget-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--ink);
  letter-spacing: -0.025em;
}

.budget-slider {
  width: 100%;
  accent-color: var(--accent-strong);
}

.budget-scale {
  display: flex;
  justify-content: space-between;
  color: var(--muted);
  font-size: 0.813rem;
  margin-top: 0.25rem;
}

.num {
  text-align: right;
  white-space: nowrap;
}

.stale {
  opacity: 0.6;
  transition: opacity 0.15s ease;
}

.place-order-btn {
  background: var(--ink);
  color: var(--on-accent);
  border: none;
  border-radius: 6px;
  padding: 0.625rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

.place-order-btn:hover:not(:disabled) {
  background: var(--ink-soft);
}

.place-order-btn:disabled {
  background: var(--line-strong);
  cursor: not-allowed;
}

.success-message {
  background: var(--success-tint-2);
  border: 1px solid var(--success-line);
  color: var(--success-ink);
  padding: 1rem;
  border-radius: 8px;
  margin: 0 0 1rem;
  font-size: 0.938rem;
}

.empty-state {
  text-align: center;
  padding: 2.5rem 1rem;
  color: var(--muted);
  font-size: 0.938rem;
}

.summary {
  display: flex;
  justify-content: flex-end;
  gap: 2rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--line);
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.summary-label {
  color: var(--muted);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.summary-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--ink);
}

.sample-note {
  color: var(--muted);
  font-size: 0.813rem;
}
</style>
