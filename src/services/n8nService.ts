export interface N8nChatMessage {
  id: string;
  sender: 'user' | 'n8n' | 'system';
  text: string;
  timestamp: number;
  raw?: any;
  notice?: string;
  fallbackUsed?: boolean;
}

const SESSION_KEY = 'codezenith_n8n_session_id';
const HISTORY_KEY = 'codezenith_n8n_history_v1';

export function getN8nSessionId(): string {
  try {
    let sid = localStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = `n8n-user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  } catch {
    return `n8n-user-${Date.now()}`;
  }
}

export function resetN8nSession(): string {
  const newSid = `n8n-user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  try {
    localStorage.setItem(SESSION_KEY, newSid);
    localStorage.removeItem(HISTORY_KEY);
  } catch (e) {
    console.warn('Failed to clear n8n localStorage:', e);
  }
  return newSid;
}

export function loadN8nHistory(): N8nChatMessage[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to load n8n chat history:', e);
  }
  return [
    {
      id: 'welcome',
      sender: 'n8n',
      text: "👋 Hi! I'm your n8n-powered coding AI assistant. You can ask me for code explanations, debugging help, algorithmic advice, or anything about your learning path!",
      timestamp: Date.now(),
    },
  ];
}

export function saveN8nHistory(messages: N8nChatMessage[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(messages.slice(-50)));
  } catch (e) {
    console.warn('Failed to save n8n chat history:', e);
  }
}

export async function sendN8nChatMessage(
  message: string,
  sessionId: string,
  context?: Record<string, any>
): Promise<{ output: string; raw?: any; sessionId?: string; n8nNotice?: string; fallbackUsed?: boolean }> {
  const res = await fetch('/api/n8n/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      chatInput: message,
      sessionId,
      context,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.output || data.error || `HTTP error ${res.status}`);
  }

  return data;
}
