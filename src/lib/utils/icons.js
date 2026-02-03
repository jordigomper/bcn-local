import { distancePointToPolyline } from './geometry.js'

const ICON_BASE_PATH = '/js/components/icons/'

export function getIconPathForCategory(category) {
  const map = {
    bicing: ICON_BASE_PATH + 'Bicing.svg',
    metro: ICON_BASE_PATH + 'StopMetro.svg',
    tram: ICON_BASE_PATH + 'StopTram.svg',
    bus: ICON_BASE_PATH + 'StopBus.svg',
    gasStation: ICON_BASE_PATH + 'GasStation.svg',
    gym: ICON_BASE_PATH + 'Sports.svg'
  }
  return map[category] || null
}

export function getIconSizeForLegend(category) {
  return [20, 20]
}

export function getRouteTypeName(routeType) {
  if (typeof window !== 'undefined' && window.I18n) {
    const typeKeys = {
      '0': 'tranvia', '1': 'metro', '2': 'tren', '3': 'bus', '4': 'ferry',
      '5': 'teleferico', '6': 'gondola', '7': 'funicular'
    }
    const key = typeKeys[routeType] || 'transport'
    return window.I18n.t(key)
  }
  const types = {
    '0': 'Tram', '1': 'Metro', '2': 'Train', '3': 'Bus', '4': 'Ferry',
    '5': 'Cable Car', '6': 'Gondola', '7': 'Funicular'
  }
  return types[routeType] || 'Transport'
}

export function getStopRouteType(stopId, routes) {
  if (!stopId || !routes) return '1'
  const stopParts = stopId.split('.')
  if (stopParts.length < 2) return '1'
  const routePrefix = stopParts[0] + '.' + stopParts[1]
  for (let i = 0; i < routes.length; i++) {
    const route = routes[i]
    const routeId = route.id || route.routeId
    if (routeId && routeId.startsWith(routePrefix)) {
      const meta = route.metadata || {}
      return meta.routeType || route.type || '1'
    }
  }
  return '1'
}

export function getStopRouteNames(stopId, routes, stopCoordinates) {
  if (!stopId || !routes || !Array.isArray(routes)) return []
  const stopParts = stopId.split('.')
  if (stopParts.length < 2) return []
  const routeNames = []
  const seenNames = {}
  if (stopParts.length === 2) {
    const firstDigit = stopParts[1] && stopParts[1].length > 0 ? stopParts[1][0] : '1'
    const routePrefix = stopParts[0] + '.' + firstDigit
    for (let i = 0; i < routes.length; i++) {
      const route = routes[i]
      const routeId = route.id || route.routeId
      if (routeId && routeId.startsWith(routePrefix + '.')) {
        const meta = route.metadata || {}
        const routeName = meta.name || routeId
        if (routeName && !seenNames[routeName]) {
          routeNames.push(routeName)
          seenNames[routeName] = true
        }
      }
    }
  } else if (stopParts.length === 3 && stopCoordinates) {
    const stopLat = stopCoordinates[0]
    const stopLng = stopCoordinates[1]
    const threshold = 0.001
    for (let i = 0; i < routes.length; i++) {
      const route = routes[i]
      if (!route.coordinates || !Array.isArray(route.coordinates)) continue
      let routePassesNear = false
      const step = Math.max(1, Math.floor(route.coordinates.length / Math.min(route.coordinates.length, 100)))
      for (let j = 0; j < route.coordinates.length; j += step) {
        const coord = route.coordinates[j]
        if (Array.isArray(coord) && coord.length >= 2) {
          if (Math.abs(coord[0] - stopLat) < threshold && Math.abs(coord[1] - stopLng) < threshold) {
            routePassesNear = true
            break
          }
        }
      }
      if (routePassesNear) {
        const meta = route.metadata || {}
        const routeName = meta.name || route.id
        if (routeName && !seenNames[routeName]) {
          routeNames.push(routeName)
          seenNames[routeName] = true
        }
      }
    }
  }
  return routeNames.sort()
}

export function getStopsForRoutes(routes, allStops) {
  if (!routes || !Array.isArray(routes) || routes.length === 0 || !allStops || !Array.isArray(allStops)) return []
  const matchingStops = []
  const seenStopIds = {}
  const threshold = 0.002
  allStops.forEach(function(stop) {
    if (seenStopIds[stop.id]) return
    if (!stop.coordinates || !Array.isArray(stop.coordinates) || stop.coordinates.length < 2) return
    const stopLat = stop.coordinates[0]
    const stopLng = stop.coordinates[1]
    const stopRouteNames = stop.metadata && stop.metadata.routeNames ? stop.metadata.routeNames : []
    let stopMatches = false
    for (let j = 0; j < routes.length; j++) {
      const route = routes[j]
      if (!route.coordinates || !Array.isArray(route.coordinates)) continue
      const routeName = (route.metadata && route.metadata.name) || route.id
      const hasMatchingName = stopRouteNames.indexOf(routeName) !== -1
      if (!hasMatchingName) continue
      const dist = distancePointToPolyline(stopLat, stopLng, route.coordinates)
      let routePassesNear = dist <= threshold
      if (!routePassesNear) {
        const step = Math.max(1, Math.floor(route.coordinates.length / 100))
        for (let k = 0; k < route.coordinates.length; k += step) {
          const coord = route.coordinates[k]
          if (Array.isArray(coord) && coord.length >= 2 &&
              Math.abs(coord[0] - stopLat) < threshold && Math.abs(coord[1] - stopLng) < threshold) {
            routePassesNear = true
            break
          }
        }
      }
      if (hasMatchingName && routePassesNear) {
        stopMatches = true
        break
      }
    }
    if (stopMatches) {
      matchingStops.push(stop)
      seenStopIds[stop.id] = true
    }
  })
  return matchingStops
}
