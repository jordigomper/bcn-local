class NeighborhoodManager {
  constructor(map, registry) {
    this.map = map;
    this.registry = registry;
    this.districtData = {};
    this.neighborhoodData = {};
    this.currentDistrictView = null;
    this.currentNeighborhoodView = null;

    this.setupZoomListener();
  }

  setupZoomListener() {
    var self = this;
    this.map.on('zoomchange', function(data) {
      self.updateTransportLinesWeight();
      self.updateStopsVisibility();
    });
  }

  renderNeighborhoods() {
    var neighborhoodsToShow = [];
    for (var name in this.neighborhoodData) {
      neighborhoodsToShow.push(name);
    }

    var self = this;
    neighborhoodsToShow.forEach(function(name) {
      var element = self.registry.get(name);
      if (element) {
        var isSelected = self.currentNeighborhoodView === name;
        element.updateState({ selected: isSelected });
      }
    });

    this.map.addPersistentElements(neighborhoodsToShow);
  }

  toggleDistrictVisibility() {
  }

  updateTransportLinesWeight() {
    var zoom = this.map.getZoom();
    var baseWeight = (zoom >= 12.5 && zoom <= 14.5) ? 2 : 4;
    var self = this;

    this.map.getAllElements().forEach(function(element) {
      if (element.type === 'polyline' && element.leafletLayer) {
        var routeType = element.metadata ? element.metadata.routeType : null;
        var isBus = routeType === '3' || (element.metadata && element.metadata.category === 'bus_route');
        var newWeight = isBus ? baseWeight / 2 : baseWeight;

        if (element.leafletLayer._gtfsWeight !== newWeight) {
          element.leafletLayer.setStyle({ weight: newWeight });
          element.leafletLayer._gtfsWeight = newWeight;
        }
      }
    });
  }

  updateStopsVisibility() {
    var self = this;

    this.map.getAllElements().forEach(function(element) {
      if (element.type === 'marker' && element.metadata && element.metadata.category === 'bus_stop') {
        if (element.leafletLayer) {
          if (element.state.visible) {
            if (!self.map.leafletMap.hasLayer(element.leafletLayer)) {
              element.leafletLayer.addTo(self.map.leafletMap);
            }
          } else {
            if (self.map.leafletMap.hasLayer(element.leafletLayer)) {
              self.map.leafletMap.removeLayer(element.leafletLayer);
            }
          }
        }
      }
    });
  }

  setCurrentView(districtCode, neighborhoodName) {
    this.currentDistrictView = districtCode;
    this.currentNeighborhoodView = neighborhoodName;
  }

  getCurrentView() {
    return {
      district: this.currentDistrictView,
      neighborhood: this.currentNeighborhoodView
    };
  }
}
