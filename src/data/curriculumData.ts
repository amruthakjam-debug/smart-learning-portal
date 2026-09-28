import { SubjectTrack } from '../types';

export const SUBJECT_TRACKS: SubjectTrack[] = [
  {
    id: 'frontend',
    title: 'Frontend & Modern Web',
    tagline: 'Deep JavaScript, Event Loops, Asynchronous Architecture & DOM',
    description: 'Master production-grade browser engineering: Promise scheduling, microtask queues, deep object manipulation, closures, and clean reactive patterns.',
    iconName: 'Layout',
    accentColor: '#38BDF8', // Sky
    modules: [
      {
        id: 'mod-fe-1',
        title: 'Asynchronous JavaScript & Event Loop Mechanics',
        description: 'Microtasks vs Macrotasks, custom Promise.all polyfills, error propagation, and abort controllers.',
        concepts: ['Promise chaining', 'Microtask Queue', 'Cancellation & Timeouts', 'Unhandled Rejections'],
        durationMinutes: 45,
        problemIds: ['promise-all-polyfill'],
      },
      {
        id: 'mod-fe-2',
        title: 'Memory & Object Structural Mutability',
        description: 'Deep copying with circular reference management, WeakMap caching, and immutable state updates.',
        concepts: ['WeakMap / WeakSet', 'Reference Cycles', 'Property Descriptors', 'Serialization'],
        durationMinutes: 35,
        problemIds: ['deep-clone-object'],
      },
      {
        id: 'mod-fe-3',
        title: 'Functional Array Pipelines & Transformations',
        description: 'Recursive and iterative flatten mechanisms, custom map/reduce idioms, and performance bottlenecks.',
        concepts: ['Recursion vs Iteration', 'Stack Depth Bounds', 'Generator Pipelines'],
        durationMinutes: 30,
        problemIds: ['flatten-nested-array'],
      },
    ],
  },
  {
    id: 'dsa',
    title: 'Data Structures & Algorithms',
    tagline: 'Computational Complexity, Two Pointers, Trees & Dynamic Programming',
    description: 'Systematic problem solving from linear scan invariants to memoization and bottom-up tabular optimization.',
    iconName: 'Cpu',
    accentColor: '#818CF8', // Indigo
    modules: [
      {
        id: 'mod-dsa-1',
        title: 'Two Pointers & In-Place Space Optimization',
        description: 'Squeezing time complexity from quadratic to linear using pointer invariants on sorted data structures.',
        concepts: ['Opposite-end pointers', 'Sliding Window', 'In-place array mutations'],
        durationMinutes: 40,
        problemIds: ['two-sum-sorted'],
      },
      {
        id: 'mod-dsa-2',
        title: 'Linear Stacks & Monotonic Sequences',
        description: 'Parentheses matching, delimiter balancing, and nearest greater/smaller element queries.',
        concepts: ['LIFO Data Structures', 'Boundary Delimiters', 'Monotonic Stacks'],
        durationMinutes: 35,
        problemIds: ['valid-parentheses'],
      },
      {
        id: 'mod-dsa-3',
        title: 'Dynamic Programming & State Transitions',
        description: 'Subproblem optimal substructure, overlapping subproblems, and unbounded knapsack variants.',
        concepts: ['State formulation', 'Tabulation vs Memoization', 'Base case initialization'],
        durationMinutes: 60,
        problemIds: ['coin-change-dp'],
      },
    ],
  },
  {
    id: 'python',
    title: 'Python & Algorithmic Scripting',
    tagline: 'Pythonic Data Structures, Interval Arithmetic & Frequency Mappings',
    description: 'Master idiomatic data munging, hash frequency signatures, intervals consolidation, and computational math.',
    iconName: 'Terminal',
    accentColor: '#34D399', // Emerald
    modules: [
      {
        id: 'mod-py-1',
        title: 'Hash Signatures & Multi-Cluster Grouping',
        description: 'Categorizing permutations and anagrams with canonical sorting signatures and frequency counters.',
        concepts: ['Canonical Hash Keys', 'Frequency Tuples', 'Bucket Sorting'],
        durationMinutes: 35,
        problemIds: ['group-anagrams'],
      },
      {
        id: 'mod-py-2',
        title: 'Interval Arithmetic & Meeting Scheduling',
        description: 'Sorting multi-dimensional coordinate ranges and merging intersecting continuous timelines.',
        concepts: ['Interval overlapping criteria', 'Greedy sweep-line algorithms', 'In-place bounds extension'],
        durationMinutes: 45,
        problemIds: ['merge-intervals'],
      },
    ],
  },
  {
    id: 'systems',
    title: 'System Design & Backend Architecture',
    tagline: 'Caching Invariants, Rate Limiters, Resilience & Throughput',
    description: 'Engineering resilient distributed services: LRU cache evictions, leaky token buckets, and failure mitigation.',
    iconName: 'Server',
    accentColor: '#F59E0B', // Amber
    modules: [
      {
        id: 'mod-sys-1',
        title: 'In-Memory Cache Eviction Policies (LRU & LFU)',
        description: 'Designing constant O(1) time key-value data structures with access time ordering.',
        concepts: ['Doubly-Linked Lists', 'Hash Map + List indexing', 'Eviction constraints'],
        durationMinutes: 50,
        problemIds: ['lru-cache-design'],
      },
      {
        id: 'mod-sys-2',
        title: 'Traffic Shaping & Token Bucket Rate Limiting',
        description: 'Controlling throughput bursts in API Gateways using sliding token replenishment formulas.',
        concepts: ['Burst capacity', 'Continuous refill mathematics', 'Graceful 429 throttling'],
        durationMinutes: 40,
        problemIds: ['token-bucket-limiter'],
      },
    ],
  },
  {
    id: 'sql',
    title: 'SQL & Relational Databases',
    tagline: 'Relational Algebra, Window Functions, Complex Joins & Subqueries',
    description: 'Writing query execution plans, handling duplicates with distinct projections, and computing rank leaders.',
    iconName: 'Database',
    accentColor: '#EC4899', // Pink
    modules: [
      {
        id: 'mod-sql-1',
        title: 'Aggregates, Subqueries & Ranking Without Duplicates',
        description: 'Writing resilient queries that gracefully handle tied values, null sets, and nth-highest extraction.',
        concepts: ['NULL handling', 'Offset and Limit semantics', 'Correlated subqueries'],
        durationMinutes: 30,
        problemIds: ['sql-second-highest-salary'],
      },
      {
        id: 'mod-sql-2',
        title: 'Multi-Table Joins & Group Top-K Selection',
        description: 'Combining foreign keys and isolating per-department extreme values without Cartesian explosions.',
        concepts: ['INNER vs LEFT JOIN', 'Group By & MAX constraints', 'Composite row lookups'],
        durationMinutes: 40,
        problemIds: ['sql-department-top-earners'],
      },
    ],
  },
];
