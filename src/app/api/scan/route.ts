import { NextResponse } from 'next/server';
import { chromium } from 'playwright';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

// Tell Next.js this route is dynamic
export const dynamic = 'force-dynamic';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function GET() {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: 'Missing GEMINI_API_KEY environment variable.' }, { status: 500 });
  }

  let storageState: any = null;
  
  if (process.env.MECO_AUTH_STATE) {
    try {
      storageState = JSON.parse(process.env.MECO_AUTH_STATE);
    } catch (e) {
      return NextResponse.json({ error: 'MECO_AUTH_STATE environment variable is not valid JSON.' }, { status: 500 });
    }
  } else {
    const authPath = path.join(process.cwd(), 'meco_auth.json');
    if (!fs.existsSync(authPath)) {
      return NextResponse.json({ error: 'Session not found. Set MECO_AUTH_STATE as an environment variable or run `node meco-login.mjs` locally.' }, { status: 500 });
    }
    storageState = authPath;
  }

  let browser;
  const processedNewsletters: any[] = [];

  try {
    // Launch standard Playwright (works locally and in Docker)
    browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'] // Required for running as root in Docker
    });

    const context = await browser.newContext({ storageState });
    const page = await context.newPage();

    // Navigate to Meco Web App
    await page.goto('https://web.meco.app/', { waitUntil: 'load' });

    // Wait for content to render and trigger lazy loading
    await page.waitForTimeout(5000);
    await page.evaluate(() => window.scrollBy(0, 2000));
    await page.waitForTimeout(2000);

    const pageText = await page.evaluate(() => document.body.innerText);

    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });
    const prompt = `
    You are an expert financial analyst. Below is the raw text scraped from my Meco newsletter inbox web view.
    Identify the distinct newsletters or articles visible in this text, and extract the most unique, pertinent, and useful information for trading and forecasting markets.
    
    Focus on:
    1. Unique alpha or insights not widely known.
    2. New market developments (Equities, Crypto, Macro, Forex).
    3. Actionable trading or forecasting utility.

    Inbox Scrape:
    ${pageText.slice(0, 80000)}

    Respond in JSON format EXACTLY like this (an array of newsletters). If you don't find any, return an empty array [].
    [
      {
        "subject": "<guess the newsletter title/subject from the text>",
        "sender": "<guess the sender>",
        "date": "<guess the date, or use today>",
        "analysis": {
          "score": <number 1-10 on relevance to trading>,
          "tldr": "<short 1-sentence summary>",
          "insights": [
            { "title": "<insight title>", "description": "<1-2 sentence explanation>" }
          ]
        }
      }
    ]
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    let analysis = [];
    try {
      const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      analysis = JSON.parse(jsonStr);
    } catch (e) {
      console.error('Failed to parse Gemini JSON:', responseText);
    }

    if (Array.isArray(analysis)) {
       analysis.forEach((nl: any, i: number) => {
         processedNewsletters.push({
           id: i,
           subject: nl.subject || 'Unknown Subject',
           sender: nl.sender || 'Unknown Sender',
           date: nl.date || new Date().toISOString(),
           analysis: nl.analysis
         });
       });
    }
    
    await browser.close();
    processedNewsletters.sort((a, b) => (b.analysis?.score || 0) - (a.analysis?.score || 0));
    return NextResponse.json({ success: true, data: processedNewsletters });
    
  } catch (err: any) {
    if (browser) await browser.close();
    console.error('Playwright Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
