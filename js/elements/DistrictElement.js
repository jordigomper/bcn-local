class DistrictElement extends MapElement {
  constructor(id, type, coordinates, metadata) {
    super(id, type, coordinates, metadata);
    this.overlayLayer = null;
  }

  createLeafletLayer() {
    return null;
  }

  onClick(map) {
    if (!map) return;

    var self = this;
    var registry = map.getRegistry ? map.getRegistry() : null;
    if (!registry) return;

    var allDistrictElements = registry.getAllElements().filter(function(el) {
      return el instanceof DistrictElement;
    });

    allDistrictElements.forEach(function(element) {
      if (element.overlayLayer) {
        map.removeOverlayLayer(element.overlayLayer);
        element.overlayLayer = null;
      }
    });

    var allNeighborhoodElements = registry.getAllElements().filter(function(el) {
      return el instanceof NeighborhoodElement;
    });

    allNeighborhoodElements.forEach(function(element) {
      if (element.overlayLayer) {
        map.removeOverlayLayer(element.overlayLayer);
        element.overlayLayer = null;
      }
    });

    var coords = Array.isArray(this.coordinates[0][0]) ? this.coordinates : [this.coordinates];

    this.overlayLayer = L.polygon(coords, {
      color: '#000000',
      fillColor: 'transparent',
      fillOpacity: 0,
      weight: 4,
      opacity: 1,
      className: 'district-border',
      pane: 'overlayPane'
    });

    map.addOverlayLayer(this.overlayLayer);

    var bounds = this.overlayLayer.getBounds();
    map.leafletMap.fitBounds(bounds, {
      padding: [100, 100],
      maxZoom: 15
    });

    var neighborhoodManager = map.neighborhoodManager || null;
    if (!neighborhoodManager) return;

    var districtData = neighborhoodManager.districtData;
    var district = districtData[this.id];
    if (!district) return;

    var districtPolygon = district.latLngs || district.polygons;
    if (!districtPolygon) return;

    var outerRing = Array.isArray(districtPolygon[0][0]) ? districtPolygon[0] : districtPolygon;

    var gasolineras = registry.getByCategory('gasolinera');
    var metroRoutes = registry.getByCategory('metro_route');
    var metroStops = registry.getByCategory('metro_stop');

    var filteredIds = [];

    var filteredGasolineras = filterElementsByPolygon(gasolineras, outerRing);
    filteredGasolineras.forEach(function(el) { filteredIds.push(el.id); });

    var filteredMetroRoutes = filterElementsByPolygon(metroRoutes, outerRing);
    filteredMetroRoutes.forEach(function(el) { filteredIds.push(el.id); });

    var filteredMetroStops = filterElementsByPolygon(metroStops, outerRing);
    filteredMetroStops.forEach(function(el) { filteredIds.push(el.id); });

    if (neighborhoodManager) {
      neighborhoodManager.setCurrentView(this.id, null);
    }

    var neighborhoodsToShow = [];
    for (var nName in neighborhoodManager.neighborhoodData) {
      neighborhoodsToShow.push(nName);
    }

    neighborhoodsToShow.forEach(function(nName) {
      var element = registry.get(nName);
      if (element) {
        element.updateState({ selected: false });
        if (element.leafletLayer) {
          map.leafletMap.removeLayer(element.leafletLayer);
          element.leafletLayer = null;
        }
        map.renderElement(nName);
      }
    });

    map.renderElements(filteredIds);

    if (map.districtsListManager) {
      map.districtsListManager.setActiveDistrict(this.id);
    }

    if (window.updateResetButtonVisibility) {
      window.updateResetButtonVisibility();
      setTimeout(function() {
        window.updateResetButtonVisibility();
      }, 200);
    }
  }

  getTooltip() {
    return this.metadata.name || this.id;
  }
}
