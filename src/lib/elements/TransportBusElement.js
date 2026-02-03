import { MapElement } from '../core/MapElement.js'
import { getRouteTypeName } from '../utils/icons.js'

export class TransportBusElement extends MapElement {
  createLeafletLayer() {
    const currentZoom = (typeof window !== 'undefined' && window.mapInstance) ? window.mapInstance.getZoom() : 13
    const baseWeight = (currentZoom >= 12.5 && currentZoom <= 14.5) ? 2 : 4
    const weight = baseWeight / 2
    const color = this.metadata.color || '#000000'
    const polyline = window.L.polyline(this.coordinates, {
      color,
      weight,
      opacity: 0.8
    })
    polyline._gtfsWeight = weight
    polyline._gtfsRouteType = '3'
    polyline.transportElement = this
    const defaultRoute = (typeof window !== 'undefined' && window.I18n) ? window.I18n.t('ruta') : 'Route'
    const routeName = this.metadata.name || defaultRoute
    polyline.bindTooltip(routeName + ' - ' + getRouteTypeName('3'), {
      permanent: false,
      direction: 'top',
      className: 'neighborhood-tooltip'
    })
    return polyline
  }

  getTooltip() {
    return this.metadata.name || this.id
  }
}
