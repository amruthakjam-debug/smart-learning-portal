import React, { useState } from 'react';
import { Play, Sparkles, RotateCcw, Copy, Code2, Terminal, BookOpen } from 'lucide-react';
import { runFreeformCode } from '../services/codeRunner';
import { askAiTutor } from '../services/aiService';

const TEMPLATES: Record<string, { title: string; code: string }> = {
  bst: {
    title: 'Binary Search Tree (Insert & Search)',
    code: `// Binary Search Tree implementation
class TreeNode {
  constructor(val) {
    this.val = val;
    this.left = null;
    this.right = null;
  }
}

class BinarySearchTree {
  constructor() {
    this.root = null;
  }

  insert(val) {
    const newNode = new TreeNode(val);
    if (!this.root) {
      this.root = newNode;
      return;
    }
    let current = this.root;
    while (true) {
      if (val < current.val) {
        if (!current.left) {
          current.left = newNode;
          break;
        }
        current = current.left;
      } else {
        if (!current.right) {
          current.right = newNode;
          break;
        }
        current = current.right;
      }
    }
  }

  inOrderTraversal(node = this.root, result = []) {
    if (!node) return result;
    this.inOrderTraversal(node.left, result);
    result.push(node.val);
    this.inOrderTraversal(node.right, result);
    return result;
  }
}

const bst = new BinarySearchTree();
[50, 30, 70, 20, 40, 60, 80].forEach(n => bst.insert(n));
console.log('In-Order Sorted Traversal:', bst.inOrderTraversal());
return bst.inOrderTraversal();
`,
  },
  debounce: {
    title: 'Debounce Utility Function',
    code: `// Debounce implementation
function debounce(fn, delay) {
  let timerId = null;
  return function(...args) {
    if (timerId) clearTimeout(timerId);
    timerId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

let callCount = 0;
const logAction = debounce((name) => {
  callCount++;
  console.log(\`Action triggered for \${name}! Total executions: \${callCount}\`);
}, 300);

// Simulate multiple rapid clicks
logAction('User A');
logAction('User A');
logAction('User A');

console.log('Debounced calls dispatched. Only the final call will execute.');
return 'Debounce test armed';
`,
  },
  eventEmitter: {
    title: 'Lightweight Event Emitter',
    code: `// Publish/Subscribe Event Emitter pattern
class EventEmitter {
  constructor() {
    this.events = new Map();
  }

  on(eventName, listener) {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, []);
    }
    this.events.get(eventName).push(listener);
    return () => this.off(eventName, listener);
  }

  emit(eventName, ...args) {
    const listeners = this.events.get(eventName);
    if (listeners) {
      listeners.forEach(fn => fn(...args));
    }
  }

  off(eventName, listener) {
    const listeners = this.events.get(eventName);
    if (!listeners) return;
    this.events.set(eventName, listeners.filter(fn => fn !== listener));
  }
}

const emitter = new EventEmitter();
const unsub = emitter.on('lesson_completed', (id, xp) => {
  console.log(\`Lesson \${id} completed! Earned \${xp} XP.\`);
});

emitter.emit('lesson_completed', 'fe-101', 50);
emitter.emit('lesson_completed', 'dsa-202', 100);
unsub();
emitter.emit('lesson_completed', 'sys-303', 75); // will not trigger

return 'EventEmitter demonstration complete';
`,
  },
};

export const PlaygroundView: React.FC = () => {
  const [code, setCode] = useState<string>(TEMPLATES.bst.code);
  const [logs, setLogs] = useState<string[]>([]);
  const [returnValue, setReturnValue] = useState<any>(null);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const handleRun = async () => {
    setIsRunning(true);
    setError(null);
    try {
      const res = await runFreeformCode(code);
      setLogs(res.logs);
      setReturnValue(res.result);
      setExecutionTime(res.timeMs);
      if (res.error) {
        setError(res.error);
      }
    } finally {
      setIsRunning(false);
    }
  };

  const handleExplainCode = async () => {
    if (isExplaining) return;
    setIsExplaining(true);
    try {
      const res = await askAiTutor('Please explain how this code operates and what asymptotic bounds it achieves.', {
        playgroundCode: code.slice(0, 800),
      });
      setAiExplanation(res.answer);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExplaining(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Interactive Code Playground</h1>
          <p className="text-sm text-slate-400 mt-1">
            Freeform execution sandbox to test data structures, experiment with snippets, and observe live output.
          </p>
        </div>

        {/* Preset Templates */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400 font-medium mr-1">Load Preset:</span>
          {Object.entries(TEMPLATES).map(([key, t]) => (
            <button
              key={key}
              onClick={() => {
                setCode(t.code);
                setLogs([]);
                setReturnValue(null);
                setError(null);
              }}
              className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-800 text-slate-300 hover:bg-slate-750 hover:text-white border border-slate-750 transition-colors"
            >
              {t.title.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Playground Surface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Code Editor */}
        <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-slate-950 flex flex-col overflow-hidden shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/70 px-4 py-2.5">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Code2 className="h-4 w-4 text-indigo-400" />
              <span className="font-mono text-slate-200">scratchpad.js</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={handleExplainCode}
                disabled={isExplaining}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded hover:bg-indigo-500/20 transition-colors disabled:opacity-50"
              >
                <Sparkles className="h-3 w-3" />
                <span>{isExplaining ? 'Analyzing...' : 'Explain with AI'}</span>
              </button>

              <button
                onClick={handleRun}
                disabled={isRunning}
                className="flex items-center gap-1.5 px-3.5 py-1 text-xs font-semibold text-white bg-indigo-600 rounded hover:bg-indigo-500 transition-colors"
              >
                <Play className="h-3.5 w-3.5 fill-white" />
                <span>{isRunning ? 'Running...' : 'Run Code'}</span>
              </button>
            </div>
          </div>

          <textarea
            value={code}
            onChange={e => setCode(e.target.value)}
            spellCheck={false}
            className="w-full h-[460px] p-4 bg-transparent text-slate-100 font-mono text-xs sm:text-sm leading-6 resize-none focus:outline-none selection:bg-indigo-600 selection:text-white"
            placeholder="// Type any JavaScript code to execute..."
          />
        </div>

        {/* Output & AI Explanation Panel */}
        <div className="lg:col-span-5 space-y-6">
          {/* Console Output Box */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 flex flex-col h-[280px] overflow-hidden shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/70 px-4 py-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <Terminal className="h-4 w-4 text-emerald-400" />
                <span>Console & Return Value</span>
              </div>
              {executionTime !== null && (
                <span className="text-[11px] text-slate-500 font-mono tabular-nums">
                  {executionTime}ms
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-2">
              {error && (
                <div className="p-2.5 bg-rose-950/40 border border-rose-800/60 rounded text-rose-300">
                  {error}
                </div>
              )}

              {logs.length > 0 && (
                <div className="space-y-1">
                  <div className="text-[11px] text-slate-500 font-semibold">Console Logs:</div>
                  {logs.map((l, idx) => (
                    <div key={idx} className="text-slate-300 pl-2 border-l border-slate-800">
                      {l}
                    </div>
                  ))}
                </div>
              )}

              {returnValue !== undefined && (
                <div className="pt-2 border-t border-slate-900">
                  <span className="text-slate-500">Return: </span>
                  <span className="text-emerald-400 font-semibold">
                    {typeof returnValue === 'object' ? JSON.stringify(returnValue, null, 2) : String(returnValue)}
                  </span>
                </div>
              )}

              {!error && logs.length === 0 && returnValue === undefined && (
                <div className="text-slate-600 text-center py-12">
                  Click &quot;Run Code&quot; to inspect output here.
                </div>
              )}
            </div>
          </div>

          {/* AI Explanation Card */}
          {aiExplanation && (
            <div className="rounded-xl border border-indigo-900/60 bg-indigo-950/20 p-5 space-y-3">
              <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold">
                <Sparkles className="h-4 w-4" />
                <span>AI Code Analysis</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                {aiExplanation}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
