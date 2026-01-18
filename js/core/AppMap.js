class AppMap extends Map {
  constructor(containerId, options) {
    super(containerId, options);
    this.registry = new ElementRegistry();
    this.filterManager = null;
    this.legendManager = null;
    this.neighborhoodManager = null;
  }

  resetView() {
    if (this.neighborhoodManager) {
      this.neighborhoodManager.setCurrentView(null, null);
      this.neighborhoodManager.renderNeighborhoods();
    }
    this.clear();
    if (this.legendManager) {
      this.legendManager.setActiveDistrict(null);
      this.legendManager.setActiveNeighborhood(null);
    }
  }

  getRegistry() {
    return this.registry;
  }

  getNeighborhoodManager() {
    return this.neighborhoodManager;
  }

  updateLegend(districtCode, neighborhoodName) {
    if (this.legendManager) {
      if (districtCode) {
        this.legendManager.setActiveDistrict(districtCode);
      } else if (neighborhoodName) {
        this.legendManager.setActiveNeighborhood(neighborhoodName);
      }
    }
  }
}
