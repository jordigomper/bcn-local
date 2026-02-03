export class NeighborhoodManager {
  constructor(map, registry) {
    this.map = map
    this.registry = registry
    this.districtData = {}
    this.neighborhoodData = {}
    this.currentDistrictView = null
    this.currentNeighborhoodView = null
    this.setupZoomListener()
  }

  setupZoomListener() {
    const self = this
    this.map.on('zoomchange', function(data) {
      self.updateTransportLinesWeight()
      self.updateStopsVisibility()
    })
  }

  renderNeighborhoods() {
    const neighborhoodsToShow = Object.keys(this.neighborhoodData)
    neighborhoodsToShow.forEach(name => {
      const element = this.registry.get(name)
      if (element) {
        element.updateState({ selected: this.currentNeighborhoodView === name })
      }
    })
    this.map.addPersistentElements(neighborhoodsToShow)
  }

  updateTransportLinesWeight() {
    const zoom = this.map.getZoom()
    const baseWeight = (zoom >= 12.5 && zoom <= 14.5) ? 2 : 4
    this.map.getAllElements().forEach(element => {
      if (element.type === 'polyline' && element.leafletLayer) {
        const routeType = element.metadata ? element.metadata.routeType : null
        const isBus = routeType === '3' || (element.metadata && element.metadata.category === 'bus_route')
        const newWeight = isBus ? baseWeight / 2 : baseWeight
        if (element.leafletLayer._gtfsWeight !== newWeight) {
          element.leafletLayer.setStyle({ weight: newWeight })
          element.leafletLayer._gtfsWeight = newWeight
        }
      }
    })
  }

  updateStopsVisibility() {
    const self = this
    this.map.getAllElements().forEach(element => {
      if (element.type === 'marker' && element.metadata && element.metadata.category === 'bus_stop') {
        if (element.leafletLayer) {
          if (element.state.visible) {
            if (!self.map.leafletMap.hasLayer(element.leafletLayer)) element.leafletLayer.addTo(self.map.leafletMap)
          } else {
            if (self.map.leafletMap.hasLayer(element.leafletLayer)) self.map.leafletMap.removeLayer(element.leafletLayer)
          }
        }
      }
    })
  }

  setCurrentView(districtCode, neighborhoodName) {
    this.currentDistrictView = districtCode
    this.currentNeighborhoodView = neighborhoodName
  }

  getCurrentView() {
    return {
      district: this.currentDistrictView,
      neighborhood: this.currentNeighborhoodView
    }
  }
}
