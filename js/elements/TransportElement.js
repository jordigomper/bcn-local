class TransportElement extends MapElement {
  constructor(id, type, coordinates, metadata) {
    super(id, type, coordinates, metadata);
  }

  createLeafletLayer() {
    if (this.type === 'marker') {
      return this.createMarker();
    } else if (this.type === 'polyline') {
      return this.createPolyline();
    }
    return null;
  }

  createMarker() {
    var category = this.metadata.category || '';
    var icon = buildTransportIcon(category);

    var marker = L.marker(this.coordinates, { icon: icon });

    var self = this;
    marker.transportElement = this;
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

  createPolyline() {
    var currentZoom = window.mapInstance ? window.mapInstance.getZoom() : 13;
    var baseWeight = (currentZoom >= 12.5 && currentZoom <= 14.5) ? 2 : 4;
    var routeType = this.metadata.routeType || '1';
    var isBus = routeType === '3' || this.metadata.category === 'bus_route';
    var weight = isBus ? baseWeight / 2 : baseWeight;
    var color = this.metadata.color || '#000000';

    var polyline = L.polyline(this.coordinates, {
      color: color,
      weight: weight,
      opacity: 0.8
    });

    polyline._gtfsWeight = weight;
    polyline._gtfsRouteType = this.metadata.routeType || '1';
    polyline.transportElement = this;

    var defaultRoute = window.I18n ? window.I18n.t('ruta') : 'Route';
    var routeName = this.metadata.name || defaultRoute;
    var routeType = getRouteTypeName(this.metadata.routeType || '1');
    polyline.bindTooltip(routeName + ' - ' + routeType, {
      permanent: false,
      direction: 'top',
      className: 'neighborhood-tooltip'
    });

    return polyline;
  }

  onClick(map) {
    return null;
  }

  getTooltip() {
    return this.metadata.name || this.id;
  }
}
