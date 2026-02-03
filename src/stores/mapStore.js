import { defineStore } from 'pinia'
import { AppMap } from '../lib/core/AppMap.js'
import { FilterManager } from '../lib/ui/FilterManager.js'
import { DistrictsListManager } from '../lib/ui/DistrictsListManager.js'
import { NeighborhoodManager } from '../lib/ui/NeighborhoodManager.js'
import { SelectionLegendManager } from '../lib/ui/SelectionLegendManager.js'
import { loadData, createElementsFromData } from '../lib/dataLoader.js'
import { I18n } from '../lib/utils/i18n.js'

export const useMapStore = defineStore('map', {
  state: () => ({
    mapInstance: null,
    showResetButton: false,
    ready: false
  }),
  actions: {
    async initMap(mapContainerElement) {
      if (this.mapInstance) return
      const mapInstance = new AppMap(mapContainerElement)
      window.mapInstance = mapInstance
      const elementRegistry = mapInstance.registry
      const filterManager = new FilterManager(mapInstance, elementRegistry)
      mapInstance.filterManager = filterManager
      const districtsListManager = new DistrictsListManager('districts-list')
      mapInstance.districtsListManager = districtsListManager
      const selectionLegendManager = new SelectionLegendManager(mapInstance)
      mapInstance.selectionLegendManager = selectionLegendManager
      this.mapInstance = mapInstance

      const data = await loadData()
      const t = (key) => I18n.t(key)
      const result = createElementsFromData(data, t)
      elementRegistry.registerAll(result.elements)
      mapInstance.registerElements(result.elements)
      const neighborhoodManager = new NeighborhoodManager(mapInstance, elementRegistry)
      neighborhoodManager.districtData = result.districts
      neighborhoodManager.neighborhoodData = result.neighborhoods
      mapInstance.neighborhoodManager = neighborhoodManager
      districtsListManager.rebuild(result.districts, result.neighborhoods)
      neighborhoodManager.renderNeighborhoods()
      selectionLegendManager.update(null)
      this.setupMapListeners()
      this.ready = true
      return mapInstance
    },
    setupMapListeners() {
      if (!this.mapInstance) return
      this.mapInstance.on('zoomend', () => this.updateResetButtonVisibility())
      this.mapInstance.on('moveend', () => this.updateResetButtonVisibility())
      setTimeout(() => this.updateResetButtonVisibility(), 500)
    },
    updateResetButtonVisibility() {
      if (!this.mapInstance) return
      let hasSelection = false
      if (this.mapInstance.neighborhoodManager) {
        const view = this.mapInstance.neighborhoodManager.getCurrentView()
        if (view && (view.district || view.neighborhood)) hasSelection = true
      }
      const selectionLegendVisible = this.mapInstance.selectionLegendManager &&
        this.mapInstance.selectionLegendManager.container &&
        this.mapInstance.selectionLegendManager.container.style.display !== 'none'
      this.showResetButton = hasSelection && !selectionLegendVisible
    },
    resetMapView() {
      if (!this.mapInstance || !this.mapInstance.leafletMap) return
      const registry = this.mapInstance.registry
      if (registry) {
        registry.getAllElements().forEach(element => {
          if (element.overlayLayer) {
            this.mapInstance.removeOverlayLayer(element.overlayLayer)
            element.overlayLayer = null
          }
          if (element.busRoutesOverlay) {
            this.mapInstance.removeOverlayLayer(element.busRoutesOverlay)
            element.busRoutesOverlay = null
          }
        })
      }
      if (this.mapInstance.neighborhoodManager) this.mapInstance.neighborhoodManager.setCurrentView(null, null)
      this.mapInstance.clear()
      if (this.mapInstance.districtsListManager) {
        this.mapInstance.districtsListManager.setActiveDistrict(null)
        this.mapInstance.districtsListManager.setActiveNeighborhood(null)
      }
      if (this.mapInstance.selectionLegendManager) {
        this.mapInstance.selectionLegendManager.selectedRoute = null
        this.mapInstance.selectionLegendManager.update(null)
      }
      if (this.mapInstance.neighborhoodManager) this.mapInstance.neighborhoodManager.renderNeighborhoods()
      const initialView = this.mapInstance.getInitialView()
      setTimeout(() => {
        if (this.mapInstance && this.mapInstance.leafletMap) {
          this.mapInstance.leafletMap.stop()
          this.mapInstance.leafletMap.setView(initialView.center, initialView.zoom, { animate: false })
          this.mapInstance.center = initialView.center
          this.mapInstance.zoom = initialView.zoom
          this.updateResetButtonVisibility()
        }
      }, 150)
    },
    toggleFilter(category) {
      if (!this.mapInstance || !this.mapInstance.filterManager) return
      this.mapInstance.filterManager.toggleFilter(category)
    },
    isFilterActive(category) {
      return this.mapInstance?.filterManager?.isActive(category) ?? false
    },
    toggleMetro() {
      if (!this.mapInstance || !this.mapInstance.filterManager) return
      this.mapInstance.filterManager.toggleFilter('metro_route')
      this.mapInstance.filterManager.toggleFilter('metro_stop')
    },
    toggleBus() {
      if (!this.mapInstance || !this.mapInstance.filterManager) return
      const fm = this.mapInstance.filterManager
      const busWasInactive = !fm.isActive('bus_route') && !fm.isActive('bus_stop')
      if (busWasInactive) {
        if (this.mapInstance.neighborhoodManager) this.mapInstance.neighborhoodManager.setCurrentView(null, null)
        if (this.mapInstance.districtsListManager) {
          this.mapInstance.districtsListManager.setActiveDistrict(null)
          this.mapInstance.districtsListManager.setActiveNeighborhood(null)
        }
        if (this.mapInstance.selectionLegendManager) {
          this.mapInstance.selectionLegendManager.selectedRoute = null
          this.mapInstance.selectionLegendManager.restoreRouteOpacity()
        }
        fm.clearFilters()
        fm.activateFilter('bus_route')
        fm.activateFilter('bus_stop')
        const initialView = this.mapInstance.getInitialView()
        this.mapInstance.leafletMap.setView(initialView.center, 14.5, { animate: true })
        this.mapInstance.zoom = 14.5
        this.mapInstance.selectionLegendManager.update({ filterBus: true })
      } else {
        fm.toggleFilter('bus_route')
        fm.toggleFilter('bus_stop')
        this.mapInstance.selectionLegendManager.update(null)
      }
    }
  }
})
