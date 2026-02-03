<template>
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
      <select
        :value="i18nStore.currentLanguage"
        class="language-selector"
        :aria-label="i18n.t('languageSelector')"
        @change="onLanguageChange(($event.target).value)"
      >
        <option value="es">ES</option>
        <option value="ca">CA</option>
        <option value="en">EN</option>
      </select>
      <button
        type="button"
        class="toggle-button"
        :class="{ active: mapStore.isFilterActive('metro_route') }"
        @click="mapStore.toggleMetro()"
      >
        {{ i18n.t('metroTren') }}
      </button>
      <button
        type="button"
        class="toggle-button"
        :class="{ active: mapStore.isFilterActive('bus_route') }"
        @click="mapStore.toggleBus()"
      >
        {{ i18n.t('buses') }}
      </button>
      <button
        type="button"
        class="toggle-button"
        :class="{ active: mapStore.isFilterActive('gasStation') }"
        @click="mapStore.toggleFilter('gasStation')"
      >
        {{ i18n.t('gasolineras') }}
      </button>
      <button
        type="button"
        class="toggle-button"
        :class="{ active: mapStore.isFilterActive('bicing') }"
        @click="mapStore.toggleFilter('bicing')"
      >
        {{ i18n.t('bicing') }}
      </button>
      <button
        type="button"
        class="toggle-button"
        :class="{ active: mapStore.isFilterActive('sports') }"
        @click="mapStore.toggleFilter('sports')"
      >
        {{ i18n.t('serviciosDeportivos') }}
      </button>
    </div>
  </header>
</template>

<script setup>
import { useMapStore } from '../stores/mapStore'
import { useI18nStore } from '../stores/i18nStore'
import { I18n } from '../lib/utils/i18n.js'

const mapStore = useMapStore()
const i18nStore = useI18nStore()
const i18n = I18n

function onLanguageChange(lang) {
  i18nStore.setLanguage(lang)
  document.documentElement.lang = lang
  document.title = I18n.t('appTitle')
}
</script>
