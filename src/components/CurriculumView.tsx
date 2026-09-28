import React, { useState } from 'react';
import {
  Layout,
  Cpu,
  Terminal,
  Server,
  Database,
  CheckCircle2,
  ArrowRight,
  Clock,
  BookOpen,
  Sparkles,
  Layers,
  Code
} from 'lucide-react';
import { SubjectTrack, SubjectId } from '../types';
import { SUBJECT_TRACKS } from '../data/curriculumData';
import { PRACTICE_PROBLEMS } from '../data/practiceProblems';

interface CurriculumViewProps {
  onSelectProblem: (problemId: string) => void;
  onOpenDailySprint: () => void;
  onOpenAiGenerator: () => void;
  solvedProblemIds: string[];
}

export const CurriculumView: React.FC<CurriculumViewProps> = ({
  onSelectProblem,
  onOpenDailySprint,
  onOpenAiGenerator,
  solvedProblemIds,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<SubjectId>('frontend');

  const selectedTrack = SUBJECT_TRACKS.find(t => t.id === selectedSubjectId) || SUBJECT_TRACKS[0];

  const getSubjectIcon = (iconName: string) => {
    switch (iconName) {
      case 'Layout':
        return <Layout className="h-5 w-5" />;
      case 'Cpu':
        return <Cpu className="h-5 w-5" />;
      case 'Terminal':
        return <Terminal className="h-5 w-5" />;
      case 'Server':
        return <Server className="h-5 w-5" />;
      case 'Database':
        return <Database className="h-5 w-5" />;
      default:
        return <BookOpen className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
          <div className="p-8 lg:p-12 lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
              <Sparkles className="h-4 w-4" />
              <span>Smart Coding Academy & Sandbox</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-400">Real-Time In-Browser Execution</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight text-balance">
              Master core software engineering through interactive practice.
            </h1>

            <p className="text-base text-slate-300 max-w-2xl leading-relaxed">
              Build algorithmic muscle and frontend mastery with automated test runners,
              progressive step-by-step AI hints, complexity analysis, and real-time execution sandboxes.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onSelectProblem('promise-all-polyfill')}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/25"
              >
                <span>Jump into First Challenge</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={onOpenDailySprint}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-200 bg-slate-800 hover:bg-slate-750 border border-slate-750 rounded-lg hover:border-slate-600 transition-colors"
              >
                <Clock className="h-4 w-4 text-amber-400" />
                <span>Today&apos;s Daily Sprint</span>
              </button>
            </div>

            {/* Quick Stats Metadata without pill capsules */}
            <div className="flex flex-wrap items-center gap-6 pt-4 text-xs text-slate-400 border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-200 tabular-nums">5 Core Tracks</span>
                <span aria-hidden="true">·</span>
                <span>Web, DSA, Python, Systems, SQL</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-200 tabular-nums">12 Modules</span>
                <span aria-hidden="true">·</span>
                <span>Self-Paced Syllabi</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-emerald-400 tabular-nums">Instant Sandbox</span>
                <span aria-hidden="true">·</span>
                <span>Zero Setup Required</span>
              </div>
            </div>
          </div>

          {/* Hero Visual Image Slot */}
          <div className="lg:col-span-5 relative h-72 lg:h-full min-h-[320px] overflow-hidden bg-slate-950 flex items-center justify-center p-6">
            <div className="relative w-full h-full rounded-xl overflow-hidden border border-slate-800/80 bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950/40">
              <img
                src="/src/assets/images/learning_portal_hero_1790604164637.jpg"
                alt="CodeZenith Smart Learning Workspace"
                className="w-full h-full object-cover object-center opacity-85 hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  // Fallback container if image fails
                  const target = e.currentTarget;
                  target.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-slate-300 bg-slate-900/80 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-800">
                <span className="font-mono text-indigo-300">Live Code Execution Engine</span>
                <span className="text-slate-400 tabular-nums">Active Sandbox v3</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subject Track Tabs */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">Coding Curricula & Tracks</h2>
            <p className="text-sm text-slate-400 mt-1">Select a specialization to explore syllabus modules and curated practice sessions.</p>
          </div>

          <button
            onClick={onOpenAiGenerator}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-lg hover:bg-indigo-500/20 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Generate Custom Subject Track</span>
          </button>
        </div>

        {/* Segmented Track Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {SUBJECT_TRACKS.map(track => {
            const isSelected = track.id === selectedSubjectId;
            const trackProblemIds = track.modules.flatMap(m => m.problemIds);
            const solvedCount = trackProblemIds.filter(id => solvedProblemIds.includes(id)).length;
            const totalCount = trackProblemIds.length;

            return (
              <button
                key={track.id}
                onClick={() => setSelectedSubjectId(track.id)}
                className={`p-4 rounded-xl text-left border transition-all ${
                  isSelected
                    ? 'bg-slate-800/90 border-indigo-500 shadow-md shadow-indigo-500/10'
                    : 'bg-slate-900/60 border-slate-800 hover:bg-slate-850 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="p-2 rounded-lg"
                    style={{
                      backgroundColor: `${track.accentColor}15`,
                      color: track.accentColor,
                    }}
                  >
                    {getSubjectIcon(track.iconName)}
                  </div>
                  {solvedCount > 0 && (
                    <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 tabular-nums">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>{solvedCount}/{totalCount}</span>
                    </div>
                  )}
                </div>

                <div className="font-semibold text-sm text-white truncate">{track.title}</div>
                <div className="text-xs text-slate-400 mt-1 line-clamp-1">{track.tagline}</div>
              </button>
            );
          })}
        </div>

        {/* Active Track Overview & Modules */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-1">
                Track Syllabus
              </div>
              <h3 className="text-2xl font-bold text-white">{selectedTrack.title}</h3>
              <p className="text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">{selectedTrack.description}</p>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-400 self-start md:self-auto shrink-0">
              <div className="flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-slate-400" />
                <span className="tabular-nums font-medium text-slate-200">{selectedTrack.modules.length} Modules</span>
              </div>
              <span aria-hidden="true">·</span>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-slate-400" />
                <span className="tabular-nums font-medium text-slate-200">
                  {selectedTrack.modules.reduce((acc, m) => acc + m.durationMinutes, 0)} mins total
                </span>
              </div>
            </div>
          </div>

          {/* Module Cards Grid */}
          <div className="space-y-4">
            {selectedTrack.modules.map((module, index) => {
              const moduleProblems = PRACTICE_PROBLEMS.filter(p => module.problemIds.includes(p.id));

              return (
                <div
                  key={module.id}
                  className="rounded-lg border border-slate-800/90 bg-slate-950/60 p-5 hover:border-slate-700 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-semibold text-indigo-400 tabular-nums">
                          0{index + 1}.
                        </span>
                        <h4 className="text-base font-semibold text-white">{module.title}</h4>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">{module.description}</p>

                      {/* Concepts Metadata */}
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-500">
                        <span className="text-slate-400">Core Concepts:</span>
                        {module.concepts.map((concept, cIdx) => (
                          <React.Fragment key={concept}>
                            <span className="text-slate-300 font-mono text-[11px]">{concept}</span>
                            {cIdx < module.concepts.length - 1 && <span aria-hidden="true">·</span>}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>

                    {/* Problem Launchers */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 pt-2 lg:pt-0">
                      {moduleProblems.map(prob => {
                        const isSolved = solvedProblemIds.includes(prob.id);

                        return (
                          <button
                            key={prob.id}
                            onClick={() => onSelectProblem(prob.id)}
                            className={`flex items-center justify-between sm:justify-start gap-2.5 px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors ${
                              isSolved
                                ? 'bg-emerald-950/30 text-emerald-300 border-emerald-800/60 hover:bg-emerald-950/50'
                                : 'bg-slate-850 text-slate-200 border-slate-750 hover:bg-slate-800 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {isSolved ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                              ) : (
                                <Code className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                              )}
                              <span className="font-semibold truncate max-w-[180px]">{prob.title}</span>
                            </div>

                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 tabular-nums">
                              <span aria-hidden="true">·</span>
                              <span>+{prob.xpReward} XP</span>
                              <ArrowRight className="h-3 w-3 text-slate-500 ml-1" />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
