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

function fetchPropertyDetails(ref) {
  return fetch('https://faciliteacasa.com/api/property-public/map-details/' + ref)
    .then(function(response) { return response.json(); })
    .catch(function() { return null; });
}

function fetchSportsData() {
  if (sportsData) return Promise.resolve(sportsData);
  return fetch(chrome.runtime.getURL('data/sport_service_simplified.json'))
    .then(function(response) { return response.json(); })
    .then(function(data) {
      sportsData = data || [];
      return sportsData;
    });
}

function fetchTransportData() {
  if (transportData) return Promise.resolve(transportData);
  return fetch(chrome.runtime.getURL('data/transporte_publico_origin.json'))
    .then(function(response) { return response.json(); })
    .then(function(data) {
      transportData = data || [];
      return transportData;
    });
}

function getTransportCategory(item) {
  var types = item && item.types ? item.types : [];
  if (types.indexOf('gasolinera') !== -1) return 'gasolinera';
  if (types.indexOf('bicing') !== -1) return 'bicing';
  if (types.indexOf('metro') !== -1 || types.indexOf('tren') !== -1 || types.indexOf('tramvia') !== -1) {
    return 'metro_tren';
  }
  if (types.indexOf('bus') !== -1) return 'bus';
  return 'metro_tren';
}

function getTransportLabel(category) {
  if (category === 'bicing') return 'Bicing';
  if (category === 'bus') return 'Bus';
  if (category === 'gasolinera') return 'Gasolinera';
  return 'Metro/Tren';
}

function formatTransportAddress(address) {
  if (!address) return '';
  var parts = [];
  if (address.street) {
    parts.push(address.street + (address.street_number ? ' ' + address.street_number : ''));
  }
  if (address.neighborhood) parts.push(address.neighborhood);
  if (address.district) parts.push(address.district);
  if (address.zip_code) parts.push(address.zip_code);
  return parts.join(' · ');
}

function buildTransportPopup(item, label) {
  var title = item.name || label;
  var typesLabel = (item.types || []).map(function(type) {
    if (type === 'bicing') return 'Bicing';
    if (type === 'bus') return 'Bus';
    if (type === 'metro') return 'Metro';
    if (type === 'tren') return 'Tren';
    if (type === 'tramvia') return 'Tranvía';
    if (type === 'gasolinera') return 'Gasolinera';
    return type;
  }).join(', ');
  var address = formatTransportAddress(item.address);
  var lines = item.lines && item.lines.length ? '<div class="transport-lines">Líneas: ' + item.lines.join(', ') + '</div>' : '';
  return '<div class="transport-popup">' +
    '<div class="transport-title">' + title + '</div>' +
    (typesLabel ? '<div class="transport-type">' + typesLabel + '</div>' : '') +
    (address ? '<div class="transport-address">' + address + '</div>' : '') +
    lines +
    '</div>';
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
    var loc = item.location;
    if (!loc || typeof loc.lat !== 'number' || typeof loc.lng !== 'number') return;
    var category = getTransportCategory(item);
    var label = getTransportLabel(category);
    if (category === 'bus') return;
    var marker = L.marker([loc.lat, loc.lng], {
      icon: buildTransportIcon(category)
    });
    marker.bindTooltip(item.name || label, {
      permanent: false,
      direction: 'top',
      className: 'neighborhood-tooltip'
    });
    marker.bindPopup(buildTransportPopup(item, label));
    layer.addLayer(marker);
  });
  return layer;
}

function toggleTransportLayer() {
  if (!map) return;
  var button = document.getElementById('transport-toggle');
  var legend = document.getElementById('transport-legend');
  if (!transportVisible) {
    fetchTransportData().then(function() {
      if (!transportLayer) {
        transportLayer = buildTransportLayer();
      }
      if (transportLayer) {
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
  }
}

function buildSportsLayer() {
  if (!sportsData || !sportsData.length) return null;
  var layer = L.layerGroup();
  sportsData.forEach(function(item) {
    var loc = item.location;
    if (!loc) return;
    var lat = null;
    var lng = null;
    if (Array.isArray(loc) && loc.length >= 2) {
      if (typeof loc[0] === 'number' && typeof loc[1] === 'number') {
        if (Math.abs(loc[0]) <= 90 && Math.abs(loc[1]) <= 180) {
          lat = loc[0];
          lng = loc[1];
        } else if (Math.abs(loc[1]) <= 90 && Math.abs(loc[0]) <= 180) {
          lat = loc[1];
          lng = loc[0];
        }
      }
    } else if (loc.lat && (loc.lng || loc.lon)) {
      lat = loc.lat;
      lng = loc.lng || loc.lon;
    } else if (loc.latitude && loc.longitude) {
      lat = loc.latitude;
      lng = loc.longitude;
    }
    if (lat === null || lng === null) return;
    var marker = L.circleMarker([lat, lng], {
      radius: 4,
      color: '#1565c0',
      weight: 1,
      opacity: 0.6,
      fillColor: '#64b5f6',
      fillOpacity: 0.4
    });
    marker.bindTooltip(item.name || 'Servicio deportivo', {
      permanent: false,
      direction: 'top',
      className: 'neighborhood-tooltip'
    });
    layer.addLayer(marker);
  });
  return layer;
}

function toggleSportsLayer() {
  if (!map) return;
  var button = document.getElementById('sports-toggle');
  if (!sportsVisible) {
    fetchSportsData().then(function() {
      if (!sportsLayer) {
        sportsLayer = buildSportsLayer();
      }
      if (sportsLayer) {
        sportsLayer.addTo(map);
        sportsVisible = true;
        if (button) button.classList.add('active');
      }
    });
  } else {
    if (sportsLayer) {
      map.removeLayer(sportsLayer);
    }
    sportsVisible = false;
    if (button) button.classList.remove('active');
  }
}

function formatViewedAt(viewedAt) {
  if (!viewedAt) return '';
  var date = new Date(viewedAt);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function persistViewedAt(property) {
  if (!property || !property.id) return;
  chrome.storage.local.get([STORAGE_KEY], function(result) {
    var properties = result[STORAGE_KEY] || [];
    var index = properties.findIndex(function(p) { return p.id === property.id; });
    if (index !== -1) {
      properties[index].viewed = true;
      properties[index].viewedAt = property.viewedAt;
      chrome.storage.local.set({ [STORAGE_KEY]: properties });
    }
  });
}

function persistFavorite(property) {
  if (!property || !property.id) return;
  chrome.storage.local.get([STORAGE_KEY], function(result) {
    var properties = result[STORAGE_KEY] || [];
    var index = properties.findIndex(function(p) { return p.id === property.id; });
    if (index !== -1) {
      properties[index].liked = property.liked;
      chrome.storage.local.set({ [STORAGE_KEY]: properties });
    }
  });
}

function persistContactedAt(property) {
  if (!property || !property.id) return;
  chrome.storage.local.get([STORAGE_KEY], function(result) {
    var properties = result[STORAGE_KEY] || [];
    var index = properties.findIndex(function(p) { return p.id === property.id; });
    if (index !== -1) {
      properties[index].contactedAt = property.contactedAt;
      chrome.storage.local.set({ [STORAGE_KEY]: properties });
    }
  });
}

function updateStats(properties) {
  var newCount = properties.filter(function(p) { return !p.viewed; }).length;
  var likedCount = properties.filter(function(p) { return p.liked; }).length;
  var viewedCount = properties.filter(function(p) { return p.viewed && !p.liked; }).length;
  var newEl = document.getElementById('new-count');
  var viewedEl = document.getElementById('viewed-count');
  var likedEl = document.getElementById('liked-count');
  if (newEl) newEl.textContent = newCount;
  if (viewedEl) viewedEl.textContent = viewedCount;
  if (likedEl) likedEl.textContent = likedCount;
}

function matchesStatusFilter(property) {
  if (currentStatusFilter === 'new') {
    return !property.viewed;
  }
  if (currentStatusFilter === 'viewed') {
    return property.viewed && !property.liked;
  }
  if (currentStatusFilter === 'liked') {
    return property.liked;
  }
  return true;
}

function buildPopupContent(property) {
  var isNew = !property.viewed;
  var viewedAtText = formatViewedAt(property.viewedAt);
  var viewedAtHtml = viewedAtText ? '<div class="viewed-at">Visto: ' + viewedAtText + '</div>' : '';
  var contactedAtText = formatViewedAt(property.contactedAt);
  var contactedAtHtml = contactedAtText ? '<div class="viewed-at">Contactado: ' + contactedAtText + '</div>' : '';
  var likedLabel = property.liked ? 'Guardado' : 'Guardar';
  var likedClass = property.liked ? 'liked' : '';
  var contactedLabel = property.contactedAt ? 'Contactado' : 'Contactar';
  var contactedClass = property.contactedAt ? 'liked' : '';
  return '<div class="custom-popup">' +
    '<div class="price">' + formatPrice(property.list_selling_price_amount) + '</div>' +
    '<div class="ref">Ref: ' + property.ref + '</div>' +
    (isNew ? '<span class="status new">🆕 Nueva</span>' : '') +
    viewedAtHtml +
    contactedAtHtml +
    '<button class="like-button ' + likedClass + '" type="button">' + likedLabel + '</button>' +
    '<button class="contact-button ' + contactedClass + '" type="button">' + contactedLabel + '</button>' +
    '<a class="link" href="https://faciliteacasa.com/vivienda/venta-piso-barcelona-' + property.ref + '" target="_blank">Ver propiedad</a>' +
    '</div>';
}

function getMarkerColor(property) {
  if (property.contactedAt) return '#4caf50';
  if (property.liked) return '#4caf50';
  if (property.viewed) return '#ff9800';
  return '#e53935';
}

function createMarkerIcon(property) {
  const color = getMarkerColor(property);
  const center = property.contactedAt
    ? '<rect x="10.2" y="12.2" width="11.6" height="7.6" rx="1.2" ry="1.2" fill="#fff"/>' +
      '<path d="M10.2 12.6 L16 16.6 L21.8 12.6" fill="none" stroke="#e53935" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<rect x="10.2" y="12.2" width="11.6" height="7.6" rx="1.2" ry="1.2" fill="none" stroke="#e53935" stroke-width="1.2"/>'
    : '<circle fill="#fff" cx="16" cy="15" r="6"/>';
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">' +
    '<path fill="' + color + '" stroke="#fff" stroke-width="2" d="M16 1C8.268 1 2 7.268 2 15c0 10.5 14 25 14 25s14-14.5 14-25c0-7.732-6.268-14-14-14z"/>' +
    center +
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
var districtData = {};
var selectedDistrictLayer = null;
var selectedNeighborhoodLayer = null;
var currentDistrictView = null;
var currentNeighborhoodView = null;
var hiddenDistricts = {};
const HIDDEN_DISTRICTS_KEY = 'facilitea_hidden_districts';
const EXTRARADIO_NORTH = 'EXTRARADIO_N';
const EXTRARADIO_SOUTH = 'EXTRARADIO_S';
var currentStatusFilter = 'all';
var sportsLayer = null;
var sportsVisible = false;
var sportsData = null;
var transportLayer = null;
var transportVisible = false;
var transportData = null;

var DISTRICT_NAMES = {
  '01': 'Ciutat Vella',
  '02': 'Eixample',
  '03': 'Sants-Montjuïc',
  '04': 'Les Corts',
  '05': 'Sarrià-Sant Gervasi',
  '06': 'Gràcia',
  '07': 'Horta-Guinardó',
  '08': 'Nou Barris',
  '09': 'Sant Andreu',
  '10': 'Sant Martí',
  'EXTRARADIO_N': 'EXTRARADIO NORTE',
  'EXTRARADIO_S': 'EXTRARADIO SUR'
};

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

function getEyeIcon(isHidden) {
  if (isHidden) {
    return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#bbb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>';
  }
  return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#bbb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
}

function saveHiddenDistricts() {
  chrome.storage.local.set({ [HIDDEN_DISTRICTS_KEY]: hiddenDistricts });
}

function loadHiddenDistricts() {
  return new Promise(function(resolve) {
    chrome.storage.local.get([HIDDEN_DISTRICTS_KEY], function(result) {
      if (result[HIDDEN_DISTRICTS_KEY]) {
        hiddenDistricts = result[HIDDEN_DISTRICTS_KEY];
      }
      resolve();
    });
  });
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

function getDistrictByPoint(lat, lng) {
  var point = [lng, lat];
  var districtCodes = Object.keys(districtData);
  for (var i = 0; i < districtCodes.length; i++) {
    var code = districtCodes[i];
    var polygons = districtData[code].polygons;
    if (!polygons) continue;
    for (var j = 0; j < polygons.length; j++) {
      if (pointInPolygon(point, polygons[j])) {
        return code;
      }
    }
  }
  return null;
}

function assignPropertyDistrict(p) {
  if (!p || !p.coordinates) return null;
  var coords = parseCoordinates(p.coordinates);
  var neighborhood = p.neighborhood || getNeighborhood(coords.lat, coords.lng);
  if (neighborhood && neighborhoodData[neighborhood]) {
    p.neighborhood = neighborhood;
    p.district = neighborhoodData[neighborhood].district;
    return p.district;
  }

  var district = getDistrictByPoint(coords.lat, coords.lng);
  if (district) {
    p.district = district;
    return p.district;
  }

  p.district = coords.lat >= BCN_CENTER[0] ? EXTRARADIO_NORTH : EXTRARADIO_SOUTH;
  return p.district;
}

function loadNeighborhoods() {
  return fetch(chrome.runtime.getURL('data/0301100100_UNITATS_ADM_POLIGONS.json'))
    .then(function(response) { return response.json(); })
    .then(function(data) {
      var distritos = data.features.filter(function(f) {
        return f.properties.TIPUS_UA === 'DISTRICTE' && f.properties.DISTRICTE && f.properties.DISTRICTE !== '-';
      });

      distritos.forEach(function(feature) {
        var props = feature.properties;
        var districtCode = props.DISTRICTE;
        var geometry = feature.geometry;

        if (!districtCode) return;

        districtData[districtCode] = {
          latLngs: geometryToLatLngs(geometry),
          polygons: geometryToPolygonsLngLat(geometry)
        };
      });

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

        var latLngs = geometryToLatLngs(geometry);
        if (!latLngs) return;
        var outerRing = geometry.type === 'MultiPolygon' ? latLngs[0][0] : latLngs[0];
        var flatCoords = outerRing.map(function(c) { return [c[1], c[0]]; });

        neighborhoodData[name] = {
          color: color,
          coordinates: outerRing,
          latLngs: latLngs,
          polygon: flatCoords,
          district: props.DISTRICTE || ''
        };
      });
    });
}

function zoomToDistrict(districtCode) {
  var isExtra = districtCode === EXTRARADIO_NORTH || districtCode === EXTRARADIO_SOUTH;
  if (!isExtra && (!districtData[districtCode] || !districtData[districtCode].latLngs)) return;

  if (selectedDistrictLayer) {
    map.removeLayer(selectedDistrictLayer);
    selectedDistrictLayer = null;
  }

  if (selectedNeighborhoodLayer) {
    map.removeLayer(selectedNeighborhoodLayer);
    selectedNeighborhoodLayer = null;
  }

  if (!isExtra) {
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
  } else {
    var extraProps = allProperties.filter(function(p) {
      return p.district === districtCode;
    });
    if (extraProps.length > 0) {
      var bounds = L.latLngBounds(
        extraProps.map(function(p) {
          var coords = parseCoordinates(p.coordinates);
          return [coords.lat, coords.lng];
        })
      );
      map.fitBounds(bounds, { padding: [100, 100], maxZoom: 15 });
    }
  }

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

  var postalSelect = null;

  setTimeout(function() {
    updateMap('all', 'all');

    setTimeout(function() {
      if (selectedDistrictLayer) {
        selectedDistrictLayer.bringToFront();
      }
    }, 100);
  }, 100);
}

function zoomToNeighborhood(neighborhoodName) {
  var neighborhood = neighborhoodData[neighborhoodName];

  if (!neighborhood) {
    console.log('Barrio no encontrado:', neighborhoodName);
    console.log('Barrios disponibles:', Object.keys(neighborhoodData));
    var found = Object.keys(neighborhoodData).find(function(key) {
      return key.toLowerCase() === neighborhoodName.toLowerCase() ||
             key.toLowerCase().includes(neighborhoodName.toLowerCase()) ||
             neighborhoodName.toLowerCase().includes(key.toLowerCase());
    });
    if (found) {
      console.log('Barrio encontrado por similitud:', found);
      neighborhood = neighborhoodData[found];
      neighborhoodName = found;
    } else {
      return;
    }
  }

  if (selectedNeighborhoodLayer) {
    map.removeLayer(selectedNeighborhoodLayer);
    selectedNeighborhoodLayer = null;
  }

  if (selectedDistrictLayer) {
    map.removeLayer(selectedDistrictLayer);
    selectedDistrictLayer = null;
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

  var postalSelect = null;

  setTimeout(function() {
    updateMap('all', neighborhoodName);

    setTimeout(function() {
      if (selectedNeighborhoodLayer) {
        selectedNeighborhoodLayer.bringToFront();
      }
    }, 100);
  }, 300);
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

  var headers = document.querySelectorAll('.legend-district-header');
  headers.forEach(function(header) {
    header.classList.remove('active');
  });

  var legendItems = document.querySelectorAll('.legend-item');
  legendItems.forEach(function(item) {
    item.classList.remove('active');
  });

  updateMap('all', 'all');

  if (allProperties.length > 0) {
    var bounds = L.latLngBounds(
      allProperties.map(function(p) {
        var coords = parseCoordinates(p.coordinates);
        return [coords.lat, coords.lng];
      })
    );
    map.fitBounds(bounds, { padding: [50, 50] });
  } else {
    map.setView(BCN_CENTER, BCN_ZOOM);
  }
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

  var neighborhoodsToShow = [];
  if (currentDistrictView) {
    for (var name in neighborhoodData) {
      if (neighborhoodData[name].district === currentDistrictView) {
        if (hiddenDistricts[currentDistrictView]) {
          continue;
        }
        neighborhoodsToShow.push(name);
      }
    }
  } else {
    for (var name in neighborhoodData) {
      var district = neighborhoodData[name].district || '';
      if (!hiddenDistricts[district]) {
        neighborhoodsToShow.push(name);
      }
    }
  }

  for (var i = 0; i < neighborhoodsToShow.length; i++) {
    var name = neighborhoodsToShow[i];
    var data = neighborhoodData[name];
    var isSelected = selectedNeighborhood === name || currentNeighborhoodView === name;
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
      var clickedName = this.neighborhoodName;
      console.log('Click en polígono - Barrio:', clickedName);
      zoomToNeighborhood(clickedName);
    });

    polygon.bindTooltip(name, {
      permanent: false,
      direction: 'center',
      className: 'neighborhood-tooltip'
    });

    neighborhoodLayers.push(polygon);
  }

  var baseFilteredProperties = allProperties.filter(function(p) {
    if (!p.coordinates) return false;
    var coords = parseCoordinates(p.coordinates);
    if (!isInBarcelonaCity(coords.lat, coords.lng)) return false;
    var district = p.district || assignPropertyDistrict(p);
    if (district && hiddenDistricts[district]) {
      return false;
    }

    if (currentDistrictView) {
      if (district !== currentDistrictView) {
        return false;
      }
    }

    if (selectedPostalCode && selectedPostalCode !== 'all') {
      var postalCode = getPostalCode(coords.lat, coords.lng);
      if (postalCode !== selectedPostalCode) return false;
    }

    if (selectedNeighborhood && selectedNeighborhood !== 'all') {
      var neighborhood = p.neighborhood || getNeighborhood(coords.lat, coords.lng);
      if (neighborhood !== selectedNeighborhood) return false;
    }

    if (currentNeighborhoodView) {
      var currentNeighborhood = p.neighborhood || getNeighborhood(coords.lat, coords.lng);
      if (currentNeighborhood !== currentNeighborhoodView) return false;
    }

    return true;
  });

  updateStats(baseFilteredProperties);

  var filteredProperties = baseFilteredProperties.filter(matchesStatusFilter);

  filteredProperties.forEach(function(property) {
    var coords = parseCoordinates(property.coordinates);
    var marker = L.marker([coords.lat, coords.lng], {
      icon: createMarkerIcon(property)
    }).addTo(map);

    marker.on('click', function() {
      if (property.ref) {
        fetchPropertyDetails(property.ref);
      }
    });

    marker.bindPopup(buildPopupContent(property));
    marker.on('popupopen', function(e) {
      var popupEl = e.popup && e.popup.getElement ? e.popup.getElement() : null;
      if (!popupEl) return;
      var likeButton = popupEl.querySelector('.like-button');
      if (likeButton) {
        likeButton.addEventListener('click', function() {
          property.liked = !property.liked;
          persistFavorite(property);
          marker.setIcon(createMarkerIcon(property));
          marker.setPopupContent(buildPopupContent(property));
          updateStats(baseFilteredProperties);
          if (!matchesStatusFilter(property)) {
            updateMap('all', 'all');
          }
        }, { once: true });
      }
      var contactButton = popupEl.querySelector('.contact-button');
      if (contactButton) {
        contactButton.addEventListener('click', function() {
          property.contactedAt = new Date().toISOString();
          persistContactedAt(property);
          marker.setIcon(createMarkerIcon(property));
          marker.setPopupContent(buildPopupContent(property));
          updateStats(baseFilteredProperties);
          if (!matchesStatusFilter(property)) {
            updateMap('all', 'all');
          }
        }, { once: true });
      }
      var link = popupEl.querySelector('.link');
      if (!link) return;
      link.addEventListener('click', function() {
        property.viewedAt = new Date().toISOString();
        property.viewed = true;
        persistViewedAt(property);
        marker.setIcon(createMarkerIcon(property));
        marker.setPopupContent(buildPopupContent(property));
        updateStats(baseFilteredProperties);
        if (!matchesStatusFilter(property)) {
          updateMap('all', 'all');
        }
      }, { once: true });
    });
    markers.push(marker);
  });

  if (filteredProperties.length > 0 && !currentNeighborhoodView && !currentDistrictView) {
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

  map = L.map('map').setView(BCN_CENTER, BCN_ZOOM);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19
  }).addTo(map);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
    attribution: '',
    maxZoom: 19,
    pane: 'overlayPane'
  }).addTo(map);

  loadNeighborhoods().then(function() {
    return loadHiddenDistricts();
  }).then(function() {
    allProperties.forEach(function(p) {
      assignPropertyDistrict(p);
    });

    var neighborhoodsWithProperties = {};
    allProperties.forEach(function(p) {
      if (p.neighborhood) {
        neighborhoodsWithProperties[p.neighborhood] = true;
      }
    });

    var neighborhoods = Object.keys(neighborhoodData).sort();

    var neighborhoodsByDistrict = {};
    neighborhoods.forEach(function(name) {
      var district = neighborhoodData[name].district || '';
      if (!neighborhoodsByDistrict[district]) {
        neighborhoodsByDistrict[district] = [];
      }
      neighborhoodsByDistrict[district].push(name);
    });

    var extraDistricts = {};
    allProperties.forEach(function(p) {
      if (p.district === EXTRARADIO_NORTH || p.district === EXTRARADIO_SOUTH) {
        extraDistricts[p.district] = true;
      }
    });

    Object.keys(extraDistricts).forEach(function(districtCode) {
      if (!neighborhoodsByDistrict[districtCode]) {
        neighborhoodsByDistrict[districtCode] = [];
      }
    });

    var legend = document.getElementById('neighborhood-legend');

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
      updateMap('all', 'all');
    }

    function createDistrictSection(districtCode, isHidden) {
      var districtName = DISTRICT_NAMES[districtCode] || 'Distrito ' + districtCode;
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
          legendItem.innerHTML = '<span class="legend-color" style="background-color: ' + getNeighborhoodColor(name) + '"></span><span class="legend-name">' + name + '</span>';
          legendItem.addEventListener('click', function(e) {
            e.stopPropagation();
            var clickedName = this.dataset.neighborhood;
            zoomToNeighborhood(clickedName);
          });
          legend.appendChild(legendItem);
        });
      }
    }

    function rebuildLegend() {
      legend.innerHTML = '';
      var visibleDistricts = [];
      var hiddenDistrictsList = [];

      Object.keys(neighborhoodsByDistrict).sort().forEach(function(districtCode) {
        if (hiddenDistricts[districtCode]) {
          hiddenDistrictsList.push(districtCode);
        } else {
          visibleDistricts.push(districtCode);
        }
      });

      visibleDistricts.forEach(function(districtCode) {
        createDistrictSection(districtCode, false);
      });

      hiddenDistrictsList.forEach(function(districtCode) {
        createDistrictSection(districtCode, true);
      });
    }

    rebuildLegend();

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && (currentDistrictView || currentNeighborhoodView)) {
        resetDistrictView();
      }
    });

    updateMap('all', 'all');

    var statFilters = document.querySelectorAll('.stat.filterable');
    statFilters.forEach(function(stat) {
      stat.addEventListener('click', function() {
        var nextFilter = this.dataset.filter;
        currentStatusFilter = currentStatusFilter === nextFilter ? 'all' : nextFilter;
        statFilters.forEach(function(el) {
          if (currentStatusFilter !== 'all' && el.dataset.filter === currentStatusFilter) {
            el.classList.add('active');
          } else {
            el.classList.remove('active');
          }
        });
        updateMap('all', 'all');
      });
    });

    var sportsToggle = document.getElementById('sports-toggle');
    if (sportsToggle) {
      sportsToggle.addEventListener('click', toggleSportsLayer);
    }

    var transportToggle = document.getElementById('transport-toggle');
    if (transportToggle) {
      transportToggle.addEventListener('click', toggleTransportLayer);
    }
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
