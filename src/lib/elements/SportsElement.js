import { MapElement } from '../core/MapElement.js'

export class SportsElement extends MapElement {
  createLeafletLayer() {
    const icon = this.getIcon()
    const marker = window.L.marker(this.coordinates, { icon })
    const self = this
    marker.sportsElement = this
    marker.on('click', function() {
      self.onClick(window.mapInstance)
    })
    const tooltip = this.getTooltip()
    if (tooltip != null) {
      marker.bindTooltip(tooltip, { permanent: false, direction: 'top', className: 'neighborhood-tooltip' })
    }
    return marker
  }

  onClick(map) {
    if (this.metadata && this.metadata.url) window.open(this.metadata.url, '_blank')
    return null
  }

  getTooltip() {
    const defaultName = (typeof window !== 'undefined' && window.I18n) ? window.I18n.t('servicioDeportivo') : 'Sports service'
    const name = this.metadata.name || defaultName
    const hasUrl = this.metadata && this.metadata.url
    if (hasUrl) {
      const clickText = (typeof window !== 'undefined' && window.I18n) ? window.I18n.t('hazClickParaIrALaWeb') : 'Click to visit website'
      return name + '<br><small style="color: #2196F3;">' + clickText + '</small>'
    }
    return name
  }

  getIcon() {
    const hasUrl = this.metadata && this.metadata.url
    const size = hasUrl ? this.iconWidth - 2 : this.iconWidth
    const className = 'leaflet-div-icon services-sports-icon' + (hasUrl ? ' services-sports-icon--with-link' : '')
    return this.createIconFromPath(this.iconBasePath + 'Sports.svg', size, size, className)
  }
}
