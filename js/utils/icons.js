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
  var configs = {
    metro_tren: { color: '#6a1b9a', bg: '#f3e5f5', text: 'M' },
    gasolinera: { color: '#424242', bg: '#eeeeee', text: 'G' }
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
