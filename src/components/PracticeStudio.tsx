import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Play,
  CheckCircle2,
  XCircle,
  Sparkles,
  RotateCcw,
  Copy,
  Bookmark,
  Send,
  HelpCircle,
  Lightbulb,
  AlertTriangle,
  BrainCircuit,
  MessageSquare
} from 'lucide-react';
import { Problem, RunResult, AIReviewResult } from '../types';
import { runTestCases, runFreeformCode } from '../services/codeRunner';
import { fetchSmartHint, fetchCodeReview, fetchErrorDiagnosis, askAiTutor } from '../services/aiService';

interface PracticeStudioProps {
  problem: Problem;
  onBack: () => void;
  onRecordSolved: (problemId: string, xpReward: number, code: string) => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  isSolved: boolean;
  savedCode?: string;
}

export const PracticeStudio: React.FC<PracticeStudioProps> = ({
  problem,
  onBack,
  onRecordSolved,
  isBookmarked,
  onToggleBookmark,
  isSolved,
  savedCode,
}) => {
  // Code state
  const [code, setCode] = useState<string>(savedCode || problem.starterCode);
  const [leftTab, setLeftTab] = useState<'description' | 'theory' | 'hints'>('description');
  const [consoleTab, setConsoleTab] = useState<'tests' | 'custom' | 'logs' | 'ai'>('tests');

  // Test Runner state
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [selectedTestCaseIndex, setSelectedTestCaseIndex] = useState<number>(0);
  const [customInputText, setCustomInputText] = useState<string>('');
  const [customResult, setCustomResult] = useState<any>(null);

  // AI Assistant states
  const [aiHints, setAiHints] = useState<string[]>(problem.hints || []);
  const [revealedHintIndex, setRevealedHintIndex] = useState<number>(0);
  const [isLoadingHint, setIsLoadingHint] = useState<boolean>(false);

  const [aiReview, setAiReview] = useState<AIReviewResult | null>(null);
  const [isLoadingReview, setIsLoadingReview] = useState<boolean>(false);

  const [bugDiagnosis, setBugDiagnosis] = useState<{ diagnosis: string; suggestedFix: string } | null>(null);
  const [isLoadingDiagnosis, setIsLoadingDiagnosis] = useState<boolean>(false);

  const [tutorQuestion, setTutorQuestion] = useState<string>('');
  const [tutorMessages, setTutorMessages] = useState<Array<{ sender: 'user' | 'tutor'; text: string }>>([
    {
      sender: 'tutor',
      text: `Hello! I am your AI coding mentor for "${problem.title}". Ask me about algorithmic intuition, edge cases, or how to break down the problem!`,
    },
  ]);
  const [isTutorThinking, setIsTutorThinking] = useState<boolean>(false);

  const [copied, setCopied] = useState<boolean>(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<boolean>(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize custom input template based on first test case
  useEffect(() => {
    if (problem.testCases.length > 0) {
      setCustomInputText(JSON.stringify(problem.testCases[0].input));
    }
  }, [problem]);

  // Handle Tab key in code editor
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newCode = code.substring(0, start) + '  ' + code.substring(end);
      setCode(newCode);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  // Run Test Cases
  const handleRunTests = async () => {
    setIsRunning(true);
    setBugDiagnosis(null);
    try {
      const result = await runTestCases(code, problem.testCases);
      setRunResult(result);
      setConsoleTab('tests');

      // If test failed, offer quick diagnosis option
      if (!result.allPassed && result.results.length > 0) {
        const failedTest = result.results.find(r => !r.passed);
        if (failedTest) {
          setSelectedTestCaseIndex(failedTest.testIndex);
        }
      }
    } catch (err: any) {
      console.error('Run failed:', err);
    } finally {
      setIsRunning(false);
    }
  };

  // Submit Solution
  const handleSubmit = async () => {
    setIsRunning(true);
    try {
      const result = await runTestCases(code, problem.testCases);
      setRunResult(result);
      setConsoleTab('tests');

      if (result.allPassed) {
        onRecordSolved(problem.id, problem.xpReward, code);
        setSubmissionSuccess(true);
        setTimeout(() => setSubmissionSuccess(false), 5000);
      }
    } finally {
      setIsRunning(false);
    }
  };

  // Run Custom Input
  const handleRunCustom = async () => {
    setIsRunning(true);
    try {
      let parsedArgs: any[];
      try {
        parsedArgs = JSON.parse(customInputText);
        if (!Array.isArray(parsedArgs)) {
          parsedArgs = [parsedArgs];
        }
      } catch (e) {
        setCustomResult({ error: 'Invalid JSON array input. Example: [[1, 2, 3], 2]' });
        setIsRunning(false);
        return;
      }

      const tempTestCase = [{ input: parsedArgs, expected: null }];
      const res = await runTestCases(code, tempTestCase);
      if (res.results.length > 0) {
        setCustomResult({
          output: res.results[0].actual,
          logs: res.logs,
          timeMs: res.results[0].executionTimeMs,
          error: res.results[0].error,
        });
      }
    } catch (err: any) {
      setCustomResult({ error: err.message });
    } finally {
      setIsRunning(false);
    }
  };

  // AI Smart Hint request
  const handleRequestHint = async () => {
    if (isLoadingHint) return;
    setIsLoadingHint(true);
    try {
      const nextLevel = Math.min(revealedHintIndex + 1, 3);
      const res = await fetchSmartHint(
        problem.title,
        problem.description,
        code,
        problem.language,
        nextLevel
      );
      if (res.hint) {
        setAiHints(prev => [...prev, res.hint]);
        setRevealedHintIndex(prev => prev + 1);
        setLeftTab('hints');
      }
    } catch (err) {
      console.error('Could not fetch AI hint:', err);
    } finally {
      setIsLoadingHint(false);
    }
  };

  // AI Code Review request
  const handleRequestReview = async () => {
    if (isLoadingReview) return;
    setIsLoadingReview(true);
    setConsoleTab('ai');
    try {
      const res = await fetchCodeReview(
        problem.title,
        code,
        problem.language,
        runResult?.allPassed || false,
        runResult?.totalTimeMs
      );
      setAiReview(res);
    } catch (err) {
      console.error('Could not fetch AI review:', err);
    } finally {
      setIsLoadingReview(false);
    }
  };

  // AI Bug Diagnosis request
  const handleDiagnoseBug = async () => {
    if (!runResult || runResult.allPassed) return;
    setIsLoadingDiagnosis(true);
    setConsoleTab('ai');
    try {
      const failedTest = runResult.results.find(r => !r.passed);
      const res = await fetchErrorDiagnosis(
        problem.title,
        code,
        problem.language,
        failedTest,
        runResult.error
      );
      setBugDiagnosis(res);
    } catch (err) {
      console.error('Could not diagnose bug:', err);
    } finally {
      setIsLoadingDiagnosis(false);
    }
  };

  // AI Tutor Q&A Chat
  const handleSendTutorQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutorQuestion.trim() || isTutorThinking) return;

    const question = tutorQuestion.trim();
    setTutorMessages(prev => [...prev, { sender: 'user', text: question }]);
    setTutorQuestion('');
    setIsTutorThinking(true);

    try {
      const res = await askAiTutor(question, {
        problemTitle: problem.title,
        subject: problem.subjectTitle,
        category: problem.category,
        codeSnippet: code.slice(0, 300),
      });
      setTutorMessages(prev => [...prev, { sender: 'tutor', text: res.answer }]);
    } catch (err) {
      setTutorMessages(prev => [
        ...prev,
        { sender: 'tutor', text: 'Sorry, I hit a momentary snag. Please try asking again!' },
      ]);
    } finally {
      setIsTutorThinking(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetCode = () => {
    if (confirm('Reset code back to original starter template?')) {
      setCode(problem.starterCode);
    }
  };

  // Line numbers calculation
  const lineCount = code.split('\n').length;
  const lineNumbers = Array.from({ length: Math.max(lineCount, 12) }, (_, i) => i + 1);

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] min-h-[700px] overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-2xl">
      {/* Studio Top Control Strip */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 py-2.5">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Problem Deck</span>
          </button>

          <div className="h-4 w-px bg-slate-800" />

          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white truncate max-w-[280px] sm:max-w-md">
              {problem.title}
            </span>
            {isSolved && (
              <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Solved</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Action strip */}
        <div className="flex items-center gap-2">
          {submissionSuccess && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold rounded-md animate-pulse">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>+{problem.xpReward} XP Earned!</span>
            </div>
          )}

          <button
            onClick={onToggleBookmark}
            className={`p-1.5 rounded-md border text-xs transition-colors ${
              isBookmarked
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
            title="Bookmark this challenge"
          >
            <Bookmark className="h-4 w-4" />
          </button>

          <button
            onClick={handleRequestHint}
            disabled={isLoadingHint}
            className="hidden md:flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-md hover:bg-amber-500/20 transition-colors disabled:opacity-50"
          >
            <Lightbulb className="h-3.5 w-3.5" />
            <span>{isLoadingHint ? 'Thinking...' : 'Get Hint'}</span>
          </button>

          <button
            onClick={handleRunTests}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition-colors disabled:opacity-50"
          >
            <Play className="h-3.5 w-3.5 fill-white text-white" />
            <span>{isRunning ? 'Running...' : 'Run Code'}</span>
          </button>

          <button
            onClick={handleSubmit}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md shadow-sm shadow-indigo-600/30 transition-colors disabled:opacity-50"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Submit Solution</span>
          </button>
        </div>
      </div>

      {/* Main Studio Two-Pane Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
        {/* LEFT ZONE: Problem Statement, Theory & Progressive Hints */}
        <div className="lg:col-span-5 border-r border-slate-800 flex flex-col bg-slate-900/40 overflow-hidden">
          {/* Left Tabs */}
          <div className="flex items-center border-b border-slate-800 bg-slate-950/60 px-4">
            <button
              onClick={() => setLeftTab('description')}
              className={`px-3 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                leftTab === 'description'
                  ? 'border-indigo-500 text-white font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setLeftTab('theory')}
              className={`px-3 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                leftTab === 'theory'
                  ? 'border-indigo-500 text-white font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Theory & Invariants
            </button>
            <button
              onClick={() => setLeftTab('hints')}
              className={`px-3 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                leftTab === 'hints'
                  ? 'border-indigo-500 text-white font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Hints ({aiHints.length})
            </button>
          </div>

          {/* Left Content Scrollable Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-slate-300">
            {leftTab === 'description' && (
              <>
                {/* Unboxed Metadata without pills */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  <span className="text-indigo-400 font-semibold">{problem.subjectTitle}</span>
                  <span aria-hidden="true">·</span>
                  <span>{problem.category}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-semibold text-amber-400">{problem.difficulty}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono text-slate-300 tabular-nums">+{problem.xpReward} XP</span>
                </div>

                {/* Problem Statement */}
                <div className="space-y-4">
                  <h2 className="text-lg font-bold text-white">{problem.title}</h2>
                  <div className="whitespace-pre-line leading-relaxed text-slate-300 text-sm">
                    {problem.description}
                  </div>
                </div>

                {/* Examples */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Examples</h3>
                  {problem.examples.map((ex, idx) => (
                    <div key={idx} className="rounded-lg border border-slate-800 bg-slate-950 p-4 space-y-2">
                      <div className="text-xs font-mono">
                        <span className="text-slate-500">Input: </span>
                        <span className="text-slate-200">{ex.input}</span>
                      </div>
                      <div className="text-xs font-mono">
                        <span className="text-slate-500">Output: </span>
                        <span className="text-emerald-400 font-semibold">{ex.output}</span>
                      </div>
                      {ex.explanation && (
                        <div className="text-xs text-slate-400 pt-1 border-t border-slate-900">
                          <span className="text-slate-500">Explanation: </span>
                          {ex.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Constraints */}
                {problem.constraints && problem.constraints.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Constraints</h3>
                    <ul className="space-y-1 list-disc list-inside text-xs font-mono text-slate-400">
                      {problem.constraints.map((c, idx) => (
                        <li key={idx}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}

            {leftTab === 'theory' && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
                  <BrainCircuit className="h-4 w-4" />
                  <span>Algorithmic Concept & Architecture</span>
                </div>
                <h3 className="text-base font-bold text-white">How to Reason About This Pattern</h3>
                <p className="text-xs leading-relaxed text-slate-300">
                  When approaching problems in <strong className="text-white">{problem.category}</strong>, identify whether the solution trades space complexity for time efficiency.
                </p>

                <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 space-y-2 text-xs">
                  <div className="font-semibold text-white">Invariant Checklist:</div>
                  <ul className="space-y-1 text-slate-400 list-disc list-inside">
                    <li>What is the base case when the input is empty or of length 1?</li>
                    <li>Are you mutating input parameters in-place or creating pure transformations?</li>
                    <li>Can asynchronous promises reject at arbitrary intervals?</li>
                    <li>Is time complexity bounded within $O(N)$ or $O(N \log N)$?</li>
                  </ul>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 space-y-2 text-xs">
                  <div className="font-semibold text-indigo-300">Target Time & Space Complexity:</div>
                  <div className="flex items-center gap-4 text-slate-300 font-mono">
                    <span>Time: <strong className="text-white">O(N)</strong></span>
                    <span aria-hidden="true">·</span>
                    <span>Space: <strong className="text-white">O(1) to O(N)</strong></span>
                  </div>
                </div>
              </div>
            )}

            {leftTab === 'hints' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Progressive Clues</h3>
                  <button
                    onClick={handleRequestHint}
                    disabled={isLoadingHint}
                    className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 disabled:opacity-50"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{isLoadingHint ? 'Generating...' : 'Ask AI for New Hint'}</span>
                  </button>
                </div>

                {aiHints.map((hint, idx) => (
                  <div key={idx} className="rounded-lg border border-slate-800 bg-slate-950 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                      <Lightbulb className="h-3.5 w-3.5" />
                      <span>Hint {idx + 1}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{hint}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT ZONE: Code Editor & Test Runner Console */}
        <div className="lg:col-span-7 flex flex-col bg-slate-950 overflow-hidden">
          {/* Editor Header Bar */}
          <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/60 px-4 py-2">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-mono text-indigo-400 font-semibold">JavaScript</span>
              <span aria-hidden="true">·</span>
              <span>ES2024 Runtime</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
                title="Copy code"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>

              <button
                onClick={handleResetCode}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
                title="Reset starter template"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Code Editor Surface with Line Numbers */}
          <div className="relative flex-1 flex overflow-hidden font-mono text-sm bg-slate-950">
            {/* Line numbers gutter */}
            <div className="w-12 py-4 select-none text-right pr-3 text-slate-600 bg-slate-950/80 border-r border-slate-900 font-mono text-xs tabular-nums leading-6">
              {lineNumbers.map(n => (
                <div key={n}>{n}</div>
              ))}
            </div>

            {/* Actual Textarea Editor */}
            <div className="relative flex-1 h-full overflow-hidden">
              <textarea
                ref={textareaRef}
                value={code}
                onChange={e => setCode(e.target.value)}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                className="w-full h-full p-4 bg-transparent text-slate-100 font-mono text-xs sm:text-sm leading-6 resize-none focus:outline-none selection:bg-indigo-600 selection:text-white overflow-y-auto"
                placeholder="// Write your code here..."
              />
            </div>
          </div>

          {/* Bottom Console / Test Runner Drawer */}
          <div className="h-64 sm:h-72 border-t border-slate-800 bg-slate-900/90 flex flex-col overflow-hidden">
            {/* Console Tabs */}
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-4">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setConsoleTab('tests')}
                  className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                    consoleTab === 'tests'
                      ? 'border-indigo-500 text-white font-semibold'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Test Results {runResult && `(${runResult.allPassed ? 'Passed' : 'Failed'})`}
                </button>

                <button
                  onClick={() => setConsoleTab('custom')}
                  className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                    consoleTab === 'custom'
                      ? 'border-indigo-500 text-white font-semibold'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Custom Test
                </button>

                <button
                  onClick={() => setConsoleTab('logs')}
                  className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                    consoleTab === 'logs'
                      ? 'border-indigo-500 text-white font-semibold'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Console Logs {runResult?.logs.length ? `(${runResult.logs.length})` : ''}
                </button>

                <button
                  onClick={() => setConsoleTab('ai')}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                    consoleTab === 'ai'
                      ? 'border-indigo-500 text-white font-semibold'
                      : 'border-transparent text-indigo-400 hover:text-indigo-300'
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>AI Mentor</span>
                </button>
              </div>

              {/* Quick AI Review trigger on console bar */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRequestReview}
                  disabled={isLoadingReview}
                  className="flex items-center gap-1 text-[11px] font-medium text-indigo-300 hover:text-white transition-colors"
                >
                  <BrainCircuit className="h-3.5 w-3.5" />
                  <span>{isLoadingReview ? 'Analyzing...' : 'Analyze Big-O'}</span>
                </button>
              </div>
            </div>

            {/* Console Drawer Content */}
            <div className="flex-1 overflow-y-auto p-4 text-xs font-mono">
              {/* Tab 1: Automated Test Results */}
              {consoleTab === 'tests' && (
                <div className="space-y-4">
                  {!runResult ? (
                    <div className="text-slate-500 py-6 text-center">
                      Click <strong className="text-slate-300">&quot;Run Code&quot;</strong> or <strong className="text-slate-300">&quot;Submit Solution&quot;</strong> to evaluate against test suites.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Overall Status Banner */}
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                          {runResult.allPassed ? (
                            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                              <CheckCircle2 className="h-4 w-4" />
                              <span>All {runResult.results.length} Test Cases Passed</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-rose-400 font-semibold">
                              <XCircle className="h-4 w-4" />
                              <span>
                                {runResult.results.filter(r => r.passed).length} / {runResult.results.length} Passed
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-slate-400 tabular-nums">
                          <span>Total: {runResult.totalTimeMs}ms</span>
                          {!runResult.allPassed && (
                            <button
                              onClick={handleDiagnoseBug}
                              disabled={isLoadingDiagnosis}
                              className="flex items-center gap-1 text-xs text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
                            >
                              <AlertTriangle className="h-3 w-3" />
                              <span>{isLoadingDiagnosis ? 'Diagnosing...' : 'Explain Failure'}</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Test Case Selectors */}
                      <div className="flex items-center gap-2">
                        {runResult.results.map((res, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedTestCaseIndex(idx)}
                            className={`px-3 py-1 rounded text-xs transition-colors flex items-center gap-1.5 ${
                              selectedTestCaseIndex === idx
                                ? 'bg-slate-800 text-white font-semibold border border-slate-700'
                                : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <span className={res.passed ? 'text-emerald-400' : 'text-rose-400'}>●</span>
                            <span>Case {idx + 1}</span>
                          </button>
                        ))}
                      </div>

                      {/* Selected Test Case Detail */}
                      {runResult.results[selectedTestCaseIndex] && (
                        <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 space-y-2">
                          <div>
                            <span className="text-slate-500">Input: </span>
                            <span className="text-slate-200">
                              {JSON.stringify(runResult.results[selectedTestCaseIndex].input)}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500">Expected: </span>
                            <span className="text-emerald-400 font-semibold">
                              {JSON.stringify(runResult.results[selectedTestCaseIndex].expected)}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500">Actual Output: </span>
                            <span
                              className={
                                runResult.results[selectedTestCaseIndex].passed
                                  ? 'text-emerald-400'
                                  : 'text-rose-400 font-semibold'
                              }
                            >
                              {JSON.stringify(runResult.results[selectedTestCaseIndex].actual)}
                            </span>
                          </div>
                          {runResult.results[selectedTestCaseIndex].error && (
                            <div className="text-rose-400 text-xs pt-1 border-t border-slate-900">
                              Error: {runResult.results[selectedTestCaseIndex].error}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Custom Test Input */}
              {consoleTab === 'custom' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Custom Arguments (JSON Array):</span>
                    <button
                      onClick={handleRunCustom}
                      disabled={isRunning}
                      className="px-3 py-1 bg-indigo-600 text-white rounded text-xs font-semibold hover:bg-indigo-500 transition-colors"
                    >
                      {isRunning ? 'Running...' : 'Run with Custom Input'}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={customInputText}
                    onChange={e => setCustomInputText(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. [[1, 2, 3], 2]"
                  />
                  {customResult && (
                    <div className="rounded border border-slate-800 bg-slate-950 p-3 space-y-1">
                      <div className="text-slate-500">Result:</div>
                      <div className="text-emerald-400 font-semibold">
                        {JSON.stringify(customResult.output, null, 2)}
                      </div>
                      {customResult.timeMs && (
                        <div className="text-slate-500 text-[11px] tabular-nums">Time: {customResult.timeMs}ms</div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Console Logs */}
              {consoleTab === 'logs' && (
                <div className="space-y-1">
                  {!runResult?.logs.length ? (
                    <div className="text-slate-500 py-6 text-center">
                      No console output captured. Use <code>console.log(...)</code> in your function to debug!
                    </div>
                  ) : (
                    runResult.logs.map((log, idx) => (
                      <div key={idx} className="text-slate-300 py-0.5">
                        <span className="text-slate-600 select-none mr-2">&gt;</span>
                        <span>{log}</span>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab 4: AI Mentor & Code Review */}
              {consoleTab === 'ai' && (
                <div className="space-y-4">
                  {/* Bug Diagnosis if requested */}
                  {bugDiagnosis && (
                    <div className="rounded-lg border border-rose-900/60 bg-rose-950/20 p-4 space-y-2">
                      <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Bug Diagnosis & Root Cause</span>
                      </div>
                      <p className="text-xs text-slate-200">{bugDiagnosis.diagnosis}</p>
                      <div className="text-xs text-amber-300 pt-1">
                        <strong>Suggested Fix: </strong> {bugDiagnosis.suggestedFix}
                      </div>
                    </div>
                  )}

                  {/* AI Review Card */}
                  {aiReview && (
                    <div className="rounded-lg border border-indigo-900/50 bg-indigo-950/20 p-4 space-y-3">
                      <div className="flex items-center justify-between border-b border-indigo-900/40 pb-2">
                        <div className="flex items-center gap-2 text-indigo-300 font-semibold">
                          <BrainCircuit className="h-4 w-4" />
                          <span>Complexity & Code Review</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-300 font-mono">
                          <span>Time: <strong className="text-white">{aiReview.timeComplexity}</strong></span>
                          <span>Space: <strong className="text-white">{aiReview.spaceComplexity}</strong></span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300">{aiReview.summary}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        <div>
                          <span className="text-emerald-400 font-semibold text-[11px]">Strengths:</span>
                          <ul className="list-disc list-inside text-slate-400 text-[11px] mt-1 space-y-0.5">
                            {aiReview.strengths.map((s, idx) => (
                              <li key={idx}>{s}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <span className="text-amber-400 font-semibold text-[11px]">Key Improvements:</span>
                          <ul className="list-disc list-inside text-slate-400 text-[11px] mt-1 space-y-0.5">
                            {aiReview.improvements.map((im, idx) => (
                              <li key={idx}>{im}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Interactive AI Chat */}
                  <div className="space-y-3">
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {tutorMessages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`p-2.5 rounded-lg text-xs leading-relaxed ${
                            msg.sender === 'user'
                              ? 'bg-indigo-600/30 text-indigo-100 ml-8 border border-indigo-500/30'
                              : 'bg-slate-950 text-slate-300 mr-8 border border-slate-800'
                          }`}
                        >
                          <div className="font-semibold text-[10px] text-slate-500 mb-0.5">
                            {msg.sender === 'user' ? 'You' : 'AI Coding Mentor'}
                          </div>
                          <div>{msg.text}</div>
                        </div>
                      ))}
                      {isTutorThinking && (
                        <div className="text-slate-500 text-xs italic py-1">AI Mentor is analyzing...</div>
                      )}
                    </div>

                    <form onSubmit={handleSendTutorQuestion} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={tutorQuestion}
                        onChange={e => setTutorQuestion(e.target.value)}
                        placeholder="Ask AI Mentor anything about this problem or concept..."
                        className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        type="submit"
                        disabled={isTutorThinking || !tutorQuestion.trim()}
                        className="p-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-500 disabled:opacity-50 transition-colors"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
