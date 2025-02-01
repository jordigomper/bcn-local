class SportsElement extends MapElement {
  constructor(id, type, coordinates, metadata) {
    super(id, type, coordinates, metadata);
  }

  createLeafletLayer() {
    var icon = this.getIcon();
    var marker = L.marker(this.coordinates, {
      icon: icon
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

  getIcon() {
    var hasUrl = this.metadata && this.metadata.url;
    var className = 'leaflet-div-icon services-sports-icon';
    var size = this.iconWidth;
    if (hasUrl) {
      size = this.iconWidth - 2;
      className += ' services-sports-icon--with-link';
    }
    return this.createIconFromPath(this.iconBasePath + 'Sports.svg', size, size, className);
  }
}
