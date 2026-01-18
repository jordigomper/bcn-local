class FilterManager {
  constructor(map, registry) {
    this.map = map;
    this.registry = registry;
    this.activeFilters = new window.Set();
    this.filteredElements = new window.Set();
  }

  toggleFilter(category) {
    if (this.activeFilters.has(category)) {
      this.deactivateFilter(category);
    } else {
      this.activateFilter(category);
    }
  }

  activateFilter(category) {
    this.activeFilters.add(category);
    this.updateFilteredElements();
    this.renderFilteredElements();
  }

  deactivateFilter(category) {
    this.activeFilters.delete(category);
    this.updateFilteredElements();
    this.renderFilteredElements();
  }

  updateFilteredElements() {
    this.filteredElements.clear();

    this.activeFilters.forEach(category => {
      var elements = this.registry.getByCategory(category);
      elements.forEach(element => {
        this.filteredElements.add(element.id);
      });
    });
  }

  renderFilteredElements() {
    if (this.activeFilters.size > 0) {
      this.map.renderElements(Array.from(this.filteredElements));
    } else {
      this.map.clear();
    }
  }

  clearFilters() {
    this.activeFilters.clear();
    this.filteredElements.clear();
    this.map.clear();
  }

  isActive(category) {
    return this.activeFilters.has(category);
  }
}
