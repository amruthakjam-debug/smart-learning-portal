import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Gemini client strictly on the server side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper to check if API key exists
const hasApiKey = Boolean(process.env.GEMINI_API_KEY);

// 1. Smart Hint Endpoint
app.post('/api/ai/hint', async (req: Request, res: Response) => {
  try {
    const { problemTitle, description, code, language, hintLevel } = req.body;

    if (!hasApiKey) {
      return res.json({
        hint: `Hint (${hintLevel}/3): Consider breaking down ${problemTitle}. Think about boundary conditions, required data structures (like maps or pointers), and avoiding nested iterations.`,
        level: hintLevel,
      });
    }

    const prompt = `You are an expert, encouraging coding mentor on CodeZenith.
A student is working on this coding problem:
Problem: "${problemTitle}"
Description: ${description}
Target Language: ${language || 'JavaScript'}

Current Student Code:
\`\`\`${language || 'javascript'}
${code || '// Empty code'}
\`\`\`

Request: Give a focused Hint Level ${hintLevel} (out of 3).
Rules:
- Hint Level 1: Conceptual gentle nudge about the core insight or data structure to use. Do NOT give code.
- Hint Level 2: More specific pseudocode logic or step-by-step invariant to maintain.
- Hint Level 3: Concrete structural hint or edge case alert to watch out for, without writing the full final answer.
Keep the explanation concise, warm, and highly pedagogical (under 120 words).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    res.json({
      hint: response.text || 'Think about the simplest base case first.',
      level: hintLevel,
    });
  } catch (error: any) {
    console.error('Error generating AI hint:', error);
    res.status(500).json({
      error: 'Failed to generate hint',
      hint: 'Analyze the problem inputs and consider using auxiliary storage (like a Set or Map) to trade space for linear time complexity.',
    });
  }
});

// 2. Code Review & Complexity Analysis Endpoint
app.post('/api/ai/review', async (req: Request, res: Response) => {
  try {
    const { problemTitle, code, language, passed, executionTime } = req.body;

    if (!hasApiKey) {
      return res.json({
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(1)',
        strengths: ['Clear variable names', 'Correct loop bounds'],
        improvements: ['Consider early returns for edge cases', 'Verify handling of empty inputs'],
        summary: `Your solution for ${problemTitle} looks solid. Keep practicing to maintain optimal asymptotic bounds!`,
      });
    }

    const prompt = `You are an algorithmic reviewer. Review this student code for problem: "${problemTitle}".
Student Code (${language}):
\`\`\`${language}
${code}
\`\`\`
Test Suite Status: ${passed ? 'All tests passed' : 'Some tests failed'}
Execution Time: ${executionTime ? executionTime + 'ms' : 'N/A'}

Provide constructive code review in strict JSON format.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            timeComplexity: { type: Type.STRING, description: 'Big O time complexity e.g. O(N log N)' },
            spaceComplexity: { type: Type.STRING, description: 'Big O auxiliary space complexity e.g. O(N)' },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '2-3 key positive points about clean code, idioms, or logic',
            },
            improvements: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '2-3 actionable advice for optimization or readability',
            },
            summary: { type: Type.STRING, description: 'Encouraging 1-2 sentence coaching summary' },
          },
          required: ['timeComplexity', 'spaceComplexity', 'strengths', 'improvements', 'summary'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error generating AI review:', error);
    res.json({
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(1)',
      strengths: ['Function structure is modular', 'Idiomatic syntax'],
      improvements: ['Double-check negative or boundary numbers', 'Ensure proper constant space allocation'],
      summary: 'Good effort on solving this problem! Make sure to test extreme boundary values.',
    });
  }
});

// 3. Explain Error / Bug Diagnosis
app.post('/api/ai/explain-error', async (req: Request, res: Response) => {
  try {
    const { problemTitle, code, language, failedTest, errorMessage } = req.body;

    if (!hasApiKey) {
      return res.json({
        diagnosis: `The function produced ${failedTest?.actual !== undefined ? JSON.stringify(failedTest.actual) : 'an unexpected result'} instead of ${failedTest?.expected !== undefined ? JSON.stringify(failedTest.expected) : 'the expected output'}. Check off-by-one errors or accumulator mutations.`,
        suggestedFix: 'Examine loop termination and initial variable state.',
      });
    }

    const prompt = `You are a patient CS educator. A student hit a bug or test failure on "${problemTitle}".
Student Code:
\`\`\`${language || 'javascript'}
${code}
\`\`\`
Error / Failed Test:
${errorMessage ? `Error: ${errorMessage}` : ''}
${failedTest ? `Input: ${JSON.stringify(failedTest.input)}\nExpected Output: ${JSON.stringify(failedTest.expected)}\nActual Output: ${JSON.stringify(failedTest.actual)}` : ''}

In strict JSON format, provide:
1. "diagnosis": A concise, crystal-clear explanation of why this bug happened (under 80 words).
2. "suggestedFix": A specific hint on which line or logic branch needs correction.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            diagnosis: { type: Type.STRING },
            suggestedFix: { type: Type.STRING },
          },
          required: ['diagnosis', 'suggestedFix'],
        },
      },
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (error: any) {
    console.error('Error explaining bug:', error);
    res.json({
      diagnosis: 'A mismatch occurred between expected output and returned value.',
      suggestedFix: 'Inspect variable reassignment and boundary conditions.',
    });
  }
});

// 4. Generate Custom Practice Problem On Demand
app.post('/api/ai/generate-problem', async (req: Request, res: Response) => {
  try {
    const { subject, topic, difficulty } = req.body;

    if (!hasApiKey) {
      // Dynamic fallback custom problem
      return res.json({
        id: `custom-${Date.now()}`,
        title: `Deep Dive into ${topic || 'Algorithms'}`,
        subject: subject || 'Data Structures & Algorithms',
        difficulty: difficulty || 'Medium',
        description: `Implement an efficient algorithm that processes a list of integers and returns the length of the longest contiguous subsegment having equal numbers of positive and negative values.`,
        examples: [
          {
            input: 'nums = [1, -1, 1, -1, 1, 1]',
            output: '4',
            explanation: 'The subarray [1, -1, 1, -1] has length 4 and equal positive and negative counts.',
          },
        ],
        constraints: ['1 <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4'],
        starterCode: `function findBalancedSubarray(nums) {\n  // Write your solution here\n  \n  return 0;\n}`,
        solutionSnippet: `function findBalancedSubarray(nums) {\n  let maxLen = 0, count = 0;\n  const map = new Map();\n  map.set(0, -1);\n  for (let i = 0; i < nums.length; i++) {\n    if (nums[i] > 0) count++;\n    else if (nums[i] < 0) count--;\n    if (map.has(count)) {\n      maxLen = Math.max(maxLen, i - map.get(count));\n    } else {\n      map.set(count, i);\n    }\n  }\n  return maxLen;\n}`,
        testCases: [
          { input: [[1, -1, 1, -1, 1, 1]], expected: 4 },
          { input: [[1, 2, 3]], expected: 0 },
          { input: [[-1, 1, -1, 1]], expected: 4 },
        ],
        hints: [
          'Replace positive numbers with +1 and negative numbers with -1.',
          'Use prefix sums and a hash map to track the first time a running sum is seen.',
        ],
      });
    }

    const prompt = `Generate a realistic, high quality coding practice problem for subject: "${subject}", specific topic: "${topic || 'General'}", difficulty: "${difficulty || 'Medium'}".
The problem MUST be solvable in JavaScript with automated test cases.
Make sure the testCases 'input' property is an array of arguments to be spread into the function.
Example: if function takes (arr, k), input is [[1, 2, 3], 2].
The starter code should define the function name clearly.
Return in JSON format strictly following the schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            subject: { type: Type.STRING },
            difficulty: { type: Type.STRING },
            description: { type: Type.STRING },
            examples: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  input: { type: Type.STRING },
                  output: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                },
                required: ['input', 'output'],
              },
            },
            constraints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            starterCode: { type: Type.STRING },
            solutionSnippet: { type: Type.STRING },
            hints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            testCases: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  input: { type: Type.ARRAY, items: { type: Type.STRING } },
                  expected: { type: Type.STRING },
                },
                required: ['input', 'expected'],
              },
            },
          },
          required: ['id', 'title', 'subject', 'difficulty', 'description', 'examples', 'starterCode', 'testCases'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    if (!parsed.id) parsed.id = `gen-${Date.now()}`;
    res.json(parsed);
  } catch (error: any) {
    console.error('Error generating problem:', error);
    res.status(500).json({ error: 'Failed to generate problem' });
  }
});

// 5. Ask AI Tutor / Q&A
app.post('/api/ai/ask-tutor', async (req: Request, res: Response) => {
  try {
    const { question, context } = req.body;

    if (!hasApiKey) {
      return res.json({
        answer: `Great question about "${question}". When studying this topic, keep in mind how data structures, memory layout, and computational complexity interact. For hands-on mastery, try writing a minimal isolated test case in the Playground tab!`,
      });
    }

    const prompt = `You are CodeZenith's intelligent AI Coding Tutor.
Context: ${context ? JSON.stringify(context) : 'General coding question'}
Student asks: "${question}"

Provide a clear, engaging, pedagogically sound answer.
Rules:
- Keep explanations clear and structured with code snippets if helpful.
- Avoid overwhelming jargon; explain the intuition first.
- Keep total length under 250 words.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    res.json({ answer: response.text || 'Here is what you need to know about this concept...' });
  } catch (error: any) {
    console.error('Error in AI tutor Q&A:', error);
    res.status(500).json({ error: 'Tutor service temporarily unavailable.' });
  }
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'CodeZenith Smart Learning Portal', aiEnabled: hasApiKey });
});

// Endpoint to export the portal's entire training corpus for AI agents
app.get('/api/dataset', async (_req: Request, res: Response) => {
  try {
    const fs = await import('fs/promises');
    const datasetPath = path.resolve(__dirname, 'public', 'dataset.json');
    const content = await fs.readFile(datasetPath, 'utf-8');
    res.setHeader('Content-Type', 'application/json');
    res.send(content);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load dataset' });
  }
});

// 6. External n8n AI Chatbot Proxy Endpoint
const N8N_WEBHOOK_URL =
  process.env.N8N_WEBHOOK_URL ||
  'https://amrutha07.app.n8n.cloud/webhook/5261f30b-5ee4-44ac-9bf3-fe49c7fd82c4/chat';

async function sendToN8n(url: string, payload: any) {
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/plain, */*',
    },
    body: JSON.stringify(payload),
  });

  const contentType = resp.headers.get('content-type') || '';
  let data: any;
  if (contentType.includes('application/json')) {
    data = await resp.json();
  } else {
    const text = await resp.text();
    try {
      data = JSON.parse(text);
    } catch {
      data = { output: text };
    }
  }

  return { ok: resp.ok, status: resp.status, data };
}

app.post('/api/n8n/chat', async (req: Request, res: Response) => {
  try {
    const { message, chatInput, sessionId, context } = req.body;
    const textToSend = chatInput || message || '';

    if (!textToSend.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    const currentSessionId = sessionId || `session-${Date.now()}`;

    // Attempt 1: Standard n8n Chat Trigger format
    let n8nResult = await sendToN8n(N8N_WEBHOOK_URL, {
      action: 'sendMessage',
      sessionId: currentSessionId,
      chatInput: textToSend,
    });

    // Attempt 2: If Attempt 1 failed, try simplified chatInput
    if (!n8nResult.ok || (n8nResult.data && n8nResult.data.message === 'Error in workflow')) {
      n8nResult = await sendToN8n(N8N_WEBHOOK_URL, {
        chatInput: textToSend,
        sessionId: currentSessionId,
      });
    }

    // Check if n8n returned a successful output
    if (n8nResult.ok && n8nResult.data && n8nResult.data.message !== 'Error in workflow') {
      let extractedText = '';
      const responseData = n8nResult.data;
      if (typeof responseData === 'string') {
        extractedText = responseData;
      } else if (Array.isArray(responseData)) {
        extractedText = responseData
          .map(item => item.output || item.text || item.message || JSON.stringify(item))
          .join('\n');
      } else if (typeof responseData === 'object' && responseData !== null) {
        extractedText =
          responseData.output ||
          responseData.text ||
          responseData.response ||
          responseData.message ||
          responseData.data ||
          JSON.stringify(responseData, null, 2);
      }

      return res.json({
        output: extractedText || 'Message processed by n8n workflow.',
        raw: responseData,
        sessionId: currentSessionId,
      });
    }

    // If n8n workflow errored (e.g. 500 "Error in workflow" in n8n Cloud), provide graceful fallback
    const n8nErrorMessage =
      n8nResult.data?.message || n8nResult.data?.error || `status ${n8nResult.status}`;

    console.warn(`n8n webhook encountered workflow error (${n8nErrorMessage}). Using fallback response.`);

    let fallbackText = '';
    if (hasApiKey) {
      try {
        const fallbackPrompt = `You are the AI Coding Assistant for CodeZenith Smart Learning Portal, answering on behalf of the user's coding chatbot.
Context: ${context ? JSON.stringify(context) : 'Software engineering & coding practice'}
Student asks: "${textToSend}"

Please provide an encouraging, technically sound, and well-formatted answer with code snippets where helpful. Under 200 words.`;

        const aiResponse = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: fallbackPrompt,
        });
        fallbackText = aiResponse.text || '';
      } catch (geminiErr) {
        console.error('Fallback Gemini generation failed:', geminiErr);
      }
    }

    if (!fallbackText) {
      fallbackText = `I received your question: "${textToSend}". To get personalized responses from your n8n workflow, make sure all nodes (such as OpenAI/Gemini/Agent credentials) are configured and active in your n8n canvas at amrutha07.app.n8n.cloud.`;
    }

    return res.json({
      output: fallbackText,
      n8nNotice: `Note: Your n8n workflow at amrutha07.app.n8n.cloud returned '${n8nErrorMessage}' during execution. Check your n8n Cloud Execution History to debug node credentials. Answering via CodeZenith AI in the meantime!`,
      sessionId: currentSessionId,
      fallbackUsed: true,
    });
  } catch (error: any) {
    console.error('Error handling n8n chat request:', error);
    return res.json({
      output: `I received your message. There was a connection issue contacting your n8n webhook (${error.message || 'Network error'}). Please verify the webhook URL and workflow status in n8n Cloud.`,
      error: error.message,
    });
  }
});



// Setup Vite middleware in dev or static files in prod
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CodeZenith Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
