var BCN_CENTER = [41.392328443726626, 2.1352100372314458];
var BCN_ZOOM = 13;

var map;
var neighborhoodLayers = [];
var neighborhoodData = {};
var districtData = {};
var selectedDistrictLayer = null;
var selectedNeighborhoodLayer = null;
var currentDistrictView = null;
var currentNeighborhoodView = null;
var hiddenDistricts = {};
var HIDDEN_DISTRICTS_KEY = 'bcn_hidden_districts';
var transportLayer = null;
var transportVisible = false;
var transportData = null;
var gtfsTransportLayer = null;
var gtfsStopsLayer = null;
var gtfsBusLayer = null;
var gtfsBusStopsLayer = null;
var gtfsTransportVisible = false;
var gtfsBusVisible = false;
var gtfsData = {
  metroRoutes: null,
  busRoutes: null,
  metroStops: null,
  busStops: null
};
var sportsLayer = null;
var sportsVisible = false;
var sportsData = null;
var districtFilteredTransportLayer = null;
var districtFilteredMetroRoutesLayer = null;
var districtFilteredMetroStopsLayer = null;
var neighborhoodFilteredMetroRoutesLayer = null;
var neighborhoodFilteredMetroStopsLayer = null;
var neighborhoodFilteredBusRoutesLayer = null;
var neighborhoodFilteredBusStopsLayer = null;
var neighborhoodFilteredBicingLayer = null;
var neighborhoodFilteredSportsLayer = null;
var bicingLayer = null;
var bicingVisible = false;
var bicingData = null;

function getInitialView() {
  var center = BCN_CENTER;
  var zoom = BCN_ZOOM;
  if (window.innerWidth === 1920 && window.innerHeight === 1080) {
    center = [41.384803698683925, 2.140244417823851];
    zoom = 12.5;
  }
  return { center: center, zoom: zoom };
}

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

function generateColorFromName(name) {
  var hash = 0;
  for (var i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  var hue = Math.abs(hash % 360);
  var saturation = 65 + (Math.abs(hash) % 20);
  var lightness = 50 + (Math.abs(hash) % 15);
  return 'hsl(' + hue + ', ' + saturation + '%, ' + lightness + '%)';
}

function hslToHex(h, s, l) {
  h /= 360;
  s /= 100;
  l /= 100;
  var r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    var hue2rgb = function(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  var toHex = function(x) {
    var hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return '#' + toHex(r) + toHex(g) + toHex(b);
}

function getEyeIcon(isHidden) {
  if (isHidden) {
    return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#bbb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>';
  }
  return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#bbb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
}

function saveHiddenDistricts() {
  localStorage.setItem(HIDDEN_DISTRICTS_KEY, JSON.stringify(hiddenDistricts));
}

function loadHiddenDistricts() {
  var raw = localStorage.getItem(HIDDEN_DISTRICTS_KEY);
  if (!raw) return;
  try {
    hiddenDistricts = JSON.parse(raw) || {};
  } catch (e) {
    hiddenDistricts = {};
  }
}

function convertEPSG25831ToWGS84(coord) {
  var x = coord[0];
  var y = coord[1];
  var k0 = 0.9996;
  var a = 6378137.0;
  var e = 0.081819190842622;
  var e2 = e * e;
  var n = (a - 6356752.314245) / (a + 6356752.314245);
  var x0 = 500000;
  var y0 = 0;
  var lon0 = 3 * Math.PI / 180;
  var m = (y - y0) / k0;
  var mu = m / (a * (1 - e2 / 4 - 3 * e2 * e2 / 64 - 5 * e2 * e2 * e2 / 256));
  var J1 = 3 * n / 2 - 27 * n * n * n / 32;
  var J2 = 21 * n * n / 16 - 55 * n * n * n * n / 32;
  var J3 = 151 * n * n * n / 96;
  var J4 = 1097 * n * n * n * n / 512;
  var fp = mu + J1 * Math.sin(2 * mu) + J2 * Math.sin(4 * mu) + J3 * Math.sin(6 * mu) + J4 * Math.sin(8 * mu);
  var ep2 = e2 / (1 - e2);
  var C1 = ep2 * Math.cos(fp) * Math.cos(fp);
  var T1 = Math.tan(fp) * Math.tan(fp);
  var N1 = a / Math.sqrt(1 - e2 * Math.sin(fp) * Math.sin(fp));
  var R1 = a * (1 - e2) / Math.pow(1 - e2 * Math.sin(fp) * Math.sin(fp), 1.5);
  var D = (x - x0) / (N1 * k0);
  var Q1 = N1 * Math.tan(fp) / R1;
  var Q2 = D * D / 2;
  var Q3 = (5 + 3 * T1 + 10 * C1 - 4 * C1 * C1 - 9 * ep2) * D * D * D * D / 24;
  var Q4 = (61 + 90 * T1 + 298 * C1 + 45 * T1 * T1 - 252 * ep2 - 3 * C1 * C1) * D * D * D * D * D * D / 720;
  var lat = fp - Q1 * (Q2 - Q3 + Q4);
  var Q5 = D;
  var Q6 = (1 + 2 * T1 + C1) * D * D * D / 6;
  var Q7 = (5 - 2 * C1 + 28 * T1 - 3 * C1 * C1 + 8 * ep2 + 24 * T1 * T1) * D * D * D * D * D / 120;
  var lng = lon0 + (Q5 - Q6 + Q7) / Math.cos(fp);
  return [lat * 180 / Math.PI, lng * 180 / Math.PI];
}

function geometryToLatLngs(geometry) {
  if (geometry.type === 'Polygon') {
    return geometry.coordinates.map(function(ring) {
      return ring.map(convertEPSG25831ToWGS84);
    });
  }
  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates.map(function(polygon) {
      return polygon.map(function(ring) {
        return ring.map(convertEPSG25831ToWGS84);
      });
    });
  }
  return null;
}

function geometryToPolygonsLngLat(geometry) {
  if (geometry.type === 'Polygon') {
    return [geometry.coordinates[0].map(function(coord) {
      var converted = convertEPSG25831ToWGS84(coord);
      return [converted[1], converted[0]];
    })];
  }
  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates.map(function(polygon) {
      return polygon[0].map(function(coord) {
        var converted = convertEPSG25831ToWGS84(coord);
        return [converted[1], converted[0]];
      });
    });
  }
  return null;
}

function loadPort(name) {
  var ports = {
    admin: function() { return fetch('data/barcelona_admin.json').then(function(r) { return r.json(); }); },
    transport: function() {
      return fetch('data/transport_public/gasolineras.json').then(function(r) { return r.json(); });
    },
    sports: function() { return fetch('data/sports_services.json').then(function(r) { return r.json(); }); }
  };
  var adapters = {
    admin: function(data) {
      var usedColors = {};
      var colorIndex = 0;
      var colorPalette = [
        '#FF6B6B', '#4ECDC4', '#95E1D3', '#F38181', '#AA96DA',
        '#FCBAD3', '#A8E6CF', '#FFD3B6', '#FFAAA5', '#DDA0DD',
        '#FFB347', '#87CEEB', '#98D8C8', '#F7DC6F', '#BB8FCE',
        '#85C1E2', '#F8B739', '#E74C3C', '#3498DB', '#2ECC71'
      ];
      var districts = {};
      var neighborhoods = {};
      (data.districts || []).forEach(function(district) {
        if (!district || !district.id || !district.coordinates || district.type !== 'polygon') return;
        var coords = district.coordinates;
        var latLngs = Array.isArray(coords[0][0]) ? coords : [coords];
        districts[district.id] = {
          name: district.metadata ? district.metadata.name : ('Distrito ' + district.id),
          latLngs: latLngs,
          polygons: latLngs
        };
      });
      (data.neighborhoods || []).forEach(function(neighborhood) {
        if (!neighborhood || !neighborhood.coordinates || neighborhood.type !== 'polygon') return;
        var meta = neighborhood.metadata || {};
        var name = meta.name || neighborhood.id || '';
        if (!name) return;
        var jsonColor = meta.color;
        var color;
        if (jsonColor && jsonColor !== '#000000' && jsonColor !== '#FFFFFF' && !usedColors[jsonColor]) {
          color = jsonColor;
          usedColors[jsonColor] = true;
        } else {
          if (colorIndex < colorPalette.length) {
            color = colorPalette[colorIndex];
            colorIndex++;
          } else {
            var hash = 0;
            for (var i = 0; i < name.length; i++) {
              hash = name.charCodeAt(i) + ((hash << 5) - hash);
            }
            var hue = Math.abs(hash % 360);
            color = hslToHex(hue, 65 + (Math.abs(hash) % 20), 50 + (Math.abs(hash) % 15));
          }
        }
        var coords = neighborhood.coordinates;
        var latLngs = Array.isArray(coords[0][0]) ? coords : [coords];
        var outerRing = latLngs[0];
        neighborhoods[name] = {
          color: color,
          coordinates: outerRing,
          latLngs: latLngs,
          polygon: outerRing,
          district: meta.district || ''
        };
      });
      return { districts: districts, neighborhoods: neighborhoods };
    },
    transport: function(data) {
      return data || [];
    },
    sports: function(data) {
      return data || [];
    }
  };
  return ports[name]().then(adapters[name]);
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

function buildTransportLayer() {
  if (!transportData || !transportData.length) return null;
  var layer = L.layerGroup();
  transportData.forEach(function(item) {
    if (!item.coordinates || item.type !== 'marker') return;
    var meta = item.metadata || {};
    if (meta.category !== 'gasolinera') return;
    var coords = item.coordinates;
    if (!Array.isArray(coords) || coords.length < 2) return;
    var marker = L.marker([coords[0], coords[1]], {
      icon: buildTransportIcon(meta.category)
    });
    marker.bindTooltip(meta.name || 'Gasolinera', {
      permanent: false,
      direction: 'top',
      className: 'neighborhood-tooltip'
    });
    layer.addLayer(marker);
  });
  return layer;
}

function buildSportsLayer() {
  if (!sportsData || !sportsData.length) return null;
  var layer = L.layerGroup();
  sportsData.forEach(function(item) {
    if (!item.coordinates || item.type !== 'marker') return;
    var coords = item.coordinates;
    if (!Array.isArray(coords) || coords.length < 2) return;
    var meta = item.metadata || {};
    var marker = L.circleMarker([coords[0], coords[1]], {
      radius: 4,
      color: '#1565c0',
      weight: 1,
      opacity: 0.6,
      fillColor: '#64b5f6',
      fillOpacity: 0.4
    });
    marker.bindTooltip(meta.name || 'Servicio deportivo', {
      permanent: false,
      direction: 'top',
      className: 'neighborhood-tooltip'
    });
    layer.addLayer(marker);
  });
  return layer;
}

function clearDistrictFilteredLayers() {
  if (districtFilteredTransportLayer) {
    map.removeLayer(districtFilteredTransportLayer);
    districtFilteredTransportLayer = null;
  }
  if (districtFilteredMetroRoutesLayer) {
    map.removeLayer(districtFilteredMetroRoutesLayer);
    districtFilteredMetroRoutesLayer = null;
  }
  if (districtFilteredMetroStopsLayer) {
    map.removeLayer(districtFilteredMetroStopsLayer);
    districtFilteredMetroStopsLayer = null;
  }
}

function clearNeighborhoodFilteredLayers() {
  if (neighborhoodFilteredMetroRoutesLayer) {
    map.removeLayer(neighborhoodFilteredMetroRoutesLayer);
    neighborhoodFilteredMetroRoutesLayer = null;
  }
  if (neighborhoodFilteredMetroStopsLayer) {
    map.removeLayer(neighborhoodFilteredMetroStopsLayer);
    neighborhoodFilteredMetroStopsLayer = null;
  }
  if (neighborhoodFilteredBusRoutesLayer) {
    map.removeLayer(neighborhoodFilteredBusRoutesLayer);
    neighborhoodFilteredBusRoutesLayer = null;
  }
  if (neighborhoodFilteredBusStopsLayer) {
    map.removeLayer(neighborhoodFilteredBusStopsLayer);
    neighborhoodFilteredBusStopsLayer = null;
  }
  if (neighborhoodFilteredBicingLayer) {
    map.removeLayer(neighborhoodFilteredBicingLayer);
    neighborhoodFilteredBicingLayer = null;
  }
  if (neighborhoodFilteredSportsLayer) {
    map.removeLayer(neighborhoodFilteredSportsLayer);
    neighborhoodFilteredSportsLayer = null;
  }
}

function showDistrictFilteredData(districtPolygon) {
  if (!districtPolygon || !Array.isArray(districtPolygon) || districtPolygon.length === 0) return;

  clearDistrictFilteredLayers();

  var outerRing = Array.isArray(districtPolygon[0][0]) ? districtPolygon[0] : districtPolygon;

  Promise.all([
    loadPort('transport').then(function(data) { return data || []; }).catch(function() { return []; }),
    loadGTFSData().catch(function() { return null; })
  ]).then(function(results) {
    var transportData = results[0];
    var gtfs = results[1];

    var filteredGasolineras = transportData.filter(function(item) {
      if (!item.coordinates || item.type !== 'marker') return false;
      var meta = item.metadata || {};
      if (meta.category !== 'gasolinera') return false;
      var coords = item.coordinates;
      if (!Array.isArray(coords) || coords.length < 2) return false;
      return pointInPolygonLatLng([coords[0], coords[1]], outerRing);
    });

    if (filteredGasolineras.length > 0) {
      districtFilteredTransportLayer = L.layerGroup();
      filteredGasolineras.forEach(function(item) {
        var coords = item.coordinates;
        var meta = item.metadata || {};
        var marker = L.marker([coords[0], coords[1]], {
          icon: buildTransportIcon(meta.category)
        });
        marker.bindTooltip(meta.name || 'Gasolinera', {
          permanent: false,
          direction: 'top',
          className: 'neighborhood-tooltip'
        });
        districtFilteredTransportLayer.addLayer(marker);
      });
      districtFilteredTransportLayer.addTo(map);
    }

    if (gtfs && gtfs.metroRoutes && gtfs.metroStops) {
      var currentZoom = map ? map.getZoom() : 13;
      var weight = (currentZoom >= 12.5 && currentZoom <= 14.5) ? 2 : 4;

      districtFilteredMetroRoutesLayer = L.layerGroup();
      districtFilteredMetroStopsLayer = L.layerGroup();

      var filteredRouteIds = new Set();

      gtfs.metroRoutes.forEach(function(route) {
        if (!route.coordinates || route.type !== 'polyline') return;
        var path = route.coordinates;
        var routeInArea = false;
        var sampleSize = Math.min(path.length, 50);
        var step = Math.max(1, Math.floor(path.length / sampleSize));
        for (var i = 0; i < path.length; i += step) {
          if (pointInPolygonLatLng(path[i], outerRing)) {
            routeInArea = true;
            var meta = route.metadata || {};
            filteredRouteIds.add(route.id);
            break;
          }
        }
        if (routeInArea) {
          var meta = route.metadata || {};
          var polyline = L.polyline(path, {
            color: meta.color || '#000000',
            weight: weight,
            opacity: 0.8
          });
          polyline._gtfsWeight = weight;
          polyline._gtfsRouteType = meta.routeType || '1';
          polyline.bindTooltip((meta.name || 'Ruta') + ' - ' + getRouteTypeName(meta.routeType || '1'), {
            permanent: false,
            direction: 'top',
            className: 'neighborhood-tooltip'
          });
          districtFilteredMetroRoutesLayer.addLayer(polyline);
        }
      });

      gtfs.metroStops.forEach(function(stop) {
        if (!stop.coordinates || stop.type !== 'marker') return;
        var coords = stop.coordinates;
        if (!Array.isArray(coords) || coords.length < 2) return;
        if (pointInPolygonLatLng([coords[0], coords[1]], outerRing)) {
          var meta = stop.metadata || {};
          var routeType = getStopRouteType(stop.id, gtfs.metroRoutes);
          var marker = L.marker([coords[0], coords[1]], {
            icon: buildStopIcon(routeType)
          });
          marker.bindTooltip(meta.name || 'Parada', {
            permanent: false,
            direction: 'top',
            className: 'neighborhood-tooltip'
          });
          districtFilteredMetroStopsLayer.addLayer(marker);
        }
      });

      if (districtFilteredMetroRoutesLayer.getLayers().length > 0) {
        districtFilteredMetroRoutesLayer.addTo(map);
      }
      if (districtFilteredMetroStopsLayer.getLayers().length > 0) {
        districtFilteredMetroStopsLayer.addTo(map);
      }
    }
  });
}

function showNeighborhoodFilteredData(neighborhoodPolygon) {
  if (!neighborhoodPolygon || !Array.isArray(neighborhoodPolygon) || neighborhoodPolygon.length === 0) return;

  clearNeighborhoodFilteredLayers();

  var outerRing = Array.isArray(neighborhoodPolygon[0][0]) ? neighborhoodPolygon[0] : neighborhoodPolygon;

  Promise.all([
    loadGTFSData().catch(function() { return null; }),
    fetch('data/transport_public/bicing.json').then(function(r) { return r.json(); }).catch(function() { return []; }),
    loadPort('sports').then(function(data) { return data || []; }).catch(function() { return []; })
  ]).then(function(results) {
    var gtfs = results[0];
    var bicingData = results[1];
    var sportsData = results[2];

    if (gtfs) {
      var currentZoom = map ? map.getZoom() : 13;
      var weight = (currentZoom >= 12.5 && currentZoom <= 14.5) ? 2 : 4;

      neighborhoodFilteredMetroRoutesLayer = L.layerGroup();
      neighborhoodFilteredMetroStopsLayer = L.layerGroup();
      neighborhoodFilteredBusRoutesLayer = L.layerGroup();
      neighborhoodFilteredBusStopsLayer = L.layerGroup();

      if (gtfs.metroRoutes) {
        gtfs.metroRoutes.forEach(function(route) {
          if (!route.coordinates || route.type !== 'polyline') return;
          var path = route.coordinates;
          var routeInArea = false;
          var sampleSize = Math.min(path.length, 50);
          var step = Math.max(1, Math.floor(path.length / sampleSize));
          for (var i = 0; i < path.length; i += step) {
            if (pointInPolygonLatLng(path[i], outerRing)) {
              routeInArea = true;
              break;
            }
          }
          if (routeInArea) {
            var meta = route.metadata || {};
            var polyline = L.polyline(path, {
              color: meta.color || '#000000',
              weight: weight,
              opacity: 0.8
            });
            polyline._gtfsWeight = weight;
            polyline._gtfsRouteType = meta.routeType || '1';
            polyline.bindTooltip((meta.name || 'Ruta') + ' - ' + getRouteTypeName(meta.routeType || '1'), {
              permanent: false,
              direction: 'top',
              className: 'neighborhood-tooltip'
            });
            neighborhoodFilteredMetroRoutesLayer.addLayer(polyline);
          }
        });
      }

      if (gtfs.busRoutes) {
        gtfs.busRoutes.forEach(function(route) {
          if (!route.coordinates || route.type !== 'polyline') return;
          var path = route.coordinates;
          var routeInArea = false;
          var sampleSize = Math.min(path.length, 50);
          var step = Math.max(1, Math.floor(path.length / sampleSize));
          for (var i = 0; i < path.length; i += step) {
            if (pointInPolygonLatLng(path[i], outerRing)) {
              routeInArea = true;
              break;
            }
          }
          if (routeInArea) {
            var meta = route.metadata || {};
            var polyline = L.polyline(path, {
              color: meta.color || '#000000',
              weight: weight,
              opacity: 0.8
            });
            polyline._gtfsWeight = weight;
            polyline._gtfsRouteType = meta.routeType || '3';
            polyline.bindTooltip((meta.name || 'Ruta') + ' - ' + getRouteTypeName(meta.routeType || '3'), {
              permanent: false,
              direction: 'top',
              className: 'neighborhood-tooltip'
            });
            neighborhoodFilteredBusRoutesLayer.addLayer(polyline);
          }
        });
      }

      if (gtfs.metroStops) {
        gtfs.metroStops.forEach(function(stop) {
          if (!stop.coordinates || stop.type !== 'marker') return;
          var coords = stop.coordinates;
          if (!Array.isArray(coords) || coords.length < 2) return;
          if (pointInPolygonLatLng([coords[0], coords[1]], outerRing)) {
            var meta = stop.metadata || {};
            var routeType = getStopRouteType(stop.id, gtfs.metroRoutes);
            var marker = L.marker([coords[0], coords[1]], {
              icon: buildStopIcon(routeType)
            });
            marker.bindTooltip(meta.name || 'Parada', {
              permanent: false,
              direction: 'top',
              className: 'neighborhood-tooltip'
            });
            neighborhoodFilteredMetroStopsLayer.addLayer(marker);
          }
        });
      }

      if (gtfs.busStops) {
        gtfs.busStops.forEach(function(stop) {
          if (!stop.coordinates || stop.type !== 'marker') return;
          var coords = stop.coordinates;
          if (!Array.isArray(coords) || coords.length < 2) return;
          if (pointInPolygonLatLng([coords[0], coords[1]], outerRing)) {
            var meta = stop.metadata || {};
            var marker = L.marker([coords[0], coords[1]], {
              icon: buildStopIcon('3')
            });
            marker.bindTooltip(meta.name || 'Parada', {
              permanent: false,
              direction: 'top',
              className: 'neighborhood-tooltip'
            });
            neighborhoodFilteredBusStopsLayer.addLayer(marker);
          }
        });
      }

      if (neighborhoodFilteredMetroRoutesLayer.getLayers().length > 0) {
        neighborhoodFilteredMetroRoutesLayer.addTo(map);
      }
      if (neighborhoodFilteredMetroStopsLayer.getLayers().length > 0) {
        neighborhoodFilteredMetroStopsLayer.addTo(map);
      }
      if (neighborhoodFilteredBusRoutesLayer.getLayers().length > 0) {
        neighborhoodFilteredBusRoutesLayer.addTo(map);
      }
      if (neighborhoodFilteredBusStopsLayer.getLayers().length > 0) {
        if (map.getZoom() >= 15) {
          neighborhoodFilteredBusStopsLayer.addTo(map);
        }
      }
    }

    var filteredBicing = bicingData.filter(function(item) {
      if (!item.coordinates || item.type !== 'marker') return false;
      var coords = item.coordinates;
      if (!Array.isArray(coords) || coords.length < 2) return false;
      return pointInPolygonLatLng([coords[0], coords[1]], outerRing);
    });

    if (filteredBicing.length > 0) {
      neighborhoodFilteredBicingLayer = L.layerGroup();
      filteredBicing.forEach(function(item) {
        var coords = item.coordinates;
        var meta = item.metadata || {};
        var marker = L.marker([coords[0], coords[1]], {
          icon: buildTransportIcon('bicing')
        });
        marker.bindTooltip(meta.name || 'Bicing', {
          permanent: false,
          direction: 'top',
          className: 'neighborhood-tooltip'
        });
        neighborhoodFilteredBicingLayer.addLayer(marker);
      });
      neighborhoodFilteredBicingLayer.addTo(map);
    }

    var filteredSports = sportsData.filter(function(item) {
      if (!item.coordinates || item.type !== 'marker') return false;
      var coords = item.coordinates;
      if (!Array.isArray(coords) || coords.length < 2) return false;
      return pointInPolygonLatLng([coords[0], coords[1]], outerRing);
    });

    if (filteredSports.length > 0) {
      neighborhoodFilteredSportsLayer = L.layerGroup();
      filteredSports.forEach(function(item) {
        if (!item.coordinates || item.type !== 'marker') return;
        var coords = item.coordinates;
        if (!Array.isArray(coords) || coords.length < 2) return;
        var meta = item.metadata || {};
        var marker = L.circleMarker([coords[0], coords[1]], {
          radius: 4,
          color: '#1565c0',
          weight: 1,
          opacity: 0.6,
          fillColor: '#64b5f6',
          fillOpacity: 0.4
        });
        marker.bindTooltip(meta.name || 'Servicio deportivo', {
          permanent: false,
          direction: 'top',
          className: 'neighborhood-tooltip'
        });
        neighborhoodFilteredSportsLayer.addLayer(marker);
      });
      neighborhoodFilteredSportsLayer.addTo(map);
    }
  });
}

function toggleTransportLayer() {
  if (!map) return;
  var button = document.getElementById('transport-toggle');
  var legend = document.getElementById('transport-legend');
  if (!transportVisible) {
    var load = transportData ? Promise.resolve(transportData) : loadPort('transport').then(function(data) {
      transportData = data;
      return transportData;
    });
    load.then(function() {
      if (!transportLayer) {
        transportLayer = buildTransportLayer();
      }
      if (transportLayer) {
        if (districtFilteredTransportLayer) {
          map.removeLayer(districtFilteredTransportLayer);
        }
        transportLayer.addTo(map);
        transportVisible = true;
        if (button) button.classList.add('active');
        if (legend) legend.classList.remove('hidden');
      }
    });
  } else {
    if (transportLayer) {
      map.removeLayer(transportLayer);
    }
    transportVisible = false;
    if (button) button.classList.remove('active');
    if (legend) legend.classList.add('hidden');

    if (currentDistrictView && districtData[currentDistrictView]) {
      showDistrictFilteredData(districtData[currentDistrictView].latLngs);
    }
  }
}

function toggleBicingLayer() {
  if (!map) return;
  var button = document.getElementById('bicing-toggle');
  if (!bicingVisible) {
    var load = bicingData ? Promise.resolve(bicingData) : fetch('data/transport_public/bicing.json').then(function(r) { return r.json(); }).then(function(data) {
      bicingData = data;
      return bicingData;
    });
    load.then(function() {
      if (currentNeighborhoodView && neighborhoodFilteredBicingLayer) {
        neighborhoodFilteredBicingLayer.addTo(map);
        bicingVisible = true;
        if (button) button.classList.add('active');
      } else {
        if (!bicingLayer) {
          bicingLayer = L.layerGroup();
          bicingData.forEach(function(item) {
            if (!item.coordinates || item.type !== 'marker') return;
            var coords = item.coordinates;
            if (!Array.isArray(coords) || coords.length < 2) return;
            var meta = item.metadata || {};
            var marker = L.marker([coords[0], coords[1]], {
              icon: buildTransportIcon('bicing')
            });
            marker.bindTooltip(meta.name || 'Bicing', {
              permanent: false,
              direction: 'top',
              className: 'neighborhood-tooltip'
            });
            bicingLayer.addLayer(marker);
          });
        }
        if (neighborhoodFilteredBicingLayer) {
          map.removeLayer(neighborhoodFilteredBicingLayer);
        }
        bicingLayer.addTo(map);
        bicingVisible = true;
        if (button) button.classList.add('active');
      }
    });
  } else {
    if (bicingLayer) {
      map.removeLayer(bicingLayer);
    }
    if (neighborhoodFilteredBicingLayer) {
      map.removeLayer(neighborhoodFilteredBicingLayer);
    }
    bicingVisible = false;
    if (button) button.classList.remove('active');

    if (currentNeighborhoodView && neighborhoodData[currentNeighborhoodView]) {
      showNeighborhoodFilteredData(neighborhoodData[currentNeighborhoodView].latLngs || neighborhoodData[currentNeighborhoodView].coordinates);
    }
  }
}

function toggleSportsLayer() {
  if (!map) return;
  var button = document.getElementById('sports-toggle');
  if (!sportsVisible) {
    var load = sportsData ? Promise.resolve(sportsData) : loadPort('sports').then(function(data) {
      sportsData = data;
      return sportsData;
    });
    load.then(function() {
      if (currentNeighborhoodView && neighborhoodFilteredSportsLayer) {
        neighborhoodFilteredSportsLayer.addTo(map);
        sportsVisible = true;
        if (button) button.classList.add('active');
      } else {
        if (!sportsLayer) {
          sportsLayer = buildSportsLayer();
        }
        if (neighborhoodFilteredSportsLayer) {
          map.removeLayer(neighborhoodFilteredSportsLayer);
        }
        sportsLayer.addTo(map);
        sportsVisible = true;
        if (button) button.classList.add('active');
      }
    });
  } else {
    if (sportsLayer) {
      map.removeLayer(sportsLayer);
    }
    if (neighborhoodFilteredSportsLayer) {
      map.removeLayer(neighborhoodFilteredSportsLayer);
    }
    sportsVisible = false;
    if (button) button.classList.remove('active');

    if (currentNeighborhoodView && neighborhoodData[currentNeighborhoodView]) {
      showNeighborhoodFilteredData(neighborhoodData[currentNeighborhoodView].latLngs || neighborhoodData[currentNeighborhoodView].coordinates);
    }
  }
}

function loadGTFSData() {
  if (gtfsData.metroRoutes && gtfsData.busRoutes && gtfsData.metroStops && gtfsData.busStops) {
    return Promise.resolve(gtfsData);
  }
  return Promise.all([
    fetch('data/transport_public/metro_routes.json').then(function(r) { return r.json(); }).then(function(data) {
      gtfsData.metroRoutes = data;
      return data;
    }).catch(function(err) {
      console.error('Error cargando metro_routes.json:', err);
      return [];
    }),
    fetch('data/transport_public/bus_routes.json').then(function(r) { return r.json(); }).then(function(data) {
      gtfsData.busRoutes = data;
      return data;
    }).catch(function(err) {
      console.error('Error cargando bus_routes.json:', err);
      return [];
    }),
    fetch('data/transport_public/metro_stops.json').then(function(r) { return r.json(); }).then(function(data) {
      gtfsData.metroStops = data;
      return data;
    }).catch(function(err) {
      console.error('Error cargando metro_stops.json:', err);
      return [];
    }),
    fetch('data/transport_public/bus_stops.json').then(function(r) { return r.json(); }).then(function(data) {
      gtfsData.busStops = data;
      return data;
    }).catch(function(err) {
      console.error('Error cargando bus_stops.json:', err);
      return [];
    })
  ]).then(function() {
    return gtfsData;
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

function buildStopIcon(routeType) {
  var filterId = 'shadow-' + routeType + '-' + Math.random().toString(36).substr(2, 9);

  if (routeType === '0') {
    // Tranvía: rombo relieve verde, fondo blanco, letra T verde
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
    // Metro/Tren: rombo relieve rojo, fondo blanco, letra M en negro
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
    // Bus: cuadrado puntas redondeadas relieve negro, fondo blanco, BUS en negro
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">' +
      '<defs>' +
      '<filter id="' + filterId + '">' +
      '<feDropShadow dx="1" dy="1" stdDeviation="1" flood-color="#212121" flood-opacity="0.5"/>' +
      '</filter>' +
      '</defs>' +
      '<rect x="4" y="4" width="12" height="12" rx="2" ry="2" fill="#FFFFFF" stroke="#424242" stroke-width="2" filter="url(#' + filterId + ')"/>' +
      '<text x="10" y="13" text-anchor="middle" font-size="6" font-weight="bold" font-family="Arial, sans-serif" fill="#000000">BUS</text>' +
      '</svg>';
    return L.divIcon({
      className: 'transport-stop-icon',
      html: svg,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  }

  // Default: metro
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

function buildGTFSTransportLayer() {
  if (!gtfsData.metroRoutes || !gtfsData.busRoutes) return null;

  var metroRoutesLayer = L.layerGroup();
  var metroStopsLayer = L.layerGroup();
  var busRoutesLayer = L.layerGroup();
  var busStopsLayer = L.layerGroup();

  var currentZoom = map ? map.getZoom() : 13;
  var weight = (currentZoom >= 12.5 && currentZoom <= 14.5) ? 2 : 4;

  if (gtfsData.metroRoutes) {
    gtfsData.metroRoutes.forEach(function(route) {
      if (!route.coordinates || route.type !== 'polyline') return;
      var meta = route.metadata || {};
      var polyline = L.polyline(route.coordinates, {
        color: meta.color || '#000000',
        weight: weight,
        opacity: 0.8
      });
      polyline._gtfsWeight = weight;
      polyline._gtfsRouteType = meta.routeType || '1';
      polyline.bindTooltip((meta.name || 'Ruta') + ' - ' + getRouteTypeName(meta.routeType || '1'), {
        permanent: false,
        direction: 'top',
        className: 'neighborhood-tooltip'
      });
      metroRoutesLayer.addLayer(polyline);
    });
  }

  if (gtfsData.busRoutes) {
    gtfsData.busRoutes.forEach(function(route) {
      if (!route.coordinates || route.type !== 'polyline') return;
      var meta = route.metadata || {};
      var polyline = L.polyline(route.coordinates, {
        color: meta.color || '#000000',
        weight: weight,
        opacity: 0.8
      });
      polyline._gtfsWeight = weight;
      polyline._gtfsRouteType = meta.routeType || '3';
      polyline.bindTooltip((meta.name || 'Ruta') + ' - ' + getRouteTypeName(meta.routeType || '3'), {
        permanent: false,
        direction: 'top',
        className: 'neighborhood-tooltip'
      });
      busRoutesLayer.addLayer(polyline);
    });
  }

  if (gtfsData.metroStops) {
    gtfsData.metroStops.forEach(function(stop) {
      if (!stop.coordinates || stop.type !== 'marker') return;
      var coords = stop.coordinates;
      if (!Array.isArray(coords) || coords.length < 2) return;
      var meta = stop.metadata || {};
      var routeType = getStopRouteType(stop.id, gtfsData.metroRoutes);
      var marker = L.marker([coords[0], coords[1]], {
        icon: buildStopIcon(routeType)
      });
      marker.bindTooltip(meta.name || 'Parada', {
        permanent: false,
        direction: 'top',
        className: 'neighborhood-tooltip'
      });
      metroStopsLayer.addLayer(marker);
    });
  }

  if (gtfsData.busStops) {
    gtfsData.busStops.forEach(function(stop) {
      if (!stop.coordinates || stop.type !== 'marker') return;
      var coords = stop.coordinates;
      if (!Array.isArray(coords) || coords.length < 2) return;
      var meta = stop.metadata || {};
      var marker = L.marker([coords[0], coords[1]], {
        icon: buildStopIcon('3')
      });
      marker.bindTooltip(meta.name || 'Parada', {
        permanent: false,
        direction: 'top',
        className: 'neighborhood-tooltip'
      });
      busStopsLayer.addLayer(marker);
    });
  }

  return {
    metro: {
      routes: metroRoutesLayer,
      stops: metroStopsLayer
    },
    bus: {
      routes: busRoutesLayer,
      stops: busStopsLayer
    }
  };
}

function updateGTFSStopsVisibility() {
  if (!map) return;
  var currentZoom = map.getZoom();
  var shouldShowBus = currentZoom >= 15;

  if (gtfsStopsLayer) {
    if (gtfsTransportVisible) {
      if (!map.hasLayer(gtfsStopsLayer)) {
        gtfsStopsLayer.addTo(map);
      }
    } else {
      if (map.hasLayer(gtfsStopsLayer)) {
        map.removeLayer(gtfsStopsLayer);
      }
    }
  }

  if (gtfsBusStopsLayer) {
    if (shouldShowBus && gtfsBusVisible) {
      if (!map.hasLayer(gtfsBusStopsLayer)) {
        gtfsBusStopsLayer.addTo(map);
      }
    } else {
      if (map.hasLayer(gtfsBusStopsLayer)) {
        map.removeLayer(gtfsBusStopsLayer);
      }
    }
  }

  if (districtFilteredMetroStopsLayer) {
    if (currentDistrictView && !gtfsTransportVisible) {
      if (!map.hasLayer(districtFilteredMetroStopsLayer)) {
        districtFilteredMetroStopsLayer.addTo(map);
      }
    } else {
      if (map.hasLayer(districtFilteredMetroStopsLayer)) {
        map.removeLayer(districtFilteredMetroStopsLayer);
      }
    }
  }

  if (neighborhoodFilteredMetroStopsLayer) {
    if (currentNeighborhoodView) {
      if (!map.hasLayer(neighborhoodFilteredMetroStopsLayer)) {
        neighborhoodFilteredMetroStopsLayer.addTo(map);
      }
    } else {
      if (map.hasLayer(neighborhoodFilteredMetroStopsLayer)) {
        map.removeLayer(neighborhoodFilteredMetroStopsLayer);
      }
    }
  }

  if (neighborhoodFilteredBusStopsLayer) {
    if (shouldShowBus && currentNeighborhoodView) {
      if (!map.hasLayer(neighborhoodFilteredBusStopsLayer)) {
        neighborhoodFilteredBusStopsLayer.addTo(map);
      }
    } else {
      if (map.hasLayer(neighborhoodFilteredBusStopsLayer)) {
        map.removeLayer(neighborhoodFilteredBusStopsLayer);
      }
    }
  }
}

function updateGTFSLinesWeight() {
  if (!map) return;
  var currentZoom = map.getZoom();
  var newWeight = (currentZoom >= 12.5 && currentZoom <= 14.5) ? 2 : 4;

  if (gtfsTransportLayer) {
    gtfsTransportLayer.eachLayer(function(layer) {
      if (layer instanceof L.Polyline) {
        if (layer._gtfsWeight !== newWeight) {
          layer.setStyle({ weight: newWeight });
          layer._gtfsWeight = newWeight;
        }
      }
    });
  }

  if (gtfsBusLayer) {
    gtfsBusLayer.eachLayer(function(layer) {
      if (layer instanceof L.Polyline) {
        if (layer._gtfsWeight !== newWeight) {
          layer.setStyle({ weight: newWeight });
          layer._gtfsWeight = newWeight;
        }
      }
    });
  }

  if (districtFilteredMetroRoutesLayer && !gtfsTransportVisible) {
    districtFilteredMetroRoutesLayer.eachLayer(function(layer) {
      if (layer instanceof L.Polyline) {
        if (layer._gtfsWeight !== newWeight) {
          layer.setStyle({ weight: newWeight });
          layer._gtfsWeight = newWeight;
        }
      }
    });
  }

  if (neighborhoodFilteredMetroRoutesLayer) {
    neighborhoodFilteredMetroRoutesLayer.eachLayer(function(layer) {
      if (layer instanceof L.Polyline) {
        if (layer._gtfsWeight !== newWeight) {
          layer.setStyle({ weight: newWeight });
          layer._gtfsWeight = newWeight;
        }
      }
    });
  }

  if (neighborhoodFilteredBusRoutesLayer) {
    neighborhoodFilteredBusRoutesLayer.eachLayer(function(layer) {
      if (layer instanceof L.Polyline) {
        if (layer._gtfsWeight !== newWeight) {
          layer.setStyle({ weight: newWeight });
          layer._gtfsWeight = newWeight;
        }
      }
    });
  }
}

function toggleGTFSMetroLayer() {
  if (!map) return;
  var button = document.getElementById('gtfs-metro-toggle');
  if (!gtfsTransportVisible) {
    loadGTFSData().then(function() {
      try {
        if (!gtfsTransportLayer || !gtfsStopsLayer) {
          var layers = buildGTFSTransportLayer();
          if (layers && layers.metro) {
            gtfsTransportLayer = layers.metro.routes;
            gtfsStopsLayer = layers.metro.stops;
            if (layers.bus) {
              gtfsBusLayer = layers.bus.routes;
              gtfsBusStopsLayer = layers.bus.stops;
            }
          }
        }
        if (gtfsTransportLayer) {
          if (districtFilteredMetroRoutesLayer) {
            map.removeLayer(districtFilteredMetroRoutesLayer);
          }
          if (districtFilteredMetroStopsLayer) {
            map.removeLayer(districtFilteredMetroStopsLayer);
          }
          gtfsTransportLayer.addTo(map);
          gtfsTransportVisible = true;
          if (gtfsStopsLayer) {
            gtfsStopsLayer.addTo(map);
          }
          updateGTFSStopsVisibility();
          if (button) button.classList.add('active');
        }
      } catch (error) {
        console.error('Error construyendo capa metro:', error);
      }
    }).catch(function(error) {
      console.error('Error cargando datos GTFS:', error);
    });
  } else {
    if (gtfsTransportLayer) {
      map.removeLayer(gtfsTransportLayer);
    }
    if (gtfsStopsLayer) {
      map.removeLayer(gtfsStopsLayer);
    }
    gtfsTransportVisible = false;
    if (button) button.classList.remove('active');

    if (currentDistrictView && districtData[currentDistrictView]) {
      showDistrictFilteredData(districtData[currentDistrictView].latLngs);
    }
  }
}

function toggleGTFSBusLayer() {
  if (!map) return;
  var button = document.getElementById('gtfs-bus-toggle');
  if (!gtfsBusVisible) {
    loadGTFSData().then(function() {
      try {
        if (!gtfsBusLayer || !gtfsBusStopsLayer) {
          var layers = buildGTFSTransportLayer();
          if (layers && layers.bus) {
            gtfsBusLayer = layers.bus.routes;
            gtfsBusStopsLayer = layers.bus.stops;
            if (layers.metro) {
              gtfsTransportLayer = layers.metro.routes;
              gtfsStopsLayer = layers.metro.stops;
            }
          }
        }
        if (gtfsBusLayer) {
          gtfsBusLayer.addTo(map);
          updateGTFSStopsVisibility();
          gtfsBusVisible = true;
          if (button) button.classList.add('active');
        }
      } catch (error) {
        console.error('Error construyendo capa bus:', error);
      }
    }).catch(function(error) {
      console.error('Error cargando datos GTFS:', error);
    });
  } else {
    if (gtfsBusLayer) {
      map.removeLayer(gtfsBusLayer);
    }
    if (gtfsBusStopsLayer) {
      map.removeLayer(gtfsBusStopsLayer);
    }
    gtfsBusVisible = false;
    if (button) button.classList.remove('active');
  }
}

function renderNeighborhoods() {
  neighborhoodLayers.forEach(function(layer) {
    map.removeLayer(layer);
  });
  neighborhoodLayers = [];

  var neighborhoodsToShow = [];
  for (var n in neighborhoodData) {
    var district = neighborhoodData[n].district || '';
    if (!hiddenDistricts[district]) {
      neighborhoodsToShow.push(n);
    }
  }

  for (var i = 0; i < neighborhoodsToShow.length; i++) {
    var name = neighborhoodsToShow[i];
    var data = neighborhoodData[name];
    var isSelected = currentNeighborhoodView === name;
    var opacity = isSelected ? 0.35 : 0.12;
    var weight = isSelected ? 4 : 2.5;
    var dashArray = isSelected ? null : '5, 5';
    var polygon = L.polygon(data.latLngs || data.coordinates, {
      color: data.color,
      fillColor: data.color,
      fillOpacity: opacity,
      weight: weight,
      opacity: 0.9,
      dashArray: dashArray,
      className: 'neighborhood-polygon',
      interactive: true
    }).addTo(map);

    polygon.neighborhoodName = name;
    polygon.on('click', function(e) {
      e.originalEvent.stopPropagation();
      zoomToNeighborhood(this.neighborhoodName);
    });

    polygon.bindTooltip(name, {
      permanent: false,
      direction: 'center',
      className: 'neighborhood-tooltip'
    });

    neighborhoodLayers.push(polygon);
  }
}

function zoomToDistrict(districtCode) {
  if (!districtData[districtCode] || !districtData[districtCode].latLngs) return;

  if (selectedDistrictLayer) {
    map.removeLayer(selectedDistrictLayer);
    selectedDistrictLayer = null;
  }
  if (selectedNeighborhoodLayer) {
    map.removeLayer(selectedNeighborhoodLayer);
    selectedNeighborhoodLayer = null;
  }

  var district = districtData[districtCode];
  selectedDistrictLayer = L.polygon(district.latLngs, {
    color: '#000000',
    fillColor: 'transparent',
    fillOpacity: 0,
    weight: 4,
    opacity: 1,
    className: 'district-border',
    pane: 'overlayPane'
  }).addTo(map);

  selectedDistrictLayer.bringToFront();

  var bounds = selectedDistrictLayer.getBounds();
  map.fitBounds(bounds, {
    padding: [100, 100],
    maxZoom: 15
  });

  currentDistrictView = districtCode;
  currentNeighborhoodView = null;

  var headers = document.querySelectorAll('.legend-district-header');
  headers.forEach(function(header) {
    if (header.dataset.district === districtCode) {
      header.classList.add('active');
    } else {
      header.classList.remove('active');
    }
  });

  var legendItems = document.querySelectorAll('.legend-item');
  legendItems.forEach(function(item) {
    item.classList.remove('active');
  });

  renderNeighborhoods();

  showDistrictFilteredData(district.latLngs);

  setTimeout(function() {
    if (selectedDistrictLayer) {
      selectedDistrictLayer.bringToFront();
    }
  }, 100);
}

function zoomToNeighborhood(neighborhoodName) {
  var neighborhood = neighborhoodData[neighborhoodName];
  if (!neighborhood) return;

  if (selectedNeighborhoodLayer) {
    map.removeLayer(selectedNeighborhoodLayer);
    selectedNeighborhoodLayer = null;
  }
  if (selectedDistrictLayer) {
    map.removeLayer(selectedDistrictLayer);
    selectedDistrictLayer = null;
  }

  clearDistrictFilteredLayers();

  if (gtfsTransportLayer) {
    map.removeLayer(gtfsTransportLayer);
  }
  if (gtfsStopsLayer) {
    map.removeLayer(gtfsStopsLayer);
  }
  if (gtfsBusLayer) {
    map.removeLayer(gtfsBusLayer);
  }
  if (gtfsBusStopsLayer) {
    map.removeLayer(gtfsBusStopsLayer);
  }
  if (bicingLayer) {
    map.removeLayer(bicingLayer);
  }
  if (sportsLayer) {
    map.removeLayer(sportsLayer);
  }

  selectedNeighborhoodLayer = L.polygon(neighborhood.latLngs || neighborhood.coordinates, {
    color: '#000000',
    fillColor: 'transparent',
    fillOpacity: 0,
    weight: 4,
    opacity: 1,
    className: 'neighborhood-border',
    pane: 'overlayPane'
  }).addTo(map);

  selectedNeighborhoodLayer.bringToFront();

  var bounds = selectedNeighborhoodLayer.getBounds();
  map.fitBounds(bounds, {
    padding: [150, 150],
    maxZoom: 16
  });

  currentNeighborhoodView = neighborhoodName;
  currentDistrictView = null;

  var legendItems = document.querySelectorAll('.legend-item');
  legendItems.forEach(function(item) {
    if (item.dataset.neighborhood === neighborhoodName) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  var headers = document.querySelectorAll('.legend-district-header');
  headers.forEach(function(header) {
    header.classList.remove('active');
  });

  renderNeighborhoods();

  showNeighborhoodFilteredData(neighborhood.latLngs || neighborhood.coordinates);

  var bicingButton = document.getElementById('bicing-toggle');
  if (bicingButton && !bicingVisible) {
    bicingVisible = true;
    bicingButton.classList.add('active');
  }

  var sportsButton = document.getElementById('sports-toggle');
  if (sportsButton && !sportsVisible) {
    sportsVisible = true;
    sportsButton.classList.add('active');
  }

  setTimeout(function() {
    if (selectedNeighborhoodLayer) {
      selectedNeighborhoodLayer.bringToFront();
    }
  }, 100);
}

function resetDistrictView() {
  if (selectedDistrictLayer) {
    map.removeLayer(selectedDistrictLayer);
    selectedDistrictLayer = null;
  }
  if (selectedNeighborhoodLayer) {
    map.removeLayer(selectedNeighborhoodLayer);
    selectedNeighborhoodLayer = null;
  }
  currentDistrictView = null;
  currentNeighborhoodView = null;

  clearDistrictFilteredLayers();
  clearNeighborhoodFilteredLayers();

  var headers = document.querySelectorAll('.legend-district-header');
  headers.forEach(function(header) {
    header.classList.remove('active');
  });

  var legendItems = document.querySelectorAll('.legend-item');
  legendItems.forEach(function(item) {
    item.classList.remove('active');
  });

  renderNeighborhoods();
  fitMapToNeighborhoods();
}

function fitMapToNeighborhoods() {
  var initialView = getInitialView();
  map.setView(initialView.center, initialView.zoom);
}

function initMap() {
  var initialView = getInitialView();
  map = L.map('map', { zoomSnap: 0.5 }).setView(initialView.center, initialView.zoom);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19
  }).addTo(map);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
    attribution: '',
    maxZoom: 19,
    pane: 'overlayPane'
  }).addTo(map);

  map.on('zoomend', function() {
    console.log('Zoom actualizado:', map.getZoom());
    if (gtfsTransportVisible || gtfsBusVisible) {
      updateGTFSStopsVisibility();
      updateGTFSLinesWeight();
    } else if (currentDistrictView || currentNeighborhoodView) {
      updateGTFSStopsVisibility();
      updateGTFSLinesWeight();
    }
  });

  map.on('moveend', function() {
    var center = map.getCenter();
    console.log('Centro actualizado:', [center.lat, center.lng]);
  });

  console.log('Viewport resolution:', window.innerWidth, 'x', window.innerHeight);

  loadHiddenDistricts();

  loadPort('admin').then(function(result) {
    districtData = result.districts;
    neighborhoodData = result.neighborhoods;
    renderNeighborhoods();
    fitMapToNeighborhoods();
    rebuildLegend();
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && (currentDistrictView || currentNeighborhoodView)) {
      resetDistrictView();
    }
  });

  var sportsToggle = document.getElementById('sports-toggle');
  if (sportsToggle) {
    sportsToggle.addEventListener('click', toggleSportsLayer);
  }

  var bicingToggle = document.getElementById('bicing-toggle');
  if (bicingToggle) {
    bicingToggle.addEventListener('click', toggleBicingLayer);
  }

  var transportToggle = document.getElementById('transport-toggle');
  if (transportToggle) {
    transportToggle.addEventListener('click', toggleTransportLayer);
  }

  var gtfsMetroToggle = document.getElementById('gtfs-metro-toggle');
  if (gtfsMetroToggle) {
    gtfsMetroToggle.addEventListener('click', toggleGTFSMetroLayer);
  }

  var gtfsBusToggle = document.getElementById('gtfs-bus-toggle');
  if (gtfsBusToggle) {
    gtfsBusToggle.addEventListener('click', toggleGTFSBusLayer);
  }
}

function rebuildLegend() {
  var legend = document.getElementById('neighborhood-legend');
  if (!legend) return;
  legend.innerHTML = '';

  var neighborhoods = Object.keys(neighborhoodData).sort();
  var neighborhoodsByDistrict = {};
  neighborhoods.forEach(function(name) {
    var district = neighborhoodData[name].district || '';
    if (!neighborhoodsByDistrict[district]) {
      neighborhoodsByDistrict[district] = [];
    }
    neighborhoodsByDistrict[district].push(name);
  });

  var visibleDistricts = [];
  var hiddenDistrictsList = [];

  Object.keys(neighborhoodsByDistrict).sort().forEach(function(districtCode) {
    if (hiddenDistricts[districtCode]) {
      hiddenDistrictsList.push(districtCode);
    } else {
      visibleDistricts.push(districtCode);
    }
  });

  function toggleDistrictVisibility(districtCode, event) {
    event.stopPropagation();
    if (hiddenDistricts[districtCode]) {
      delete hiddenDistricts[districtCode];
    } else {
      hiddenDistricts[districtCode] = true;
      if (currentDistrictView === districtCode) {
        resetDistrictView();
      } else if (currentNeighborhoodView) {
        var district = neighborhoodData[currentNeighborhoodView] ? neighborhoodData[currentNeighborhoodView].district : null;
        if (district === districtCode) {
          resetDistrictView();
        }
      }
    }
    saveHiddenDistricts();
    rebuildLegend();
    renderNeighborhoods();
  }

  function createDistrictSection(districtCode, isHidden) {
    var districtName = districtData[districtCode] ? districtData[districtCode].name : ('Distrito ' + districtCode);
    var districtBarrios = neighborhoodsByDistrict[districtCode].sort();

    var districtHeader = document.createElement('div');
    districtHeader.className = 'legend-district-header';
    if (isHidden) {
      districtHeader.classList.add('hidden-district');
    }
    districtHeader.dataset.district = districtCode;

    var headerText = document.createElement('span');
    headerText.className = 'district-name';
    headerText.textContent = districtName;
    headerText.addEventListener('click', function() {
      if (!isHidden) {
        zoomToDistrict(districtCode);
      }
    });

    var eyeIcon = document.createElement('span');
    eyeIcon.className = 'district-eye-icon';
    eyeIcon.innerHTML = getEyeIcon(isHidden);
    eyeIcon.addEventListener('click', function(e) {
      toggleDistrictVisibility(districtCode, e);
    });

    districtHeader.appendChild(headerText);
    districtHeader.appendChild(eyeIcon);
    legend.appendChild(districtHeader);

    if (!isHidden) {
      districtBarrios.forEach(function(name) {
        var legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
        legendItem.dataset.neighborhood = name;
        legendItem.innerHTML = '<span class="legend-color" style="background-color: ' + (neighborhoodData[name] ? neighborhoodData[name].color : '#ccc') + '"></span><span class="legend-name">' + name + '</span>';
        legendItem.addEventListener('click', function(e) {
          e.stopPropagation();
          zoomToNeighborhood(this.dataset.neighborhood);
        });
        legend.appendChild(legendItem);
      });
    }
  }

  visibleDistricts.forEach(function(districtCode) {
    createDistrictSection(districtCode, false);
  });

  hiddenDistrictsList.forEach(function(districtCode) {
    createDistrictSection(districtCode, true);
  });
}

document.addEventListener('DOMContentLoaded', function() {
  initMap();
});
