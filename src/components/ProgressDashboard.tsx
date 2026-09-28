import React from 'react';
import {
  Award,
  Flame,
  CheckCircle2,
  TrendingUp,
  BookOpen,
  Code2,
  Sparkles,
  Zap,
  ShieldCheck
} from 'lucide-react';
import { UserProgress, Problem } from '../types';
import { SUBJECT_TRACKS } from '../data/curriculumData';

interface ProgressDashboardProps {
  progress: UserProgress;
  problems: Problem[];
  onSelectProblem: (problemId: string) => void;
  onOpenAiGenerator: () => void;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  progress,
  problems,
  onSelectProblem,
  onOpenAiGenerator,
}) => {
  const currentLevel = progress.level;
  const currentXp = progress.xp;
  const nextLevelXp = currentLevel * 100;
  const currentLevelProgress = currentXp % 100;

  // Breakdown by difficulty
  const solvedProblems = problems.filter(p => progress.solvedProblemIds.includes(p.id));
  const easySolved = solvedProblems.filter(p => p.difficulty === 'Easy').length;
  const mediumSolved = solvedProblems.filter(p => p.difficulty === 'Medium').length;
  const hardSolved = solvedProblems.filter(p => p.difficulty === 'Hard').length;

  const totalEasy = problems.filter(p => p.difficulty === 'Easy').length;
  const totalMedium = problems.filter(p => p.difficulty === 'Medium').length;
  const totalHard = problems.filter(p => p.difficulty === 'Hard').length;

  // Subject completion stats
  const subjectStats = SUBJECT_TRACKS.map(track => {
    const trackProblems = problems.filter(p => p.subjectId === track.id);
    const solvedInTrack = trackProblems.filter(p => progress.solvedProblemIds.includes(p.id)).length;
    const percentage = trackProblems.length > 0 ? Math.round((solvedInTrack / trackProblems.length) * 100) : 0;
    return {
      ...track,
      total: trackProblems.length,
      solved: solvedInTrack,
      percentage,
    };
  });

  const ACHIEVEMENTS = [
    {
      id: 'first-step',
      title: 'First Step',
      desc: 'Complete your first practice problem',
      unlocked: progress.solvedProblemIds.length >= 1,
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
    },
    {
      id: 'streak-3',
      title: 'Streak Novice',
      desc: 'Achieve a 3-day consecutive practice streak',
      unlocked: progress.streakDays >= 3,
      icon: <Flame className="h-4 w-4 text-amber-400" />,
    },
    {
      id: 'century-xp',
      title: 'Centurion',
      desc: 'Amass over 100 total experience points',
      unlocked: progress.xp >= 100,
      icon: <Zap className="h-4 w-4 text-indigo-400" />,
    },
    {
      id: 'algo-tamer',
      title: 'Algorithm Tamer',
      desc: 'Solve at least 2 Data Structures & Algorithm challenges',
      unlocked: solvedProblems.filter(p => p.subjectId === 'dsa').length >= 2,
      icon: <ShieldCheck className="h-4 w-4 text-sky-400" />,
    },
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Learning Analytics & Mastery</h1>
        <p className="text-sm text-slate-400 mt-1">
          Monitor your skill progression, streak velocity, and subject mastery breakdown.
        </p>
      </div>

      {/* Top 3 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Level & XP */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Current Standing</span>
            <Award className="h-4 w-4 text-indigo-400" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-white tabular-nums">
              Level {currentLevel}
            </div>
            <div className="text-xs text-slate-400 tabular-nums mt-0.5">
              {currentXp} total XP earned
            </div>
          </div>
          {/* Progress bar to next level */}
          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-[11px] text-slate-400 font-mono tabular-nums">
              <span>Progress to Lv {currentLevel + 1}</span>
              <span>{currentLevelProgress} / 100 XP</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${currentLevelProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Streak */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Consistency</span>
            <Flame className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-white tabular-nums">
              {progress.streakDays} Days
            </div>
            <div className="text-xs text-slate-400 mt-0.5">Active practice streak</div>
          </div>
          <p className="text-xs text-slate-400 pt-2 leading-relaxed">
            Practice daily to maintain your streak multiplier and lock in retention.
          </p>
        </div>

        {/* Card 3: Solved Total */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Completed Sessions</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-white tabular-nums">
              {solvedProblems.length} / {problems.length}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">Challenges solved</div>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400 pt-2 tabular-nums">
            <span className="text-emerald-400 font-medium">{easySolved} Easy</span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-400 font-medium">{mediumSolved} Med</span>
            <span aria-hidden="true">·</span>
            <span className="text-rose-400 font-medium">{hardSolved} Hard</span>
          </div>
        </div>
      </div>

      {/* Subject Mastery Progress Bars */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Subject Mastery Breakdown</h2>
            <p className="text-xs text-slate-400 mt-0.5">Curriculum completion rate per engineering track.</p>
          </div>
          <button
            onClick={onOpenAiGenerator}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-md hover:bg-indigo-500/20 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Target Weak Subject</span>
          </button>
        </div>

        <div className="space-y-4">
          {subjectStats.map(sub => (
            <div key={sub.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">{sub.title}</span>
                <span className="font-mono text-slate-400 tabular-nums">
                  {sub.solved}/{sub.total} solved ({sub.percentage}%)
                </span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.max(sub.percentage, 4)}%`,
                    backgroundColor: sub.accentColor,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements & Milestones */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
        <h2 className="text-base font-bold text-white">Academy Milestones & Badges</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {ACHIEVEMENTS.map(ach => (
            <div
              key={ach.id}
              className={`p-4 rounded-xl border transition-colors ${
                ach.unlocked
                  ? 'bg-slate-950/80 border-slate-800'
                  : 'bg-slate-950/30 border-slate-900 opacity-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  {ach.icon}
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {ach.unlocked ? 'Unlocked' : 'Locked'}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-white">{ach.title}</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{ach.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
