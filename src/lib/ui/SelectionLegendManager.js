import { getIconPathForCategory, getIconSizeForLegend } from '../utils/icons.js'
import { distancePointToPolyline } from '../utils/geometry.js'

export class SelectionLegendManager {
  constructor(map) {
    this.map = map
    this.container = document.getElementById('selection-legend')
    this.content = document.getElementById('selection-legend-content')
    this.resetButton = document.getElementById('selection-legend-reset-button')
    this.currentView = null
    this.selectedRoute = null
    this.setupResetButton()
  }

  setupResetButton() {
    if (this.resetButton) {
      this.resetButton.addEventListener('click', () => {
        if (window.resetMapView) window.resetMapView()
      })
    }
  }

  update(view) {
    const previousView = this.currentView
    this.currentView = view
    if (!view || (!view.district && !view.neighborhood && !view.filterBus)) {
      this.hide()
      this.selectedRoute = null
      return
    }
    const viewChanged = !previousView || previousView.district !== view.district || previousView.neighborhood !== view.neighborhood
    if (viewChanged && this.selectedRoute) {
      this.selectedRoute = null
      this.restoreRouteOpacity()
    }
    this.show()
    this.render()
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

  show() {
    if (this.container) this.container.style.display = 'block'
    if (this.resetButton) {
      this.resetButton.style.display = 'flex'
      setTimeout(() => this.updateResetButtonPosition(), 200)
    }
  }

  hide() {
    if (this.container) this.container.style.display = 'none'
    if (this.resetButton) this.resetButton.style.display = 'none'
  }

  updateResetButtonPosition() {
    if (!this.resetButton || !this.container) return
    setTimeout(() => {
      if (!this.resetButton || !this.container) return
      const containerRect = this.container.getBoundingClientRect()
      const bottomPosition = window.innerHeight - containerRect.top + 10
      this.resetButton.style.bottom = bottomPosition + 'px'
      this.resetButton.style.right = '20px'
    }, 150)
  }

  render() {
    if (!this.content || !this.map) return
    const registry = this.map.getRegistry ? this.map.getRegistry() : null
    if (!registry) return
    const visibleElements = this.getVisibleElements(registry)
    let html = ''
    if (this.hasCategoryElements(visibleElements, 'bicing')) html += this.renderTransportIcon('bicing', 'bicing', visibleElements)
    if (this.hasCategoryElements(visibleElements, 'gasStation')) html += this.renderTransportIcon('gasStation', 'gasolineras', visibleElements)
    if (this.hasCategoryElements(visibleElements, 'gym')) html += this.renderTransportIcon('gym', 'gimnasios', visibleElements)
    if (this.hasCategoryElements(visibleElements, 'metro')) html += this.renderTransportIcon('metro', 'metroTren', visibleElements, '1')
    if (this.hasCategoryElements(visibleElements, 'tram')) html += this.renderTransportIcon('tram', 'tranvia', visibleElements, '0')
    if (this.hasCategoryElements(visibleElements, 'bus')) html += this.renderTransportIcon('bus', 'bus', visibleElements, '3')
    this.content.innerHTML = html
    this.updateTranslations()
    this.setupLineClickHandlers()
    if (this.resetButton) setTimeout(() => this.updateResetButtonPosition(), 200)
  }

  setupLineClickHandlers() {
    const lineElements = this.content.querySelectorAll('.selection-legend-line')
    lineElements.forEach(lineEl => {
      lineEl.style.cursor = 'pointer'
      lineEl.addEventListener('click', (e) => {
        e.stopPropagation()
        const routeName = lineEl.getAttribute('data-route-name')
        const routeType = lineEl.getAttribute('data-route-type')
        if (this.selectedRoute && this.selectedRoute.name === routeName && this.selectedRoute.routeType === routeType) {
          this.selectedRoute = null
          this.restoreOriginalView()
        } else {
          this.selectedRoute = { name: routeName, routeType }
          this.filterByRoute(routeName, routeType)
        }
        this.render()
      })
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

  hasCategoryElements(visibleElements, category) {
    if (!visibleElements || visibleElements.length === 0) return false
    for (let i = 0; i < visibleElements.length; i++) {
      const element = visibleElements[i]
      const meta = element.metadata || {}
      if (category === 'bicing' && meta.category === 'bicing') return true
      if (category === 'metro' && (meta.routeType === '1' || meta.routeType === '2' || meta.category === 'metro_route' || meta.category === 'metro_stop')) return true
      if (category === 'tram' && (meta.routeType === '0' || meta.category === 'tram_route')) return true
      if (category === 'bus' && (meta.routeType === '3' || meta.category === 'bus_route' || meta.category === 'bus_stop')) return true
      if (category === 'gasStation' && meta.category === 'gasStation') return true
      if (category === 'gym' && meta.category === 'sports' && (meta.typologies || []).indexOf('Gimnasos') !== -1) return true
    }
    return false
  }

  renderTransportIcon(category, i18nKey, visibleElements, routeType) {
    const iconHtml = this.getIconHtml(category)
    const label = (typeof window !== 'undefined' && window.I18n) ? window.I18n.t(i18nKey) : i18nKey
    let lines = routeType !== undefined ? this.getVisibleRouteLines(visibleElements, routeType) : []
    let linesHtml = ''
    if (lines.length > 0) {
      linesHtml = '<div class="selection-legend-lines">'
      lines.forEach(line => {
        const lineName = line.name || line
        const displayName = line.displayName || lineName
        const lineColor = line.color || '#333'
        const isSelected = this.selectedRoute && this.selectedRoute.name === lineName && this.selectedRoute.routeType === routeType
        let style = 'background: ' + lineColor + '; color: #fff; border-color: ' + lineColor + ';'
        if (isSelected) style += ' box-shadow: 0 0 0 2px rgba(0,0,0,0.3); font-weight: 600;'
        const dataAttr = 'data-route-name="' + lineName + '" data-route-type="' + (routeType || '') + '"'
        linesHtml += '<span class="selection-legend-line' + (isSelected ? ' selected' : '') + '" style="' + style + '" ' + dataAttr + '>' + displayName + '</span>'
      })
      linesHtml += '</div>'
    }
    return '<div class="selection-legend-item"><span class="selection-legend-icon">' + iconHtml + '</span><span>' + label + '</span>' + linesHtml + '</div>'
  }

  getIconHtml(category) {
    const path = getIconPathForCategory(category)
    if (!path) return ''
    const size = getIconSizeForLegend(category)
    return '<img src="' + path + '" width="' + size[0] + '" height="' + size[1] + '" alt="">'
  }

  getVisibleElements(registry) {
    if (!this.map || !this.map.renderedElements) return []
    const visibleIds = Array.from(this.map.renderedElements)
    return visibleIds.map(id => registry.get(id)).filter(Boolean)
  }

  getVisibleRouteLines(visibleElements, routeType) {
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
          lines.push({ name: routeName, displayName, color: meta.color || '#333' })
          seenNames[routeName] = true
        }
      }
    })
    return lines.sort((a, b) => a.name.localeCompare(b.name))
  }

  updateTranslations() {
    if (typeof window === 'undefined' || !window.I18n) return
    this.container.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n')
      if (key) el.textContent = window.I18n.t(key)
    })
    this.container.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title')
      if (key) el.setAttribute('title', window.I18n.t(key))
    })
  }
}
