class SportsElement extends MapElement {
  constructor(id, type, coordinates, metadata) {
    super(id, type, coordinates, metadata);
  }

  createLeafletLayer() {
    var hasUrl = this.metadata && this.metadata.url;

    var marker = L.circleMarker(this.coordinates, {
      radius: hasUrl ? 5 : 4,
      color: hasUrl ? '#1976D2' : '#1565c0',
      weight: hasUrl ? 2 : 1,
      opacity: 0.8,
      fillColor: hasUrl ? '#42A5F5' : '#64b5f6',
      fillOpacity: hasUrl ? 0.6 : 0.4
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
    if (this.metadata && this.metadata.url) {
      window.open(this.metadata.url, '_blank');
    }
    return null;
  }

  getTooltip() {
    var defaultName = window.I18n ? window.I18n.t('servicioDeportivo') : 'Sports service';
    var name = this.metadata.name || defaultName;
    var hasUrl = this.metadata && this.metadata.url;

    if (hasUrl) {
      var clickText = window.I18n ? window.I18n.t('hazClickParaIrALaWeb') : 'Click to visit website';
      return name + '<br><small style="color: #2196F3;">' + clickText + '</small>';
    }

    return name;
  }
}
