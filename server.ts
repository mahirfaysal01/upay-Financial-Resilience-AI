import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json());

// Server-side Gemini AI Coach endpoint
app.post('/api/ai/coach', async (req, res) => {
  try {
    const { message, context, conversationHistory } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      // Deterministic fallback if API key is not configured
      return res.status(200).json({
        source: 'rule-engine-fallback',
        reply: null, // Client will invoke deterministic reply
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = `You are the AI Financial Coach for "upay Financial Resilience AI", a digital financial services assistant for the DIU CPC × upay AI Hackathon 2026.
Your role is to explain structured financial analytics in clear, empathetic, non-judgmental, actionable, and non-manipulative language.

STRICT PRODUCT PRINCIPLES:
1. Ground every single claim in the provided structured context.
2. NEVER invent balances, dates, or spending figures not provided in context.
3. NEVER recommend high-interest loans, speculative products, or encourage unnecessary spending.
4. Keep answers focused, scannable, and practical for digital wallet users in Bangladesh (using Bangladeshi Taka ৳).
5. If certain information is unknown or not in context, state clearly that it is not available.

CURRENT STRUCTURED FINANCIAL CONTEXT:
- Customer Name: ${context.name} (ID: ${context.customerId})
- Current Wallet Balance: ৳${context.currentBalance?.toLocaleString()}
- Monthly Income: ৳${context.monthlyIncome?.toLocaleString()}
- Typical Monthly Spending: ৳${context.monthlySpending?.toLocaleString()}
- Financial Shortage Risk: ${Math.round((context.shortageRisk || 0) * 100)}% (Level: ${context.riskLevel})
- Projected Month-End Balance: ৳${context.projectedMonthEndBalance?.toLocaleString()}
- Days Remaining Until Next Income: ${context.daysUntilNextIncome} days
- Key Spending Drivers / Anomalies: ${JSON.stringify(context.anomalies || [])}
- Upcoming Obligations: ${JSON.stringify(context.upcomingBills || [])}
`;

    const chatContext = Array.isArray(conversationHistory)
      ? conversationHistory.slice(-4).map((h) => `${h.role === 'user' ? 'Customer' : 'Coach'}: ${h.text}`).join('\n')
      : '';

    const prompt = `${systemPrompt}\n\nRecent Conversation:\n${chatContext}\n\nCustomer: ${message}\n\nAI Financial Coach:`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const replyText = response.text || 'I analyzed your wallet activity and have compiled your financial projection.';

    return res.status(200).json({
      source: 'gemini-3.8-flash',
      reply: replyText,
    });
  } catch (error: any) {
    console.warn('Gemini proxy error:', error?.message || error);
    return res.status(200).json({
      source: 'rule-engine-fallback',
      reply: null, // Triggers deterministic fallback on client
    });
  }
});

// Vite Middleware & Static Serving
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith('/api')) {
        return next();
      }
      try {
        let template = fs.readFileSync(path.resolve('index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace?.(e);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`upay Financial Resilience AI server running on port ${PORT}`);
  });
}

startServer();
