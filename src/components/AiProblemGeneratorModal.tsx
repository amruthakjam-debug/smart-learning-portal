import React, { useState } from 'react';
import { X, Sparkles, Loader2, BookOpen, AlertCircle } from 'lucide-react';
import { Problem, SubjectId, Difficulty } from '../types';
import { generateAiProblem } from '../services/aiService';

interface AiProblemGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProblemGenerated: (problem: Problem) => void;
}

export const AiProblemGeneratorModal: React.FC<AiProblemGeneratorModalProps> = ({
  isOpen,
  onClose,
  onProblemGenerated,
}) => {
  const [subject, setSubject] = useState<SubjectId>('dsa');
  const [topic, setTopic] = useState<string>('Sliding Window & Subarrays');
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);

    const subjectMap: Record<SubjectId, string> = {
      frontend: 'Frontend & Modern Web',
      dsa: 'Data Structures & Algorithms',
      python: 'Python & Algorithmic Scripting',
      systems: 'System Design & Backend Architecture',
      sql: 'SQL & Relational Databases',
    };

    try {
      const generated = await generateAiProblem(
        subjectMap[subject],
        topic,
        difficulty
      );

      // Ensure proper formatting
      const finalProblem: Problem = {
        ...generated,
        id: generated.id || `custom-${Date.now()}`,
        subjectId: subject,
        subjectTitle: subjectMap[subject],
        difficulty,
        category: topic || 'Custom AI Challenge',
        language: 'javascript',
        xpReward: difficulty === 'Easy' ? 50 : difficulty === 'Medium' ? 75 : 100,
        hints: generated.hints && generated.hints.length > 0
          ? generated.hints
          : ['Break the problem into subproblems.', 'Check bounds and edge cases.'],
      };

      onProblemGenerated(finalProblem);
      onClose();
    } catch (err: any) {
      console.error('Problem generation error:', err);
      setError('Could not generate custom challenge. Please check parameters and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            <Sparkles className="h-4 w-4" />
            <span>AI Practice Lab & Problem Synthesizer</span>
          </div>
          <h2 className="text-2xl font-bold text-white">Generate Custom Challenge</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Specify any programming subject, specific algorithmic concept, or design pattern. Our server-side AI will craft a tailored problem with runnable test suites and starter code.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-rose-950/40 border border-rose-800/60 rounded-lg text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleGenerate} className="space-y-4 text-xs">
          {/* Track Selection */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">Coding Track</label>
            <select
              value={subject}
              onChange={e => setSubject(e.target.value as SubjectId)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="frontend">Frontend & Modern Web</option>
              <option value="dsa">Data Structures & Algorithms</option>
              <option value="python">Python & Algorithmic Scripting</option>
              <option value="systems">System Design & Backend Architecture</option>
              <option value="sql">SQL & Relational Databases</option>
            </select>
          </div>

          {/* Topic Focus */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">Concept or Topic Focus</label>
            <input
              type="text"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="e.g. Sliding Window, LRU Cache, Custom Event Emitter, Trie"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          {/* Difficulty Selection */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">Target Difficulty</label>
            <div className="grid grid-cols-3 gap-2">
              {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map(d => (
                <button
                  type="button"
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`py-2 rounded-lg font-medium transition-colors border ${
                    difficulty === d
                      ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGenerating}
              className="flex items-center gap-2 px-5 py-2.5 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-600/30 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Synthesizing Challenge...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generate & Practice</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
