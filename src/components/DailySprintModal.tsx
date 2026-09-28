import React from 'react';
import { X, Clock, Flame, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Problem } from '../types';

interface DailySprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  sprintProblem: Problem;
  onStartSprint: (problemId: string) => void;
  isSolved: boolean;
}

export const DailySprintModal: React.FC<DailySprintModalProps> = ({
  isOpen,
  onClose,
  sprintProblem,
  onStartSprint,
  isSolved,
}) => {
  if (!isOpen) return null;

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
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
            <Flame className="h-4 w-4" />
            <span>Today&apos;s Daily Coding Sprint</span>
          </div>
          <h2 className="text-2xl font-bold text-white">15-Minute Algorithmic Sprint</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Sharpen speed and accuracy. Complete today&apos;s featured problem in a focused sprint to claim bonus experience points and protect your daily streak.
          </p>
        </div>

        {/* Problem Spotlight Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-indigo-400">{sprintProblem.subjectTitle}</span>
            <span className="font-semibold text-amber-400">{sprintProblem.difficulty}</span>
          </div>

          <h3 className="text-base font-bold text-white">{sprintProblem.title}</h3>

          <p className="text-xs text-slate-400 line-clamp-2">
            {sprintProblem.description}
          </p>

          <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-xs text-slate-400">
            <div className="flex items-center gap-1.5 text-amber-300 font-mono font-medium">
              <Zap className="h-3.5 w-3.5" />
              <span>+{sprintProblem.xpReward + 50} XP (Includes +50 Sprint Bonus)</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span>15 mins target</span>
            </div>
          </div>
        </div>

        {/* Sprint Rules Checklist */}
        <div className="space-y-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>Run automated test cases to verify edge cases</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>Smart hints available if you hit an algorithmic wall</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>Automated Big-O complexity analysis upon submission</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            Maybe Later
          </button>
          <button
            onClick={() => {
              onStartSprint(sprintProblem.id);
              onClose();
            }}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-colors"
          >
            <span>{isSolved ? 'Review Sprint Challenge' : 'Start Sprint Now'}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
