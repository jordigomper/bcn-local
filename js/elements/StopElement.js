class StopElement extends MapElement {
  constructor(id, type, coordinates, metadata) {
    super(id, type, coordinates, metadata);
    this.routeType = metadata.routeType || '1';
    this.busRoutesOverlay = null;
  }

  getMinZoom() {
    if (this.metadata && typeof this.metadata.minZoom === 'number') {
      return this.metadata.minZoom;
    }
    return 14.5;
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
        className: 'neighborhood-tooltip',
        interactive: false
      });
    }

    return marker;
  }

  onClick(map) {
    if (!map || this.routeType !== '3') return null;

    var registry = map.getRegistry ? map.getRegistry() : null;
    if (!registry) return null;

    var allStopElements = registry.getAllElements().filter(function(el) {
      return el instanceof StopElement && el.routeType === '3';
    });

    allStopElements.forEach(function(element) {
      if (element.busRoutesOverlay) {
        map.removeOverlayLayer(element.busRoutesOverlay);
        element.busRoutesOverlay = null;
      }
    });

    var busRoutes = registry.getByCategory('bus_route');
    if (!busRoutes || busRoutes.length === 0) return null;

    var stopLat = this.coordinates[0];
    var stopLng = this.coordinates[1];
    var threshold = 0.001;
    var currentZoom = map.getZoom ? map.getZoom() : 13;
    var baseWeight = (currentZoom >= 12.5 && currentZoom <= 14.5) ? 2 : 4;
    var busWeight = baseWeight / 2;

    var routesLayer = L.layerGroup();
    var routesFound = false;
    var stopRouteNames = this.metadata.routeNames || [];

    for (var i = 0; i < busRoutes.length; i++) {
      var route = busRoutes[i];
      if (!route.coordinates || !Array.isArray(route.coordinates)) continue;

      var meta = route.metadata || {};
      var routeName = meta.name || route.id;
      var routePassesNear = false;
      if (typeof distancePointToPolyline === 'function') {
        var dist = distancePointToPolyline(stopLat, stopLng, route.coordinates);
        routePassesNear = dist <= threshold;
      }
      if (!routePassesNear) {
        var step = Math.max(1, Math.floor(route.coordinates.length / 100));
        for (var j = 0; j < route.coordinates.length; j += step) {
          var coord = route.coordinates[j];
          if (Array.isArray(coord) && coord.length >= 2) {
            if (Math.abs(coord[0] - stopLat) < threshold && Math.abs(coord[1] - stopLng) < threshold) {
              routePassesNear = true;
              break;
            }
          }
        }
      }
      var isAssignedToStop = stopRouteNames.indexOf(routeName) >= 0;
      if (routePassesNear || isAssignedToStop) {
        var routeColor = meta.color || '#800020';

        var polyline = L.polyline(route.coordinates, {
          color: routeColor,
          weight: busWeight,
          opacity: 0.9
        });

        polyline.bindTooltip(routeName, {
          permanent: false,
          direction: 'top',
          className: 'neighborhood-tooltip'
        });

        routesLayer.addLayer(polyline);
        routesFound = true;
      }
    }

    if (routesFound) {
      this.busRoutesOverlay = routesLayer;
      map.addOverlayLayer(routesLayer);
    }

    return null;
  }

  getTooltip() {
    var defaultName = window.I18n ? window.I18n.t('parada') : 'Stop';
    var name = this.metadata.name || defaultName;
    var routeNames = this.metadata.routeNames || [];

    if (routeNames.length > 0) {
      var lineasText = window.I18n ? window.I18n.t('lineas') : 'Lines';
      return name + '<br><small>' + lineasText + ': ' + routeNames.join(', ') + '</small>';
    }

    return name;
  }
}
