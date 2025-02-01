class TransportMetroElement extends MapElement {
  constructor(id, type, coordinates, metadata) {
    super(id, type, coordinates, metadata);
  }

  createLeafletLayer() {
    var currentZoom = window.mapInstance ? window.mapInstance.getZoom() : 13;
    var baseWeight = (currentZoom >= 12.5 && currentZoom <= 14.5) ? 2 : 4;
    var weight = baseWeight;
    var color = this.metadata.color || '#000000';
    var routeType = this.metadata.routeType || '1';
    var polyline = L.polyline(this.coordinates, {
      color: color,
      weight: weight,
      opacity: 0.8
    });
    polyline._gtfsWeight = weight;
    polyline._gtfsRouteType = routeType;
    polyline.transportElement = this;
    var defaultRoute = window.I18n ? window.I18n.t('ruta') : 'Route';
    var routeName = this.metadata.name || defaultRoute;
    polyline.bindTooltip(routeName + ' - ' + getRouteTypeName(routeType), {
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
