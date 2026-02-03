import { BaseMap } from './BaseMap.js'
import { ElementRegistry } from '../registry/ElementRegistry.js'

export class AppMap extends BaseMap {
  constructor(containerIdOrElement, options) {
    super(containerIdOrElement, options)
    this.registry = new ElementRegistry()
    this.filterManager = null
    this.districtsListManager = null
    this.neighborhoodManager = null
  }

  resetView() {
    if (this.registry) {
      this.registry.getAllElements().forEach(element => {
        if (element.overlayLayer) {
          this.removeOverlayLayer(element.overlayLayer)
          element.overlayLayer = null
        }
        if (element.busRoutesOverlay) {
          this.removeOverlayLayer(element.busRoutesOverlay)
          element.busRoutesOverlay = null
        }
      })
    }
    this.clear()
    const initialView = this.getInitialView()
    if (this.leafletMap) {
      this.leafletMap.stop()
      this.leafletMap.setView(initialView.center, initialView.zoom, { animate: false })
    }
  }

  getRegistry() {
    return this.registry
  }
}
