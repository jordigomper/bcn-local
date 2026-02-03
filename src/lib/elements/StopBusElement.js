import { MapElement } from '../core/MapElement.js'
import { distancePointToPolyline } from '../utils/geometry.js'

export class StopBusElement extends MapElement {
  constructor(id, type, coordinates, metadata) {
    super(id, type, coordinates, metadata)
    this.routeType = '3'
    this.busRoutesOverlay = null
  }

  getIcon() {
    return this.createIconFromPath(this.iconBasePath + 'StopBus.svg', this.iconWidth, this.iconHeight, 'transports-stop-bus-icon')
  }

  createLeafletLayer() {
    const icon = this.getIcon()
    const marker = window.L.marker(this.coordinates, { icon })
    const self = this
    marker.stopElement = this
    marker.on('click', function() {
      self.onClick(window.mapInstance)
    })
    const tooltip = this.getTooltip()
    if (tooltip != null) {
      marker.bindTooltip(tooltip, { permanent: false, direction: 'top', className: 'neighborhood-tooltip', interactive: false })
    }
    return marker
  }

  onClick(map) {
    if (!map) return null
    const registry = map.getRegistry ? map.getRegistry() : null
    if (!registry) return null
    const allStopElements = registry.getAllElements().filter(el => el.busRoutesOverlay)
    allStopElements.forEach(element => {
      if (element.busRoutesOverlay) {
        map.removeOverlayLayer(element.busRoutesOverlay)
        element.busRoutesOverlay = null
      }
    })
    const busRoutes = registry.getByCategory('bus_route')
    if (!busRoutes || busRoutes.length === 0) return null
    const stopLat = this.coordinates[0]
    const stopLng = this.coordinates[1]
    const threshold = 0.001
    const currentZoom = map.getZoom ? map.getZoom() : 13
    const baseWeight = (currentZoom >= 12.5 && currentZoom <= 14.5) ? 2 : 4
    const busWeight = baseWeight / 2
    const routesLayer = window.L.layerGroup()
    let routesFound = false
    const stopRouteNames = this.metadata.routeNames || []
    for (let i = 0; i < busRoutes.length; i++) {
      const route = busRoutes[i]
      if (!route.coordinates || !Array.isArray(route.coordinates)) continue
      const meta = route.metadata || {}
      const routeName = meta.name || route.id
      let routePassesNear = distancePointToPolyline(stopLat, stopLng, route.coordinates) <= threshold
      if (!routePassesNear) {
        const step = Math.max(1, Math.floor(route.coordinates.length / 100))
        for (let j = 0; j < route.coordinates.length; j += step) {
          const coord = route.coordinates[j]
          if (Array.isArray(coord) && coord.length >= 2 &&
              Math.abs(coord[0] - stopLat) < threshold && Math.abs(coord[1] - stopLng) < threshold) {
            routePassesNear = true
            break
          }
        }
      }
      const isAssignedToStop = stopRouteNames.indexOf(routeName) >= 0
      if (routePassesNear || isAssignedToStop) {
        const routeColor = meta.color || '#800020'
        const polyline = window.L.polyline(route.coordinates, {
          color: routeColor,
          weight: busWeight,
          opacity: 0.9
        })
        polyline.bindTooltip(routeName, { permanent: false, direction: 'top', className: 'neighborhood-tooltip' })
        routesLayer.addLayer(polyline)
        routesFound = true
      }
    }
    if (routesFound) {
      this.busRoutesOverlay = routesLayer
      map.addOverlayLayer(routesLayer)
    }
    return null
  }

  getTooltip() {
    const defaultName = (typeof window !== 'undefined' && window.I18n) ? window.I18n.t('parada') : 'Stop'
    const name = this.metadata.name || defaultName
    const routeNames = this.metadata.routeNames || []
    if (routeNames.length > 0) {
      const linesText = (typeof window !== 'undefined' && window.I18n) ? window.I18n.t('lineas') : 'Lines'
      return name + '<br><small>' + linesText + ': ' + routeNames.join(', ') + '</small>'
    }
    return name
  }
}
