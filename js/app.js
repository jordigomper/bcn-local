var mapInstance = null;
var elementRegistry = null;
var filterManager = null;
var legendManager = null;

function loadJSON(url) {
  return fetch(url).then(r => r.json());
}

function loadData() {
  return Promise.all([
    loadJSON('data/barcelona_admin.json'),
    loadJSON('data/transport_public/gasolineras.json'),
    loadJSON('data/transport_public/bicing.json'),
    loadJSON('data/sports_services.json'),
    loadJSON('data/transport_public/metro_routes.json'),
    loadJSON('data/transport_public/metro_stops.json'),
    loadJSON('data/transport_public/bus_routes.json'),
    loadJSON('data/transport_public/bus_stops.json')
  ]).then(function(results) {
    return {
      admin: results[0],
      gasolineras: results[1],
      bicing: results[2],
      sports: results[3],
      metroRoutes: results[4],
      metroStops: results[5],
      busRoutes: results[6],
      busStops: results[7]
    };
  });
}

function createElementsFromData(data) {
  var elements = [];
  var districts = {};
  var neighborhoods = {};

  if (data.admin && data.admin.districts) {
    data.admin.districts.forEach(function(district) {
      if (district.type === 'polygon') {
        var element = ElementFactory.createSingle(district, DistrictElement);
        if (element) {
          elements.push(element);
          districts[district.id] = {
            name: district.metadata ? district.metadata.name : district.id,
            latLngs: Array.isArray(district.coordinates[0][0]) ? district.coordinates : [district.coordinates],
            polygons: Array.isArray(district.coordinates[0][0]) ? district.coordinates : [district.coordinates]
          };
        }
      }
    });
  }

  if (data.admin && data.admin.neighborhoods) {
    var usedColors = {};
    var colorIndex = 0;
    var colorPalette = [
      '#FF6B6B', '#4ECDC4', '#95E1D3', '#F38181', '#AA96DA',
      '#FCBAD3', '#A8E6CF', '#FFD3B6', '#FFAAA5', '#DDA0DD',
      '#FFB347', '#87CEEB', '#98D8C8', '#F7DC6F', '#BB8FCE',
      '#85C1E2', '#F8B739', '#E74C3C', '#3498DB', '#2ECC71'
    ];

    data.admin.neighborhoods.forEach(function(neighborhood) {
      if (neighborhood.type === 'polygon') {
        var meta = neighborhood.metadata || {};
        var name = meta.name || neighborhood.id || '';
        if (!name) return;

        var element = ElementFactory.createSingle(neighborhood, NeighborhoodElement);
        if (element) {
          element.id = name;
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
              color = generateColorFromName(name);
            }
          }

          element.color = color;
          elements.push(element);
          neighborhoods[name] = {
            color: color,
            coordinates: Array.isArray(neighborhood.coordinates[0][0]) ? neighborhood.coordinates[0] : neighborhood.coordinates,
            latLngs: Array.isArray(neighborhood.coordinates[0][0]) ? neighborhood.coordinates : [neighborhood.coordinates],
            district: meta.district || ''
          };
        }
      }
    });
  }

  if (data.gasolineras) {
    data.gasolineras.forEach(function(item) {
      if (item.type === 'marker') {
        var element = ElementFactory.createSingle(item, TransportElement);
        if (element) elements.push(element);
      }
    });
  }

  if (data.bicing) {
    data.bicing.forEach(function(item) {
      if (item.type === 'marker') {
        var element = ElementFactory.createSingle(item, TransportElement);
        if (element) elements.push(element);
      }
    });
  }

  if (data.sports) {
    data.sports.forEach(function(item) {
      if (item.type === 'marker') {
        var element = ElementFactory.createSingle(item, SportsElement);
        if (element) elements.push(element);
      }
    });
  }

  if (data.metroRoutes) {
    data.metroRoutes.forEach(function(item) {
      if (item.type === 'polyline') {
        var element = ElementFactory.createSingle(item, TransportElement);
        if (element) elements.push(element);
      }
    });
  }

  if (data.metroStops) {
    data.metroStops.forEach(function(item) {
      if (item.type === 'marker') {
        var routes = data.metroRoutes || [];
        var routeType = getStopRouteType(item.id, routes);
        var meta = item.metadata || {};
        meta.routeType = routeType;
        item.metadata = meta;
        var element = ElementFactory.createSingle(item, StopElement);
        if (element) elements.push(element);
      }
    });
  }

  if (data.busRoutes) {
    data.busRoutes.forEach(function(item) {
      if (item.type === 'polyline') {
        var element = ElementFactory.createSingle(item, TransportElement);
        if (element) elements.push(element);
      }
    });
  }

  if (data.busStops) {
    data.busStops.forEach(function(item) {
      if (item.type === 'marker') {
        var meta = item.metadata || {};
        meta.routeType = '3';
        item.metadata = meta;
        var element = ElementFactory.createSingle(item, StopElement);
        if (element) elements.push(element);
      }
    });
  }

  return { elements: elements, districts: districts, neighborhoods: neighborhoods };
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
  return '#' + [r, g, b].map(x => {
    var hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

function initApp() {
  mapInstance = new AppMap('map');
  window.mapInstance = mapInstance;

  elementRegistry = mapInstance.registry;
  filterManager = new FilterManager(mapInstance, elementRegistry);
  mapInstance.filterManager = filterManager;

  legendManager = new LegendManager('neighborhood-legend');
  mapInstance.legendManager = legendManager;

  loadData().then(function(data) {
    var result = createElementsFromData(data);

    elementRegistry.registerAll(result.elements);
    mapInstance.registerElements(result.elements);

    var neighborhoodManager = new NeighborhoodManager(mapInstance, elementRegistry);
    neighborhoodManager.districtData = result.districts;
    neighborhoodManager.neighborhoodData = result.neighborhoods;
    mapInstance.neighborhoodManager = neighborhoodManager;

    legendManager.rebuild(result.districts, result.neighborhoods);
    neighborhoodManager.renderNeighborhoods();

    setupEventListeners();
  });
}

function setupEventListeners() {
  document.getElementById('gtfs-metro-toggle').addEventListener('click', function() {
    filterManager.toggleFilter('metro_route');
    filterManager.toggleFilter('metro_stop');
    this.classList.toggle('active');
  });

  document.getElementById('gtfs-bus-toggle').addEventListener('click', function() {
    filterManager.toggleFilter('bus_route');
    if (mapInstance.getZoom() >= 15) {
      filterManager.toggleFilter('bus_stop');
    }
    this.classList.toggle('active');
  });

  document.getElementById('transport-toggle').addEventListener('click', function() {
    filterManager.toggleFilter('gasolinera');
    this.classList.toggle('active');
  });

  document.getElementById('bicing-toggle').addEventListener('click', function() {
    filterManager.toggleFilter('bicing');
    this.classList.toggle('active');
  });

  document.getElementById('sports-toggle').addEventListener('click', function() {
    filterManager.toggleFilter('sports');
    this.classList.toggle('active');
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && (mapInstance.currentDistrictView || mapInstance.currentNeighborhoodView)) {
      mapInstance.resetView();
    }
  });
}

document.addEventListener('DOMContentLoaded', initApp);
