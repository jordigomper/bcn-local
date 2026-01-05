const STORAGE_KEY = 'facilitea_properties';

const BCN_CITY_BOUNDS = {
  minLat: 41.32,
  maxLat: 41.47,
  minLng: 2.05,
  maxLng: 2.23
};

const BCN_CENTER = [41.3874, 2.1686];
const BCN_ZOOM = 14;

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

function initMap(properties) {
  const filteredProperties = properties.filter(function(p) {
    if (!p.coordinates) return false;
    const coords = parseCoordinates(p.coordinates);
    return isInBarcelonaCity(coords.lat, coords.lng);
  });

  const newCount = filteredProperties.filter(function(p) { return !p.viewed; }).length;
  const viewedCount = filteredProperties.filter(function(p) { return p.viewed; }).length;

  document.getElementById('new-count').textContent = newCount;
  document.getElementById('viewed-count').textContent = viewedCount;

  const map = L.map('map').setView(BCN_CENTER, BCN_ZOOM);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map);

  filteredProperties.forEach(function(property) {
    const coords = parseCoordinates(property.coordinates);
    const isNew = !property.viewed;

    const marker = L.marker([coords.lat, coords.lng], {
      icon: createMarkerIcon(isNew)
    }).addTo(map);

    const popupContent = '<div class="custom-popup">' +
      '<div class="price">' + formatPrice(property.list_selling_price_amount) + '</div>' +
      '<div class="ref">Ref: ' + property.ref + '</div>' +
      '<span class="status ' + (isNew ? 'new' : 'viewed') + '">' + (isNew ? '🆕 Nueva' : '✓ Vista') + '</span>' +
      '<a class="link" href="https://faciliteacasa.com/viviendas/' + property.id + '" target="_blank">Ver propiedad</a>' +
      '</div>';

    marker.bindPopup(popupContent);
  });
}

document.addEventListener('DOMContentLoaded', function() {
  chrome.storage.local.get([STORAGE_KEY], function(result) {
    const properties = result[STORAGE_KEY] || [];
    if (properties.length === 0) {
      document.getElementById('map').innerHTML = '<div class="loading">No hay datos disponibles</div>';
      return;
    }
    initMap(properties);
  });
});
