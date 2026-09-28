import { AIReviewResult, Problem } from '../types';

export async function fetchSmartHint(
  problemTitle: string,
  description: string,
  code: string,
  language: string,
  hintLevel: number
): Promise<{ hint: string; level: number }> {
  const res = await fetch('/api/ai/hint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      problemTitle,
      description,
      code,
      language,
      hintLevel,
    }),
  });

  if (!res.ok) {
    throw new Error('Failed to fetch AI hint');
  }
  return res.json();
}

export async function fetchCodeReview(
  problemTitle: string,
  code: string,
  language: string,
  passed: boolean,
  executionTime?: number
): Promise<AIReviewResult> {
  const res = await fetch('/api/ai/review', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      problemTitle,
      code,
      language,
      passed,
      executionTime,
    }),
  });

  if (!res.ok) {
    throw new Error('Failed to fetch AI review');
  }
  return res.json();
}

export async function fetchErrorDiagnosis(
  problemTitle: string,
  code: string,
  language: string,
  failedTest?: any,
  errorMessage?: string
): Promise<{ diagnosis: string; suggestedFix: string }> {
  const res = await fetch('/api/ai/explain-error', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      problemTitle,
      code,
      language,
      failedTest,
      errorMessage,
    }),
  });

  if (!res.ok) {
    throw new Error('Failed to explain error');
  }
  return res.json();
}

export async function generateAiProblem(
  subject: string,
  topic: string,
  difficulty: string
): Promise<Problem> {
  const res = await fetch('/api/ai/generate-problem', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      subject,
      topic,
      difficulty,
    }),
  });

  if (!res.ok) {
    throw new Error('Failed to generate problem');
  }
  return res.json();
}

export async function askAiTutor(
  question: string,
  context?: any
): Promise<{ answer: string }> {
  const res = await fetch('/api/ai/ask-tutor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question,
      context,
    }),
  });

  if (!res.ok) {
    throw new Error('Failed to get tutor answer');
  }
  return res.json();
}
