class Map {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.center = options.center || [41.392328443726626, 2.1352100372314458];
    this.zoom = options.zoom || 13;
    this.leafletMap = null;
    this.elements = new window.Map();
    this.renderedElements = new window.Set();
    this.persistentElements = new window.Set();
    this.eventListeners = new window.Map();

    this.init();
  }

  init() {
    var initialView = this.getInitialView();
    this.leafletMap = L.map(this.containerId, { zoomSnap: 0.5 }).setView(initialView.center, initialView.zoom);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19
    }).addTo(this.leafletMap);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
      attribution: '',
      maxZoom: 19,
      pane: 'overlayPane'
    }).addTo(this.leafletMap);

    this.setupEventListeners();
  }

  getInitialView() {
    var center = this.center;
    var zoom = this.zoom;
    if (window.innerWidth === 1920 && window.innerHeight === 1080) {
      center = [41.384803698683925, 2.140244417823851];
      zoom = 12.5;
    }
    return { center: center, zoom: zoom };
  }

  setupEventListeners() {
    var self = this;
    this.leafletMap.on('zoomend', function() {
      self.zoom = self.leafletMap.getZoom();
      self.emit('zoomchange', { zoom: self.zoom });
    });

    this.leafletMap.on('moveend', function() {
      var center = self.leafletMap.getCenter();
      self.center = [center.lat, center.lng];
      self.emit('moveend', { center: self.center });
    });
  }

  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.eventListeners.has(event)) {
      var callbacks = this.eventListeners.get(event);
      var index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      var callbacks = this.eventListeners.get(event);
      for (var i = 0; i < callbacks.length; i++) {
        callbacks[i](data);
      }
    }
  }

  registerElement(element) {
    this.elements.set(element.id, element);
  }

  registerElements(elements) {
    elements.forEach(element => {
      this.registerElement(element);
    });
  }

  getElement(id) {
    return this.elements.get(id);
  }

  getElements(ids) {
    return ids.map(id => this.elements.get(id)).filter(el => el !== undefined);
  }

  getAllElements() {
    return Array.from(this.elements.values());
  }

  renderElements(elementIds) {
    var idsToRender = new window.Set(elementIds);

    var self = this;
    this.persistentElements.forEach(function(id) {
      idsToRender.add(id);
    });

    var idsToRemove = new window.Set();

    this.renderedElements.forEach(function(id) {
      if (!idsToRender.has(id) && !self.persistentElements.has(id)) {
        idsToRemove.add(id);
      }
    });

    idsToRemove.forEach(function(id) {
      self.removeElement(id);
    });

    idsToRender.forEach(function(id) {
      if (!self.renderedElements.has(id)) {
        self.renderElement(id);
      }
    });

    this.renderedElements = idsToRender;
  }

  renderElement(elementId) {
    var element = this.elements.get(elementId);
    if (!element) return;

    if (element.leafletLayer && this.leafletMap.hasLayer(element.leafletLayer)) {
      this.leafletMap.removeLayer(element.leafletLayer);
      element.leafletLayer = null;
    }

    if (!element.leafletLayer) {
      element.leafletLayer = element.createLeafletLayer();
    }

    if (element.leafletLayer) {
      element.leafletLayer.addTo(this.leafletMap);
      element.updateState({ visible: true });
    }
  }

  removeElement(elementId) {
    var element = this.elements.get(elementId);
    if (!element || !element.leafletLayer) return;

    this.leafletMap.removeLayer(element.leafletLayer);
    element.updateState({ visible: false });
  }

  removeElements(elementIds) {
    elementIds.forEach(id => this.removeElement(id));
  }

  clear() {
    var self = this;
    this.renderedElements.forEach(function(id) {
      if (!self.persistentElements.has(id)) {
        self.removeElement(id);
      }
    });
    var newRendered = new window.Set();
    this.persistentElements.forEach(function(id) {
      newRendered.add(id);
    });
    this.renderedElements = newRendered;
  }

  addPersistentElement(elementId) {
    if (!this.persistentElements.has(elementId)) {
      this.persistentElements.add(elementId);
      if (!this.renderedElements.has(elementId)) {
        this.renderElement(elementId);
      }
    }
  }

  removePersistentElement(elementId) {
    this.persistentElements.delete(elementId);
    if (this.renderedElements.has(elementId)) {
      this.removeElement(elementId);
    }
  }

  addPersistentElements(elementIds) {
    var self = this;
    elementIds.forEach(function(id) {
      self.addPersistentElement(id);
    });
  }

  clearPersistentElements() {
    var self = this;
    this.persistentElements.forEach(function(id) {
      self.removePersistentElement(id);
    });
  }

  zoomToFit(elementIds, options = {}) {
    if (!elementIds || elementIds.length === 0) return;

    var elements = this.getElements(elementIds);
    var bounds = [];
    var self = this;

    elements.forEach(function(element) {
      if (element.coordinates) {
        if (element.type === 'marker') {
          bounds.push(element.coordinates);
        } else if (element.type === 'polyline') {
          bounds.push.apply(bounds, element.coordinates);
        } else if (element.type === 'polygon') {
          var coords = Array.isArray(element.coordinates[0][0]) ? element.coordinates[0] : element.coordinates;
          bounds.push.apply(bounds, coords);
        }
      }
    });

    if (bounds.length > 0) {
      var latlngBounds = L.latLngBounds(bounds);
      this.leafletMap.fitBounds(latlngBounds, {
        padding: options.padding || [100, 100],
        maxZoom: options.maxZoom || 15
      });
    }
  }

  setCenter(center) {
    this.center = center;
    this.leafletMap.setView(center, this.zoom);
  }

  setZoom(zoom) {
    this.zoom = zoom;
    this.leafletMap.setZoom(zoom);
  }

  getZoom() {
    return this.leafletMap.getZoom();
  }

  getCenter() {
    var center = this.leafletMap.getCenter();
    return [center.lat, center.lng];
  }

  addOverlayLayer(layer) {
    if (layer) {
      layer.addTo(this.leafletMap);
      if (layer.bringToFront) {
        layer.bringToFront();
      }
    }
  }

  removeOverlayLayer(layer) {
    if (layer && this.leafletMap.hasLayer(layer)) {
      this.leafletMap.removeLayer(layer);
    }
  }
}
