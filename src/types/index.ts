export type SubjectId = 'frontend' | 'dsa' | 'python' | 'systems' | 'sql';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface TestCase {
  input: any[];
  expected: any;
  description?: string;
}

export interface ProblemExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface Problem {
  id: string;
  title: string;
  subjectId: SubjectId;
  subjectTitle: string;
  difficulty: Difficulty;
  category: string;
  description: string;
  examples: ProblemExample[];
  constraints: string[];
  starterCode: string;
  solutionSnippet?: string;
  testCases: TestCase[];
  hints: string[];
  xpReward: number;
  language: 'javascript' | 'sql';
}

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  concepts: string[];
  durationMinutes: number;
  problemIds: string[];
}

export interface SubjectTrack {
  id: SubjectId;
  title: string;
  tagline: string;
  description: string;
  iconName: string;
  accentColor: string;
  modules: LearningModule[];
}

export interface TestResult {
  testIndex: number;
  passed: boolean;
  input: any[];
  expected: any;
  actual: any;
  executionTimeMs: number;
  error?: string;
}

export interface RunResult {
  success: boolean;
  allPassed: boolean;
  results: TestResult[];
  logs: string[];
  totalTimeMs: number;
  error?: string;
}

export interface AIReviewResult {
  timeComplexity: string;
  spaceComplexity: string;
  strengths: string[];
  improvements: string[];
  summary: string;
}

export interface UserProgress {
  xp: number;
  level: number;
  streakDays: number;
  lastActiveDate: string;
  solvedProblemIds: string[];
  bookmarkedProblemIds: string[];
  submissions: Record<string, { code: string; passed: boolean; timestamp: number }>;
}
