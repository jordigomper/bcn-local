class StopBicingElement extends MapElement {
  constructor(id, type, coordinates, metadata) {
    super(id, type, coordinates, metadata);
  }

  createLeafletLayer() {
    var icon = this.getIcon();
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
    return this.metadata.name || this.id;
  }

  getIcon() {
    return this.createIconFromPath(this.iconBasePath + 'Bicing.svg', this.iconWidth, this.iconHeight, 'transports-bicing-icon');
  }
}
