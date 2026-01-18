class LegendManager {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.districts = {};
    this.neighborhoods = {};
    this.hiddenDistricts = {};
  }

  rebuild(districts, neighborhoods) {
    this.districts = districts || {};
    this.neighborhoods = neighborhoods || {};
    this.render();
  }

  render() {
    if (!this.container) return;

    var html = '';
    var districtsByCode = {};

    for (var name in this.neighborhoods) {
      var neighborhood = this.neighborhoods[name];
      var district = neighborhood.district || '';
      if (!districtsByCode[district]) {
        districtsByCode[district] = [];
      }
      districtsByCode[district].push({ name: name, color: neighborhood.color });
    }

    for (var code in this.districts) {
      var district = this.districts[code];
      var isHidden = this.hiddenDistricts[code];
      var neighborhoods = districtsByCode[code] || [];

      html += '<div class="legend-district-header' + (isHidden ? ' hidden-district' : '') + '">';
      html += '<span class="district-name" data-district="' + code + '">' + (district.name || code) + '</span>';
      html += '<span class="district-eye-icon" data-district="' + code + '">' + this.getEyeIcon(isHidden) + '</span>';
      html += '</div>';

      if (!isHidden) {
        neighborhoods.forEach(function(n) {
          html += '<div class="legend-item" data-neighborhood="' + n.name + '">';
          html += '<span class="legend-color" style="background-color: ' + n.color + '"></span>';
          html += '<span class="legend-name">' + n.name + '</span>';
          html += '</div>';
        });
      }
    }

    this.container.innerHTML = html;
    this.attachEventListeners();
  }

  getEyeIcon(hidden) {
    if (hidden) {
      return '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 8s2-4 7-4 7 4 7 4-2 4-7 4-7-4-7-4z"/><circle cx="8" cy="8" r="2"/></svg>';
    }
    return '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 1l14 14M8 3c3 0 5 2 5 5M8 13c-3 0-5-2-5-5"/></svg>';
  }

  attachEventListeners() {
    var self = this;

    var districtHeaders = this.container.querySelectorAll('.district-name');
    districtHeaders.forEach(function(header) {
      header.addEventListener('click', function() {
        var districtCode = this.dataset.district;
        if (window.mapInstance) {
          var registry = window.mapInstance.getRegistry();
          if (registry) {
            var districtElement = registry.get(districtCode);
            if (districtElement && districtElement.onClick) {
              districtElement.onClick(window.mapInstance);
            }
          }
        }
      });
    });

    var eyeIcons = this.container.querySelectorAll('.district-eye-icon');
    eyeIcons.forEach(function(icon) {
      icon.addEventListener('click', function(e) {
        e.stopPropagation();
        var districtCode = this.dataset.district;
        if (window.mapInstance) {
          var neighborhoodManager = window.mapInstance.getNeighborhoodManager();
          if (neighborhoodManager) {
            neighborhoodManager.toggleDistrictVisibility(districtCode);
            if (window.mapInstance.legendManager) {
              window.mapInstance.legendManager.toggleDistrictVisibility(districtCode);
            }
          }
        }
      });
    });

    var neighborhoodItems = this.container.querySelectorAll('.legend-item[data-neighborhood]');
    neighborhoodItems.forEach(function(item) {
      item.addEventListener('click', function() {
        var neighborhoodName = this.dataset.neighborhood;
        if (window.mapInstance) {
          var registry = window.mapInstance.getRegistry();
          if (registry) {
            var neighborhoodElement = registry.get(neighborhoodName);
            if (neighborhoodElement && neighborhoodElement.onClick) {
              neighborhoodElement.onClick(window.mapInstance);
            }
          }
        }
      });
    });
  }

  setActiveDistrict(districtCode) {
    var headers = document.querySelectorAll('.legend-district-header');
    headers.forEach(function(header) {
      if (header.querySelector('.district-name').dataset.district === districtCode) {
        header.classList.add('active');
      } else {
        header.classList.remove('active');
      }
    });

    var items = document.querySelectorAll('.legend-item');
    items.forEach(function(item) {
      item.classList.remove('active');
    });
  }

  setActiveNeighborhood(neighborhoodName) {
    var items = document.querySelectorAll('.legend-item');
    items.forEach(function(item) {
      if (item.dataset.neighborhood === neighborhoodName) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  toggleDistrictVisibility(districtCode) {
    this.hiddenDistricts[districtCode] = !this.hiddenDistricts[districtCode];
    this.render();
  }
}
