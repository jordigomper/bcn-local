class MapElement {
  constructor(id, type, coordinates, metadata = {}) {
    this.id = id;
    this.type = type;
    this.coordinates = coordinates;
    this.metadata = metadata;
    this.state = {
      visible: false,
      active: false,
      selected: false
    };
    this.leafletLayer = null;
  }

  onClick(map) {
    return null;
  }

  onHover(map) {
    return null;
  }

  getTooltip() {
    return this.metadata.name || this.id;
  }

  createLeafletLayer() {
    throw new Error('createLeafletLayer debe ser implementado por la subclase');
  }

  updateState(newState) {
    var oldState = this.getState();
    this.state = Object.assign({}, this.state, newState);
    var newStateFull = this.getState();
    this.onStateChange(oldState, newStateFull);
  }

  onStateChange(oldState, newState) {
  }

  getState() {
    return Object.assign({}, this.state);
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      coordinates: this.coordinates,
      metadata: this.metadata,
      state: this.state
    };
  }
}
