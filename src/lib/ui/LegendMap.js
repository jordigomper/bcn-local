import { distancePointToPolyline } from '../utils/geometry.js'
import { LegendProviderRegistry } from '../legend/LegendProviderRegistry.js'
import { registerDefaultLegendProviders } from '../legend/legendItemProviders.js'

export class LegendMap {
  constructor(map, onItemsChange) {
    this.map = map
    this.onItemsChange = onItemsChange || (() => {})
    this.providerRegistry = new LegendProviderRegistry()
    registerDefaultLegendProviders(this.providerRegistry)
    this.currentView = null
    this.selectedRoute = null
  }

  update(view) {
    const previousView = this.currentView
    this.currentView = view
    if (!view || (!view.district && !view.neighborhood && !view.filterBus)) {
      this.selectedRoute = null
      this.notify([], false, null)
      return
    }
    const viewChanged = !previousView || previousView.district !== view.district || previousView.neighborhood !== view.neighborhood
    if (viewChanged && this.selectedRoute) {
      this.selectedRoute = null
      this.restoreRouteOpacity()
    }
    const visibleElements = this.getVisibleElements()
    const items = this.providerRegistry.getItems(visibleElements)
    this.notify(items, true, this.selectedRoute)
  }

  notify(items, visible, selectedRoute) {
    this.onItemsChange(items, visible, selectedRoute)
  }

  getVisibleElements() {
    if (!this.map || !this.map.renderedElements) return []
    const registry = this.map.getRegistry ? this.map.getRegistry() : null
    if (!registry) return []
    const visibleIds = Array.from(this.map.renderedElements)
    return visibleIds.map(id => registry.get(id)).filter(Boolean)
  }

  handleLineClick(routeName, routeType) {
    if (this.selectedRoute && this.selectedRoute.name === routeName && this.selectedRoute.routeType === routeType) {
      this.selectedRoute = null
      this.restoreOriginalView()
    } else {
      this.selectedRoute = { name: routeName, routeType }
      this.filterByRoute(routeName, routeType)
    }
    this.update(this.currentView)
  }

  handleReset() {
    this.selectedRoute = null
    this.restoreOriginalView()
    this.update(null)
  }

  restoreRouteOpacity() {
    if (!this.map) return
    const registry = this.map.getRegistry ? this.map.getRegistry() : null
    if (!registry) return
    registry.getAllElements().forEach(element => {
      if (element.type === 'polyline' && element.leafletLayer) {
        const meta = element.metadata || {}
        const isTransportRoute = meta.category === 'metro_route' || meta.category === 'bus_route' || meta.category === 'tram_route' || meta.routeType
        if (isTransportRoute) element.leafletLayer.setStyle({ opacity: 0.8 })
      } else if (element.type === 'marker' && element.leafletLayer) {
        const meta = element.metadata || {}
        const isTransportStop = meta.category === 'metro_stop' || meta.category === 'bus_stop' || meta.category === 'tram_stop' || meta.routeType
        if (isTransportStop) element.leafletLayer.setOpacity(1.0)
      }
    })
  }

  restoreOriginalView() {
    if (!this.map) return
    const registry = this.map.getRegistry ? this.map.getRegistry() : null
    if (!registry) return
    registry.getAllElements().forEach(element => {
      if (element.type === 'polyline' && element.leafletLayer) {
        const meta = element.metadata || {}
        const isTransportRoute = meta.category === 'metro_route' || meta.category === 'bus_route' || meta.category === 'tram_route' || meta.routeType
        if (isTransportRoute) element.leafletLayer.setStyle({ opacity: 0.8 })
      } else if (element.type === 'marker' && element.leafletLayer) {
        const meta = element.metadata || {}
        const isTransportStop = meta.category === 'metro_stop' || meta.category === 'bus_stop' || meta.category === 'tram_stop' || meta.routeType
        if (isTransportStop) element.leafletLayer.setOpacity(1.0)
      }
    })
    if (this.currentView && this.currentView.district) {
      const districtElement = registry.get(this.currentView.district)
      if (districtElement && districtElement.onClick) districtElement.onClick(this.map)
    } else if (this.currentView && this.currentView.neighborhood) {
      const neighborhoodElement = registry.get(this.currentView.neighborhood)
      if (neighborhoodElement && neighborhoodElement.onClick) neighborhoodElement.onClick(this.map)
    }
  }

  filterByRoute(routeName, routeType) {
    if (!this.map) return
    const registry = this.map.getRegistry ? this.map.getRegistry() : null
    if (!registry) return
    const allElements = registry.getAllElements()
    let routePolylinesForBus = []
    if (routeType === '3') {
      allElements.forEach(element => {
        if (element.type !== 'polyline' || !element.coordinates || !Array.isArray(element.coordinates)) return
        const meta = element.metadata || {}
        const elementRouteName = meta.name || element.id
        if ((meta.category === 'bus_route' || meta.routeType === '3') && elementRouteName === routeName) routePolylinesForBus.push(element)
      })
    }
    const busStopProximityThreshold = 0.002
    allElements.forEach(element => {
      if (element.type === 'polyline' && element.leafletLayer) {
        const meta = element.metadata || {}
        const elementRouteType = meta.routeType
        const elementRouteName = meta.name || element.id
        const isTransportRoute = meta.category === 'metro_route' || meta.category === 'bus_route' || meta.category === 'tram_route' || elementRouteType
        if (isTransportRoute) {
          let isMatch = false
          if (routeType === '1' || routeType === '2') isMatch = (elementRouteType === '1' || elementRouteType === '2' || meta.category === 'metro_route') && elementRouteName === routeName
          else if (routeType === '3') isMatch = (elementRouteType === '3' || meta.category === 'bus_route') && elementRouteName === routeName
          else if (routeType === '0') isMatch = (elementRouteType === '0' || meta.category === 'tram_route') && elementRouteName === routeName
          if (isMatch) {
            element.leafletLayer.setStyle({ opacity: 0.9 })
            element.leafletLayer.bringToFront()
          } else {
            let sameType = false
            if (routeType === '1' || routeType === '2') sameType = (elementRouteType === '1' || elementRouteType === '2' || meta.category === 'metro_route')
            else if (routeType === '3') sameType = (elementRouteType === '3' || meta.category === 'bus_route')
            else if (routeType === '0') sameType = (elementRouteType === '0' || meta.category === 'tram_route')
            if (sameType) element.leafletLayer.setStyle({ opacity: 0.2 })
          }
        }
      } else if (element.type === 'marker' && element.leafletLayer) {
        const meta = element.metadata || {}
        const stopRouteNames = meta.routeNames || []
        const elementRouteType = meta.routeType
        const isTransportStop = meta.category === 'metro_stop' || meta.category === 'bus_stop' || meta.category === 'tram_stop' || elementRouteType
        if (isTransportStop) {
          let stopMatches = false
          for (let i = 0; i < stopRouteNames.length; i++) {
            if (stopRouteNames[i] === routeName) {
              if (routeType === '1' || routeType === '2') stopMatches = (elementRouteType === '1' || elementRouteType === '2' || meta.category === 'metro_stop')
              else if (routeType === '3') {
                if (elementRouteType === '3' || meta.category === 'bus_stop') {
                  if (routePolylinesForBus.length === 0) stopMatches = true
                  else if (element.coordinates && Array.isArray(element.coordinates) && element.coordinates.length >= 2) {
                    const stopLat = element.coordinates[0]
                    const stopLng = element.coordinates[1]
                    for (let r = 0; r < routePolylinesForBus.length; r++) {
                      if (distancePointToPolyline(stopLat, stopLng, routePolylinesForBus[r].coordinates) <= busStopProximityThreshold) {
                        stopMatches = true
                        break
                      }
                    }
                  }
                }
              } else if (routeType === '0') stopMatches = (elementRouteType === '0' || meta.category === 'tram_stop')
              break
            }
          }
          if (stopMatches) {
            element.leafletLayer.setOpacity(1.0)
            if (element.leafletLayer.bringToFront) element.leafletLayer.bringToFront()
          } else {
            let sameType = false
            if (routeType === '1' || routeType === '2') sameType = (elementRouteType === '1' || elementRouteType === '2' || meta.category === 'metro_stop')
            else if (routeType === '3') sameType = (elementRouteType === '3' || meta.category === 'bus_stop')
            else if (routeType === '0') sameType = (elementRouteType === '0' || meta.category === 'tram_stop')
            if (sameType) element.leafletLayer.setOpacity(0.2)
          }
        }
      }
    })
    if (routeType === '3' && routePolylinesForBus.length > 0 && this.map.zoomToFit) {
      this.map.zoomToFit(routePolylinesForBus.map(el => el.id), { padding: [80, 80], maxZoom: 15 })
    }
  }
}
