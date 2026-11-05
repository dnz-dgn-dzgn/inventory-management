<template>
  <div class="reports">
    <div class="page-header">
      <h2>{{ t('reports.title') }}</h2>
      <p>{{ t('reports.description') }}</p>
    </div>

    <div v-if="loading" class="loading">{{ t('reports.loading') }}</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <!-- Filters can legitimately produce no rows (backend returns []) -->
    <div v-else-if="!hasData" class="card">
      <div class="empty-state">{{ t('reports.empty') }}</div>
    </div>
    <div v-else>
      <!-- Quarterly Performance -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">{{ t('reports.quarterly.title') }}</h3>
        </div>
        <div v-if="quarterlyData.length === 0" class="empty-state">{{ t('reports.empty') }}</div>
        <div v-else class="table-container">
          <table class="reports-table">
            <thead>
              <tr>
                <th>{{ t('reports.quarterly.quarter') }}</th>
                <th>{{ t('reports.quarterly.totalOrders') }}</th>
                <th>{{ t('reports.quarterly.totalRevenue') }}</th>
                <th>{{ t('reports.quarterly.avgOrderValue') }}</th>
                <th>{{ t('reports.quarterly.fulfillmentRate') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="q in quarterlyData" :key="q.quarter">
                <td><strong>{{ q.quarter }}</strong></td>
                <td>{{ q.total_orders }}</td>
                <td>{{ formatAmount(q.total_revenue) }}</td>
                <td>{{ formatAmount(q.avg_order_value) }}</td>
                <td>
                  <span :class="getFulfillmentClass(q.fulfillment_rate)">
                    {{ q.fulfillment_rate }}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Monthly Trends Chart -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">{{ t('reports.trend.title') }}</h3>
        </div>
        <div v-if="monthlyData.length === 0" class="empty-state">{{ t('reports.empty') }}</div>
        <div v-else class="chart-container">
          <div class="bar-chart">
            <div v-for="month in monthlyData" :key="month.month" class="bar-wrapper">
              <div class="bar-container">
                <div
                  class="bar"
                  :style="{ height: getBarHeight(month.revenue) + 'px' }"
                  :title="formatAmount(month.revenue)"
                ></div>
              </div>
              <div class="bar-label">{{ formatMonth(month.month) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Month-over-Month Comparison -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">{{ t('reports.mom.title') }}</h3>
        </div>
        <div v-if="monthlyRows.length === 0" class="empty-state">{{ t('reports.empty') }}</div>
        <div v-else class="table-container">
          <table class="reports-table">
            <thead>
              <tr>
                <th>{{ t('reports.mom.month') }}</th>
                <th>{{ t('reports.mom.orders') }}</th>
                <th>{{ t('reports.mom.revenue') }}</th>
                <th>{{ t('reports.mom.change') }}</th>
                <th>{{ t('reports.mom.growthRate') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in monthlyRows" :key="row.month">
                <td><strong>{{ formatMonth(row.month) }}</strong></td>
                <td>{{ row.order_count }}</td>
                <td>{{ formatAmount(row.revenue) }}</td>
                <td>
                  <span v-if="row.hasPrevious" :class="getChangeClass(row.revenue, row.previousRevenue)">
                    {{ getChangeValue(row.revenue, row.previousRevenue) }}
                  </span>
                  <span v-else>-</span>
                </td>
                <td>
                  <span v-if="row.hasPrevious" :class="getChangeClass(row.revenue, row.previousRevenue)">
                    {{ getGrowthRate(row.revenue, row.previousRevenue) }}
                  </span>
                  <span v-else>-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Summary Stats -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">{{ t('reports.stats.totalRevenue') }}</div>
          <div class="stat-value">{{ formatAmount(totalRevenue) }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">{{ t('reports.stats.avgMonthlyRevenue') }}</div>
          <div class="stat-value">{{ formatAmount(avgMonthlyRevenue) }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">{{ t('reports.stats.totalOrders') }}</div>
          <div class="stat-value">{{ totalOrders }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">{{ t('reports.stats.bestQuarter') }}</div>
          <div class="stat-value">{{ bestQuarter || '-' }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'
import { api } from '../api'
import { useFilters } from '../composables/useFilters'
import { useI18n } from '../composables/useI18n'
import { formatCurrencyWithDecimals } from '../utils/currency'

export default {
  name: 'Reports',
  setup() {
    const { t, currentLocale, currentCurrency } = useI18n()

    const loading = ref(true)
    const error = ref(null)
    const quarterlyData = ref([])
    const monthlyData = ref([])

    // Use shared filters (global filter bar)
    const {
      selectedPeriod,
      selectedLocation,
      selectedCategory,
      selectedStatus,
      getCurrentFilters
    } = useFilters()

    const loadData = async () => {
      try {
        loading.value = true
        error.value = null
        const filters = getCurrentFilters()
        const [quarterly, monthly] = await Promise.all([
          api.getQuarterlyReports(filters),
          api.getMonthlyTrends(filters)
        ])
        quarterlyData.value = Array.isArray(quarterly) ? quarterly : []
        monthlyData.value = Array.isArray(monthly) ? monthly : []
      } catch (err) {
        error.value = t('reports.loadError') + ': ' + err.message
        console.error('Failed to load reports:', err)
      } finally {
        loading.value = false
      }
    }

    // Watch for filter changes and reload data
    watch([selectedPeriod, selectedLocation, selectedCategory, selectedStatus], () => {
      loadData()
    })

    onMounted(() => {
      loadData()
    })

    // Coerce missing/invalid numbers to 0 so sums never become NaN
    const toNumber = (value) => {
      const n = Number(value)
      return Number.isFinite(n) ? n : 0
    }

    const hasData = computed(() => quarterlyData.value.length > 0 || monthlyData.value.length > 0)

    // Summary stats (derived, cached)
    const totalRevenue = computed(() =>
      monthlyData.value.reduce((sum, m) => sum + toNumber(m.revenue), 0)
    )

    const avgMonthlyRevenue = computed(() =>
      monthlyData.value.length > 0 ? totalRevenue.value / monthlyData.value.length : 0
    )

    const totalOrders = computed(() =>
      monthlyData.value.reduce((sum, m) => sum + toNumber(m.order_count), 0)
    )

    // Quarter with the highest revenue; '' when there is no quarter with revenue
    const bestQuarter = computed(() => {
      const best = quarterlyData.value.reduce(
        (acc, q) => (toNumber(q.total_revenue) > acc.revenue
          ? { revenue: toNumber(q.total_revenue), quarter: q.quarter }
          : acc),
        { revenue: 0, quarter: '' }
      )
      return best.quarter
    })

    // Max revenue computed once instead of for every bar
    const maxRevenue = computed(() =>
      monthlyData.value.reduce((max, m) => Math.max(max, toNumber(m.revenue)), 0)
    )

    // Monthly rows with their predecessor attached (replaces monthlyData[index - 1] in the template)
    const monthlyRows = computed(() =>
      monthlyData.value.map((m, i) => ({
        ...m,
        hasPrevious: i > 0,
        previousRevenue: i > 0 ? monthlyData.value[i - 1].revenue : 0
      }))
    )

    const formatAmount = (amount) => {
      return formatCurrencyWithDecimals(toNumber(amount), currentCurrency.value, 2)
    }

    // Converts 'YYYY-MM' to a localized 'Mon YYYY'; returns '-' for invalid input
    const formatMonth = (monthStr) => {
      if (typeof monthStr !== 'string' || !/^\d{4}-(0[1-9]|1[0-2])$/.test(monthStr)) {
        return '-'
      }
      const [year, month] = monthStr.split('-').map(Number)
      const date = new Date(year, month - 1, 1)
      if (isNaN(date.getTime())) return '-'
      const locale = currentLocale.value === 'ja' ? 'ja-JP' : 'en-US'
      return date.toLocaleDateString(locale, { year: 'numeric', month: 'short' })
    }

    // Bar height in px (max 200px), relative to the highest month
    const getBarHeight = (revenue) => {
      if (maxRevenue.value === 0) return 0
      return (toNumber(revenue) / maxRevenue.value) * 200
    }

    const getFulfillmentClass = (rate) => {
      if (rate >= 90) return 'badge success'
      if (rate >= 75) return 'badge warning'
      return 'badge danger'
    }

    // Signed currency difference: keeps the +/- prefix in front of the currency symbol
    const getChangeValue = (current, previous) => {
      const change = toNumber(current) - toNumber(previous)
      if (change > 0) return '+' + formatAmount(change)
      if (change < 0) return '-' + formatAmount(Math.abs(change))
      return formatAmount(0)
    }

    const getChangeClass = (current, previous) => {
      const change = toNumber(current) - toNumber(previous)
      if (change > 0) return 'positive-change'
      if (change < 0) return 'negative-change'
      return ''
    }

    const getGrowthRate = (current, previous) => {
      const cur = Number(current)
      const prev = Number(previous)
      // No meaningful rate for missing values or a zero base
      if (!Number.isFinite(cur) || !Number.isFinite(prev) || prev === 0) {
        return t('reports.notAvailable')
      }
      const rate = ((cur - prev) / prev) * 100
      const sign = rate > 0 ? '+' : ''
      return sign + rate.toFixed(1) + '%'
    }

    return {
      t,
      loading,
      error,
      quarterlyData,
      monthlyData,
      monthlyRows,
      hasData,
      totalRevenue,
      avgMonthlyRevenue,
      totalOrders,
      bestQuarter,
      formatAmount,
      formatMonth,
      getBarHeight,
      getFulfillmentClass,
      getChangeValue,
      getChangeClass,
      getGrowthRate
    }
  }
}
</script>

<style scoped>
.reports {
  padding: 0;
}

.card {
  background: var(--surface);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px var(--shadow-color-lg);
}

.card-header {
  margin-bottom: 1.5rem;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--ink);
  margin: 0;
}

.reports-table {
  width: 100%;
  border-collapse: collapse;
}

.reports-table th {
  background: var(--surface-subtle);
  padding: 0.75rem;
  text-align: left;
  font-weight: 600;
  color: var(--muted);
  border-bottom: 2px solid var(--line);
}

.reports-table td {
  padding: 0.75rem;
  border-bottom: 1px solid var(--line);
}

.reports-table tr:hover {
  background: var(--surface-subtle);
}

.chart-container {
  padding: 2rem 1rem;
  min-height: 300px;
}

.bar-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 250px;
  gap: 0.5rem;
}

.bar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  max-width: 80px;
}

.bar-container {
  height: 200px;
  display: flex;
  align-items: flex-end;
  width: 100%;
}

.bar {
  width: 100%;
  background: linear-gradient(to top, var(--accent), var(--accent-light));
  border-radius: 4px 4px 0 0;
  transition: all 0.3s;
  cursor: pointer;
}

.bar:hover {
  background: linear-gradient(to top, var(--accent-strong), var(--accent));
}

.bar-label {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: var(--muted);
  text-align: center;
  transform: rotate(-45deg);
  white-space: nowrap;
  margin-top: 1.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}

.stat-card {
  background: var(--surface);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px var(--shadow-color-lg);
  border-left: 4px solid var(--accent);
}

.stat-label {
  font-size: 0.875rem;
  color: var(--muted);
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--ink);
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
}

.badge.success {
  background: var(--success-tint-4);
  color: var(--success-ink-2);
}

.badge.warning {
  background: var(--warning-tint-2);
  color: var(--warning-ink);
}

.badge.danger {
  background: var(--danger-tint-2);
  color: var(--danger-ink);
}

.positive-change {
  color: var(--success-strong-2);
  font-weight: 600;
}

.negative-change {
  color: var(--danger-strong);
  font-weight: 600;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: var(--muted);
}

.error {
  background: var(--danger-tint-2);
  color: var(--danger-ink);
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
}

.empty-state {
  text-align: center;
  padding: 2rem 1rem;
  color: var(--muted);
  font-size: 0.938rem;
}

/* Responsive: layout-only overrides, desktop (>1100px) unchanged */
@media (max-width: 768px) {
  .card { padding: 1rem; min-width: 0; max-width: 100%; }
  .chart-container { padding: 1rem 0.5rem; overflow-x: auto; max-width: 100%; }
  /* 12-month chart scrolls inside its card rather than the page */
  .bar-chart { min-width: 540px; }
  .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .reports-table td:first-child, .reports-table th:first-child { white-space: nowrap; }
}

@media (max-width: 480px) {
  .stats-grid { grid-template-columns: minmax(0, 1fr); }
}
</style>
