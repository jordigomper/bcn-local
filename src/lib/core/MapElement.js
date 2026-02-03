export class MapElement {
  constructor(id, type, coordinates, metadata = {}) {
    this.id = id
    this.type = type
    this.coordinates = coordinates
    this.metadata = metadata
    this.state = { visible: false, active: false, selected: false }
    this.leafletLayer = null
    this.iconBasePath = '/js/components/icons/'
    this.iconWidth = 11
    this.iconHeight = 11
  }

  onClick(map) {
    return null
  }

  onHover(map) {
    return null
  }

  getTooltip() {
    return this.metadata.name || this.id
  }

  getIcon() {
    return null
  }

  createIconFromPath(path, width, height, className) {
    const w = width || this.iconWidth
    const h = height || this.iconHeight
    const style = 'width:' + w + 'px;height:' + h + 'px;display:block;'
    return window.L.divIcon({
      html: '<img src="' + path + '" width="' + w + '" height="' + h + '" alt="" style="' + style + '" />',
      iconSize: [w, h],
      iconAnchor: [w / 2, h / 2],
      className: className || ''
    })
  }

  createLeafletLayer() {
    throw new Error('createLeafletLayer must be implemented by the subclass')
  }

  updateState(newState) {
    const oldState = this.getState()
    this.state = Object.assign({}, this.state, newState)
    this.onStateChange(oldState, this.getState())
  }

  onStateChange(oldState, newState) {}

  getState() {
    return Object.assign({}, this.state)
  }

  toJSON() {
    return { id: this.id, type: this.type, coordinates: this.coordinates, metadata: this.metadata, state: this.state }
  }
}
