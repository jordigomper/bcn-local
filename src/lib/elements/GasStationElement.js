import { MapElement } from '../core/MapElement.js'

export class GasStationElement extends MapElement {
  createLeafletLayer() {
    return this.createMarker()
  }

  getIcon() {
    return this.createIconFromPath(this.iconBasePath + 'GasStation.svg', this.iconWidth, this.iconHeight, 'services-gas-station-icon')
  }

  createMarker() {
    const icon = this.getIcon()
    const marker = window.L.marker(this.coordinates, { icon })
    const self = this
    marker.gasStationElement = this
    marker.on('click', function() {
      self.onClick(window.mapInstance)
    })
    const tooltip = this.getTooltip()
    if (tooltip != null) {
      marker.bindTooltip(tooltip, { permanent: false, direction: 'top', className: 'neighborhood-tooltip' })
    }
    return marker
  }

  getTooltip() {
    return this.metadata.name || this.id
  }
}
