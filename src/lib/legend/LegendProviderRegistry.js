export class LegendProviderRegistry {
  constructor() {
    this.providers = new Map()
  }

  register(id, getItem) {
    this.providers.set(id, { id, getItem })
  }

  getItems(visibleElements) {
    if (!visibleElements || visibleElements.length === 0) return []
    const items = []
    this.providers.forEach(({ id, getItem }) => {
      const item = getItem(visibleElements)
      if (item != null) items.push({ ...item, id: item.id || id })
    })
    return items
  }
}
