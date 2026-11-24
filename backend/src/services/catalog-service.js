import { catalogRepository as repository } from '../repositories/catalog-repository.js';
export class ApiError extends Error {
  constructor(status, code, message) { super(message); this.status = status; this.code = code; }
}
const badRequest = message => { throw new ApiError(400, 'VALIDATION_ERROR', message); };
const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
function integerParam(value, fallback, name, max) {
  if (value === null) return fallback;
  if (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value)) || Number(value) < 1 || Number(value) > max) {
    badRequest(`${name} phải là số nguyên từ 1 đến ${max}.`);
  }
  return Number(value);
}
export function getCategories() {
  const products = repository.getProducts().filter(item => item.available);
  return repository.getCategories().map(category => ({ ...category, count: products.filter(item => item.categoryId === category.id).length }));
}
export function getStore() { return repository.getStore(); }
export function getHome() {
  const { slides, gallery, ...store } = getStore();
  return { store, slides, gallery, categories: getCategories() };
}
export function listMenu(params = new URLSearchParams()) {
  for (const key of ['category', 'q', 'page', 'limit']) {
    if (params.getAll(key).length > 1) badRequest(`Không được lặp tham số ${key}.`);
  }
  const category = params.get('category') || 'all';
  if (category !== 'all' && !repository.getCategories().some(item => item.id === category)) badRequest('Danh mục không hợp lệ.');
  const q = (params.get('q') || '').trim();
  if (q.length > 100) badRequest('Từ khóa tìm kiếm không được quá 100 ký tự.');
  const page = integerParam(params.get('page'), 1, 'page', 10000);
  const limit = integerParam(params.get('limit'), 24, 'limit', 24);
  const products = repository.getProducts().filter(item => item.available &&
    (category === 'all' || item.categoryId === category) &&
    (!q || normalize(item.name).includes(normalize(q))));
  return {
    data: products.slice((page - 1) * limit, page * limit),
    meta: { total: products.length, page, limit, pageCount: Math.ceil(products.length / limit) },
  };
}
export function getProduct(id) {
  const product = repository.getProducts().find(item => item.id === id && item.available);
  if (!product) throw new ApiError(404, 'PRODUCT_NOT_FOUND', 'Không tìm thấy món này trong thực đơn.');
  return product;
}
export function createQuote(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload) || !Array.isArray(payload.items) ||
      payload.items.length < 1 || payload.items.length > 20) badRequest('items phải là danh sách từ 1 đến 20 món.');
  const grouped = new Map();
  for (const item of payload.items) {
    if (!item || typeof item !== 'object' || Array.isArray(item) || typeof item.productId !== 'string' ||
        !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 20) {
      badRequest('Mỗi món cần productId và quantity là số nguyên từ 1 đến 20.');
    }
    const product = getProduct(item.productId);
    const variantId = item.variantId ?? 'regular';
    const variant = product.variants.find(variant => variant.id === variantId);
    if (!variant) badRequest(`Lựa chọn kích cỡ không hợp lệ cho ${product.name}.`);
    const key = `${product.id}:${variant.id}`;
    const previous = grouped.get(key);
    const quantity = (previous?.quantity || 0) + item.quantity;
    if (quantity > 20) badRequest('Tổng số lượng cho mỗi món và kích cỡ không được vượt quá 20.');
    // Prices and totals always come from the catalog; client-supplied prices are ignored.
    const unitPrice = product.price + variant.extraPrice;
    grouped.set(key, { productId: product.id, name: product.name, variantId: variant.id, variantName: variant.name,
      quantity, unitPrice, subtotal: unitPrice * quantity });
  }
  const items = [...grouped.values()];
  return { items, total: items.reduce((sum, item) => sum + item.subtotal, 0), currency: 'VND', isEstimate: true };
}
