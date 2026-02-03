<template>
  <div class="app">
    <AppHeader />

    <button v-show="mapStore.showResetButton" id="reset-view-button" type="button" class="reset-button" :title="i18n.t('resetButtonTitle')" @click="mapStore.resetMapView()">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
        <path d="M21 3v5h-5"/>
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
        <path d="M3 21v-5h5"/>
      </svg>
      <span>{{ i18n.t('resetButton') }}</span>
    </button>

    <div class="legend-container">
      <div class="legend-title">{{ i18n.t('districtsList') }}</div>
      <div id="districts-list"></div>
    </div>

    <LegendMap
      :visible="mapStore.legendVisible"
      :title="i18n.t('leyendaSeleccion')"
      :items="mapStore.legendItems"
      :selected-route="mapStore.legendSelectedRoute"
      :reset-label="i18n.t('resetButton')"
      :reset-title="i18n.t('resetButtonTitle')"
      @reset="mapStore.resetMapView()"
      @line-click="mapStore.handleLegendLineClick($event.routeName, $event.routeType)"
    />

    <main id="main" role="main">
      <div id="map" aria-label="Mapa interactivo de Barcelona"></div>
    </main>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useMapStore } from './stores/mapStore'
import { useI18nStore } from './stores/i18nStore'
import { I18n } from './lib/utils/i18n.js'
import AppHeader from './components/AppHeader.vue'
import LegendMap from './components/LegendMap.vue'

const mapStore = useMapStore()
const i18nStore = useI18nStore()
const i18n = I18n

onMounted(() => {
  i18nStore.init()
  if (typeof window !== 'undefined') {
    window.I18n = I18n
    window.updateTranslations = () => {
      if (mapStore.mapInstance?.districtsListManager) mapStore.mapInstance.districtsListManager.render()
    }
    window.updateResetButtonVisibility = () => mapStore.updateResetButtonVisibility()
    window.resetMapView = () => mapStore.resetMapView()
  }
  const el = document.getElementById('map')
  if (el) mapStore.initMap(el).then(() => {
    setupKeyboard()
  })
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    delete window.mapInstance
    delete window.updateTranslations
    delete window.updateResetButtonVisibility
    delete window.resetMapView
  }
})

function setupKeyboard() {
  document.addEventListener('keydown', onKeydown)
}

function onKeydown(e) {
  if (e.key === 'Escape') mapStore.resetMapView()
}
</script>
