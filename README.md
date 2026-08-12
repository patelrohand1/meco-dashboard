# Market Intelligence Dashboard

A custom-built, automated web dashboard that scans your Meco newsletter inbox using Playwright, parses the contents with Gemini AI (3.5 Flash), and highlights the most unique, actionable, and relevant market intelligence for trading and forecasting.

## Live Application
This dashboard is deployed live on Render:
**[https://meco-dashboard.onrender.com/](https://meco-dashboard.onrender.com/)**

## Technology Stack
- **Frontend/Backend:** Next.js, React, TailwindCSS
- **AI Processing:** Google Gemini 3.5 Flash
- **Web Scraping:** Playwright (Standard Chromium via Docker)
- **Deployment:** Render.com (Docker Environment)

## How it Works
1. A headless Chromium browser navigates to the Meco web application.
2. It uses securely stored session cookies (`MECO_AUTH_STATE`) to bypass login.
3. The inbox content is scraped and passed to a highly tuned Gemini AI prompt.
4. The AI identifies distinct newsletters, summarizes them, extracts actionable insights, and scores them based on their relevance to market trading.
5. The results are presented in a clean, responsive UI.

## Environment Setup
If running this locally, you must provide the following environment variables:
- `GEMINI_API_KEY`: Your Google Generative AI API key.
- `MECO_AUTH_STATE`: The JSON string content of your Meco browser session cookies.
