import { getIconPathForCategory, getIconSizeForLegend } from '../utils/icons.js'
import { LegendProviderRegistry } from './LegendProviderRegistry.js'

function hasCategory(visibleElements, predicate) {
  if (!visibleElements || visibleElements.length === 0) return false
  for (let i = 0; i < visibleElements.length; i++) {
    const meta = visibleElements[i].metadata || {}
    if (predicate(meta)) return true
  }
  return false
}

function getVisibleRouteLines(visibleElements, routeType) {
  const lines = []
  const seenNames = {}
  visibleElements.forEach(element => {
    if (element.type !== 'polyline') return
    const meta = element.metadata || {}
    const elementRouteType = meta.routeType
    let isMatch = false
    if (routeType === '1' || routeType === '2') isMatch = (elementRouteType === '1' || elementRouteType === '2' || meta.category === 'metro_route')
    else if (routeType === '3') isMatch = (elementRouteType === '3' || meta.category === 'bus_route')
    else if (routeType === '0') isMatch = (elementRouteType === '0' || meta.category === 'tram_route')
    if (isMatch) {
      const routeName = meta.name || element.id
      if (routeName && !seenNames[routeName]) {
        const displayName = routeName.length > 15 ? routeName.substring(0, 12) + '...' : routeName
        lines.push({ name: routeName, displayName, color: meta.color || '#333', routeType })
        seenNames[routeName] = true
      }
    }
  })
  return lines.sort((a, b) => a.name.localeCompare(b.name))
}

export function registerDefaultLegendProviders(registry) {
  if (!(registry instanceof LegendProviderRegistry)) return

  registry.register('bicing', (visibleElements) => {
    if (!hasCategory(visibleElements, m => m.category === 'bicing')) return null
    const iconPath = getIconPathForCategory('bicing')
    const iconSize = getIconSizeForLegend('bicing')
    return { labelKey: 'bicing', iconPath, iconSize }
  })

  registry.register('gasStation', (visibleElements) => {
    if (!hasCategory(visibleElements, m => m.category === 'gasStation')) return null
    const iconPath = getIconPathForCategory('gasStation')
    const iconSize = getIconSizeForLegend('gasStation')
    return { labelKey: 'gasolineras', iconPath, iconSize }
  })

  registry.register('gym', (visibleElements) => {
    if (!hasCategory(visibleElements, m => m.category === 'sports' && (m.typologies || []).indexOf('Gimnasos') !== -1)) return null
    const iconPath = getIconPathForCategory('gym')
    const iconSize = getIconSizeForLegend('gym')
    return { labelKey: 'gimnasios', iconPath, iconSize }
  })

  registry.register('metro', (visibleElements) => {
    if (!hasCategory(visibleElements, m => m.routeType === '1' || m.routeType === '2' || m.category === 'metro_route' || m.category === 'metro_stop')) return null
    const iconPath = getIconPathForCategory('metro')
    const iconSize = getIconSizeForLegend('metro')
    const lines = getVisibleRouteLines(visibleElements, '1').map(l => ({ ...l, routeType: '1' }))
    return { labelKey: 'metroTren', iconPath, iconSize, lines: lines.length ? lines : null, routeType: '1' }
  })

  registry.register('tram', (visibleElements) => {
    if (!hasCategory(visibleElements, m => m.routeType === '0' || m.category === 'tram_route')) return null
    const iconPath = getIconPathForCategory('tram')
    const iconSize = getIconSizeForLegend('tram')
    const lines = getVisibleRouteLines(visibleElements, '0')
    return { labelKey: 'tranvia', iconPath, iconSize, lines: lines.length ? lines.map(l => ({ ...l, routeType: '0' })) : null, routeType: '0' }
  })

  registry.register('bus', (visibleElements) => {
    if (!hasCategory(visibleElements, m => m.routeType === '3' || m.category === 'bus_route' || m.category === 'bus_stop')) return null
    const iconPath = getIconPathForCategory('bus')
    const iconSize = getIconSizeForLegend('bus')
    const lines = getVisibleRouteLines(visibleElements, '3').map(l => ({ ...l, routeType: '3' }))
    return { labelKey: 'bus', iconPath, iconSize, lines: lines.length ? lines : null, routeType: '3' }
  })
}
