export class BaseMap {
  constructor(containerIdOrElement, options = {}) {
    const container = typeof containerIdOrElement === 'string'
      ? document.getElementById(containerIdOrElement)
      : containerIdOrElement
    this.containerId = container ? container.id || 'map' : containerIdOrElement
    this.containerElement = container
    this.center = options.center || [41.392328443726626, 2.1602100372314458]
    this.zoom = options.zoom || 13
    this.initialCenter = this.center
    this.initialZoom = this.zoom
    this.leafletMap = null
    this.elements = new Map()
    this.renderedElements = new Set()
    this.persistentElements = new Set()
    this.eventListeners = new Map()
    this.init()
  }

  init() {
    const initialView = this.getInitialView()
    const el = this.containerElement || document.getElementById(this.containerId)
    if (!el) return
    this.leafletMap = window.L.map(el, { zoomSnap: 0.5 }).setView(initialView.center, initialView.zoom)
    window.L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19
    }).addTo(this.leafletMap)
    window.L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
      attribution: '',
      maxZoom: 19,
      pane: 'overlayPane'
    }).addTo(this.leafletMap)
    this.setupEventListeners()
  }

  getInitialView() {
    let center = this.initialCenter
    let zoom = this.initialZoom
    if (typeof window !== 'undefined' && window.innerWidth === 1920 && window.innerHeight === 1080) {
      center = [41.384803698683925, 2.165244417823851]
      zoom = 12.5
    }
    return { center, zoom }
  }

  setupEventListeners() {
    const self = this
    this.leafletMap.on('zoomend', function() {
      self.zoom = self.leafletMap.getZoom()
      self.emit('zoomchange', { zoom: self.zoom })
    })
    this.leafletMap.on('moveend', function() {
      const center = self.leafletMap.getCenter()
      self.center = [center.lat, center.lng]
      self.emit('moveend', { center: self.center })
    })
  }

  on(event, callback) {
    if (!this.eventListeners.has(event)) this.eventListeners.set(event, [])
    this.eventListeners.get(event).push(callback)
  }

  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const callbacks = this.eventListeners.get(event)
      const index = callbacks.indexOf(callback)
      if (index > -1) callbacks.splice(index, 1)
    }
  }

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(cb => cb(data))
    }
  }

  registerElement(element) {
    this.elements.set(element.id, element)
  }

  registerElements(elements) {
    elements.forEach(el => this.registerElement(el))
  }

  getElement(id) {
    return this.elements.get(id)
  }

  getElements(ids) {
    return ids.map(id => this.elements.get(id)).filter(el => el !== undefined)
  }

  getAllElements() {
    return Array.from(this.elements.values())
  }

  renderElements(elementIds) {
    const idsToRender = new Set(elementIds)
    this.persistentElements.forEach(id => idsToRender.add(id))
    const idsToRemove = new Set()
    this.renderedElements.forEach(id => {
      if (!idsToRender.has(id) && !this.persistentElements.has(id)) idsToRemove.add(id)
    })
    idsToRemove.forEach(id => this.removeElement(id))
    idsToRender.forEach(id => {
      if (!this.renderedElements.has(id)) this.renderElement(id)
    })
    this.renderedElements = idsToRender
  }

  renderElement(elementId) {
    const element = this.elements.get(elementId)
    if (!element) return
    if (element.leafletLayer && this.leafletMap.hasLayer(element.leafletLayer)) {
      this.leafletMap.removeLayer(element.leafletLayer)
      element.leafletLayer = null
    }
    if (!element.leafletLayer) {
      element.leafletLayer = element.createLeafletLayer()
    }
    if (element.leafletLayer) {
      element.leafletLayer.addTo(this.leafletMap)
      element.updateState({ visible: true })
    }
  }

  removeElement(elementId) {
    const element = this.elements.get(elementId)
    if (!element || !element.leafletLayer) return
    if (this.leafletMap.hasLayer(element.leafletLayer)) this.leafletMap.removeLayer(element.leafletLayer)
    element.updateState({ visible: false })
  }

  removeElements(elementIds) {
    elementIds.forEach(id => this.removeElement(id))
  }

  clear() {
    this.renderedElements.forEach(id => {
      if (!this.persistentElements.has(id)) this.removeElement(id)
    })
    this.renderedElements = new Set(this.persistentElements)
  }

  addPersistentElement(elementId) {
    if (!this.persistentElements.has(elementId)) {
      this.persistentElements.add(elementId)
      if (!this.renderedElements.has(elementId)) this.renderElement(elementId)
    }
  }

  removePersistentElement(elementId) {
    this.persistentElements.delete(elementId)
    if (this.renderedElements.has(elementId)) this.removeElement(elementId)
  }

  addPersistentElements(elementIds) {
    elementIds.forEach(id => this.addPersistentElement(id))
  }

  clearPersistentElements() {
    this.persistentElements.forEach(id => this.removePersistentElement(id))
  }

  zoomToFit(elementIds, options = {}) {
    if (!elementIds || elementIds.length === 0) return
    const elements = this.getElements(elementIds)
    const bounds = []
    elements.forEach(el => {
      if (el.coordinates) {
        if (el.type === 'marker') bounds.push(el.coordinates)
        else if (el.type === 'polyline') bounds.push(...el.coordinates)
        else if (el.type === 'polygon') {
          const coords = Array.isArray(el.coordinates[0][0]) ? el.coordinates[0] : el.coordinates
          bounds.push(...coords)
        }
      }
    })
    if (bounds.length > 0) {
      this.leafletMap.fitBounds(window.L.latLngBounds(bounds), {
        padding: options.padding || [100, 100],
        maxZoom: options.maxZoom || 15
      })
    }
  }

  setCenter(center) {
    this.center = center
    this.leafletMap.setView(center, this.zoom)
  }

  setZoom(zoom) {
    this.zoom = zoom
    this.leafletMap.setZoom(zoom)
  }

  getZoom() {
    return this.leafletMap.getZoom()
  }

  getCenter() {
    const center = this.leafletMap.getCenter()
    return [center.lat, center.lng]
  }

  addOverlayLayer(layer) {
    if (layer) {
      layer.addTo(this.leafletMap)
      if (layer.bringToFront) layer.bringToFront()
    }
  }

  removeOverlayLayer(layer) {
    if (layer && this.leafletMap.hasLayer(layer)) this.leafletMap.removeLayer(layer)
  }
}
