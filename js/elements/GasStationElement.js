class GasStationElement extends MapElement {
  constructor(id, type, coordinates, metadata) {
    super(id, type, coordinates, metadata);
  }

  createLeafletLayer() {
    return this.createMarker();
  }

  getIcon() {
    return this.createIconFromPath(this.iconBasePath + 'GasStation.svg', this.iconWidth, this.iconHeight, 'services-gas-station-icon');
  }

  createMarker() {
    var icon = this.getIcon();
    var marker = L.marker(this.coordinates, { icon: icon });
    var self = this;
    marker.gasStationElement = this;
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
}
