import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
(async () => {
  console.log("Fetching models...");
  // listModels doesn't exist on the JS SDK in some versions, but we can try fetching.
  // Actually, we can just fetch via curl to the REST API if we have the key.
})();
