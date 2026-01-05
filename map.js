const STORAGE_KEY = 'facilitea_properties';

const BCN_CITY_BOUNDS = {
  minLat: 41.32,
  maxLat: 41.47,
  minLng: 2.05,
  maxLng: 2.23
};

const BCN_CENTER = [41.3874, 2.1686];
const BCN_ZOOM = 14;

const POSTAL_CODE_AREAS = {
  '08001': { minLat: 41.375, maxLat: 41.385, minLng: 2.16, maxLng: 2.18 },
  '08002': { minLat: 41.38, maxLat: 41.39, minLng: 2.17, maxLng: 2.19 },
  '08003': { minLat: 41.38, maxLat: 41.39, minLng: 2.18, maxLng: 2.20 },
  '08004': { minLat: 41.37, maxLat: 41.38, minLng: 2.15, maxLng: 2.17 },
  '08005': { minLat: 41.39, maxLat: 41.40, minLng: 2.19, maxLng: 2.21 },
  '08006': { minLat: 41.39, maxLat: 41.41, minLng: 2.15, maxLng: 2.17 },
  '08007': { minLat: 41.39, maxLat: 41.40, minLng: 2.16, maxLng: 2.18 },
  '08008': { minLat: 41.39, maxLat: 41.40, minLng: 2.15, maxLng: 2.17 },
  '08009': { minLat: 41.39, maxLat: 41.40, minLng: 2.16, maxLng: 2.18 },
  '08010': { minLat: 41.40, maxLat: 41.41, minLng: 2.17, maxLng: 2.19 },
  '08011': { minLat: 41.38, maxLat: 41.39, minLng: 2.15, maxLng: 2.17 },
  '08012': { minLat: 41.40, maxLat: 41.41, minLng: 2.15, maxLng: 2.17 },
  '08013': { minLat: 41.40, maxLat: 41.41, minLng: 2.18, maxLng: 2.20 },
  '08014': { minLat: 41.37, maxLat: 41.38, minLng: 2.13, maxLng: 2.15 },
  '08015': { minLat: 41.38, maxLat: 41.39, minLng: 2.13, maxLng: 2.15 },
  '08020': { minLat: 41.41, maxLat: 41.42, minLng: 2.17, maxLng: 2.19 },
  '08021': { minLat: 41.40, maxLat: 41.41, minLng: 2.13, maxLng: 2.15 },
  '08022': { minLat: 41.40, maxLat: 41.41, minLng: 2.12, maxLng: 2.14 },
  '08023': { minLat: 41.40, maxLat: 41.41, minLng: 2.11, maxLng: 2.13 },
  '08024': { minLat: 41.41, maxLat: 41.42, minLng: 2.15, maxLng: 2.17 },
  '08025': { minLat: 41.41, maxLat: 41.42, minLng: 2.17, maxLng: 2.19 },
  '08026': { minLat: 41.42, maxLat: 41.43, minLng: 2.17, maxLng: 2.19 },
  '08028': { minLat: 41.38, maxLat: 41.39, minLng: 2.11, maxLng: 2.13 },
  '08029': { minLat: 41.38, maxLat: 41.39, minLng: 2.12, maxLng: 2.14 },
  '08030': { minLat: 41.42, maxLat: 41.43, minLng: 2.19, maxLng: 2.21 },
  '08031': { minLat: 41.43, maxLat: 41.44, minLng: 2.17, maxLng: 2.19 },
  '08032': { minLat: 41.43, maxLat: 41.44, minLng: 2.15, maxLng: 2.17 },
  '08033': { minLat: 41.44, maxLat: 41.45, minLng: 2.17, maxLng: 2.19 },
  '08034': { minLat: 41.39, maxLat: 41.40, minLng: 2.10, maxLng: 2.12 },
  '08035': { minLat: 41.40, maxLat: 41.41, minLng: 2.10, maxLng: 2.12 },
  '08036': { minLat: 41.39, maxLat: 41.40, minLng: 2.14, maxLng: 2.16 },
  '08037': { minLat: 41.40, maxLat: 41.41, minLng: 2.16, maxLng: 2.18 },
  '08038': { minLat: 41.37, maxLat: 41.38, minLng: 2.17, maxLng: 2.19 },
  '08039': { minLat: 41.37, maxLat: 41.38, minLng: 2.19, maxLng: 2.21 },
  '08040': { minLat: 41.38, maxLat: 41.39, minLng: 2.19, maxLng: 2.21 },
  '08041': { minLat: 41.38, maxLat: 41.39, minLng: 2.20, maxLng: 2.22 },
  '08042': { minLat: 41.39, maxLat: 41.40, minLng: 2.20, maxLng: 2.22 }
};

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


function getPostalCode(lat, lng) {
  for (var code in POSTAL_CODE_AREAS) {
    var area = POSTAL_CODE_AREAS[code];
    if (lat >= area.minLat && lat <= area.maxLat &&
        lng >= area.minLng && lng <= area.maxLng) {
      return code;
    }
  }
  return null;
}

function isInBarcelonaCity(lat, lng) {
  return lat >= BCN_CITY_BOUNDS.minLat &&
         lat <= BCN_CITY_BOUNDS.maxLat &&
         lng >= BCN_CITY_BOUNDS.minLng &&
         lng <= BCN_CITY_BOUNDS.maxLng;
}

function parseCoordinates(coordStr) {
  const [lat, lng] = coordStr.split(',').map(Number);
  return { lat, lng };
}

function formatPrice(price) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(parseFloat(price));
}

function createMarkerIcon(isNew) {
  const color = isNew ? '#e53935' : '#4caf50';
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">' +
    '<path fill="' + color + '" stroke="#fff" stroke-width="2" d="M16 1C8.268 1 2 7.268 2 15c0 10.5 14 25 14 25s14-14.5 14-25c0-7.732-6.268-14-14-14z"/>' +
    '<circle fill="#fff" cx="16" cy="15" r="6"/>' +
    '</svg>';
  return L.divIcon({
    html: svg,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -42],
    className: 'custom-marker'
  });
}

var map;
var markers = [];
var allProperties = [];
var neighborhoodLayers = [];
var neighborhoodData = {};

function getNeighborhood(lat, lng) {
  for (var name in neighborhoodData) {
    var polygon = neighborhoodData[name].polygon;
    if (polygon && pointInPolygon([lng, lat], polygon)) {
      return name;
    }
  }
  return null;
}

function getNeighborhoodColor(name) {
  return neighborhoodData[name] ? neighborhoodData[name].color : '#CCCCCC';
}

function loadNeighborhoods() {
  return fetch(chrome.runtime.getURL('data/0301100100_UNITATS_ADM_POLIGONS.json'))
    .then(function(response) { return response.json(); })
    .then(function(data) {
      var barris = data.features.filter(function(f) {
        return f.properties.BARRI && f.properties.BARRI !== '-' && f.properties.TIPUS_UA === 'BARRI';
      });

      var usedColors = {};
      var colorIndex = 0;
      var colorPalette = [
        '#FF6B6B', '#4ECDC4', '#95E1D3', '#F38181', '#AA96DA',
        '#FCBAD3', '#A8E6CF', '#FFD3B6', '#FFAAA5', '#DDA0DD',
        '#FFB347', '#87CEEB', '#DDA0DD', '#98D8C8', '#F7DC6F',
        '#BB8FCE', '#85C1E2', '#F8B739', '#E74C3C', '#3498DB',
        '#2ECC71', '#F39C12', '#9B59B6', '#1ABC9C', '#E67E22',
        '#34495E', '#16A085', '#27AE60', '#2980B9', '#8E44AD',
        '#C0392B', '#D35400', '#F1C40F', '#E74C3C', '#ECF0F1'
      ];

      barris.forEach(function(feature) {
        var props = feature.properties;
        var name = props.NOM || '';
        var jsonColor = props.FHEX_COLOR;
        var geometry = feature.geometry;

        if (!name) return;

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

        var convertedCoords;
        if (geometry.type === 'MultiPolygon') {
          convertedCoords = geometry.coordinates[0][0].map(function(coord) {
            var x = coord[0];
            var y = coord[1];
            var lat = 41.385 + (y - 4580000) / 111320;
            var lng = 2.173 + (x - 430000) / (111320 * Math.cos(41.385 * Math.PI / 180));
            return [lat, lng];
          });
        } else if (geometry.type === 'Polygon') {
          convertedCoords = geometry.coordinates[0].map(function(coord) {
            var x = coord[0];
            var y = coord[1];
            var lat = 41.385 + (y - 4580000) / 111320;
            var lng = 2.173 + (x - 430000) / (111320 * Math.cos(41.385 * Math.PI / 180));
            return [lat, lng];
          });
        } else {
          return;
        }

        var flatCoords = convertedCoords.map(function(c) { return [c[1], c[0]]; });

        neighborhoodData[name] = {
          color: color,
          coordinates: convertedCoords,
          polygon: flatCoords
        };
      });
    });
}

function updateMap(selectedPostalCode, selectedNeighborhood) {
  markers.forEach(function(marker) {
    map.removeLayer(marker);
  });
  markers = [];

  neighborhoodLayers.forEach(function(layer) {
    map.removeLayer(layer);
  });
  neighborhoodLayers = [];

  for (var name in neighborhoodData) {
    var data = neighborhoodData[name];
    var isSelected = selectedNeighborhood === name;
    var opacity = isSelected ? 0.35 : 0.12;
    var weight = isSelected ? 4 : 2.5;
    var dashArray = isSelected ? null : '5, 5';

    var polygonCoords = data.coordinates.map(function(c) { return [c[0], c[1]]; });
    var polygon = L.polygon(polygonCoords, {
      color: data.color,
      fillColor: data.color,
      fillOpacity: opacity,
      weight: weight,
      opacity: 0.9,
      dashArray: dashArray,
      className: 'neighborhood-polygon'
    }).addTo(map);

    neighborhoodLayers.push(polygon);
  }

  var filteredProperties = allProperties.filter(function(p) {
    if (!p.coordinates) return false;
    var coords = parseCoordinates(p.coordinates);
    if (!isInBarcelonaCity(coords.lat, coords.lng)) return false;

    if (selectedPostalCode && selectedPostalCode !== 'all') {
      var postalCode = getPostalCode(coords.lat, coords.lng);
      if (postalCode !== selectedPostalCode) return false;
    }

    if (selectedNeighborhood && selectedNeighborhood !== 'all') {
      var neighborhood = getNeighborhood(coords.lat, coords.lng);
      if (neighborhood !== selectedNeighborhood) return false;
    }

    return true;
  });

  var newCount = filteredProperties.filter(function(p) { return !p.viewed; }).length;
  var viewedCount = filteredProperties.filter(function(p) { return p.viewed; }).length;

  document.getElementById('new-count').textContent = newCount;
  document.getElementById('viewed-count').textContent = viewedCount;

  filteredProperties.forEach(function(property) {
    var coords = parseCoordinates(property.coordinates);
    var isNew = !property.viewed;

    var marker = L.marker([coords.lat, coords.lng], {
      icon: createMarkerIcon(isNew)
    }).addTo(map);

    var popupContent = '<div class="custom-popup">' +
      '<div class="price">' + formatPrice(property.list_selling_price_amount) + '</div>' +
      '<div class="ref">Ref: ' + property.ref + '</div>' +
      '<span class="status ' + (isNew ? 'new' : 'viewed') + '">' + (isNew ? '🆕 Nueva' : '✓ Vista') + '</span>' +
      '<a class="link" href="https://faciliteacasa.com/viviendas/' + property.id + '" target="_blank">Ver propiedad</a>' +
      '</div>';

    marker.bindPopup(popupContent);
    markers.push(marker);
  });

  if (filteredProperties.length > 0) {
    var bounds = L.latLngBounds(
      filteredProperties.map(function(p) {
        var coords = parseCoordinates(p.coordinates);
        return [coords.lat, coords.lng];
      })
    );
    map.fitBounds(bounds, { padding: [50, 50] });
  }
}

function initMap(properties) {
  allProperties = properties.filter(function(p) {
    if (!p.coordinates) return false;
    var coords = parseCoordinates(p.coordinates);
    return isInBarcelonaCity(coords.lat, coords.lng);
  });

  allProperties.forEach(function(p) {
    if (!p.postalCode && p.coordinates) {
      var coords = parseCoordinates(p.coordinates);
      p.postalCode = getPostalCode(coords.lat, coords.lng);
      p.neighborhood = getNeighborhood(coords.lat, coords.lng);
    }
  });

  var postalCodes = [];
  allProperties.forEach(function(p) {
    if (p.postalCode && postalCodes.indexOf(p.postalCode) === -1) {
      postalCodes.push(p.postalCode);
    }
  });
  postalCodes.sort();

  var postalSelect = document.getElementById('postal-filter');
  postalCodes.forEach(function(code) {
    var option = document.createElement('option');
    option.value = code;
    option.textContent = code;
    postalSelect.appendChild(option);
  });

  map = L.map('map').setView(BCN_CENTER, BCN_ZOOM);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  }).addTo(map);

  loadNeighborhoods().then(function() {
    var neighborhoods = Object.keys(neighborhoodData).sort();
    var neighborhoodSelect = document.getElementById('neighborhood-filter');
    var legend = document.getElementById('neighborhood-legend');

    neighborhoods.forEach(function(name) {
      var option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      option.style.backgroundColor = getNeighborhoodColor(name);
      option.style.color = '#000';
      neighborhoodSelect.appendChild(option);

      var legendItem = document.createElement('div');
      legendItem.className = 'legend-item';
      legendItem.dataset.neighborhood = name;
      legendItem.innerHTML = '<span class="legend-color" style="background-color: ' + getNeighborhoodColor(name) + '"></span><span class="legend-name">' + name + '</span>';
      legendItem.addEventListener('click', function() {
        neighborhoodSelect.value = name;
        var event = new Event('change');
        neighborhoodSelect.dispatchEvent(event);
      });
      legend.appendChild(legendItem);
    });

    allProperties.forEach(function(p) {
      if (!p.neighborhood && p.coordinates) {
        var coords = parseCoordinates(p.coordinates);
        p.neighborhood = getNeighborhood(coords.lat, coords.lng);
      }
    });

    function applyFilters() {
      var postalValue = postalSelect.value;
      var neighborhoodValue = neighborhoodSelect.value;

      if (neighborhoodValue && neighborhoodValue !== 'all') {
        var color = getNeighborhoodColor(neighborhoodValue);
        neighborhoodSelect.style.borderColor = color;
        neighborhoodSelect.style.backgroundColor = color + '20';
      } else {
        neighborhoodSelect.style.borderColor = 'rgba(0, 0, 0, 0.1)';
        neighborhoodSelect.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
      }

      var legendItems = document.querySelectorAll('.legend-item');
      legendItems.forEach(function(item) {
        if (item.dataset.neighborhood === neighborhoodValue) {
          item.style.background = 'rgba(229, 57, 53, 0.1)';
          item.style.fontWeight = '600';
        } else {
          item.style.background = '';
          item.style.fontWeight = '';
        }
      });

      updateMap(postalValue, neighborhoodValue);
    }

    postalSelect.addEventListener('change', applyFilters);
    neighborhoodSelect.addEventListener('change', applyFilters);

    updateMap('all', 'all');
  });
}

document.addEventListener('DOMContentLoaded', function() {
  chrome.storage.local.get([STORAGE_KEY], function(result) {
    var properties = result[STORAGE_KEY] || [];
    if (properties.length === 0) {
      document.getElementById('map').innerHTML = '<div class="loading">No hay datos disponibles</div>';
      return;
    }
    initMap(properties);
  });
});
