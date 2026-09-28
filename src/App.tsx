/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { CurriculumView } from './components/CurriculumView';
import { PracticeDeckView } from './components/PracticeDeckView';
import { PracticeStudio } from './components/PracticeStudio';
import { PlaygroundView } from './components/PlaygroundView';
import { ProgressDashboard } from './components/ProgressDashboard';
import { DailySprintModal } from './components/DailySprintModal';
import { AiProblemGeneratorModal } from './components/AiProblemGeneratorModal';
import { N8nChatWidget } from './components/N8nChatWidget';
import { PRACTICE_PROBLEMS } from './data/practiceProblems';
import { useProgress } from './hooks/useProgress';
import { Problem } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'curriculum' | 'practice' | 'playground' | 'analytics'>('curriculum');
  const [problems, setProblems] = useState<Problem[]>(PRACTICE_PROBLEMS);
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null);

  // Modals state
  const [isDailySprintOpen, setIsDailySprintOpen] = useState<boolean>(false);
  const [isAiGeneratorOpen, setIsAiGeneratorOpen] = useState<boolean>(false);
  const [isN8nChatOpen, setIsN8nChatOpen] = useState<boolean>(false);

  // User Progress Hook
  const { progress, recordSolved, toggleBookmark } = useProgress();

  // Current problem if in studio mode
  const currentProblem = selectedProblemId
    ? problems.find(p => p.id === selectedProblemId) || null
    : null;

  // Daily Sprint Problem (e.g. two-sum-sorted)
  const sprintProblem = problems.find(p => p.id === 'two-sum-sorted') || problems[0];

  const handleSelectProblem = (problemId: string) => {
    setSelectedProblemId(problemId);
  };

  const handleBackToDeck = () => {
    setSelectedProblemId(null);
  };

  const handleProblemGenerated = (newProblem: Problem) => {
    setProblems(prev => [newProblem, ...prev]);
    setSelectedProblemId(newProblem.id);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Top Bar Contract compliant Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={tab => {
          setSelectedProblemId(null);
          setActiveTab(tab);
        }}
        progress={progress}
        onOpenDailySprint={() => setIsDailySprintOpen(true)}
        onOpenAiGenerator={() => setIsAiGeneratorOpen(true)}
        onOpenN8nChat={() => setIsN8nChatOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {selectedProblemId && currentProblem ? (
          <PracticeStudio
            problem={currentProblem}
            onBack={handleBackToDeck}
            onRecordSolved={recordSolved}
            isBookmarked={progress.bookmarkedProblemIds.includes(currentProblem.id)}
            onToggleBookmark={() => toggleBookmark(currentProblem.id)}
            isSolved={progress.solvedProblemIds.includes(currentProblem.id)}
            savedCode={progress.submissions[currentProblem.id]?.code}
          />
        ) : (
          <>
            {activeTab === 'curriculum' && (
              <CurriculumView
                onSelectProblem={handleSelectProblem}
                onOpenDailySprint={() => setIsDailySprintOpen(true)}
                onOpenAiGenerator={() => setIsAiGeneratorOpen(true)}
                solvedProblemIds={progress.solvedProblemIds}
              />
            )}

            {activeTab === 'practice' && (
              <PracticeDeckView
                problems={problems}
                solvedProblemIds={progress.solvedProblemIds}
                bookmarkedProblemIds={progress.bookmarkedProblemIds}
                onSelectProblem={handleSelectProblem}
                onToggleBookmark={toggleBookmark}
                onOpenAiGenerator={() => setIsAiGeneratorOpen(true)}
              />
            )}

            {activeTab === 'playground' && <PlaygroundView />}

            {activeTab === 'analytics' && (
              <ProgressDashboard
                progress={progress}
                problems={problems}
                onSelectProblem={handleSelectProblem}
                onOpenAiGenerator={() => setIsAiGeneratorOpen(true)}
              />
            )}
          </>
        )}
      </main>

      {/* Modals */}
      <DailySprintModal
        isOpen={isDailySprintOpen}
        onClose={() => setIsDailySprintOpen(false)}
        sprintProblem={sprintProblem}
        onStartSprint={id => {
          setSelectedProblemId(id);
        }}
        isSolved={progress.solvedProblemIds.includes(sprintProblem.id)}
      />

      <AiProblemGeneratorModal
        isOpen={isAiGeneratorOpen}
        onClose={() => setIsAiGeneratorOpen(false)}
        onProblemGenerated={handleProblemGenerated}
      />

      {/* Floating n8n AI Chatbot Widget */}
      <N8nChatWidget
        isOpen={isN8nChatOpen}
        onOpen={() => setIsN8nChatOpen(true)}
        onClose={() => setIsN8nChatOpen(false)}
        currentContext={{
          activeTab,
          problemTitle: currentProblem?.title,
          subject: currentProblem?.subjectTitle,
        }}
      />
    </div>
  );
}
