import { ElementFactory } from './factories/ElementFactory.js'
import { DistrictElement } from './elements/DistrictElement.js'
import { NeighborhoodElement } from './elements/NeighborhoodElement.js'
import { GasStationElement } from './elements/GasStationElement.js'
import { StopBicingElement } from './elements/StopBicingElement.js'
import { SportsElement } from './elements/SportsElement.js'
import { TransportMetroElement } from './elements/TransportMetroElement.js'
import { TransportTramElement } from './elements/TransportTramElement.js'
import { TransportBusElement } from './elements/TransportBusElement.js'
import { StopMetroElement } from './elements/StopMetroElement.js'
import { StopTramElement } from './elements/StopTramElement.js'
import { StopBusElement } from './elements/StopBusElement.js'
import { getStopRouteType, getStopRouteNames } from './utils/icons.js'

function loadJSON(url) {
  return fetch(url).then(r => r.json())
}

export function loadData() {
  return Promise.all([
    loadJSON('/data/barcelona_admin.json'),
    loadJSON('/data/transport_public/gasStations.json'),
    loadJSON('/data/transport_public/bicing.json'),
    loadJSON('/data/sports_services.json'),
    loadJSON('/data/transport_public/metro_routes.json'),
    loadJSON('/data/transport_public/metro_stops.json'),
    loadJSON('/data/transport_public/bus_routes.json'),
    loadJSON('/data/transport_public/bus_stops.json')
  ]).then(results => ({
    admin: results[0],
    gasStations: results[1],
    bicing: results[2],
    sports: results[3],
    metroRoutes: results[4],
    metroStops: results[5],
    busRoutes: results[6],
    busStops: results[7]
  }))
}

function generateColorFromName(name) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash % 360)
  const saturation = 65 + (Math.abs(hash) % 20)
  const lightness = 50 + (Math.abs(hash) % 15)
  return 'hsl(' + hue + ', ' + saturation + '%, ' + lightness + '%)'
}

export function createElementsFromData(data, t) {
  const elements = []
  const districts = {}
  const neighborhoods = {}
  const defaultSports = t ? t('servicioDeportivo') : 'Sports service'

  if (data.admin && data.admin.districts) {
    data.admin.districts.forEach(district => {
      if (district.type === 'polygon') {
        const element = ElementFactory.createSingle(district, DistrictElement)
        if (element) {
          elements.push(element)
          districts[district.id] = {
            name: district.metadata ? district.metadata.name : district.id,
            latLngs: Array.isArray(district.coordinates[0][0]) ? district.coordinates : [district.coordinates],
            polygons: Array.isArray(district.coordinates[0][0]) ? district.coordinates : [district.coordinates]
          }
        }
      }
    })
  }

  if (data.admin && data.admin.neighborhoods) {
    const usedColors = {}
    let colorIndex = 0
    const colorPalette = [
      '#FF6B6B', '#4ECDC4', '#95E1D3', '#F38181', '#AA96DA',
      '#FCBAD3', '#A8E6CF', '#FFD3B6', '#FFAAA5', '#DDA0DD',
      '#FFB347', '#87CEEB', '#98D8C8', '#F7DC6F', '#BB8FCE',
      '#85C1E2', '#F8B739', '#E74C3C', '#3498DB', '#2ECC71'
    ]
    data.admin.neighborhoods.forEach(neighborhood => {
      if (neighborhood.type === 'polygon') {
        const meta = neighborhood.metadata || {}
        const name = meta.name || neighborhood.id || ''
        if (!name) return
        const element = ElementFactory.createSingle(neighborhood, NeighborhoodElement)
        if (element) {
          element.id = name
          const jsonColor = meta.color
          let color
          if (jsonColor && jsonColor !== '#000000' && jsonColor !== '#FFFFFF' && !usedColors[jsonColor]) {
            color = jsonColor
            usedColors[jsonColor] = true
          } else {
            if (colorIndex < colorPalette.length) {
              color = colorPalette[colorIndex++]
            } else {
              color = generateColorFromName(name)
            }
          }
          element.color = color
          elements.push(element)
          neighborhoods[name] = {
            color,
            coordinates: Array.isArray(neighborhood.coordinates[0][0]) ? neighborhood.coordinates[0] : neighborhood.coordinates,
            latLngs: Array.isArray(neighborhood.coordinates[0][0]) ? neighborhood.coordinates : [neighborhood.coordinates],
            district: meta.district || ''
          }
        }
      }
    })
  }

  if (data.gasStations) {
    data.gasStations.forEach(item => {
      if (item.type === 'marker') {
        const element = ElementFactory.createSingle(item, GasStationElement)
        if (element) elements.push(element)
      }
    })
  }

  if (data.bicing) {
    data.bicing.forEach(item => {
      if (item.type === 'marker') {
        const element = ElementFactory.createSingle(item, StopBicingElement)
        if (element) elements.push(element)
      }
    })
  }

  const allowedTypologies = [
    'Gimnasos', 'Piscines', 'Piscines - Refugis Climàtics', 'Pavellons poliesportius',
    'Frontons curts', 'Frontons llargs', 'Pistes poliesportives', 'Pistes especialitzades',
    'Pistes petites poliesportives', 'Complexos esportius', 'Complexos esportius - Refugis climàtics',
    'Centres Esportius (CEM)', 'Instal·lacions esportives especialitzades, singulars',
    'Sales poliesportives', 'Rocòdroms', 'Camps de futbol', 'Camps de rugbi', 'Camps especialitzats',
    'Pistes de patinatge', 'Pistes de pàdel'
  ]
  const excludedTypologies = [
    'Clubs', 'Penyes', 'Federacions esportives', 'Pistes de tennis taula', 'Pistes de petanca',
    'Associacions', 'Agrupaments escolta', 'Escoles', 'Esplais', 'Biblioplatges', 'Zones de joc',
    'Lloguer', "Registres d'interes pel web Esportabarcelona (Gestio DAC)"
  ]

  if (data.sports) {
    data.sports.forEach(item => {
      if (!item.location || !item.location.lat || !item.location.lon) return
      const typologies = item.categories && item.categories.Tipologia ? item.categories.Tipologia : []
      if (typologies.length === 0) return
      const hasAllowed = typologies.some(t => allowedTypologies.indexOf(t) !== -1)
      const hasExcluded = typologies.some(t => excludedTypologies.indexOf(t) !== -1)
      if (!hasAllowed || hasExcluded) return
      const transformedItem = {
        id: item.id ? String(item.id) : 'sports_' + Math.random().toString(36).substr(2, 9),
        type: 'marker',
        coordinates: [item.location.lat, item.location.lon],
        metadata: {
          name: item.name || defaultSports,
          category: 'sports',
          typologies,
          district: item.address ? item.address.district : null,
          neighborhood: item.address ? item.address.neighborhood : null,
          url: item.url || null
        }
      }
      const element = ElementFactory.createSingle(transformedItem, SportsElement)
      if (element) elements.push(element)
    })
  }

  if (data.metroRoutes) {
    data.metroRoutes.forEach(item => {
      if (item.type === 'polyline') {
        const meta = item.metadata || {}
        const routeType = meta.routeType || '1'
        const TransportClass = routeType === '0' ? TransportTramElement : TransportMetroElement
        if (!meta.category) {
          meta.category = routeType === '0' ? 'tram_route' : 'metro_route'
          item.metadata = meta
        }
        const element = ElementFactory.createSingle(item, TransportClass)
        if (element) elements.push(element)
      }
    })
  }

  if (data.metroStops) {
    data.metroStops.forEach(item => {
      if (item.type === 'marker') {
        const routes = data.metroRoutes || []
        const routeType = getStopRouteType(item.id, routes)
        const routeNames = getStopRouteNames(item.id, routes, item.coordinates)
        const meta = item.metadata || {}
        meta.routeType = routeType
        meta.routeNames = routeNames
        item.metadata = meta
        const StopClass = routeType === '0' ? StopTramElement : StopMetroElement
        const element = ElementFactory.createSingle(item, StopClass)
        if (element) elements.push(element)
      }
    })
  }

  if (data.busRoutes) {
    data.busRoutes.forEach(item => {
      if (item.type === 'polyline') {
        const meta = item.metadata || {}
        if (!meta.category) {
          meta.category = 'bus_route'
          item.metadata = meta
        }
        const element = ElementFactory.createSingle(item, TransportBusElement)
        if (element) elements.push(element)
      }
    })
  }

  if (data.busStops) {
    data.busStops.forEach(item => {
      if (item.type === 'marker') {
        const routes = data.busRoutes || []
        const meta = item.metadata || {}
        const routeNames = (meta.routeNames && Array.isArray(meta.routeNames) && meta.routeNames.length > 0)
          ? meta.routeNames
          : getStopRouteNames(item.id, routes, item.coordinates)
        meta.routeType = '3'
        meta.routeNames = routeNames
        item.metadata = meta
        const element = ElementFactory.createSingle(item, StopBusElement)
        if (element) elements.push(element)
      }
    })
  }

  return { elements, districts, neighborhoods }
}
