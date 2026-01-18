class NeighborhoodManager {
  constructor(map, registry) {
    this.map = map;
    this.registry = registry;
    this.hiddenDistricts = {};
    this.districtData = {};
    this.neighborhoodData = {};
    this.currentDistrictView = null;
    this.currentNeighborhoodView = null;

    this.loadHiddenDistricts();
    this.setupZoomListener();
  }

  setupZoomListener() {
    var self = this;
    this.map.on('zoomchange', function(data) {
      self.updateTransportLinesWeight();
      self.updateStopsVisibility();
    });
  }

  loadHiddenDistricts() {
    var raw = localStorage.getItem('bcn_hidden_districts');
    if (raw) {
      try {
        this.hiddenDistricts = JSON.parse(raw) || {};
      } catch (e) {
        this.hiddenDistricts = {};
      }
    }
  }

  saveHiddenDistricts() {
    localStorage.setItem('bcn_hidden_districts', JSON.stringify(this.hiddenDistricts));
  }

  renderNeighborhoods() {
    var neighborhoodsToShow = [];
    for (var name in this.neighborhoodData) {
      var neighborhood = this.neighborhoodData[name];
      var district = neighborhood.district || '';
      if (this.hiddenDistricts[district] === false) {
        neighborhoodsToShow.push(name);
      }
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

  toggleDistrictVisibility(districtCode) {
    if (this.hiddenDistricts[districtCode] === false) {
      this.hiddenDistricts[districtCode] = true;
    } else {
      this.hiddenDistricts[districtCode] = false;
    }
    this.saveHiddenDistricts();
    this.renderNeighborhoods();
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
    var zoom = this.map.getZoom();
    var shouldShowBus = zoom >= 15;
    var self = this;

    this.map.getAllElements().forEach(function(element) {
      if (element.type === 'marker' && element.metadata && element.metadata.category === 'bus_stop') {
        if (element.leafletLayer) {
          if (shouldShowBus && element.state.visible) {
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
