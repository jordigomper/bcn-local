class AppMap extends Map {
  constructor(containerId, options) {
    super(containerId, options);
    this.registry = new ElementRegistry();
    this.filterManager = null;
    this.legendManager = null;
    this.neighborhoodManager = null;
  }

  resetView() {
    var registry = this.registry;

    if (registry) {
      var allElements = registry.getAllElements();
      allElements.forEach(function(element) {
        if (element.overlayLayer) {
          this.removeOverlayLayer(element.overlayLayer);
          element.overlayLayer = null;
        }
        if (element.busRoutesOverlay) {
          this.removeOverlayLayer(element.busRoutesOverlay);
          element.busRoutesOverlay = null;
        }
      }.bind(this));
    }

    this.clear();

    var initialView = this.getInitialView();
    if (this.leafletMap) {
      this.leafletMap.stop();
      this.leafletMap.setView(initialView.center, initialView.zoom, {
        animate: false
      });
    }
  }

  getRegistry() {
    return this.registry;
  }
}
