class SelectionLegendManager {
  constructor(map) {
    this.map = map;
    this.container = document.getElementById('selection-legend');
    this.content = document.getElementById('selection-legend-content');
    this.resetButton = document.getElementById('selection-legend-reset-button');
    this.currentView = null;
    this.selectedRoute = null;
    this.setupResetButton();
  }

  setupResetButton() {
    var self = this;
    if (this.resetButton) {
      this.resetButton.addEventListener('click', function() {
        if (window.resetMapView) {
          window.resetMapView();
        }
      });
    }
  }

  update(view) {
    var previousView = this.currentView;
    this.currentView = view;
    
    if (!view || (!view.district && !view.neighborhood && !view.filterBus)) {
      this.hide();
      this.selectedRoute = null;
      return;
    }

    var viewChanged = !previousView || 
                     previousView.district !== view.district || 
                     previousView.neighborhood !== view.neighborhood;
    
    if (viewChanged && this.selectedRoute) {
      this.selectedRoute = null;
      this.restoreRouteOpacity();
    }

    this.show();
    this.render();
  }

  restoreRouteOpacity() {
    if (!this.map) return;
    
    var registry = this.map.getRegistry ? this.map.getRegistry() : null;
    if (!registry) return;
    
    var allElements = registry.getAllElements();
    var self = this;
    
    allElements.forEach(function(element) {
      if (element.type === 'polyline' && element.leafletLayer) {
        var meta = element.metadata || {};
        var elementRouteType = meta.routeType;
        var isTransportRoute = meta.category === 'metro_route' || meta.category === 'bus_route' || 
                              meta.category === 'tram_route' || elementRouteType;
        
        if (isTransportRoute) {
          element.leafletLayer.setStyle({ opacity: 0.8 });
        }
      } else if (element.type === 'marker' && element.leafletLayer) {
        var meta = element.metadata || {};
        var elementRouteType = meta.routeType;
        var isTransportStop = meta.category === 'metro_stop' || meta.category === 'bus_stop' || 
                             meta.category === 'tram_stop' || elementRouteType;
        
        if (isTransportStop) {
          element.leafletLayer.setOpacity(1.0);
        }
      }
    });
  }

  show() {
    if (this.container) {
      this.container.style.display = 'block';
    }
    if (this.resetButton) {
      this.resetButton.style.display = 'flex';
      var self = this;
      setTimeout(function() {
        self.updateResetButtonPosition();
      }, 200);
    }
  }

  hide() {
    if (this.container) {
      this.container.style.display = 'none';
    }
    if (this.resetButton) {
      this.resetButton.style.display = 'none';
    }
  }

  updateResetButtonPosition() {
    if (!this.resetButton || !this.container) return;
    
    var self = this;
    setTimeout(function() {
      if (!self.resetButton || !self.container) return;
      
      var containerRect = self.container.getBoundingClientRect();
      var windowHeight = window.innerHeight;
      var legendTop = containerRect.top;
      var buttonHeight = self.resetButton.offsetHeight || 40;
      
      var bottomPosition = windowHeight - legendTop + 10;
      
      if (self.resetButton) {
        self.resetButton.style.bottom = bottomPosition + 'px';
        self.resetButton.style.right = '20px';
      }
    }, 150);
  }

  render() {
    if (!this.content || !this.map) return;

    var registry = this.map.getRegistry ? this.map.getRegistry() : null;
    if (!registry) return;

    var visibleElements = this.getVisibleElements(registry);
    var html = '';

    if (this.hasCategoryElements(visibleElements, 'bicing')) {
      html += this.renderTransportIcon('bicing', 'bicing', visibleElements);
    }
    if (this.hasCategoryElements(visibleElements, 'metro')) {
      html += this.renderTransportIcon('metro', 'metroTren', visibleElements, '1');
    }
    if (this.hasCategoryElements(visibleElements, 'tram')) {
      html += this.renderTransportIcon('tram', 'tranvia', visibleElements, '0');
    }
    if (this.hasCategoryElements(visibleElements, 'bus')) {
      html += this.renderTransportIcon('bus', 'bus', visibleElements, '3');
    }
    if (this.hasCategoryElements(visibleElements, 'gasStation')) {
      html += this.renderTransportIcon('gasStation', 'gasolineras', visibleElements);
    }
    if (this.hasCategoryElements(visibleElements, 'gym')) {
      html += this.renderTransportIcon('gym', 'gimnasios', visibleElements);
    }

    this.content.innerHTML = html;
    this.updateTranslations();
    this.setupLineClickHandlers();
    
    if (this.resetButton) {
      setTimeout(function() {
        this.updateResetButtonPosition();
      }.bind(this), 200);
    }
  }

  setupLineClickHandlers() {
    var self = this;
    var lineElements = this.content.querySelectorAll('.selection-legend-line');
    
    lineElements.forEach(function(lineEl) {
      lineEl.style.cursor = 'pointer';
      lineEl.addEventListener('click', function(e) {
        e.stopPropagation();
        var routeName = this.getAttribute('data-route-name');
        var routeType = this.getAttribute('data-route-type');
        
        if (self.selectedRoute && self.selectedRoute.name === routeName && self.selectedRoute.routeType === routeType) {
          self.selectedRoute = null;
          self.restoreOriginalView();
        } else {
          self.selectedRoute = {
            name: routeName,
            routeType: routeType
          };
          self.filterByRoute(routeName, routeType);
        }
        self.render();
      });
    });
  }

  restoreOriginalView() {
    if (!this.map) return;
    
    var registry = this.map.getRegistry ? this.map.getRegistry() : null;
    if (!registry) return;
    
    var allElements = registry.getAllElements();
    var self = this;
    
    allElements.forEach(function(element) {
      if (element.type === 'polyline' && element.leafletLayer) {
        var meta = element.metadata || {};
        var elementRouteType = meta.routeType;
        var isTransportRoute = meta.category === 'metro_route' || meta.category === 'bus_route' || 
                              meta.category === 'tram_route' || elementRouteType;
        
        if (isTransportRoute) {
          element.leafletLayer.setStyle({ opacity: 0.8 });
        }
      } else if (element.type === 'marker' && element.leafletLayer) {
        var meta = element.metadata || {};
        var elementRouteType = meta.routeType;
        var isTransportStop = meta.category === 'metro_stop' || meta.category === 'bus_stop' || 
                             meta.category === 'tram_stop' || elementRouteType;
        
        if (isTransportStop) {
          element.leafletLayer.setOpacity(1.0);
        }
      }
    });
    
    if (this.currentView && this.currentView.district) {
      var neighborhoodManager = this.map.neighborhoodManager;
      if (neighborhoodManager) {
        var districtElement = registry.get(this.currentView.district);
        if (districtElement && districtElement.onClick) {
          districtElement.onClick(this.map);
        }
      }
    } else if (this.currentView && this.currentView.neighborhood) {
      var neighborhoodManager = this.map.neighborhoodManager;
      if (neighborhoodManager) {
        var neighborhoodElement = registry.get(this.currentView.neighborhood);
        if (neighborhoodElement && neighborhoodElement.onClick) {
          neighborhoodElement.onClick(this.map);
        }
      }
    }
  }

  filterByRoute(routeName, routeType) {
    if (!this.map) return;
    
    var registry = this.map.getRegistry ? this.map.getRegistry() : null;
    if (!registry) return;
    
    var allElements = registry.getAllElements();
    var self = this;
    var routePolylinesForBus = [];
    if (routeType === '3') {
      allElements.forEach(function(element) {
        if (element.type !== 'polyline' || !element.coordinates || !Array.isArray(element.coordinates)) return;
        var meta = element.metadata || {};
        var elementRouteName = meta.name || element.id;
        if ((meta.category === 'bus_route' || meta.routeType === '3') && elementRouteName === routeName) {
          routePolylinesForBus.push(element);
        }
      });
    }

    var busStopProximityThreshold = 0.002;

    allElements.forEach(function(element) {
      if (element.type === 'polyline' && element.leafletLayer) {
        var meta = element.metadata || {};
        var elementRouteType = meta.routeType;
        var elementRouteName = meta.name || element.id;
        var isTransportRoute = meta.category === 'metro_route' || meta.category === 'bus_route' || 
                              meta.category === 'tram_route' || elementRouteType;
        
        if (isTransportRoute) {
          var isMatch = false;
          
          if (routeType === '1' || routeType === '2') {
            isMatch = (elementRouteType === '1' || elementRouteType === '2' || meta.category === 'metro_route') && 
                       elementRouteName === routeName;
          } else if (routeType === '3') {
            isMatch = (elementRouteType === '3' || meta.category === 'bus_route') && 
                       elementRouteName === routeName;
          } else if (routeType === '0') {
            isMatch = (elementRouteType === '0' || meta.category === 'tram_route') && 
                       elementRouteName === routeName;
          }
          
          if (isMatch) {
            element.leafletLayer.setStyle({ opacity: 0.9 });
            element.leafletLayer.bringToFront();
          } else {
            var sameType = false;
            if (routeType === '1' || routeType === '2') {
              sameType = (elementRouteType === '1' || elementRouteType === '2' || meta.category === 'metro_route');
            } else if (routeType === '3') {
              sameType = (elementRouteType === '3' || meta.category === 'bus_route');
            } else if (routeType === '0') {
              sameType = (elementRouteType === '0' || meta.category === 'tram_route');
            }
            
            if (sameType) {
              element.leafletLayer.setStyle({ opacity: 0.2 });
            }
          }
        }
      } else if (element.type === 'marker' && element.leafletLayer) {
        var meta = element.metadata || {};
        var stopRouteNames = meta.routeNames || [];
        var elementRouteType = meta.routeType;
        var isTransportStop = meta.category === 'metro_stop' || meta.category === 'bus_stop' || 
                             meta.category === 'tram_stop' || elementRouteType;
        
        if (isTransportStop) {
          var stopMatches = false;
          for (var i = 0; i < stopRouteNames.length; i++) {
            if (stopRouteNames[i] === routeName) {
              if (routeType === '1' || routeType === '2') {
                stopMatches = (elementRouteType === '1' || elementRouteType === '2' || meta.category === 'metro_stop');
              } else if (routeType === '3') {
                if (elementRouteType === '3' || meta.category === 'bus_stop') {
                  if (routePolylinesForBus.length === 0) {
                    stopMatches = true;
                  } else if (element.coordinates && Array.isArray(element.coordinates) && element.coordinates.length >= 2) {
                    var stopLat = element.coordinates[0];
                    var stopLng = element.coordinates[1];
                    for (var r = 0; r < routePolylinesForBus.length; r++) {
                      var routeCoords = routePolylinesForBus[r].coordinates;
                      var dist = typeof distancePointToPolyline === 'function'
                        ? distancePointToPolyline(stopLat, stopLng, routeCoords)
                        : Infinity;
                      if (dist <= busStopProximityThreshold) {
                        stopMatches = true;
                        break;
                      }
                    }
                  }
                }
              } else if (routeType === '0') {
                stopMatches = (elementRouteType === '0' || meta.category === 'tram_stop');
              }
              break;
            }
          }
          
          if (stopMatches) {
            element.leafletLayer.setOpacity(1.0);
            if (element.leafletLayer.bringToFront) {
              element.leafletLayer.bringToFront();
            }
          } else {
            var sameType = false;
            if (routeType === '1' || routeType === '2') {
              sameType = (elementRouteType === '1' || elementRouteType === '2' || meta.category === 'metro_stop');
            } else if (routeType === '3') {
              sameType = (elementRouteType === '3' || meta.category === 'bus_stop');
            } else if (routeType === '0') {
              sameType = (elementRouteType === '0' || meta.category === 'tram_stop');
            }
            
            if (sameType) {
              element.leafletLayer.setOpacity(0.2);
            }
          }
        }
      }
    });

    if (routeType === '3' && routePolylinesForBus.length > 0 && this.map.zoomToFit) {
      var routeIds = routePolylinesForBus.map(function(el) { return el.id; });
      this.map.zoomToFit(routeIds, { padding: [80, 80], maxZoom: 15 });
    }
  }

  hasCategoryElements(visibleElements, category) {
    if (!visibleElements || visibleElements.length === 0) return false;

    for (var i = 0; i < visibleElements.length; i++) {
      var element = visibleElements[i];
      var meta = element.metadata || {};

      if (category === 'bicing') {
        if (meta.category === 'bicing') {
          return true;
        }
      } else if (category === 'metro') {
        var routeType = meta.routeType;
        if (routeType === '1' || routeType === '2' || 
            meta.category === 'metro_route' || meta.category === 'metro_stop') {
          return true;
        }
      } else if (category === 'tram') {
        var routeType = meta.routeType;
        if (routeType === '0' || meta.category === 'tram_route') {
          return true;
        }
      } else if (category === 'bus') {
        var routeType = meta.routeType;
        if (routeType === '3' || meta.category === 'bus_route' || meta.category === 'bus_stop') {
          return true;
        }
      } else if (category === 'gasStation') {
        if (meta.category === 'gasStation') {
          return true;
        }
      } else if (category === 'gym') {
        if (meta.category === 'sports') {
          var typologies = meta.typologies || [];
          if (typologies.indexOf('Gimnasos') !== -1) {
            return true;
          }
        }
      }
    }

    return false;
  }

  renderTransportIcon(category, i18nKey, visibleElements, routeType) {
    var iconHtml = this.getIconHtml(category);
    var label = window.I18n ? window.I18n.t(i18nKey) : i18nKey;
    var lines = [];

    if (routeType !== undefined) {
      lines = this.getVisibleRouteLines(visibleElements, routeType);
    }

    var linesHtml = '';
    if (lines.length > 0) {
      var self = this;
      linesHtml = '<div class="selection-legend-lines">';
      lines.forEach(function(line) {
        var lineName = line.name || line;
        var displayName = line.displayName || lineName;
        var lineColor = line.color || '#333';
        var isSelected = self.selectedRoute && self.selectedRoute.name === lineName && self.selectedRoute.routeType === routeType;
        var style = 'background: ' + lineColor + '; color: #fff; border-color: ' + lineColor + ';';
        if (isSelected) {
          style += ' box-shadow: 0 0 0 2px rgba(0,0,0,0.3); font-weight: 600;';
        }
        var dataAttr = 'data-route-name="' + lineName + '" data-route-type="' + (routeType || '') + '"';
        linesHtml += '<span class="selection-legend-line' + (isSelected ? ' selected' : '') + '" style="' + style + '" ' + dataAttr + '>' + displayName + '</span>';
      });
      linesHtml += '</div>';
    }

    return '<div class="selection-legend-item">' +
      '<span class="selection-legend-icon">' + iconHtml + '</span>' +
      '<span>' + label + '</span>' +
      linesHtml +
      '</div>';
  }

  getIconHtml(category) {
    var path = getIconPathForCategory(category);
    if (!path) return '';
    var size = getIconSizeForLegend(category);
    var w = size[0];
    var h = size[1];
    return '<img src="' + path + '" width="' + w + '" height="' + h + '" alt="">';
  }

  getVisibleElements(registry) {
    if (!this.map || !this.map.renderedElements) return [];
    
    var visibleIds = Array.from(this.map.renderedElements);
    var visibleElements = [];
    
    visibleIds.forEach(function(id) {
      var element = registry.get(id);
      if (element) {
        visibleElements.push(element);
      }
    });
    
    return visibleElements;
  }

  getVisibleRouteLines(visibleElements, routeType) {
    var lines = [];
    var seenNames = {};
    
    visibleElements.forEach(function(element) {
      if (element.type === 'polyline') {
        var meta = element.metadata || {};
        var elementRouteType = meta.routeType;
        var isMatch = false;
        
        if (routeType === '1' || routeType === '2') {
          isMatch = (elementRouteType === '1' || elementRouteType === '2' || meta.category === 'metro_route');
        } else if (routeType === '3') {
          isMatch = (elementRouteType === '3' || meta.category === 'bus_route');
        } else if (routeType === '0') {
          isMatch = (elementRouteType === '0' || meta.category === 'tram_route');
        }
        
        if (isMatch) {
          var routeName = meta.name || element.id;
          if (routeName && !seenNames[routeName]) {
            var displayName = routeName;
            var fullName = routeName;
            if (routeName.length > 15) {
              displayName = routeName.substring(0, 12) + '...';
            }
            var routeColor = meta.color || '#333';
            lines.push({
              name: fullName,
              displayName: displayName,
              color: routeColor
            });
            seenNames[routeName] = true;
          }
        }
      }
    });
    
    lines.sort(function(a, b) {
      return a.name.localeCompare(b.name);
    });
    
    return lines;
  }

  updateTranslations() {
    if (!window.I18n) return;
    
    var elements = this.container.querySelectorAll('[data-i18n]');
    elements.forEach(function(el) {
      var key = el.getAttribute('data-i18n');
      if (key && window.I18n) {
        el.textContent = window.I18n.t(key);
      }
    });

    var titleElements = this.container.querySelectorAll('[data-i18n-title]');
    titleElements.forEach(function(el) {
      var key = el.getAttribute('data-i18n-title');
      if (key && window.I18n) {
        el.setAttribute('title', window.I18n.t(key));
      }
    });
  }
}
