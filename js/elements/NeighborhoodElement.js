class NeighborhoodElement extends MapElement {
  constructor(id, type, coordinates, metadata) {
    super(id, type, coordinates, metadata);
    this.color = (metadata && metadata.color) ? metadata.color : '#FF6B6B';
    this.overlayLayer = null;
  }

  createLeafletLayer() {
    var coords = Array.isArray(this.coordinates[0][0]) ? this.coordinates : [this.coordinates];
    var isSelected = this.state.selected;
    var opacity = this.getOpacity();
    var weight = isSelected ? 4 : 0;
    var dashArray = isSelected ? null : null;

    var polygon = L.polygon(coords, {
      color: this.color,
      fillColor: this.color,
      fillOpacity: opacity,
      weight: weight,
      opacity: isSelected ? 0.9 : 0,
      dashArray: dashArray,
      className: 'neighborhood-polygon',
      interactive: true
    });

    var self = this;
    polygon.neighborhoodElement = this;
    polygon.on('click', function(e) {
      e.originalEvent.stopPropagation();
      self.onClick(window.mapInstance);
    });

    var tooltip = this.getTooltip();
    if (tooltip != null) {
      polygon.bindTooltip(tooltip, {
        permanent: false,
        direction: 'center',
        className: 'neighborhood-tooltip'
      });
    }

    return polygon;
  }

  onClick(map) {
    if (!map) return;

    var self = this;
    var registry = map.getRegistry ? map.getRegistry() : null;
    if (!registry) return;

    var name = this.metadata.name || this.id;

    var neighborhoodManager = map.getNeighborhoodManager ? map.getNeighborhoodManager() : null;
    if (!neighborhoodManager) return;

    var allNeighborhoodElements = registry.getAllElements().filter(function(el) {
      return el instanceof NeighborhoodElement;
    });

    allNeighborhoodElements.forEach(function(element) {
      if (element.overlayLayer) {
        map.removeOverlayLayer(element.overlayLayer);
        element.overlayLayer = null;
      }
    });

    var allDistrictElements = registry.getAllElements().filter(function(el) {
      return el instanceof DistrictElement;
    });

    allDistrictElements.forEach(function(element) {
      if (element.overlayLayer) {
        map.removeOverlayLayer(element.overlayLayer);
        element.overlayLayer = null;
      }
    });

    var neighborhoodData = neighborhoodManager.neighborhoodData;
    var neighborhood = neighborhoodData[name];
    if (!neighborhood) return;

    var neighborhoodPolygon = neighborhood.latLngs || neighborhood.coordinates;
    if (!neighborhoodPolygon) return;

    var coords = Array.isArray(neighborhoodPolygon[0][0]) ? neighborhoodPolygon : [neighborhoodPolygon];

    this.overlayLayer = L.polygon(coords, {
      color: '#000000',
      fillColor: 'transparent',
      fillOpacity: 0,
      weight: 4,
      opacity: 1,
      className: 'neighborhood-border',
      pane: 'overlayPane',
      interactive: false
    });

    map.addOverlayLayer(this.overlayLayer);

    setTimeout(function() {
      if (self.overlayLayer && self.overlayLayer.bringToFront) {
        self.overlayLayer.bringToFront();
      }
    }, 100);

    var bounds = this.overlayLayer.getBounds();
    map.leafletMap.fitBounds(bounds, {
      padding: [150, 150],
      maxZoom: 16
    });

    var outerRing = Array.isArray(neighborhoodPolygon[0][0]) ? neighborhoodPolygon[0] : neighborhoodPolygon;

    neighborhoodManager.setCurrentView(null, name);

    var neighborhoodsToShow = [];
    for (var nName in neighborhoodData) {
      var nData = neighborhoodData[nName];
      var nDistrict = nData.district || '';
      if (!neighborhoodManager.hiddenDistricts[nDistrict]) {
        neighborhoodsToShow.push(nName);
      }
    }

    neighborhoodsToShow.forEach(function(nName) {
      var element = registry.get(nName);
      if (element) {
        var isSelected = nName === name;
        element.updateState({ selected: isSelected });
      }
    });

    var allElements = registry.getAllElements();
    var filteredElements = filterElementsByPolygon(allElements, outerRing);
    var filteredIds = filteredElements.map(function(el) { return el.id; });

    map.renderElements(filteredIds);

    if (map.updateLegend) {
      map.updateLegend(null, name);
    }
    
    if (window.updateResetButtonVisibility) {
      window.updateResetButtonVisibility();
      setTimeout(function() {
        window.updateResetButtonVisibility();
      }, 200);
    }
  }

  onStateChange(oldState, newState) {
    if (oldState.selected !== newState.selected) {
      this.onSelectedChange(newState.selected);
    }
  }

  onSelectedChange(isSelected) {
    if (!this.leafletLayer) return;

    var opacity = this.getOpacity();
    var weight = isSelected ? 4 : 0;

    this.leafletLayer.setStyle({
      fillOpacity: opacity,
      weight: weight,
      opacity: isSelected ? 0.9 : 0
    });
  }

  getTooltip() {
    if (this.state.selected) return;
    return this.metadata.name || this.id;
  }

  getOpacity() {
    return this.state.selected ? 0 : 0.12;
  }

}
