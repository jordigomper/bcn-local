<template>
  <div class="app">
    <header class="header">
      <h1>
        <svg class="header-logo" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="3" fill="#e53935"/>
          <path d="M16 6L16 13M16 19L16 26M6 16L13 16M19 16L26 16" stroke="#e53935" stroke-width="2" stroke-linecap="round"/>
          <path d="M9 9L12 12M23 9L20 12M9 23L12 20M23 23L20 20" stroke="#e53935" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>
        </svg>
        <span>{{ i18n.t('appName') }}</span>
      </h1>
      <div class="header-actions">
        <select :value="i18nStore.currentLanguage" class="language-selector" :aria-label="i18n.t('languageSelector')" @change="(e) => onLanguageChange(e.target.value)">
          <option value="es">ES</option>
          <option value="ca">CA</option>
          <option value="en">EN</option>
        </select>
        <button id="gtfs-metro-toggle" type="button" class="toggle-button" :class="{ active: mapStore.isFilterActive('metro_route') }" @click="onMetroToggle">
          {{ i18n.t('metroTren') }}
        </button>
        <button id="gtfs-bus-toggle" type="button" class="toggle-button" :class="{ active: mapStore.isFilterActive('bus_route') }" @click="onBusToggle">
          {{ i18n.t('buses') }}
        </button>
        <button id="transport-toggle" type="button" class="toggle-button" :class="{ active: mapStore.isFilterActive('gasStation') }" @click="onTransportToggle">
          {{ i18n.t('gasolineras') }}
        </button>
        <button id="bicing-toggle" type="button" class="toggle-button" :class="{ active: mapStore.isFilterActive('bicing') }" @click="onBicingToggle">
          {{ i18n.t('bicing') }}
        </button>
        <button id="sports-toggle" type="button" class="toggle-button" :class="{ active: mapStore.isFilterActive('sports') }" @click="onSportsToggle">
          {{ i18n.t('serviciosDeportivos') }}
        </button>
      </div>
    </header>

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

    <button id="selection-legend-reset-button" type="button" class="selection-legend-reset-button" :title="i18n.t('resetButtonTitle')" style="display: none;">
      <span>Clear / </span>
      <span class="key-style">ESC</span>
    </button>
    <div id="selection-legend" class="selection-legend" style="display: none;">
      <div class="selection-legend-title">{{ i18n.t('leyendaSeleccion') }}</div>
      <div id="selection-legend-content"></div>
    </div>

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

const mapStore = useMapStore()
const i18nStore = useI18nStore()
const i18n = I18n

onMounted(() => {
  i18nStore.init()
  if (typeof window !== 'undefined') {
    window.I18n = I18n
    window.updateTranslations = () => {
      if (mapStore.mapInstance?.selectionLegendManager) mapStore.mapInstance.selectionLegendManager.updateTranslations()
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

function onLanguageChange(lang) {
  i18nStore.setLanguage(lang)
  document.documentElement.lang = lang
  document.title = i18n.t('appTitle')
}

function onMetroToggle() {
  mapStore.toggleMetro()
}

function onBusToggle() {
  mapStore.toggleBus()
}

function onTransportToggle() {
  mapStore.toggleFilter('gasStation')
}

function onBicingToggle() {
  mapStore.toggleFilter('bicing')
}

function onSportsToggle() {
  mapStore.toggleFilter('sports')
}
</script>
