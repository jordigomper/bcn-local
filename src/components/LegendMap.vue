<template>
  <div v-show="visible" class="legend-map-wrapper">
    <button
      type="button"
      class="selection-legend-reset-button"
      :title="resetTitle"
      @click="$emit('reset')"
    >
      <span>{{ resetLabel }} / </span>
      <span class="key-style">ESC</span>
    </button>
    <div class="selection-legend">
      <div class="selection-legend-title">{{ title }}</div>
      <div class="selection-legend-content">
        <LegendItem
          v-for="item in itemsWithLabels"
          :key="item.id"
          :label="item.label"
          :icon-path="item.iconPath"
          :icon-size="item.iconSize || [20, 20]"
          :lines="item.lines || []"
          :selected-route="selectedRoute"
          @line-click="onLineClick"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import LegendItem from './LegendItem.vue'
import { useI18nStore } from '../stores/i18nStore.js'

const props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: '' },
  items: { type: Array, default: () => [] },
  selectedRoute: { type: Object, default: null },
  resetLabel: { type: String, default: 'Clear' },
  resetTitle: { type: String, default: '' }
})

const emit = defineEmits(['reset', 'line-click'])

const i18nStore = useI18nStore()
const { currentLanguage } = storeToRefs(i18nStore)

const itemsWithLabels = computed(() => {
  currentLanguage
  const t = (key) => (typeof window !== 'undefined' && window.I18n ? window.I18n.t(key) : key)
  return props.items.map(item => ({ ...item, label: t(item.labelKey) }))
})

function onLineClick(payload) {
  emit('line-click', payload)
}
</script>

<style scoped>
.legend-map-wrapper {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

.legend-map-wrapper :deep(.selection-legend) {
  position: relative;
  bottom: auto;
  right: auto;
}

.selection-legend-reset-button {
  position: absolute;
  bottom: 100%;
  right: 0;
  margin-bottom: 8px;
}
</style>
