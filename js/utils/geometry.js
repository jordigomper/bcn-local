function pointInPolygon(point, polygon) {
  var x = point[0], y = point[1];
  var inside = false;
  for (var i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    var xi = polygon[i][0], yi = polygon[i][1];
    var xj = polygon[j][0], yj = polygon[j][1];
    var intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function pointInPolygonLatLng(point, polygon) {
  var lat = point[0], lng = point[1];
  var inside = false;
  for (var i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    var lati = polygon[i][0], lngi = polygon[i][1];
    var latj = polygon[j][0], lngj = polygon[j][1];
    var intersect = ((lati > lat) !== (latj > lat)) && (lng < (lngj - lngi) * (lat - lati) / (latj - lati) + lngi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function filterElementsByPolygon(elements, polygon) {
  var outerRing = Array.isArray(polygon[0][0]) ? polygon[0] : polygon;
  return elements.filter(function(element) {
    if (!element.coordinates) return false;
    var coords = element.coordinates;

    if (element.type === 'marker') {
      return pointInPolygonLatLng(coords, outerRing);
    } else if (element.type === 'polyline') {
      var sampleSize = Math.min(coords.length, 50);
      var step = Math.max(1, Math.floor(coords.length / sampleSize));
      for (var i = 0; i < coords.length; i += step) {
        if (pointInPolygonLatLng(coords[i], outerRing)) {
          return true;
        }
      }
      return false;
    } else if (element.type === 'polygon') {
      var polyCoords = Array.isArray(coords[0][0]) ? coords[0] : coords;
      for (var j = 0; j < polyCoords.length; j++) {
        if (pointInPolygonLatLng(polyCoords[j], outerRing)) {
          return true;
        }
      }
      return false;
    }
    return false;
  });
}
