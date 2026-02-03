export class ElementFactory {
  static createFromJSON(jsonData, elementClass) {
    if (Array.isArray(jsonData)) {
      return jsonData.map(item => this.createSingle(item, elementClass))
    }
    return this.createSingle(jsonData, elementClass)
  }

  static createSingle(jsonData, elementClass) {
    if (!jsonData.id || !jsonData.type || !jsonData.coordinates) {
      console.warn('Invalid JSON for element creation:', jsonData)
      return null
    }
    return new elementClass(
      jsonData.id,
      jsonData.type,
      jsonData.coordinates,
      jsonData.metadata || {}
    )
  }

  static createMarker(id, coordinates, metadata) {
    return { id, type: 'marker', coordinates, metadata }
  }

  static createPolyline(id, coordinates, metadata) {
    return { id, type: 'polyline', coordinates, metadata }
  }

  static createPolygon(id, coordinates, metadata) {
    return { id, type: 'polygon', coordinates, metadata }
  }
}
