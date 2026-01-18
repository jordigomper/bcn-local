class SelectionLegendManager {
  constructor(map) {
    this.map = map;
    this.container = document.getElementById('selection-legend');
    this.content = document.getElementById('selection-legend-content');
    this.resetButton = document.getElementById('selection-legend-reset-button');
    this.currentView = null;
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
    this.currentView = view;
    
    if (!view || (!view.district && !view.neighborhood)) {
      this.hide();
      return;
    }

    this.show();
    this.render();
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
      var legendHeight = self.container.offsetHeight || 500;
      var buttonHeight = self.resetButton.offsetHeight || 40;
      var bottomPosition = 20 + legendHeight + 10;
      if (self.resetButton) {
        self.resetButton.style.bottom = bottomPosition + 'px';
      }
    }, 100);
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
    if (this.hasCategoryElements(visibleElements, 'gasolinera')) {
      html += this.renderTransportIcon('gasolinera', 'gasolineras', visibleElements);
    }
    if (this.hasCategoryElements(visibleElements, 'gimnasio')) {
      html += this.renderTransportIcon('gimnasio', 'gimnasios', visibleElements);
    }

    this.content.innerHTML = html;
    this.updateTranslations();
    
    if (this.resetButton) {
      setTimeout(function() {
        this.updateResetButtonPosition();
      }.bind(this), 200);
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
      } else if (category === 'gasolinera') {
        if (meta.category === 'gasolinera') {
          return true;
        }
      } else if (category === 'gimnasio') {
        if (meta.category === 'sports') {
          var tipologias = meta.tipologias || [];
          if (tipologias.indexOf('Gimnasos') !== -1) {
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
      linesHtml = '<div class="selection-legend-lines">';
      lines.forEach(function(line) {
        linesHtml += '<span class="selection-legend-line">' + line + '</span>';
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
    if (category === 'bicing') {
      return '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<circle cx="9" cy="9" r="7.5" fill="#ffffff" stroke="#000000" stroke-width="1.5" />' +
        '<text x="9" y="12" text-anchor="end" font-size="10" font-weight="700" font-family="Arial, sans-serif" fill="#d32f2f">b</text>' +
        '<text x="9" y="12" text-anchor="start" font-size="10" font-weight="700" font-family="Arial, sans-serif" fill="#000000">g</text>' +
        '</svg>';
    } else if (category === 'metro') {
      return '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<circle cx="9" cy="9" r="7.5" fill="#f3e5f5" stroke="#6a1b9a" stroke-width="1.5" />' +
        '<text x="9" y="12" text-anchor="middle" font-size="9" font-family="Arial, sans-serif" fill="#6a1b9a">M</text>' +
        '</svg>';
    } else if (category === 'tram') {
      return '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<polygon points="10,3 17,10 10,17 3,10" fill="#FFFFFF" stroke="#4CAF50" stroke-width="2"/>' +
        '<text x="10" y="14" text-anchor="middle" font-size="10" font-weight="bold" font-family="Arial, sans-serif" fill="#4CAF50">T</text>' +
        '</svg>';
    } else if (category === 'bus') {
      return '<svg width="24" height="20" viewBox="0 0 24 20" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<rect x="3" y="4" width="18" height="12" rx="2" ry="2" fill="#FFFFFF" stroke="#212121" stroke-width="2"/>' +
        '<text x="12" y="12.8" text-anchor="middle" font-size="6.2" font-weight="bold" font-family="Arial, sans-serif" letter-spacing="0.4" fill="#000000">BUS</text>' +
        '</svg>';
    } else if (category === 'gasolinera') {
      return '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<circle cx="9" cy="9" r="8.5" fill="#FF9800" stroke="#FF9800" stroke-width="0.5"/>' +
        '<g transform="translate(5, 5)">' +
        '<rect x="0" y="0" width="5" height="6" rx="0.5" fill="#000000"/>' +
        '<rect x="1" y="1" width="3" height="3" fill="#FF9800"/>' +
        '<path d="M4.5 -0.5h1.2c0.6 0 1.2 0.6 1.2 1.2v1.8" stroke="#000000" stroke-width="1" fill="none" stroke-linecap="round"/>' +
        '</g>' +
        '</svg>';
    } else if (category === 'gimnasio') {
      return '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<circle cx="9" cy="9" r="7.5" fill="#42A5F5" stroke="#1976D2" stroke-width="1.5" />' +
        '<rect x="6" y="8" width="6" height="2" fill="#FFFFFF"/>' +
        '<rect x="5" y="7" width="2" height="4" fill="#FFFFFF"/>' +
        '<rect x="11" y="7" width="2" height="4" fill="#FFFFFF"/>' +
        '</svg>';
    }
    return '';
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
            if (routeName.length > 15) {
              displayName = routeName.substring(0, 12) + '...';
            }
            lines.push(displayName);
            seenNames[routeName] = true;
          }
        }
      }
    });
    
    return lines.sort();
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
