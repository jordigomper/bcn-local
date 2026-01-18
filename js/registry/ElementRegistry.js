class ElementRegistry {
  constructor() {
    this.elements = new window.Map();
  }

  register(element) {
    this.elements.set(element.id, element);
  }

  registerAll(elements) {
    var self = this;
    elements.forEach(function(element) { self.register(element); });
  }

  get(id) {
    return this.elements.get(id);
  }

  getAll(ids) {
    var self = this;
    return ids.map(function(id) { return self.elements.get(id); }).filter(function(el) { return el !== undefined; });
  }

  getAllElements() {
    return Array.from(this.elements.values());
  }

  getByType(type) {
    return Array.from(this.elements.values()).filter(el => el.type === type);
  }

  getByCategory(category) {
    return Array.from(this.elements.values()).filter(el =>
      el.metadata && el.metadata.category === category
    );
  }

  clear() {
    this.elements.clear();
  }

  size() {
    return this.elements.size;
  }
}
