import React, { useState, useMemo } from 'react';
import {
  Search,
  CheckCircle2,
  Bookmark,
  Sparkles,
  ArrowRight,
  Filter,
  Code2
} from 'lucide-react';
import { Problem, SubjectId, Difficulty } from '../types';

interface PracticeDeckViewProps {
  problems: Problem[];
  solvedProblemIds: string[];
  bookmarkedProblemIds: string[];
  onSelectProblem: (problemId: string) => void;
  onToggleBookmark: (problemId: string) => void;
  onOpenAiGenerator: () => void;
}

export const PracticeDeckView: React.FC<PracticeDeckViewProps> = ({
  problems,
  solvedProblemIds,
  bookmarkedProblemIds,
  onSelectProblem,
  onToggleBookmark,
  onOpenAiGenerator,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [filterSolved, setFilterSolved] = useState<string>('all'); // all, solved, unsolved, bookmarked

  const filteredProblems = useMemo(() => {
    return problems.filter(p => {
      // Search filter
      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Subject filter
      if (selectedSubject !== 'all' && p.subjectId !== selectedSubject) return false;

      // Difficulty filter
      if (selectedDifficulty !== 'all' && p.difficulty !== selectedDifficulty) return false;

      // Status filter
      const isSolved = solvedProblemIds.includes(p.id);
      const isBookmarked = bookmarkedProblemIds.includes(p.id);

      if (filterSolved === 'solved' && !isSolved) return false;
      if (filterSolved === 'unsolved' && isSolved) return false;
      if (filterSolved === 'bookmarked' && !isBookmarked) return false;

      return true;
    });
  }, [problems, searchQuery, selectedSubject, selectedDifficulty, filterSolved, solvedProblemIds, bookmarkedProblemIds]);

  const difficultyColor = (diff: Difficulty) => {
    switch (diff) {
      case 'Easy':
        return 'text-emerald-400';
      case 'Medium':
        return 'text-amber-400';
      case 'Hard':
        return 'text-rose-400';
      default:
        return 'text-slate-300';
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Practice Sessions & Problem Deck</h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse interactive challenges, test your solutions against real edge cases, and earn XP.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAiGenerator}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors shadow-sm shadow-indigo-600/20 whitespace-nowrap"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Generate Custom Challenge</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search problems by title, algorithm, or concept..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Filter Segmented Controls */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          {/* Subject Filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-400 font-medium mr-1">Subject:</span>
            {[
              { id: 'all', label: 'All Subjects' },
              { id: 'frontend', label: 'Frontend' },
              { id: 'dsa', label: 'DSA' },
              { id: 'python', label: 'Python' },
              { id: 'systems', label: 'Systems' },
              { id: 'sql', label: 'SQL' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedSubject(tab.id)}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  selectedSubject === tab.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-slate-800 hidden lg:block" />

          {/* Difficulty Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium mr-1">Difficulty:</span>
            {['all', 'Easy', 'Medium', 'Hard'].map(d => (
              <button
                key={d}
                onClick={() => setSelectedDifficulty(d)}
                className={`px-2.5 py-1.5 rounded-md font-medium transition-colors ${
                  selectedDifficulty === d
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {d === 'all' ? 'All' : d}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-slate-800 hidden lg:block" />

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium mr-1">Status:</span>
            {[
              { id: 'all', label: 'All' },
              { id: 'unsolved', label: 'Unsolved' },
              { id: 'solved', label: 'Solved' },
              { id: 'bookmarked', label: 'Saved' },
            ].map(st => (
              <button
                key={st.id}
                onClick={() => setFilterSolved(st.id)}
                className={`px-2.5 py-1.5 rounded-md font-medium transition-colors ${
                  filterSolved === st.id
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Problems Counter and Listing */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <div className="flex items-center gap-2">
            <span>Showing</span>
            <span className="font-semibold text-white tabular-nums">{filteredProblems.length}</span>
            <span>challenges</span>
          </div>
          <div className="flex items-center gap-2 tabular-nums">
            <span className="text-emerald-400 font-medium">
              {solvedProblemIds.length} solved
            </span>
            <span aria-hidden="true">·</span>
            <span>{problems.length} total curated</span>
          </div>
        </div>

        {/* Problem Cards Deck */}
        {filteredProblems.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-12 text-center space-y-3">
            <Code2 className="h-8 w-8 text-slate-500 mx-auto" />
            <h3 className="text-base font-semibold text-white">No challenges match your filters</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try adjusting your search criteria or generate a brand new custom problem with the AI Practice Lab.
            </p>
            <button
              onClick={onOpenAiGenerator}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-md hover:bg-indigo-500/20 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Generate Challenge Now</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProblems.map((problem, index) => {
              const isSolved = solvedProblemIds.includes(problem.id);
              const isBookmarked = bookmarkedProblemIds.includes(problem.id);

              return (
                <div
                  key={problem.id}
                  className="group rounded-xl border border-slate-800/90 bg-slate-900/50 hover:bg-slate-850 hover:border-slate-700 transition-all p-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Left: Problem info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        {isSolved ? (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 shrink-0">
                            <CheckCircle2 className="h-4 w-4" />
                          </div>
                        ) : (
                          <span className="font-mono text-xs text-slate-500 tabular-nums shrink-0">
                            {String(index + 1).padStart(2, '0')}.
                          </span>
                        )}

                        <h3
                          onClick={() => onSelectProblem(problem.id)}
                          className="text-base font-semibold text-white hover:text-indigo-400 transition-colors cursor-pointer"
                        >
                          {problem.title}
                        </h3>
                      </div>

                      {/* Zero-Pill Unboxed Metadata with typographic separators */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 pl-8">
                        <span className="text-slate-300 font-medium">{problem.subjectTitle}</span>
                        <span aria-hidden="true">·</span>
                        <span>{problem.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className={`font-semibold ${difficultyColor(problem.difficulty)}`}>
                          {problem.difficulty}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono text-amber-300/90 tabular-nums">+{problem.xpReward} XP</span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">{problem.testCases.length} Test Cases</span>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      <button
                        onClick={() => onToggleBookmark(problem.id)}
                        className={`p-2 rounded-lg border transition-colors ${
                          isBookmarked
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                        }`}
                        title={isBookmarked ? 'Remove bookmark' : 'Bookmark challenge'}
                      >
                        <Bookmark className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => onSelectProblem(problem.id)}
                        className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                          isSolved
                            ? 'bg-slate-800 text-slate-200 hover:bg-slate-750 hover:text-white border border-slate-700'
                            : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm shadow-indigo-600/20'
                        }`}
                      >
                        <span>{isSolved ? 'Review Solution' : 'Solve Challenge'}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
