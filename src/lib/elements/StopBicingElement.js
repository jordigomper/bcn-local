import { MapElement } from '../core/MapElement.js'

export class StopBicingElement extends MapElement {
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
      marker.bindTooltip(tooltip, { permanent: false, direction: 'top', className: 'neighborhood-tooltip' })
    }
    return marker
  }

  getIcon() {
    return this.createIconFromPath(this.iconBasePath + 'Bicing.svg', this.iconWidth, this.iconHeight, 'transports-bicing-icon')
  }

  getTooltip() {
    return this.metadata.name || this.id
  }
}
