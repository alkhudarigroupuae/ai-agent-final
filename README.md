# SaleParts AI Agent

Production-ready multi-component system for WooCommerce:

- `wordpress-plugin/saleparts-ai-agent`: WordPress plugin (chat widget, voice support, admin panel).
- `ai-backend`: Node.js + Express AI orchestration layer for product search, alternatives, and manager tooling.
- `vector-db`: Supabase pgvector schema for semantic product search.

## Repository Structure

```txt
/wordpress-plugin
  /saleparts-ai-agent
/ai-backend
/vector-db
```

## Features

### Customer AI Assistant
- Website chat widget with ChatGPT-style avatar launcher, glow effect, and branded theme support (logo/color/background).
- Voice input (Web Speech API) and speech output.
- Product search logic for part number/SKU, title, description, and semantic alternatives.
- Compatibility/replacement suggestions via vector search.

### Store Manager Assistant
- Generate improved descriptions and titles.
- Suggest SEO keywords and categories.
- Image enhancement helper endpoint and query generation for finding high-quality source images.
- Client dashboard includes **Export Questions CSV** for reporting.

### Backend Endpoints
- `POST /search-product`
- `GET /get-product/:id`
- `POST /similar-products`
- `POST /generate-description`
- `POST /enhance-image`
- `GET /health`

## 1) WordPress Plugin Installation

1. Zip the folder `wordpress-plugin/saleparts-ai-agent`.
2. In WordPress admin: **Plugins → Add New → Upload Plugin**.
3. Activate **SaleParts AI Agent**.
4. Open **SaleParts AI Agent** settings and set:
   - AI Backend URL (`https://<your-vercel-domain>`)
   - WooCommerce API Base URL (`https://<store>/wp-json/wc/v3`)
   - Voice assistant toggle
   - Brand name/color/logo/background image URL for white-label client deployments
5. Add shortcode `[saleparts_ai_chat]` to a page, or load site-wide from theme templates.

## 2) AI Backend Setup

```bash
cd ai-backend
cp .env.example .env
npm install
npm run dev
```

Required `.env` values:

- `OPENAI_API_KEY`
- `WC_URL`
- `WC_CONSUMER_KEY`
- `WC_CONSUMER_SECRET`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## 3) Vector DB Setup (Supabase)

1. Create Supabase project.
2. Run SQL from `vector-db/supabase-schema.sql` in SQL editor.
3. Sync products into embeddings table:

```bash
cd ai-backend
npm run sync:products
```

## 4) Vercel Deployment (Backend)

1. Import repository into Vercel.
2. Set root directory to `ai-backend`.
3. Vercel detects `vercel.json` and deploys `src/server.js`.
4. Add all environment variables from `.env.example`.
5. Deploy and copy generated URL into WordPress plugin settings.

## 5) Security Notes

- WooCommerce keys and OpenAI credentials are environment variables only.
- No secrets are hardcoded in plugin or backend files.
- WordPress question logging uses REST nonce validation for authenticated users.
- Use WooCommerce API keys with read-only or constrained permissions where possible.

## 6) Production Recommendations

- Put backend behind API gateway/rate limiter.
- Add auth for manager-only endpoints.
- Store enhanced images in object storage (S3/Supabase Storage).
- Add structured logging (Datadog/ELK) and uptime checks.
- Add integration tests against staging WooCommerce data.

## 7) GitHub Publishing Troubleshooting

If `git push -u origin work` fails on your local machine, use this checklist:

1. Ensure you are inside the repository directory:

   ```bash
   git rev-parse --show-toplevel
   ```

   If this command errors with `not a git repository`, run `cd` into the cloned project folder first.

2. Verify the branch exists locally:

   ```bash
   git branch
   ```

   If `work` is missing, create it from your current state:

   ```bash
   git checkout -b work
   ```

3. Verify remote configuration:

   ```bash
   git remote -v
   ```

   If no `origin` exists, add it:

   ```bash
   git remote add origin https://github.com/alkhudarigroupuae/ecommerco.ai.git
   ```

4. Push the branch:

   ```bash
   git push -u origin work
   ```

5. If you see authentication errors, use a GitHub Personal Access Token (PAT) or switch to SSH remote authentication.


## 8) Download Source Code (ZIP)

If you want a downloadable source package (without `.git` history and local secrets), run:

```bash
bash scripts/create-source-zip.sh
```

This generates a ZIP file inside `dist/` named like:

- `dist/saleparts-ai-agent-source-YYYYMMDD-HHMMSS.zip`

The archive excludes:

- `.git`
- `node_modules`
- local `.env` files
- existing `dist` output
