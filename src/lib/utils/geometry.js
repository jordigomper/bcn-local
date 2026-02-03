export function distancePointToSegment(px, py, x1, y1, x2, y2) {
  var dx = x2 - x1;
  var dy = y2 - y1;
  var len2 = dx * dx + dy * dy;
  if (len2 === 0) {
    return Math.sqrt((px - x1) * (px - x1) + (py - y1) * (py - y1));
  }
  var t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / len2));
  var qx = x1 + t * dx;
  var qy = y1 + t * dy;
  return Math.sqrt((px - qx) * (px - qx) + (py - qy) * (py - qy));
}

export function distancePointToPolyline(lat, lng, coordinates) {
  if (!coordinates || coordinates.length < 2) return Infinity;
  var minDist = Infinity;
  for (var i = 0; i < coordinates.length - 1; i++) {
    var a = coordinates[i];
    var b = coordinates[i + 1];
    if (!Array.isArray(a) || a.length < 2 || !Array.isArray(b) || b.length < 2) continue;
    var d = distancePointToSegment(lat, lng, a[0], a[1], b[0], b[1]);
    if (d < minDist) minDist = d;
  }
  return minDist;
}

export function pointInPolygon(point, polygon) {
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

export function pointInPolygonLatLng(point, polygon) {
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

export function filterElementsByPolygon(elements, polygon) {
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
