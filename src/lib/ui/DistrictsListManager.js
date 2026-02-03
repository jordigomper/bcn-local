export class DistrictsListManager {
  constructor(containerIdOrElement) {
    this.container = typeof containerIdOrElement === 'string'
      ? document.getElementById(containerIdOrElement)
      : containerIdOrElement
    this.districts = {}
    this.neighborhoods = {}
    this.hiddenDistricts = {}
  }

  rebuild(districts, neighborhoods) {
    this.districts = districts || {}
    this.neighborhoods = neighborhoods || {}
    this.render()
  }

  render() {
    if (!this.container) return
    let html = ''
    const districtsByCode = {}
    for (const name in this.neighborhoods) {
      const neighborhood = this.neighborhoods[name]
      const district = neighborhood.district || ''
      if (!districtsByCode[district]) districtsByCode[district] = []
      districtsByCode[district].push({ name, color: neighborhood.color })
    }
    for (const code in this.districts) {
      const district = this.districts[code]
      const neighborhoods = districtsByCode[code] || []
      html += '<div class="legend-district-header">'
      html += '<span class="district-name" data-district="' + code + '">' + (district.name || code) + '</span>'
      html += '</div>'
      neighborhoods.forEach(n => {
        html += '<div class="legend-item" data-neighborhood="' + n.name + '">'
        html += '<span class="legend-color" style="background-color: ' + n.color + '"></span>'
        html += '<span class="legend-name">' + n.name + '</span>'
        html += '</div>'
      })
    }
    this.container.innerHTML = html
    this.attachEventListeners()
  }

  attachEventListeners() {
    const districtHeaders = this.container.querySelectorAll('.district-name')
    districtHeaders.forEach(header => {
      header.addEventListener('click', function() {
        const districtCode = this.dataset.district
        if (window.mapInstance) {
          const registry = window.mapInstance.getRegistry()
          if (registry) {
            const districtElement = registry.get(districtCode)
            if (districtElement && districtElement.onClick) districtElement.onClick(window.mapInstance)
          }
        }
      })
    })
    const neighborhoodItems = this.container.querySelectorAll('.legend-item[data-neighborhood]')
    neighborhoodItems.forEach(item => {
      item.addEventListener('click', function() {
        const neighborhoodName = this.dataset.neighborhood
        if (window.mapInstance) {
          const registry = window.mapInstance.getRegistry()
          if (registry) {
            const neighborhoodElement = registry.get(neighborhoodName)
            if (neighborhoodElement && neighborhoodElement.onClick) neighborhoodElement.onClick(window.mapInstance)
          }
        }
      })
    })
  }

  setActiveDistrict(districtCode) {
    document.querySelectorAll('.legend-district-header').forEach(header => {
      if (header.querySelector('.district-name').dataset.district === districtCode) header.classList.add('active')
      else header.classList.remove('active')
    })
    document.querySelectorAll('.legend-item').forEach(item => item.classList.remove('active'))
  }

  setActiveNeighborhood(neighborhoodName) {
    document.querySelectorAll('.legend-district-header').forEach(header => header.classList.remove('active'))
    const items = document.querySelectorAll('.legend-item')
    let activeItem = null
    items.forEach(item => {
      if (item.dataset.neighborhood === neighborhoodName) {
        item.classList.add('active')
        activeItem = item
      } else {
        item.classList.remove('active')
      }
    })
    if (activeItem && this.container) {
      const neighborhood = this.neighborhoods[neighborhoodName]
      if (neighborhood && neighborhood.district) {
        setTimeout(() => {
          const districtHeader = this.container.querySelector('.legend-district-header .district-name[data-district="' + neighborhood.district + '"]')
          if (districtHeader) {
            const districtHeaderElement = districtHeader.closest('.legend-district-header')
            if (districtHeaderElement) {
              districtHeaderElement.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' })
            }
          }
        }, 50)
      }
    }
  }
}
