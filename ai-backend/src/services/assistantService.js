import { openai } from '../clients/openaiClient.js';

export async function buildCustomerReply(query, products, alternatives) {
  const prompt = `You are SaleParts AI, an expert parts advisor.\nUser query: ${query}\nProducts: ${JSON.stringify(products)}\nAlternatives: ${JSON.stringify(alternatives)}\nGenerate a concise, helpful response. If no exact match, recommend alternatives and compatibility guidance.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2
  });

  return completion.choices[0]?.message?.content || 'I found potential matches. Please review product details.';
}

export async function generateProductDescription(input) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: `Create a production-ready WooCommerce product listing: improve title, description, SEO keywords, and suggested category. Source input: ${JSON.stringify(input)}`
      }
    ]
  });
  return completion.choices[0]?.message?.content || '';
}
