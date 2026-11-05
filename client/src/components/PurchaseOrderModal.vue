<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen && backlogItem" class="modal-overlay" @click="close">
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <h3 class="modal-title">{{ mode === 'view' ? t('purchaseOrder.viewTitle') : t('purchaseOrder.createTitle') }}</h3>
            <button class="close-button" :aria-label="t('purchaseOrder.close')" @click="close">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <div class="item-header">
              <h4 class="item-name">{{ translateProductName(backlogItem.item_name) }}</h4>
              <div class="item-meta">
                <span>{{ t('purchaseOrder.sku') }}: {{ backlogItem.item_sku }}</span>
                <span>{{ t('purchaseOrder.shortage') }}: {{ shortage }} {{ t('purchaseOrder.units') }}</span>
              </div>
            </div>

            <!-- View mode -->
            <template v-if="mode === 'view'">
              <div v-if="loading" class="state-message">{{ t('purchaseOrder.loadingOrder') }}</div>
              <div v-else-if="loadError" class="form-error-banner">{{ loadError }}</div>
              <div v-else-if="order" class="info-grid">
                <div class="info-item">
                  <div class="info-label">{{ t('purchaseOrder.supplierName') }}</div>
                  <div class="info-value">{{ order.supplier_name }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">{{ t('purchaseOrder.status') }}</div>
                  <div class="info-value"><span class="badge">{{ statusLabel(order.status) }}</span></div>
                </div>
                <div class="info-item">
                  <div class="info-label">{{ t('purchaseOrder.quantity') }}</div>
                  <div class="info-value">{{ order.quantity }} {{ t('purchaseOrder.units') }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">{{ t('purchaseOrder.unitCost') }}</div>
                  <div class="info-value">{{ formatCurrencyWithDecimals(order.unit_cost, 'USD', 2) }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">{{ t('purchaseOrder.totalCost') }}</div>
                  <div class="info-value">{{ formatCurrencyWithDecimals(order.quantity * order.unit_cost, 'USD', 2) }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">{{ t('purchaseOrder.expectedDelivery') }}</div>
                  <div class="info-value">{{ formatDate(order.expected_delivery_date) }}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">{{ t('purchaseOrder.createdAt') }}</div>
                  <div class="info-value">{{ formatDate(order.created_date) }}</div>
                </div>
                <div v-if="order.notes" class="info-item full-row">
                  <div class="info-label">{{ t('purchaseOrder.notes') }}</div>
                  <div class="info-value notes-text">{{ order.notes }}</div>
                </div>
              </div>
            </template>

            <!-- Create mode -->
            <form v-else id="po-form" class="po-form" novalidate @submit.prevent="submit">
              <div v-if="submitError" class="form-error-banner">{{ submitError }}</div>

              <div class="form-group">
                <label for="po-supplier">{{ t('purchaseOrder.supplierName') }}</label>
                <input id="po-supplier" v-model="form.supplier_name" type="text" :placeholder="t('purchaseOrder.supplierPlaceholder')" :class="{ invalid: errors.supplier_name }" />
                <div v-if="errors.supplier_name" class="field-error">{{ errors.supplier_name }}</div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="po-quantity">{{ t('purchaseOrder.quantity') }}</label>
                  <input id="po-quantity" v-model.number="form.quantity" type="number" min="1" step="1" :class="{ invalid: errors.quantity }" />
                  <div v-if="errors.quantity" class="field-error">{{ errors.quantity }}</div>
                </div>
                <div class="form-group">
                  <label for="po-unit-cost">{{ t('purchaseOrder.unitCost') }}</label>
                  <input id="po-unit-cost" v-model.number="form.unit_cost" type="number" min="0" step="0.01" :class="{ invalid: errors.unit_cost }" />
                  <div v-if="errors.unit_cost" class="field-error">{{ errors.unit_cost }}</div>
                </div>
              </div>

              <div class="form-group">
                <label for="po-date">{{ t('purchaseOrder.expectedDelivery') }}</label>
                <input id="po-date" v-model="form.expected_delivery_date" type="date" :min="todayString()" :class="{ invalid: errors.expected_delivery_date }" />
                <div v-if="errors.expected_delivery_date" class="field-error">{{ errors.expected_delivery_date }}</div>
              </div>

              <div class="form-group">
                <label for="po-notes">{{ t('purchaseOrder.notes') }}</label>
                <textarea id="po-notes" v-model="form.notes" rows="3" :placeholder="t('purchaseOrder.notesPlaceholder')"></textarea>
              </div>
            </form>
          </div>

          <div class="modal-footer">
            <template v-if="mode === 'view'">
              <button type="button" class="btn-secondary" @click="close">{{ t('purchaseOrder.close') }}</button>
            </template>
            <template v-else>
              <button type="button" class="btn-secondary" :disabled="submitting" @click="close">{{ t('purchaseOrder.cancel') }}</button>
              <button type="submit" form="po-form" class="btn-primary" :disabled="submitting">
                {{ submitting ? t('purchaseOrder.submitting') : t('purchaseOrder.submit') }}
              </button>
            </template>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { api } from '../api'
import { useI18n } from '../composables/useI18n'
import { formatCurrencyWithDecimals } from '../utils/currency'

const { t, currentLocale, translateProductName } = useI18n()

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  backlogItem: { type: Object, default: null },
  mode: { type: String, default: 'create' }
})

const emit = defineEmits(['close', 'po-created'])

const form = reactive({
  supplier_name: '',
  quantity: 1,
  unit_cost: null,
  expected_delivery_date: '',
  notes: ''
})
const errors = reactive({})
const submitting = ref(false)
const submitError = ref(null)
const loading = ref(false)
const loadError = ref(null)
const order = ref(null)

const shortage = computed(() => {
  if (!props.backlogItem) return 0
  return Math.max(props.backlogItem.quantity_needed - props.backlogItem.quantity_available, 0)
})

// Local calendar date as YYYY-MM-DD (toISOString would use UTC and can be off by a day)
const dateToString = (date) => {
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}
const todayString = () => dateToString(new Date())

const resetForm = () => {
  const defaultDate = new Date()
  defaultDate.setDate(defaultDate.getDate() + 7)
  form.supplier_name = ''
  form.quantity = Math.max(shortage.value, 1)
  form.unit_cost = null
  form.expected_delivery_date = dateToString(defaultDate)
  form.notes = ''
  Object.keys(errors).forEach(key => delete errors[key])
  submitError.value = null
  submitting.value = false
}

const loadOrder = async () => {
  order.value = null
  loadError.value = null
  if (!props.backlogItem) return
  loading.value = true
  try {
    order.value = await api.getPurchaseOrderByBacklogItem(props.backlogItem.id)
  } catch (err) {
    console.error('Failed to load purchase order:', err)
    loadError.value = t('purchaseOrder.errors.loadFailed')
  } finally {
    loading.value = false
  }
}

// Reset state every time the modal opens
watch(() => props.isOpen, (open) => {
  if (!open) return
  if (props.mode === 'view') {
    loadOrder()
  } else {
    resetForm()
  }
})

const validate = () => {
  Object.keys(errors).forEach(key => delete errors[key])
  if (!form.supplier_name.trim()) errors.supplier_name = t('purchaseOrder.errors.supplierRequired')
  if (!Number.isInteger(form.quantity) || form.quantity < 1) errors.quantity = t('purchaseOrder.errors.quantityInvalid')
  if (typeof form.unit_cost !== 'number' || !(form.unit_cost > 0)) errors.unit_cost = t('purchaseOrder.errors.unitCostInvalid')
  if (!form.expected_delivery_date) {
    errors.expected_delivery_date = t('purchaseOrder.errors.dateRequired')
  } else if (form.expected_delivery_date < todayString()) {
    // YYYY-MM-DD strings compare correctly as text
    errors.expected_delivery_date = t('purchaseOrder.errors.datePast')
  }
  return Object.keys(errors).length === 0
}

const submit = async () => {
  if (submitting.value || !validate()) return
  submitting.value = true
  submitError.value = null
  try {
    const created = await api.createPurchaseOrder({
      backlog_item_id: props.backlogItem.id,
      supplier_name: form.supplier_name.trim(),
      quantity: form.quantity,
      unit_cost: form.unit_cost,
      expected_delivery_date: form.expected_delivery_date,
      notes: form.notes.trim() || null
    })
    emit('po-created', created)
    resetForm()
  } catch (err) {
    console.error('Failed to create purchase order:', err)
    submitError.value = err.response?.status === 409
      ? t('purchaseOrder.errors.alreadyExists')
      : t('purchaseOrder.errors.createFailed')
  } finally {
    submitting.value = false
  }
}

const close = () => {
  if (submitting.value) return
  emit('close')
}

const statusLabel = (status) => {
  const key = (status || '').toLowerCase()
  const known = ['pending', 'ordered', 'shipped', 'received', 'cancelled']
  return known.includes(key) ? t(`purchaseOrder.statuses.${key}`) : status
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return '-'
  const locale = currentLocale.value === 'ja' ? 'ja-JP' : 'en-US'
  return date.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 1rem;
}

.modal-container {
  background: var(--surface);
  border-radius: 12px;
  box-shadow: 0 20px 50px var(--shadow-color-xl);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid var(--line);
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--ink);
  letter-spacing: -0.025em;
}

.close-button {
  background: none;
  border: none;
  color: var(--muted);
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.15s ease;
}

.close-button:hover {
  background: var(--surface-sunken);
  color: var(--ink);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem 2rem;
}

.item-header {
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--line);
  margin-bottom: 1.25rem;
}

.item-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--ink);
  margin: 0 0 0.5rem 0;
}

.item-meta {
  display: flex;
  gap: 1.5rem;
  font-size: 0.875rem;
  color: var(--muted);
}

.state-message {
  padding: 2rem;
  text-align: center;
  color: var(--muted);
}

.form-error-banner {
  padding: 0.75rem 1rem;
  background: var(--danger-tint);
  border: 1px solid var(--danger-line);
  border-radius: 8px;
  color: var(--danger-ink);
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.po-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.form-group label {
  font-size: 0.813rem;
  font-weight: 600;
  color: var(--ink-3);
}

.form-group input,
.form-group textarea {
  padding: 0.625rem 0.75rem;
  border: 1px solid var(--line-strong);
  border-radius: 8px;
  font-size: 0.875rem;
  font-family: inherit;
  color: var(--ink);
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--accent);
}

.form-group input.invalid {
  border-color: var(--danger);
}

.field-error {
  font-size: 0.75rem;
  color: var(--danger-strong);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-item.full-row {
  grid-column: 1 / -1;
}

.info-label {
  font-size: 0.813rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--muted);
}

.info-value {
  font-size: 0.938rem;
  color: var(--ink);
  font-weight: 500;
}

.notes-text {
  white-space: pre-wrap;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.625rem;
  border-radius: 6px;
  background: var(--accent-tint-2);
  color: var(--accent-ink);
  font-size: 0.813rem;
  font-weight: 600;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--line);
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.btn-secondary,
.btn-primary {
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

.btn-secondary {
  background: var(--surface-sunken);
  border: 1px solid var(--line);
  color: var(--ink-2);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--line);
  border-color: var(--line-strong);
}

.btn-primary {
  background: var(--accent);
  border: 1px solid var(--accent);
  color: var(--on-accent);
}

.btn-primary:hover:not(:disabled) {
  background: var(--accent-strong);
}

.btn-primary:disabled,
.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Modal transition animations */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.2s ease;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.95);
}
</style>
