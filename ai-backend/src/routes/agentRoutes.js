import express from 'express';
import { createEmbedding, semanticSearch } from '../services/vectorService.js';
import { buildCustomerReply, generateProductDescription } from '../services/assistantService.js';
import { findProductsByIntent } from '../services/productService.js';
import { buildImageSearchQueries } from '../services/imageService.js';

const router = express.Router();

router.post('/search-product', async (req, res, next) => {
  try {
    const { query } = req.body;
    const products = await findProductsByIntent(query || '');

    const embedding = await createEmbedding(query || '');
    const semanticAlternatives = await semanticSearch(embedding, 4);

    const reply = await buildCustomerReply(query, products.slice(0, 3), semanticAlternatives);

    res.json({
      query,
      matches: products,
      alternatives: semanticAlternatives,
      reply
    });
  } catch (error) {
    next(error);
  }
});

router.get('/get-product/:id', async (req, res, next) => {
  try {
    const products = await findProductsByIntent(req.params.id);
    res.json(products[0] || null);
  } catch (error) {
    next(error);
  }
});

router.post('/similar-products', async (req, res, next) => {
  try {
    const { text } = req.body;
    const embedding = await createEmbedding(text || '');
    const alternatives = await semanticSearch(embedding, 8);
    res.json({ alternatives });
  } catch (error) {
    next(error);
  }
});

router.post('/generate-description', async (req, res, next) => {
  try {
    const generated = await generateProductDescription(req.body);
    res.json({ generated });
  } catch (error) {
    next(error);
  }
});

router.post('/enhance-image', async (req, res) => {
  const { sku, productName, brand } = req.body;
  res.json({
    message: 'Upload processing should be handled via multipart + object storage in production.',
    recommendedSearchQueries: buildImageSearchQueries({ sku, name: productName, brand })
  });
});

export default router;
