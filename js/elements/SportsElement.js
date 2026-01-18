class SportsElement extends MapElement {
  constructor(id, type, coordinates, metadata) {
    super(id, type, coordinates, metadata);
  }

  createLeafletLayer() {
    var marker = L.circleMarker(this.coordinates, {
      radius: 4,
      color: '#1565c0',
      weight: 1,
      opacity: 0.6,
      fillColor: '#64b5f6',
      fillOpacity: 0.4
    });

    var self = this;
    marker.sportsElement = this;
    marker.on('click', function() {
      self.onClick(window.mapInstance);
    });

    var tooltip = this.getTooltip();
    if (tooltip != null) {
      marker.bindTooltip(tooltip, {
        permanent: false,
        direction: 'top',
        className: 'neighborhood-tooltip'
      });
    }

    return marker;
  }

  onClick(map) {
    return null;
  }

  getTooltip() {
    return this.metadata.name || 'Servicio deportivo';
  }
}
