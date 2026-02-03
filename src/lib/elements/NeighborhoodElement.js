import { MapElement } from '../core/MapElement.js'
import { DistrictElement } from './DistrictElement.js'
import { filterElementsByPolygon } from '../utils/geometry.js'
import { getStopsForRoutes } from '../utils/icons.js'

export class NeighborhoodElement extends MapElement {
  constructor(id, type, coordinates, metadata) {
    super(id, type, coordinates, metadata)
    this.color = (metadata && metadata.color) ? metadata.color : '#FF6B6B'
    this.overlayLayer = null
  }

  createLeafletLayer() {
    const coords = Array.isArray(this.coordinates[0][0]) ? this.coordinates : [this.coordinates]
    const isSelected = this.state.selected
    const opacity = this.getOpacity()
    const weight = isSelected ? 4 : 0
    const polygon = window.L.polygon(coords, {
      color: this.color,
      fillColor: this.color,
      fillOpacity: opacity,
      weight,
      opacity: isSelected ? 0.9 : 0,
      className: 'neighborhood-polygon',
      interactive: true
    })
    const self = this
    polygon.neighborhoodElement = this
    polygon.on('click', function(e) {
      e.originalEvent.stopPropagation()
      self.onClick(window.mapInstance)
    })
    const tooltip = this.getTooltip()
    if (tooltip != null) {
      polygon.bindTooltip(tooltip, { permanent: false, direction: 'center', className: 'neighborhood-tooltip' })
    }
    return polygon
  }

  onClick(map) {
    if (!map) return
    const registry = map.getRegistry ? map.getRegistry() : null
    if (!registry) return
    const name = this.metadata.name || this.id
    const neighborhoodManager = map.neighborhoodManager || null
    if (!neighborhoodManager) return

    const allNeighborhoodElements = registry.getAllElements().filter(el => el instanceof NeighborhoodElement)
    allNeighborhoodElements.forEach(element => {
      if (element.overlayLayer) {
        map.removeOverlayLayer(element.overlayLayer)
        element.overlayLayer = null
      }
    })
    const allDistrictElements = registry.getAllElements().filter(el => el instanceof DistrictElement)
    allDistrictElements.forEach(element => {
      if (element.overlayLayer) {
        map.removeOverlayLayer(element.overlayLayer)
        element.overlayLayer = null
      }
    })

    const neighborhoodData = neighborhoodManager.neighborhoodData
    const neighborhood = neighborhoodData[name]
    if (!neighborhood) return
    const neighborhoodPolygon = neighborhood.latLngs || neighborhood.coordinates
    if (!neighborhoodPolygon) return
    const coords = Array.isArray(neighborhoodPolygon[0][0]) ? neighborhoodPolygon : [neighborhoodPolygon]
    this.overlayLayer = window.L.polygon(coords, {
      color: '#000000',
      fillColor: 'transparent',
      fillOpacity: 0,
      weight: 4,
      opacity: 1,
      className: 'neighborhood-border',
      pane: 'overlayPane',
      interactive: false
    })
    map.addOverlayLayer(this.overlayLayer)
    setTimeout(() => {
      if (this.overlayLayer && this.overlayLayer.bringToFront) this.overlayLayer.bringToFront()
    }, 100)
    const bounds = this.overlayLayer.getBounds()
    map.leafletMap.fitBounds(bounds, { padding: [150, 150], maxZoom: 16 })
    const outerRing = Array.isArray(neighborhoodPolygon[0][0]) ? neighborhoodPolygon[0] : neighborhoodPolygon
    neighborhoodManager.setCurrentView(null, name)

    const neighborhoodsToShow = Object.keys(neighborhoodData)
    neighborhoodsToShow.forEach(nName => {
      const element = registry.get(nName)
      if (element) element.updateState({ selected: nName === name })
    })
    const allElements = registry.getAllElements()
    const filteredElements = filterElementsByPolygon(allElements, outerRing)
    const filteredIds = filteredElements.map(el => el.id)
    const filteredRoutes = filteredElements.filter(el =>
      el.type === 'polyline' && ((el.metadata && el.metadata.category === 'metro_route') ||
        (el.metadata && el.metadata.category === 'bus_route') ||
        (el.metadata && el.metadata.category === 'tram_route') || (el.metadata && el.metadata.routeType)))
    if (filteredRoutes.length > 0) {
      const allStops = registry.getAllElements().filter(el =>
        el.type === 'marker' && ((el.metadata && el.metadata.category === 'metro_stop') ||
          (el.metadata && el.metadata.category === 'bus_stop') || (el.metadata && el.metadata.routeType)))
      getStopsForRoutes(filteredRoutes, allStops).forEach(stop => {
        if (filteredIds.indexOf(stop.id) === -1) filteredIds.push(stop.id)
      })
    }
    map.renderElements(filteredIds)
    if (map.districtsListManager) map.districtsListManager.setActiveNeighborhood(name)
    if (map.legendMap && neighborhoodManager) {
      map.legendMap.update(neighborhoodManager.getCurrentView())
    }
    if (window.updateResetButtonVisibility) {
      window.updateResetButtonVisibility()
      setTimeout(() => window.updateResetButtonVisibility(), 200)
    }
  }

  onStateChange(oldState, newState) {
    if (oldState.selected !== newState.selected) this.onSelectedChange(newState.selected)
  }

  onSelectedChange(isSelected) {
    if (!this.leafletLayer) return
    const opacity = this.getOpacity()
    const weight = isSelected ? 4 : 0
    this.leafletLayer.setStyle({ fillOpacity: opacity, weight, opacity: isSelected ? 0.9 : 0 })
    const tooltip = this.getTooltip()
    if (tooltip != null) {
      this.leafletLayer.unbindTooltip()
      this.leafletLayer.bindTooltip(tooltip, { permanent: false, direction: 'center', className: 'neighborhood-tooltip' })
    } else {
      this.leafletLayer.unbindTooltip()
    }
  }

  getTooltip() {
    if (this.state.selected) return
    return this.metadata.name || this.id
  }

  getOpacity() {
    return this.state.selected ? 0 : 0.12
  }
}
