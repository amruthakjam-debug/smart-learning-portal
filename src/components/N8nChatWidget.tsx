import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  RotateCcw,
  Bot,
  User,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import {
  N8nChatMessage,
  getN8nSessionId,
  resetN8nSession,
  loadN8nHistory,
  saveN8nHistory,
  sendN8nChatMessage,
} from '../services/n8nService';

interface N8nChatWidgetProps {
  currentContext?: {
    activeTab?: string;
    problemTitle?: string;
    subject?: string;
  };
  isOpen?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
}

export const N8nChatWidget: React.FC<N8nChatWidgetProps> = ({
  currentContext,
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  onOpen: externalOnOpen,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState<boolean>(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  const handleOpen = () => {
    if (externalOnOpen) externalOnOpen();
    setInternalIsOpen(true);
  };

  const handleClose = () => {
    if (externalOnClose) externalOnClose();
    setInternalIsOpen(false);
  };

  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [messages, setMessages] = useState<N8nChatMessage[]>(loadN8nHistory);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string>(getN8nSessionId);
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [isOpen, messages]);

  // Persist messages
  useEffect(() => {
    saveN8nHistory(messages);
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMsg: N8nChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendN8nChatMessage(query, sessionId, {
        currentProblem: currentContext?.problemTitle || 'Portal Dashboard',
        currentSubject: currentContext?.subject || 'Software Engineering',
        activeView: currentContext?.activeTab || 'curriculum',
      });

      const n8nMsg: N8nChatMessage = {
        id: `n8n-${Date.now()}`,
        sender: 'n8n',
        text: response.output || 'Done!',
        timestamp: Date.now(),
        raw: response.raw,
        notice: response.n8nNotice,
        fallbackUsed: response.fallbackUsed,
      };

      setMessages(prev => [...prev, n8nMsg]);
    } catch (err: any) {
      const errorMsg: N8nChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'system',
        text:
          err.message ||
          'Failed to reach the n8n webhook. Please confirm the workflow is active in n8n Cloud.',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleReset = () => {
    if (confirm('Clear chat history and start a fresh session with your n8n bot?')) {
      const newSid = resetN8nSession();
      setSessionId(newSid);
      setMessages([
        {
          id: `welcome-${Date.now()}`,
          sender: 'n8n',
          text: "Fresh session started! How can I assist with your coding goals today?",
          timestamp: Date.now(),
        },
      ]);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeIdx(id);
    setTimeout(() => setCopiedCodeIdx(null), 2000);
  };

  // Render markdown-like text with code blocks
  const renderMessageContent = (text: string, msgId: string) => {
    const codeBlockRegex = /```([a-zA-Z0-9]*)\n([\s\S]*?)```/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`} className="whitespace-pre-wrap leading-relaxed">
            {text.slice(lastIndex, match.index)}
          </span>
        );
      }

      const lang = match[1] || 'code';
      const codeSnippet = match[2];
      const snippetId = `${msgId}-${match.index}`;

      parts.push(
        <div key={`code-${match.index}`} className="my-2.5 rounded-lg border border-slate-800 bg-slate-950 overflow-hidden text-xs font-mono">
          <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/80 border-b border-slate-800 text-[11px] text-slate-400">
            <span className="font-semibold text-indigo-300">{lang}</span>
            <button
              onClick={() => copyToClipboard(codeSnippet, snippetId)}
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              {copiedCodeIdx === snippetId ? (
                <>
                  <Check className="h-3 w-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-3 text-slate-200 overflow-x-auto leading-5">{codeSnippet}</pre>
        </div>
      );

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(
        <span key={`text-end`} className="whitespace-pre-wrap leading-relaxed">
          {text.slice(lastIndex)}
        </span>
      );
    }

    return parts;
  };

  const PROMPT_SUGGESTIONS = [
    'How does Promise.all work internally?',
    'Explain the two-pointer invariant',
    'Tips to optimize LRU Cache in O(1)',
    'Generate a coding interview question',
  ];

  return (
    <>
      {/* Floating Trigger Button in bottom right */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
          <button
            onClick={handleOpen}
            className="group relative flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-full shadow-2xl shadow-indigo-600/40 hover:shadow-indigo-500/50 transition-all transform hover:-translate-y-0.5 focus:outline-none"
          >
            <div className="relative flex items-center justify-center">
              <Bot className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
              </span>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold leading-tight tracking-tight font-sans">
                n8n AI Mentor
              </span>
              <span className="text-[10px] text-indigo-200 leading-tight">
                Online &bull; Ask anything
              </span>
            </div>
          </button>
        </div>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <div
          className={`fixed z-50 flex flex-col rounded-2xl border border-slate-800 bg-slate-950/95 backdrop-blur-xl shadow-2xl transition-all duration-300 ${
            isExpanded
              ? 'inset-4 sm:inset-8 lg:inset-12'
              : 'bottom-5 right-5 w-[92vw] sm:w-[440px] h-[600px] max-h-[85vh]'
          }`}
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/90 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-pink-500 text-white shadow-md">
                <Bot className="h-4 w-4" />
                <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-white tracking-wide">
                    n8n Chatbot
                  </h3>
                  <span className="px-1.5 py-0.5 text-[9px] font-mono font-medium rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Live
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  <span className="truncate max-w-[160px] text-slate-400">
                    amrutha07.app.n8n.cloud
                  </span>
                </div>
              </div>
            </div>

            {/* Window controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleReset}
                title="Reset session and clear conversation"
                className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Minimize window' : 'Expand window'}
                className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
              >
                {isExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              </button>

              <button
                onClick={handleClose}
                title="Close chat"
                className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Current context indicator if available */}
          {currentContext?.problemTitle && (
            <div className="flex items-center justify-between px-4 py-1.5 bg-indigo-950/40 border-b border-indigo-900/30 text-[11px] text-indigo-300">
              <span className="truncate">
                Active context: <strong className="text-white">{currentContext.problemTitle}</strong>
              </span>
              <span className="text-[10px] text-indigo-400 shrink-0 font-mono">Synced</span>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sans">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender !== 'user' && (
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-800 text-indigo-400 mt-0.5">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-xs'
                      : msg.sender === 'system'
                      ? 'bg-rose-950/40 border border-rose-800/60 text-rose-300 rounded-bl-xs'
                      : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-1 text-[10px] opacity-70">
                    <span className="font-semibold">
                      {msg.sender === 'user' ? 'You' : msg.sender === 'system' ? 'System Notice' : 'n8n Assistant'}
                    </span>
                    <span className="tabular-nums">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="leading-relaxed">
                    {renderMessageContent(msg.text, msg.id)}
                  </div>

                  {msg.notice && (
                    <div className="mt-2.5 pt-2 border-t border-slate-800 text-[11px] text-amber-300/90 bg-amber-950/30 p-2 rounded border border-amber-500/20 leading-relaxed">
                      {msg.notice}
                    </div>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-indigo-700 text-white mt-0.5">
                    <User className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-800 text-indigo-400">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl rounded-bl-xs px-4 py-3 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce" />
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions pills */}
          <div className="px-3 py-2 border-t border-slate-800/60 bg-slate-900/40 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[11px]">
            <span className="text-slate-500 shrink-0 font-medium mr-1">Ask:</span>
            {PROMPT_SUGGESTIONS.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(s)}
                disabled={isLoading}
                className="shrink-0 px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-750 transition-colors whitespace-nowrap"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 border-t border-slate-800 bg-slate-900/90 rounded-b-2xl">
            <div className="relative flex items-center">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask n8n bot (e.g. explain a function, debug code, ask algorithm)..."
                rows={1}
                className="w-full pl-3 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={isLoading || !input.trim()}
                className="absolute right-2 p-1.5 text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors disabled:opacity-40 disabled:hover:bg-indigo-600"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-slate-500">
              <span className="flex items-center gap-1">
                <span>Webhook:</span>
                <span className="font-mono text-indigo-400">5261f30b...82c4/chat</span>
              </span>
              <span>Press Enter to send</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
