var ICON_BASE_PATH = 'js/components/icons/';

function getIconPathForCategory(category) {
  var map = {
    bicing: ICON_BASE_PATH + 'Bicing.svg',
    metro: ICON_BASE_PATH + 'StopMetro.svg',
    tram: ICON_BASE_PATH + 'StopTram.svg',
    bus: ICON_BASE_PATH + 'StopBus.svg',
    gasStation: ICON_BASE_PATH + 'GasStation.svg',
    gym: ICON_BASE_PATH + 'Sports.svg'
  };
  return map[category] || null;
}

function getIconSizeForLegend(category) {
  return [20, 20];
}

function getRouteTypeName(routeType) {
  if (!window.I18n) {
    var types = {
      '0': 'Tram',
      '1': 'Metro',
      '2': 'Train',
      '3': 'Bus',
      '4': 'Ferry',
      '5': 'Cable Car',
      '6': 'Gondola',
      '7': 'Funicular'
    };
    return types[routeType] || 'Transport';
  }

  var typeKeys = {
    '0': 'tranvia',
    '1': 'metro',
    '2': 'tren',
    '3': 'bus',
    '4': 'ferry',
    '5': 'teleferico',
    '6': 'gondola',
    '7': 'funicular'
  };

  var key = typeKeys[routeType] || 'transport';
  return window.I18n.t(key);
}

function getStopRouteType(stopId, routes) {
  if (!stopId || !routes) {
    return '1';
  }

  var stopParts = stopId.split('.');
  if (stopParts.length < 2) {
    return '1';
  }

  var routePrefix = stopParts[0] + '.' + stopParts[1];

  for (var i = 0; i < routes.length; i++) {
    var route = routes[i];
    var routeId = route.id || route.routeId;
    if (routeId && routeId.startsWith(routePrefix)) {
      var meta = route.metadata || {};
      return meta.routeType || route.type || '1';
    }
  }

  return '1';
}

function getStopRouteNames(stopId, routes, stopCoordinates) {
  if (!stopId || !routes || !Array.isArray(routes)) {
    return [];
  }

  var stopParts = stopId.split('.');
  if (stopParts.length < 2) {
    return [];
  }

  var routeNames = [];
  var seenNames = {};

  if (stopParts.length === 2) {
    var firstDigit = stopParts[1] && stopParts[1].length > 0 ? stopParts[1][0] : '1';
    var routePrefix = stopParts[0] + '.' + firstDigit;

    for (var i = 0; i < routes.length; i++) {
      var route = routes[i];
      var routeId = route.id || route.routeId;
      if (routeId && routeId.startsWith(routePrefix + '.')) {
        var meta = route.metadata || {};
        var routeName = meta.name || routeId;
        if (routeName && !seenNames[routeName]) {
          routeNames.push(routeName);
          seenNames[routeName] = true;
        }
      }
    }
  } else if (stopParts.length === 3 && stopCoordinates) {
    var stopLat = stopCoordinates[0];
    var stopLng = stopCoordinates[1];
    var threshold = 0.001;

    for (var i = 0; i < routes.length; i++) {
      var route = routes[i];
      if (!route.coordinates || !Array.isArray(route.coordinates)) continue;

      var routePassesNear = false;
      var sampleSize = Math.min(route.coordinates.length, 100);
      var step = Math.max(1, Math.floor(route.coordinates.length / sampleSize));

      for (var j = 0; j < route.coordinates.length; j += step) {
        var coord = route.coordinates[j];
        if (Array.isArray(coord) && coord.length >= 2) {
          var lat = coord[0];
          var lng = coord[1];
          var latDiff = Math.abs(lat - stopLat);
          var lngDiff = Math.abs(lng - stopLng);
          if (latDiff < threshold && lngDiff < threshold) {
            routePassesNear = true;
            break;
          }
        }
      }

      if (routePassesNear) {
        var meta = route.metadata || {};
        var routeName = meta.name || route.id;
        if (routeName && !seenNames[routeName]) {
          routeNames.push(routeName);
          seenNames[routeName] = true;
        }
      }
    }
  }

  return routeNames.sort();
}

function getStopsForRoutes(routes, allStops) {
  if (!routes || !Array.isArray(routes) || routes.length === 0 || !allStops || !Array.isArray(allStops)) {
    return [];
  }

  var routeNames = {};
  var routeIds = {};
  
  routes.forEach(function(route) {
    var meta = route.metadata || {};
    var routeName = meta.name || route.id;
    var routeId = route.id;
    
    if (routeName) {
      routeNames[routeName] = route;
    }
    if (routeId) {
      routeIds[routeId] = route;
    }
  });

  var matchingStops = [];
  var seenStopIds = {};
  var threshold = 0.002;
  
  allStops.forEach(function(stop) {
    if (seenStopIds[stop.id]) return;
    if (!stop.coordinates || !Array.isArray(stop.coordinates) || stop.coordinates.length < 2) return;
    
    var stopLat = stop.coordinates[0];
    var stopLng = stop.coordinates[1];
    var stopMatches = false;
    var stopRouteNames = stop.metadata && stop.metadata.routeNames ? stop.metadata.routeNames : [];
    
    for (var j = 0; j < routes.length; j++) {
      var route = routes[j];
      if (!route.coordinates || !Array.isArray(route.coordinates)) continue;
      
      var routeName = (route.metadata && route.metadata.name) || route.id;
      var hasMatchingName = false;
      
      for (var i = 0; i < stopRouteNames.length; i++) {
        if (routeName === stopRouteNames[i]) {
          hasMatchingName = true;
          break;
        }
      }
      
      if (!hasMatchingName) continue;

      var dist = typeof distancePointToPolyline === 'function'
        ? distancePointToPolyline(stopLat, stopLng, route.coordinates)
        : Infinity;
      var routePassesNear = dist <= threshold;
      if (!routePassesNear) {
        var step = Math.max(1, Math.floor(route.coordinates.length / 100));
        for (var k = 0; k < route.coordinates.length; k += step) {
          var coord = route.coordinates[k];
          if (Array.isArray(coord) && coord.length >= 2) {
            var lat = coord[0];
            var lng = coord[1];
            if (Math.abs(lat - stopLat) < threshold && Math.abs(lng - stopLng) < threshold) {
              routePassesNear = true;
              break;
            }
          }
        }
      }

      if (hasMatchingName && routePassesNear) {
        stopMatches = true;
        break;
      }
    }

    if (stopMatches) {
      matchingStops.push(stop);
      seenStopIds[stop.id] = true;
    }
  });

  return matchingStops;
}
