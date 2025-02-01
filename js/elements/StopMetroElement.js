class StopMetroElement extends MapElement {
  constructor(id, type, coordinates, metadata) {
    super(id, type, coordinates, metadata);
    this.routeType = metadata.routeType || '1';
  }

  getIcon() {
    return this.createIconFromPath(this.iconBasePath + 'StopMetro.svg', this.iconWidth, this.iconHeight, 'transports-stop-metro-icon');
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
        className: 'neighborhood-tooltip',
        interactive: false
      });
    }
    return marker;
  }

  onClick(map) {
    return null;
  }

  getTooltip() {
    var defaultName = window.I18n ? window.I18n.t('parada') : 'Stop';
    var name = this.metadata.name || defaultName;
    var routeNames = this.metadata.routeNames || [];
    if (routeNames.length > 0) {
      var linesText = window.I18n ? window.I18n.t('lineas') : 'Lines';
      return name + '<br><small>' + linesText + ': ' + routeNames.join(', ') + '</small>';
    }
    return name;
  }
}
