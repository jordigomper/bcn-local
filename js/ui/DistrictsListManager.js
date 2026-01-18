class DistrictsListManager {
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
      var neighborhoods = districtsByCode[code] || [];

      html += '<div class="legend-district-header">';
      html += '<span class="district-name" data-district="' + code + '">' + (district.name || code) + '</span>';
      html += '</div>';

      neighborhoods.forEach(function(n) {
        html += '<div class="legend-item" data-neighborhood="' + n.name + '">';
        html += '<span class="legend-color" style="background-color: ' + n.color + '"></span>';
        html += '<span class="legend-name">' + n.name + '</span>';
        html += '</div>';
      });
    }

    this.container.innerHTML = html;
    this.attachEventListeners();
  }

  attachEventListeners() {
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
    var headers = document.querySelectorAll('.legend-district-header');
    headers.forEach(function(header) {
      header.classList.remove('active');
    });

    var items = document.querySelectorAll('.legend-item');
    var activeItem = null;
    items.forEach(function(item) {
      if (item.dataset.neighborhood === neighborhoodName) {
        item.classList.add('active');
        activeItem = item;
      } else {
        item.classList.remove('active');
      }
    });

    if (activeItem && this.container) {
      var self = this;
      var neighborhood = this.neighborhoods[neighborhoodName];
      if (neighborhood && neighborhood.district) {
        setTimeout(function() {
          var districtHeader = self.container.querySelector('.legend-district-header .district-name[data-district="' + neighborhood.district + '"]');
          if (districtHeader) {
            var districtHeaderElement = districtHeader.closest('.legend-district-header');
            if (districtHeaderElement) {
              districtHeaderElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
                inline: 'nearest'
              });
            }
          }
        }, 50);
      }
    }
  }
}
