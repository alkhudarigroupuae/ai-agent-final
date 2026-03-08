import { openai } from '../clients/openaiClient.js';
import { supabase } from '../clients/supabaseClient.js';

export async function createEmbedding(input) {
  const result = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input
  });
  return result.data[0].embedding;
}

export async function semanticSearch(queryEmbedding, limit = 5) {
  const { data, error } = await supabase.rpc('match_products', {
    query_embedding: queryEmbedding,
    match_count: limit
  });

  if (error) throw error;
  return data || [];
}

export async function upsertProductEmbedding(product) {
  const input = `${product.name}\nSKU:${product.sku}\n${product.description || ''}`;
  const embedding = await createEmbedding(input);

  const payload = {
    product_id: product.id,
    sku: product.sku,
    title: product.name,
    description: product.description,
    embedding,
    image_url: product.images?.[0]?.src || null,
    categories: (product.categories || []).map((c) => c.name)
  };

  const { error } = await supabase.from('product_embeddings').upsert(payload, { onConflict: 'product_id' });
  if (error) throw error;
}
