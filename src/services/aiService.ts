import { useState, useCallback } from 'react';
import { aiClient, isAiMockMode, getMockFinancialVerdictResponse } from './aiClient';
import { useNotification, ToastNotification } from '../context/NotificationContext';

/**
 * Structured Financial Verdict Schema returned by AI Model
 */
export interface FinancialVerdict {
  riskScore: number;
  riskLevel: 'HIGH' | 'MODERATE' | 'LOW';
  verdictHeadline: string;
  verdictExplanation: string;
  recommendedActions: string[];
  safetyBufferRecommendation: number;
  daysUntilDeficit: number;
  confidenceScore?: number;
  evaluatedAt?: string;
  modelUsed?: string;
  isMock?: boolean;
}

/**
 * Options to integrate with the established Toast Notification system
 */
export interface FetchVerdictOptions {
  model?: string;
  showToasts?: boolean;
  toaster?: {
    notifySuccess?: (title: string, message: string, options?: any) => string;
    notifyError?: (title: string, message: string, options?: any) => string;
    notifyInfo?: (title: string, message: string, options?: any) => string;
    notifyWarning?: (title: string, message: string, options?: any) => string;
  };
  onStart?: () => void;
  onSuccess?: (verdict: FinancialVerdict) => void;
  onError?: (error: Error) => void;
}

/**
 * Utility to extract clean JSON string even if LLM wraps output in Markdown code fences
 */
function cleanJsonOutput(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return cleaned.trim();
}

/**
 * Queries OpenRouter AI model (like 'google/gemini-2.0-flash-lite' with intelligent fallback to 'google/gemini-2.5-flash-lite')
 * to evaluate customer financial resilience and returns validated parsed JSON.
 * Ensures the UI can handle loading and error states using our established Toast notification system.
 *
 * @param data Financial profile data (income, spending, bills, balance, risk)
 * @param options Toast notification handlers and lifecycle hooks
 */
export async function fetchFinancialVerdict(
  data: Record<string, any>,
  options?: FetchVerdictOptions
): Promise<FinancialVerdict> {
  const requestedModel = options?.model || 'upay AI';
  const toaster = options?.toaster;

  options?.onStart?.();

  // 1. Try server-side live AI endpoint first
  try {
    const res = await fetch('/api/ai/verdict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data }),
    });

    if (res.ok) {
      const serverData = await res.json();
      if (serverData && serverData.verdict && typeof serverData.verdict.riskScore === 'number') {
        const liveVerdict: FinancialVerdict = {
          ...serverData.verdict,
          evaluatedAt: new Date().toISOString(),
          modelUsed: 'upay AI',
        };

        if (toaster?.notifySuccess) {
          toaster.notifySuccess(
            'এআই আর্থিক রায় প্রস্তুত',
            'উপায় এআই ইন্টেলিজেন্স ইঞ্জিনের মাধ্যমে আর্থিক বিশ্লেষণ সফলভাবে প্রস্তুত করা হয়েছে।',
            { duration: 4500 }
          );
        }

        options?.onSuccess?.(liveVerdict);
        return liveVerdict;
      }
    }
  } catch {
    // Proceed to client resilience engine fallback
  }

  // 2. Client resilience engine fallback
  if (isAiMockMode) {
    const rawMock = getMockFinancialVerdictResponse(data);
    const parsedMock: FinancialVerdict = JSON.parse(rawMock);
    parsedMock.modelUsed = 'upay AI';

    if (toaster?.notifySuccess) {
      toaster.notifySuccess(
        'আর্থিক রায় প্রস্তুত',
        'উপায় রেজিলিয়েন্স ইঞ্জিনের মাধ্যমে আর্থিক বিশ্লেষণ সফলভাবে প্রস্তুত করা হয়েছে।',
        { duration: 4000 }
      );
    }
    options?.onSuccess?.(parsedMock);
    return parsedMock;
  }

  const systemInstruction = `You are the lead AI Financial Risk & Resilience Engine for "upay" (UCB Fintech).
Analyze the provided user financial data and output ONLY a valid, minified JSON object with this exact schema:
{
  "riskScore": number (0 to 100),
  "riskLevel": "HIGH" | "MODERATE" | "LOW",
  "verdictHeadline": string in natural Bengali (বাংলা),
  "verdictExplanation": string in natural Bengali explaining cash flow and deficit timing,
  "recommendedActions": string[] (array of 2 to 3 actionable steps in Bengali),
  "safetyBufferRecommendation": number (amount in BDT recommended to lock),
  "daysUntilDeficit": number (estimated days before liquid balance drops below safe threshold),
  "confidenceScore": number (80 to 99)
}
CRITICAL: Output pure JSON only. Do not add markdown backticks, explanations, or commentary outside the JSON.`;

  const userPrompt = `Evaluate this upay customer financial profile:
${JSON.stringify(data, null, 2)}`;

  // Candidates list to gracefully handle upstream slug changes on OpenRouter
  const candidateModels = Array.from(
    new Set([
      requestedModel,
      'google/gemini-2.5-flash-lite',
      'google/gemini-2.5-flash',
    ])
  );

  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const response = await aiClient.post('/chat/completions', {
        model,
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 800,
        temperature: 0.3,
      });

      const rawContent = response.data?.choices?.[0]?.message?.content;
      if (!rawContent) {
        throw new Error('AI প্রদানকারী কোনো উত্তর ফেরত দেয়নি।');
      }

      const cleanedJson = cleanJsonOutput(rawContent);
      const parsed: FinancialVerdict = JSON.parse(cleanedJson);
      parsed.modelUsed = 'upay AI';
      parsed.evaluatedAt = new Date().toISOString();

      if (toaster?.notifySuccess) {
        toaster.notifySuccess(
          'এআই আর্থিক রায় প্রস্তুত',
          `${parsed.verdictHeadline} (ঝুঁকি স্কোর: ${parsed.riskScore}%)`,
          { duration: 4500 }
        );
      }

      options?.onSuccess?.(parsed);
      return parsed;
    } catch (err: any) {
      console.warn(`[aiService] Model ${model} failed, attempting next candidate. Error:`, err?.message || err);
      lastError = err;
    }
  }

  // If all candidate models fail, fallback gracefully with error toast and mock data
  console.error('[aiService] All AI candidate models failed during fetchFinancialVerdict:', lastError);

  const errorMessage =
    lastError?.response?.data?.error?.message ||
    lastError?.message ||
    'আর্থিক বিশ্লেষণ সম্পন্ন করার সময় অপ্রত্যাশিত ত্রুটি ঘটেছে।';

  if (toaster?.notifyError) {
    toaster.notifyError(
      'এআই বিশ্লেষণে ত্রুটি',
      `${errorMessage} (সিস্টেম স্বয়ংক্রিয় রিজার্ভ ডেটা ব্যবহার করছে)`,
      { duration: 6000 }
    );
  }

  const fallbackMock = JSON.parse(getMockFinancialVerdictResponse(data));
  fallbackMock.modelUsed = 'upay AI';
  options?.onError?.(lastError instanceof Error ? lastError : new Error(errorMessage));

  return fallbackMock;
}

/**
 * React Hook that integrates fetchFinancialVerdict directly with our established Toast Notification system
 * and provides reactive loading, error, and verdict states for the UI.
 */
export function useFinancialVerdict() {
  const { notifySuccess, notifyError, notifyInfo, notifyWarning } = useNotification();
  const [loading, setLoading] = useState<boolean>(false);
  const [verdict, setVerdict] = useState<FinancialVerdict | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getVerdict = useCallback(
    async (data: Record<string, any>, modelName?: string) => {
      setLoading(true);
      setError(null);

      notifyInfo(
        'এআই বিশ্লেষণ প্রক্রিয়াধীন',
        'আপনার লেনদেন ও ক্যাশফ্লো গাণিতিক মডেলে নিরীক্ষা করা হচ্ছে...',
        { duration: 3000 }
      );

      try {
        const result = await fetchFinancialVerdict(data, {
          model: modelName || 'upay AI',
          toaster: {
            notifySuccess,
            notifyError,
            notifyInfo,
            notifyWarning,
          },
        });

        setVerdict(result);
        return result;
      } catch (err: any) {
        const msg = err?.message || 'এআই রায় সংগ্রহে সমস্যা হয়েছে';
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [notifySuccess, notifyError, notifyInfo, notifyWarning]
  );

  const resetVerdict = useCallback(() => {
    setVerdict(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    getVerdict,
    verdict,
    loading,
    error,
    resetVerdict,
  };
}

export default fetchFinancialVerdict;
