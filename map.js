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

const NEIGHBORHOOD_AREAS = {
  'Ciutat Vella': { minLat: 41.37, maxLat: 41.39, minLng: 2.16, maxLng: 2.20 },
  'Eixample': { minLat: 41.38, maxLat: 41.41, minLng: 2.15, maxLng: 2.19 },
  'Gràcia': { minLat: 41.40, maxLat: 41.41, minLng: 2.15, maxLng: 2.17 },
  'Les Corts': { minLat: 41.38, maxLat: 41.39, minLng: 2.11, maxLng: 2.15 },
  'Sarrià-Sant Gervasi': { minLat: 41.39, maxLat: 41.41, minLng: 2.10, maxLng: 2.15 },
  'Horta-Guinardó': { minLat: 41.41, maxLat: 41.43, minLng: 2.15, maxLng: 2.19 },
  'Nou Barris': { minLat: 41.42, maxLat: 41.45, minLng: 2.17, maxLng: 2.21 },
  'Sant Andreu': { minLat: 41.42, maxLat: 41.44, minLng: 2.19, maxLng: 2.22 },
  'Sant Martí': { minLat: 41.37, maxLat: 41.40, minLng: 2.19, maxLng: 2.22 },
  'Sants-Montjuïc': { minLat: 41.36, maxLat: 41.38, minLng: 2.13, maxLng: 2.19 }
};

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

function getNeighborhood(lat, lng) {
  for (var name in NEIGHBORHOOD_AREAS) {
    var area = NEIGHBORHOOD_AREAS[name];
    if (lat >= area.minLat && lat <= area.maxLat &&
        lng >= area.minLng && lng <= area.maxLng) {
      return name;
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

function updateMap(selectedPostalCode, selectedNeighborhood) {
  markers.forEach(function(marker) {
    map.removeLayer(marker);
  });
  markers = [];

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

  var neighborhoods = [];
  allProperties.forEach(function(p) {
    if (p.neighborhood && neighborhoods.indexOf(p.neighborhood) === -1) {
      neighborhoods.push(p.neighborhood);
    }
  });
  neighborhoods.sort();

  var postalSelect = document.getElementById('postal-filter');
  postalCodes.forEach(function(code) {
    var option = document.createElement('option');
    option.value = code;
    option.textContent = code;
    postalSelect.appendChild(option);
  });

  var neighborhoodSelect = document.getElementById('neighborhood-filter');
  neighborhoods.forEach(function(name) {
    var option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    neighborhoodSelect.appendChild(option);
  });

  map = L.map('map').setView(BCN_CENTER, BCN_ZOOM);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map);

  function applyFilters() {
    var postalValue = postalSelect.value;
    var neighborhoodValue = neighborhoodSelect.value;
    updateMap(postalValue, neighborhoodValue);
  }

  postalSelect.addEventListener('change', applyFilters);
  neighborhoodSelect.addEventListener('change', applyFilters);

  updateMap('all', 'all');
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
