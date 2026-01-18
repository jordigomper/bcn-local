class GTFSFilterManager {
  constructor(map, neighborhoodManager) {
    this.map = map;
    this.neighborhoodManager = neighborhoodManager;
    this.gtfsTransportLayer = null;
    this.gtfsStopsLayer = null;
    this.gtfsBusLayer = null;
    this.gtfsBusStopsLayer = null;
    this.gtfsTransportVisible = false;
    this.gtfsBusVisible = false;
    this.gtfsData = {
      metroRoutes: null,
      busRoutes: null,
      metroStops: null,
      busStops: null
    };

    this.setupZoomListener();
  }

  setupZoomListener() {
    var self = this;
    if (this.map && this.map.leafletMap) {
      this.map.leafletMap.on('zoomend', function() {
        if (self.gtfsTransportVisible || self.gtfsBusVisible) {
          self.updateGTFSStopsVisibility();
          self.updateGTFSLinesWeight();
        }
      });
    }
  }

  loadGTFSData() {
    if (this.gtfsData.metroRoutes && this.gtfsData.busRoutes && this.gtfsData.metroStops && this.gtfsData.busStops) {
      return Promise.resolve(this.gtfsData);
    }
    var self = this;
    return Promise.all([
      fetch('data/transport_public/metro_routes.json').then(function(r) { return r.json(); }).then(function(data) {
        self.gtfsData.metroRoutes = data;
        return data;
      }).catch(function(err) {
        console.error('Error loading metro_routes.json:', err);
        return [];
      }),
      fetch('data/transport_public/bus_routes.json').then(function(r) { return r.json(); }).then(function(data) {
        self.gtfsData.busRoutes = data;
        return data;
      }).catch(function(err) {
        console.error('Error loading bus_routes.json:', err);
        return [];
      }),
      fetch('data/transport_public/metro_stops.json').then(function(r) { return r.json(); }).then(function(data) {
        self.gtfsData.metroStops = data;
        return data;
      }).catch(function(err) {
        console.error('Error loading metro_stops.json:', err);
        return [];
      }),
      fetch('data/transport_public/bus_stops.json').then(function(r) { return r.json(); }).then(function(data) {
        self.gtfsData.busStops = data;
        return data;
      }).catch(function(err) {
        console.error('Error loading bus_stops.json:', err);
        return [];
      })
    ]).then(function() {
      return self.gtfsData;
    });
  }

  buildGTFSTransportLayer() {
    if (!this.gtfsData.metroRoutes || !this.gtfsData.busRoutes) return null;

    var metroRoutesLayer = L.layerGroup();
    var metroStopsLayer = L.layerGroup();
    var busRoutesLayer = L.layerGroup();
    var busStopsLayer = L.layerGroup();

    var currentZoom = this.map && this.map.leafletMap ? this.map.leafletMap.getZoom() : 13;
    var baseWeight = (currentZoom >= 12.5 && currentZoom <= 14.5) ? 2 : 4;
    var metroWeight = baseWeight;
    var busWeight = baseWeight / 2;

    if (this.gtfsData.metroRoutes) {
      this.gtfsData.metroRoutes.forEach(function(route) {
        if (!route.coordinates || route.type !== 'polyline') return;
        var meta = route.metadata || {};
        var polyline = L.polyline(route.coordinates, {
          color: meta.color || '#000000',
          weight: metroWeight,
          opacity: 0.8
        });
        polyline._gtfsWeight = metroWeight;
        polyline._gtfsRouteType = meta.routeType || '1';
        var defaultRoute = window.I18n ? window.I18n.t('ruta') : 'Route';
        polyline.bindTooltip((meta.name || defaultRoute) + ' - ' + getRouteTypeName(meta.routeType || '1'), {
          permanent: false,
          direction: 'top',
          className: 'neighborhood-tooltip'
        });
        metroRoutesLayer.addLayer(polyline);
      });
    }

    if (this.gtfsData.busRoutes) {
      this.gtfsData.busRoutes.forEach(function(route) {
        if (!route.coordinates || route.type !== 'polyline') return;
        var meta = route.metadata || {};
        var polyline = L.polyline(route.coordinates, {
          color: meta.color || '#000000',
          weight: busWeight,
          opacity: 0.8
        });
        polyline._gtfsWeight = busWeight;
        polyline._gtfsRouteType = meta.routeType || '3';
        var defaultRoute = window.I18n ? window.I18n.t('ruta') : 'Route';
        polyline.bindTooltip((meta.name || defaultRoute) + ' - ' + getRouteTypeName(meta.routeType || '3'), {
          permanent: false,
          direction: 'top',
          className: 'neighborhood-tooltip'
        });
        busRoutesLayer.addLayer(polyline);
      });
    }

    if (this.gtfsData.metroStops) {
      this.gtfsData.metroStops.forEach(function(stop) {
        if (!stop.coordinates || stop.type !== 'marker') return;
        var coords = stop.coordinates;
        if (!Array.isArray(coords) || coords.length < 2) return;
        var meta = stop.metadata || {};
        var routeType = getStopRouteType(stop.id, this.gtfsData.metroRoutes);
        var marker = L.marker([coords[0], coords[1]], {
          icon: buildStopIcon(routeType)
        });
        var defaultStop = window.I18n ? window.I18n.t('parada') : 'Stop';
        marker.bindTooltip(meta.name || defaultStop, {
          permanent: false,
          direction: 'top',
          className: 'neighborhood-tooltip'
        });
        metroStopsLayer.addLayer(marker);
      }.bind(this));
    }

    if (this.gtfsData.busStops) {
      this.gtfsData.busStops.forEach(function(stop) {
        if (!stop.coordinates || stop.type !== 'marker') return;
        var coords = stop.coordinates;
        if (!Array.isArray(coords) || coords.length < 2) return;
        var meta = stop.metadata || {};
        var marker = L.marker([coords[0], coords[1]], {
          icon: buildStopIcon('3')
        });
        var defaultStop = window.I18n ? window.I18n.t('parada') : 'Stop';
        marker.bindTooltip(meta.name || defaultStop, {
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

  updateGTFSStopsVisibility() {
    if (!this.map || !this.map.leafletMap) return;
    var currentZoom = this.map.leafletMap.getZoom();
    var shouldShowBus = currentZoom >= 15;

    if (this.gtfsStopsLayer) {
      if (this.gtfsTransportVisible) {
        if (!this.map.leafletMap.hasLayer(this.gtfsStopsLayer)) {
          this.gtfsStopsLayer.addTo(this.map.leafletMap);
        }
      } else {
        if (this.map.leafletMap.hasLayer(this.gtfsStopsLayer)) {
          this.map.leafletMap.removeLayer(this.gtfsStopsLayer);
        }
      }
    }

    if (this.gtfsBusStopsLayer) {
      if (shouldShowBus && this.gtfsBusVisible) {
        if (!this.map.leafletMap.hasLayer(this.gtfsBusStopsLayer)) {
          this.gtfsBusStopsLayer.addTo(this.map.leafletMap);
        }
      } else {
        if (this.map.leafletMap.hasLayer(this.gtfsBusStopsLayer)) {
          this.map.leafletMap.removeLayer(this.gtfsBusStopsLayer);
        }
      }
    }

  }

  updateGTFSLinesWeight() {
    if (!this.map || !this.map.leafletMap) return;
    var currentZoom = this.map.leafletMap.getZoom();
    var baseWeight = (currentZoom >= 12.5 && currentZoom <= 14.5) ? 2 : 4;
    var newMetroWeight = baseWeight;
    var newBusWeight = baseWeight / 2;

    if (this.gtfsTransportLayer) {
      this.gtfsTransportLayer.eachLayer(function(layer) {
        if (layer instanceof L.Polyline) {
          if (layer._gtfsWeight !== newMetroWeight) {
            layer.setStyle({ weight: newMetroWeight });
            layer._gtfsWeight = newMetroWeight;
          }
        }
      });
    }

    if (this.gtfsBusLayer) {
      this.gtfsBusLayer.eachLayer(function(layer) {
        if (layer instanceof L.Polyline) {
          if (layer._gtfsWeight !== newBusWeight) {
            layer.setStyle({ weight: newBusWeight });
            layer._gtfsWeight = newBusWeight;
          }
        }
      });
    }

  }

  toggleGTFSMetroLayer() {
    if (!this.map || !this.map.leafletMap) return;
    var button = document.getElementById('gtfs-metro-toggle');
    var self = this;

    if (!this.gtfsTransportVisible) {
      this.loadGTFSData().then(function() {
        try {
          if (!self.gtfsTransportLayer || !self.gtfsStopsLayer) {
            var layers = self.buildGTFSTransportLayer();
            if (layers && layers.metro) {
              self.gtfsTransportLayer = layers.metro.routes;
              self.gtfsStopsLayer = layers.metro.stops;
              if (layers.bus) {
                self.gtfsBusLayer = layers.bus.routes;
                self.gtfsBusStopsLayer = layers.bus.stops;
              }
            }
          }
          if (self.gtfsTransportLayer) {
            self.gtfsTransportLayer.addTo(self.map.leafletMap);
            self.gtfsTransportVisible = true;
            if (self.gtfsStopsLayer) {
              self.gtfsStopsLayer.addTo(self.map.leafletMap);
            }
            self.updateGTFSStopsVisibility();
            if (button) button.classList.add('active');
          }
        } catch (error) {
          console.error('Error building metro layer:', error);
        }
      }).catch(function(error) {
        console.error('Error loading GTFS data:', error);
      });
    } else {
      if (this.gtfsTransportLayer) {
        this.map.leafletMap.removeLayer(this.gtfsTransportLayer);
      }
      if (this.gtfsStopsLayer) {
        this.map.leafletMap.removeLayer(this.gtfsStopsLayer);
      }
      this.gtfsTransportVisible = false;
      if (button) button.classList.remove('active');
    }
  }

  toggleGTFSBusLayer() {
    if (!this.map || !this.map.leafletMap) return;
    var button = document.getElementById('gtfs-bus-toggle');
    var self = this;

    if (!this.gtfsBusVisible) {
      this.loadGTFSData().then(function() {
        try {
          if (!self.gtfsBusLayer || !self.gtfsBusStopsLayer) {
            var layers = self.buildGTFSTransportLayer();
            if (layers && layers.bus) {
              self.gtfsBusLayer = layers.bus.routes;
              self.gtfsBusStopsLayer = layers.bus.stops;
              if (layers.metro) {
                self.gtfsTransportLayer = layers.metro.routes;
                self.gtfsStopsLayer = layers.metro.stops;
              }
            }
          }
          if (self.gtfsBusLayer) {
            self.gtfsBusLayer.addTo(self.map.leafletMap);
            self.updateGTFSStopsVisibility();
            self.gtfsBusVisible = true;
            if (button) button.classList.add('active');
          }
        } catch (error) {
          console.error('Error building bus layer:', error);
        }
      }).catch(function(error) {
        console.error('Error loading GTFS data:', error);
      });
    } else {
      if (this.gtfsBusLayer) {
        this.map.leafletMap.removeLayer(this.gtfsBusLayer);
      }
      if (this.gtfsBusStopsLayer) {
        this.map.leafletMap.removeLayer(this.gtfsBusStopsLayer);
      }
      this.gtfsBusVisible = false;
      if (button) button.classList.remove('active');
    }
  }
}
