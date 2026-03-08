import { fetchProducts } from './productService.js';
import { upsertProductEmbedding } from './vectorService.js';

async function run() {
  const products = await fetchProducts('');
  console.log(`Syncing ${products.length} products...`);

  for (const product of products) {
    await upsertProductEmbedding(product);
    console.log(`Synced ${product.id} ${product.name}`);
  }

  console.log('Product embedding sync complete.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
