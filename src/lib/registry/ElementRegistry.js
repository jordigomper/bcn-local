export class ElementRegistry {
  constructor() {
    this.elements = new Map()
  }

  register(element) {
    this.elements.set(element.id, element)
  }

  registerAll(elements) {
    elements.forEach(el => this.register(el))
  }

  get(id) {
    return this.elements.get(id)
  }

  getAll(ids) {
    return ids.map(id => this.elements.get(id)).filter(el => el !== undefined)
  }

  getAllElements() {
    return Array.from(this.elements.values())
  }

  getByType(type) {
    return Array.from(this.elements.values()).filter(el => el.type === type)
  }

  getByCategory(category) {
    return Array.from(this.elements.values()).filter(el =>
      el.metadata && el.metadata.category === category
    )
  }

  clear() {
    this.elements.clear()
  }

  size() {
    return this.elements.size
  }
}
