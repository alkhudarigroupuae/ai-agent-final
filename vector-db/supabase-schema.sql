create extension if not exists vector;

create table if not exists product_embeddings (
  product_id bigint primary key,
  sku text,
  title text,
  description text,
  image_url text,
  categories text[],
  embedding vector(1536),
  updated_at timestamptz default now()
);

create or replace function match_products(query_embedding vector(1536), match_count int)
returns table (
  product_id bigint,
  sku text,
  title text,
  description text,
  image_url text,
  categories text[],
  similarity float
)
language sql stable as $$
  select
    product_id,
    sku,
    title,
    description,
    image_url,
    categories,
    1 - (product_embeddings.embedding <=> query_embedding) as similarity
  from product_embeddings
  order by product_embeddings.embedding <=> query_embedding
  limit match_count;
$$;
