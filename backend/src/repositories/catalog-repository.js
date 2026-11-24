import catalog from '../data/catalog.json' with { type: 'json' };
import store from '../data/store.json' with { type: 'json' };
// Read-only seed repository. Replace these methods with database queries when needed.
export const catalogRepository = {
  getProducts: () => structuredClone(catalog.products),
  getCategories: () => structuredClone(catalog.categories),
  getStore: () => structuredClone(store),
};
