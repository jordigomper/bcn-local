function buildStopIcon(routeType) {
  var filterId = 'shadow-' + routeType + '-' + Math.random().toString(36).substr(2, 9);

  if (routeType === '0') {
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">' +
      '<defs>' +
      '<filter id="' + filterId + '">' +
      '<feDropShadow dx="1" dy="1" stdDeviation="1" flood-color="#2E7D32" flood-opacity="0.5"/>' +
      '</filter>' +
      '</defs>' +
      '<polygon points="10,3 17,10 10,17 3,10" fill="#FFFFFF" stroke="#4CAF50" stroke-width="2" filter="url(#' + filterId + ')"/>' +
      '<text x="10" y="14" text-anchor="middle" font-size="10" font-weight="bold" font-family="Arial, sans-serif" fill="#4CAF50">T</text>' +
      '</svg>';
    return L.divIcon({
      className: 'transport-stop-icon',
      html: svg,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  } else if (routeType === '1' || routeType === '2') {
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">' +
      '<defs>' +
      '<filter id="' + filterId + '">' +
      '<feDropShadow dx="1" dy="1" stdDeviation="1" flood-color="#C62828" flood-opacity="0.5"/>' +
      '</filter>' +
      '</defs>' +
      '<polygon points="10,3 17,10 10,17 3,10" fill="#FFFFFF" stroke="#F44336" stroke-width="2" filter="url(#' + filterId + ')"/>' +
      '<text x="10" y="14" text-anchor="middle" font-size="10" font-weight="bold" font-family="Arial, sans-serif" fill="#000000">M</text>' +
      '</svg>';
    return L.divIcon({
      className: 'transport-stop-icon',
      html: svg,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  } else if (routeType === '3') {
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">' +
      '<defs>' +
      '<filter id="' + filterId + '">' +
      '<feDropShadow dx="1" dy="1" stdDeviation="1" flood-color="#212121" flood-opacity="0.5"/>' +
      '</filter>' +
      '</defs>' +
      '<rect x="4" y="4" width="12" height="12" rx="2" ry="2" fill="#FFFFFF" stroke="#212121" stroke-width="2" filter="url(#' + filterId + ')"/>' +
      '<text x="10" y="13" text-anchor="middle" font-size="7" font-weight="bold" font-family="Arial, sans-serif" fill="#000000">BUS</text>' +
      '</svg>';
    return L.divIcon({
      className: 'transport-stop-icon',
      html: svg,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  }

  return L.divIcon({
    className: 'transport-stop-icon',
    html: '<div></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
}

function buildTransportIcon(category) {
  if (category === 'bicing') {
    var bicingSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18">' +
      '<circle cx="9" cy="9" r="7.5" fill="#ffffff" stroke="#000000" stroke-width="1.5" />' +
      '<text x="9" y="12" text-anchor="end" font-size="10" font-weight="700" font-family="Arial, sans-serif" fill="#d32f2f">b</text>' +
      '<text x="9" y="12" text-anchor="start" font-size="10" font-weight="700" font-family="Arial, sans-serif" fill="#000000">g</text>' +
      '</svg>';
    return L.divIcon({
      className: 'transport-icon',
      html: bicingSvg,
      iconSize: [18, 18],
      iconAnchor: [9, 9]
    });
  }
  
  if (category === 'gasolinera') {
    var filterId = 'gasolinera-shadow-' + Math.random().toString(36).substr(2, 9);
    var gasolineraSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18">' +
      '<defs>' +
      '<filter id="' + filterId + '">' +
      '<feDropShadow dx="1" dy="1" stdDeviation="1.5" flood-color="#1565C0" flood-opacity="0.6"/>' +
      '</filter>' +
      '</defs>' +
      '<circle cx="9" cy="9" r="7.5" fill="#FF9800" stroke="#1565C0" stroke-width="2" filter="url(#' + filterId + ')"/>' +
      '<text x="9" y="12.5" text-anchor="middle" font-size="10" font-weight="bold" font-family="Arial, sans-serif" fill="#000000">G</text>' +
      '</svg>';
    return L.divIcon({
      className: 'transport-icon',
      html: gasolineraSvg,
      iconSize: [18, 18],
      iconAnchor: [9, 9]
    });
  }
  
  var configs = {
    metro_tren: { color: '#6a1b9a', bg: '#f3e5f5', text: 'M' }
  };
  var cfg = configs[category] || configs.metro_tren;
  var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18">' +
    '<circle cx="9" cy="9" r="7.5" fill="' + cfg.bg + '" stroke="' + cfg.color + '" stroke-width="1.5" />' +
    '<text x="9" y="12" text-anchor="middle" font-size="9" font-family="Arial, sans-serif" fill="' + cfg.color + '">' + cfg.text + '</text>' +
    '</svg>';
  return L.divIcon({
    className: 'transport-icon',
    html: svg,
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  });
}

function getRouteTypeName(routeType) {
  var types = {
    '0': 'Tranvía',
    '1': 'Metro',
    '2': 'Tren',
    '3': 'Bus',
    '4': 'Ferry',
    '5': 'Teleférico',
    '6': 'Gondola',
    '7': 'Funicular'
  };
  return types[routeType] || 'Transporte';
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
