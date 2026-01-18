class ElementFactory {
  static createFromJSON(jsonData, elementClass) {
    if (Array.isArray(jsonData)) {
      return jsonData.map(item => this.createSingle(item, elementClass));
    }
    return this.createSingle(jsonData, elementClass);
  }

  static createSingle(jsonData, elementClass) {
    if (!jsonData.id || !jsonData.type || !jsonData.coordinates) {
      console.warn('JSON inválido para crear elemento:', jsonData);
      return null;
    }

    return new elementClass(
      jsonData.id,
      jsonData.type,
      jsonData.coordinates,
      jsonData.metadata || {}
    );
  }

  static createMarker(id, coordinates, metadata) {
    return {
      id: id,
      type: 'marker',
      coordinates: coordinates,
      metadata: metadata
    };
  }

  static createPolyline(id, coordinates, metadata) {
    return {
      id: id,
      type: 'polyline',
      coordinates: coordinates,
      metadata: metadata
    };
  }

  static createPolygon(id, coordinates, metadata) {
    return {
      id: id,
      type: 'polygon',
      coordinates: coordinates,
      metadata: metadata
    };
  }
}
