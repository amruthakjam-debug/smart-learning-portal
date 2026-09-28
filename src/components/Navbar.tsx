import React from 'react';
import { Sparkles, Flame, Award, BookOpen, Code2, Play, BarChart3, Clock } from 'lucide-react';
import { UserProgress } from '../types';

interface NavbarProps {
  activeTab: 'curriculum' | 'practice' | 'playground' | 'analytics';
  setActiveTab: (tab: 'curriculum' | 'practice' | 'playground' | 'analytics') => void;
  progress: UserProgress;
  onOpenDailySprint: () => void;
  onOpenAiGenerator: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  progress,
  onOpenDailySprint,
  onOpenAiGenerator,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single element wordmark brand */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab('curriculum')}
            className="flex items-center gap-2 text-left group focus:outline-none"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/20 group-hover:bg-indigo-500 transition-colors">
              <Code2 className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white font-sans">
              CodeZenith
            </span>
          </button>

          {/* Zone 2: Clean text navigation links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('curriculum')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'curriculum'
                  ? 'text-white bg-slate-800/80 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Curriculum</span>
            </button>

            <button
              onClick={() => setActiveTab('practice')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'practice'
                  ? 'text-white bg-slate-800/80 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Code2 className="h-4 w-4" />
              <span>Practice Sessions</span>
            </button>

            <button
              onClick={() => setActiveTab('playground')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'playground'
                  ? 'text-white bg-slate-800/80 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Play className="h-4 w-4" />
              <span>Playground</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'analytics'
                  ? 'text-white bg-slate-800/80 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </button>
          </nav>
        </div>

        {/* Zone 3: 1-2 primary actions and user progress meters */}
        <div className="flex items-center gap-3">
          {/* Daily Sprint Button */}
          <button
            onClick={onOpenDailySprint}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-md hover:bg-amber-500/20 transition-colors"
            title="Start today's 15-minute coding sprint"
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Daily Sprint</span>
          </button>

          {/* AI Generator Button */}
          <button
            onClick={onOpenAiGenerator}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-500 transition-colors shadow-sm shadow-indigo-600/30 whitespace-nowrap"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-200" />
            <span>AI Practice Lab</span>
          </button>

          {/* Streak indicator */}
          <div className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-amber-400 bg-slate-900 border border-slate-800 rounded-md tabular-nums">
            <Flame className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span>{progress.streakDays}d streak</span>
          </div>

          {/* XP Level badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-indigo-300 bg-slate-900 border border-slate-800 rounded-md tabular-nums">
            <Award className="h-3.5 w-3.5 text-indigo-400" />
            <span>Lv {progress.level} · {progress.xp} XP</span>
          </div>
        </div>
      </div>
    </header>
  );
};
