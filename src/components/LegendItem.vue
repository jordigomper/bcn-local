<template>
  <div class="selection-legend-item">
    <span class="selection-legend-icon">
      <img v-if="iconPath" :src="iconPath" :width="iconSize[0]" :height="iconSize[1]" alt="">
    </span>
    <span>{{ label }}</span>
    <div v-if="lines && lines.length" class="selection-legend-lines">
      <span
        v-for="line in lines"
        :key="line.name + (line.routeType || '')"
        class="selection-legend-line"
        :class="{ selected: isLineSelected(line) }"
        :style="lineStyle(line)"
        @click="onLineClick(line)"
      >
        {{ line.displayName || line.name }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: { type: String, required: true },
  iconPath: { type: String, default: null },
  iconSize: { type: Array, default: () => [20, 20] },
  lines: { type: Array, default: () => [] },
  selectedRoute: { type: Object, default: null }
})

const emit = defineEmits(['line-click'])

function isLineSelected(line) {
  if (!props.selectedRoute) return false
  return props.selectedRoute.name === line.name && props.selectedRoute.routeType === (line.routeType || '')
}

function lineStyle(line) {
  const color = line.color || '#333'
  const style = {
    background: color,
    color: '#fff',
    borderColor: color
  }
  if (isLineSelected(line)) {
    style.boxShadow = '0 0 0 2px rgba(0,0,0,0.3)'
    style.fontWeight = 600
  }
  return style
}

function onLineClick(line) {
  emit('line-click', { routeName: line.name, routeType: line.routeType || '' })
}
</script>
