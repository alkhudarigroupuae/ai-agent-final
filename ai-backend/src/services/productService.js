import { wooClient } from '../clients/wooClient.js';

const safeText = (value) => (value || '').toString().toLowerCase();

export async function fetchProducts(search = '') {
  const response = await wooClient.get('products', { search, per_page: 50 });
  return response.data;
}

export async function findProductsByIntent(query) {
  const normalized = safeText(query);
  const parts = normalized.match(/[a-z0-9-]{3,}/g) || [];
  const skuCandidate = parts.find((token) => /\d/.test(token));

  const [skuMatches, titleMatches, descriptionMatches] = await Promise.all([
    skuCandidate ? wooClient.get('products', { sku: skuCandidate, per_page: 20 }).then((res) => res.data) : Promise.resolve([]),
    fetchProducts(query),
    fetchProducts(parts.join(' '))
  ]);

  const uniqueMap = new Map();
  [...skuMatches, ...titleMatches, ...descriptionMatches].forEach((product) => uniqueMap.set(product.id, product));
  return Array.from(uniqueMap.values());
}
