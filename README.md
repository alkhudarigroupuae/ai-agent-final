<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/1e351b59-8429-4d66-b519-88a7ba3553f9

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env.local` and set your Gemini API key:
   ```
   cp .env.example .env.local
   # Then edit .env.local and set GEMINI_API_KEY to your key
   ```
   Alternatively, leave `.env.local` empty and enter your API key in the in-app prompt when the app starts.
3. Run the app:
   `npm start`
