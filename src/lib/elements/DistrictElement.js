import { MapElement } from '../core/MapElement.js'
import { NeighborhoodElement } from './NeighborhoodElement.js'
import { filterElementsByPolygon } from '../utils/geometry.js'
import { getStopsForRoutes } from '../utils/icons.js'

export class DistrictElement extends MapElement {
  constructor(id, type, coordinates, metadata) {
    super(id, type, coordinates, metadata)
    this.overlayLayer = null
  }

  createLeafletLayer() {
    return null
  }

  onClick(map) {
    if (!map) return
    const registry = map.getRegistry ? map.getRegistry() : null
    if (!registry) return

    const allDistrictElements = registry.getAllElements().filter(el => el instanceof DistrictElement)
    allDistrictElements.forEach(element => {
      if (element.overlayLayer) {
        map.removeOverlayLayer(element.overlayLayer)
        element.overlayLayer = null
      }
    })
    const allNeighborhoodElements = registry.getAllElements().filter(el => el instanceof NeighborhoodElement)
    allNeighborhoodElements.forEach(element => {
      if (element.overlayLayer) {
        map.removeOverlayLayer(element.overlayLayer)
        element.overlayLayer = null
      }
    })

    const coords = Array.isArray(this.coordinates[0][0]) ? this.coordinates : [this.coordinates]
    this.overlayLayer = window.L.polygon(coords, {
      color: '#000000',
      fillColor: 'transparent',
      fillOpacity: 0,
      weight: 4,
      opacity: 1,
      className: 'district-border',
      pane: 'overlayPane'
    })
    map.addOverlayLayer(this.overlayLayer)
    const bounds = this.overlayLayer.getBounds()
    map.leafletMap.fitBounds(bounds, { padding: [100, 100], maxZoom: 15 })

    const neighborhoodManager = map.neighborhoodManager || null
    if (!neighborhoodManager) return
    const districtData = neighborhoodManager.districtData
    const district = districtData[this.id]
    if (!district) return
    const districtPolygon = district.latLngs || district.polygons
    if (!districtPolygon) return
    const outerRing = Array.isArray(districtPolygon[0][0]) ? districtPolygon[0] : districtPolygon

    const gasStations = registry.getByCategory('gasStation')
    const metroRoutes = registry.getAllElements().filter(el =>
      el.type === 'polyline' && ((el.metadata && el.metadata.category === 'metro_route') || (el.metadata && el.metadata.routeType && el.metadata.routeType !== '3')))
    const metroStops = registry.getAllElements().filter(el =>
      el.type === 'marker' && ((el.metadata && el.metadata.category === 'metro_stop') || (el.metadata && el.metadata.routeType && el.metadata.routeType !== '3')))
    const filteredIds = []
    filterElementsByPolygon(gasStations, outerRing).forEach(el => filteredIds.push(el.id))
    filterElementsByPolygon(metroRoutes, outerRing).forEach(el => filteredIds.push(el.id))
    filterElementsByPolygon(metroStops, outerRing).forEach(el => filteredIds.push(el.id))
    const filteredMetroRoutes = filterElementsByPolygon(metroRoutes, outerRing)
    if (filteredMetroRoutes.length > 0) {
      getStopsForRoutes(filteredMetroRoutes, metroStops).forEach(stop => {
        if (filteredIds.indexOf(stop.id) === -1) filteredIds.push(stop.id)
      })
    }
    const busRoutes = registry.getAllElements().filter(el =>
      el.type === 'polyline' && ((el.metadata && el.metadata.category === 'bus_route') || (el.metadata && el.metadata.routeType === '3')))
    const busStops = registry.getAllElements().filter(el =>
      el.type === 'marker' && ((el.metadata && el.metadata.category === 'bus_stop') || (el.metadata && el.metadata.routeType === '3')))
    const filteredBusRoutes = filterElementsByPolygon(busRoutes, outerRing)
    filteredBusRoutes.forEach(el => filteredIds.push(el.id))
    if (filteredBusRoutes.length > 0) {
      getStopsForRoutes(filteredBusRoutes, busStops).forEach(stop => {
        if (filteredIds.indexOf(stop.id) === -1) filteredIds.push(stop.id)
      })
    }

    neighborhoodManager.setCurrentView(this.id, null)
    const neighborhoodsToShow = Object.keys(neighborhoodManager.neighborhoodData)
    neighborhoodsToShow.forEach(nName => {
      const element = registry.get(nName)
      if (element) {
        element.updateState({ selected: false })
        if (element.leafletLayer) {
          map.leafletMap.removeLayer(element.leafletLayer)
          element.leafletLayer = null
        }
        map.renderElement(nName)
      }
    })
    map.renderElements(filteredIds)
    if (map.districtsListManager) map.districtsListManager.setActiveDistrict(this.id)
    if (map.selectionLegendManager && neighborhoodManager) {
      map.selectionLegendManager.update(neighborhoodManager.getCurrentView())
    }
    if (window.updateResetButtonVisibility) {
      window.updateResetButtonVisibility()
      setTimeout(() => window.updateResetButtonVisibility(), 200)
    }
  }

  getTooltip() {
    return this.metadata.name || this.id
  }
}
