import { MapElement } from '../core/MapElement.js'

export class StopMetroElement extends MapElement {
  constructor(id, type, coordinates, metadata) {
    super(id, type, coordinates, metadata)
    this.routeType = metadata.routeType || '1'
  }

  getIcon() {
    return this.createIconFromPath(this.iconBasePath + 'StopMetro.svg', this.iconWidth, this.iconHeight, 'transports-stop-metro-icon')
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
