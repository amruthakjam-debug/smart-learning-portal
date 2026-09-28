import { useState, useEffect } from 'react';
import { UserProgress } from '../types';

const STORAGE_KEY = 'codezenith_user_progress_v1';

const INITIAL_PROGRESS: UserProgress = {
  xp: 120,
  level: 2,
  streakDays: 3,
  lastActiveDate: new Date().toISOString().split('T')[0],
  solvedProblemIds: ['flatten-nested-array'],
  bookmarkedProblemIds: ['promise-all-polyfill'],
  submissions: {},
};

export function useProgress() {
  const [progress, setProgress] = useState<UserProgress>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not read user progress from localStorage', e);
    }
    return INITIAL_PROGRESS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
      console.warn('Could not persist user progress to localStorage', e);
    }
  }, [progress]);

  const recordSolved = (problemId: string, xpReward: number, code: string) => {
    setProgress(prev => {
      const alreadySolved = prev.solvedProblemIds.includes(problemId);
      const newXp = alreadySolved ? prev.xp : prev.xp + xpReward;
      const newLevel = Math.floor(newXp / 100) + 1;
      const today = new Date().toISOString().split('T')[0];

      let newStreak = prev.streakDays;
      if (prev.lastActiveDate !== today) {
        newStreak += 1;
      }

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        streakDays: newStreak,
        lastActiveDate: today,
        solvedProblemIds: alreadySolved ? prev.solvedProblemIds : [...prev.solvedProblemIds, problemId],
        submissions: {
          ...prev.submissions,
          [problemId]: {
            code,
            passed: true,
            timestamp: Date.now(),
          },
        },
      };
    });
  };

  const toggleBookmark = (problemId: string) => {
    setProgress(prev => {
      const isBookmarked = prev.bookmarkedProblemIds.includes(problemId);
      return {
        ...prev,
        bookmarkedProblemIds: isBookmarked
          ? prev.bookmarkedProblemIds.filter(id => id !== problemId)
          : [...prev.bookmarkedProblemIds, problemId],
      };
    });
  };

  const resetProgress = () => {
    setProgress(INITIAL_PROGRESS);
  };

  return {
    progress,
    recordSolved,
    toggleBookmark,
    resetProgress,
  };
}
