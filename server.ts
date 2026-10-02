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

// Initialize Google GenAI client with required User-Agent
const geminiApiKey = process.env.GEMINI_API_KEY;
const ai = geminiApiKey && geminiApiKey !== 'MY_GEMINI_API_KEY'
  ? new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

/**
 * Resilient Gemini Content Generation with automated fallback
 * Tries gemini-3.8-flash first; if experiencing temporary demand spikes (503),
 * smoothly switches to gemini-3.1-flash-lite to guarantee 100% uptime for the user.
 */
async function generateGeminiContentWithFallback(prompt: string, systemInstruction?: string) {
  if (!ai) {
    throw new Error('Gemini API key is not configured');
  }

  const modelCandidates = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];
  let lastError: any = null;

  for (const model of modelCandidates) {
    try {
      const config: Record<string, any> = {};
      if (systemInstruction) {
        config.systemInstruction = systemInstruction;
      }

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: Object.keys(config).length > 0 ? config : undefined,
      });

      if (response && response.text) {
        return {
          text: response.text,
          model,
        };
      }
    } catch (err: any) {
      console.warn(`[Gemini API] Model ${model} failed, attempting next candidate. Error:`, err?.message || err);
      lastError = err;
    }
  }

  throw lastError || new Error('All Gemini models failed');
}

// 1. AI API Status Endpoint
app.get('/api/ai/status', (_req, res) => {
  res.json({
    active: !!ai,
    apiKeyConfigured: !!geminiApiKey && geminiApiKey !== 'MY_GEMINI_API_KEY',
    primaryModel: 'gemini-3.8-flash',
    fallbackModel: 'gemini-3.1-flash-lite',
    provider: 'Google Gemini Generative AI',
  });
});

// 2. Server-side Gemini AI Coach endpoint
app.post('/api/ai/coach', async (req, res) => {
  try {
    const { message, context, conversationHistory, lang = 'bn' } = req.body;

    if (!ai) {
      return res.status(200).json({
        source: 'rule-engine-fallback',
        reply: null,
      });
    }

    const systemInstruction = `You are the AI Financial Coach for "upay Financial Resilience AI", an intelligent financial resilience assistant for upay digital financial services in Bangladesh.
Your mission is to provide empathetic, highly practical, grounded, non-manipulative financial coaching in ${lang === 'bn' ? 'Bengali (বাংলা)' : 'English'}.

STRICT FINANCIAL RESILIENCE PRINCIPLES:
1. Ground every statement exclusively in the provided structured context.
2. NEVER fabricate balances, deposit dates, or transaction numbers.
3. NEVER promote predatory micro-credit or encourage unnecessary spending.
4. Use Bangladeshi Taka (৳ / BDT).
5. Explain financial trade-offs clearly: e.g., if cutting dining out or merchant deliveries saves money, quantify the exact benefit.
6. Keep answers structured, friendly, concise, and scannable with bullet points when listing steps.

CURRENT CUSTOMER CONTEXT:
- Customer: ${context?.name || 'Customer'} (ID: ${context?.customerId || 'C001'})
- Current Wallet Balance: ৳${context?.currentBalance?.toLocaleString() || 0}
- Monthly Inflow: ৳${context?.monthlyIncome?.toLocaleString() || 0}
- Typical Monthly Outflow: ৳${context?.monthlySpending?.toLocaleString() || 0}
- Liquidity Shortage Risk: ${Math.round((context?.shortageRisk || 0) * 100)}% (Level: ${context?.riskLevel || 'LOW'})
- Projected Month-End Balance: ৳${context?.projectedMonthEndBalance?.toLocaleString() || 0}
- Days Remaining Until Next Income: ${context?.daysUntilNextIncome || 0} days
- Key Spending Drivers & Anomalies: ${JSON.stringify(context?.anomalies || [])}
- Upcoming Obligations: ${JSON.stringify(context?.upcomingBills || [])}
`;

    const chatContext = Array.isArray(conversationHistory)
      ? conversationHistory.slice(-4).map((h) => `${h.role === 'user' ? 'Customer' : 'Coach'}: ${h.text}`).join('\n')
      : '';

    const prompt = `Recent Conversation Context:\n${chatContext}\n\nCustomer Question / Prompt:\n${message}\n\nPlease respond clearly and helpfully as the upay AI Financial Coach:`;

    const result = await generateGeminiContentWithFallback(prompt, systemInstruction);

    return res.status(200).json({
      source: result.model,
      reply: result.text,
      model: result.model,
    });
  } catch (error: any) {
    console.warn('Gemini proxy error:', error?.message || error);
    return res.status(200).json({
      source: 'rule-engine-fallback',
      reply: null,
      error: error?.message,
    });
  }
});

// 3. Server-side Gemini Deep Insights endpoint
app.post('/api/ai/deep-insights', async (req, res) => {
  try {
    const { context, lang = 'bn' } = req.body;

    if (!ai) {
      return res.status(200).json({
        source: 'rule-engine-fallback',
        insights: null,
      });
    }

    const prompt = `Analyze this digital financial wallet profile for ${context?.name || 'Customer'}:
- Current Liquid Balance: ৳${context?.currentBalance}
- Monthly Inflow: ৳${context?.monthlyIncome}
- Monthly Spending: ৳${context?.monthlySpending}
- Liquidity Shortage Risk: ${Math.round((context?.shortageRisk || 0) * 100)}% (${context?.riskLevel})
- Days to Next Income: ${context?.daysUntilNextIncome} days
- Flagged Anomalies: ${JSON.stringify(context?.anomalies || [])}
- Upcoming Bills: ${JSON.stringify(context?.upcomingBills || [])}

Generate 3 personalized, highly specific financial resilience insights or action steps in ${lang === 'bn' ? 'Bengali (বাংলা)' : 'English'}.
Focus on:
1. How to safeguard cash flow until the next deposit.
2. An actionable way to reduce highest variance anomaly category.
3. A realistic micro-savings or safety reserve buffer tactic.

Provide your output as concise, readable text with clear bullet points.`;

    const result = await generateGeminiContentWithFallback(prompt);

    return res.status(200).json({
      source: result.model,
      insights: result.text,
      model: result.model,
    });
  } catch (error: any) {
    console.warn('Gemini deep insights error:', error?.message || error);
    return res.status(200).json({
      source: 'rule-engine-fallback',
      insights: null,
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
