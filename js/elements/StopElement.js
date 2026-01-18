class StopElement extends MapElement {
  constructor(id, type, coordinates, metadata) {
    super(id, type, coordinates, metadata);
    this.routeType = metadata.routeType || '1';
  }

  createLeafletLayer() {
    var icon = buildStopIcon(this.routeType);

    var marker = L.marker(this.coordinates, { icon: icon });

    var self = this;
    marker.stopElement = this;
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
    return this.metadata.name || 'Parada';
  }
}
