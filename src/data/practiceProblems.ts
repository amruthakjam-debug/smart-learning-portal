import { Problem } from '../types';

export const PRACTICE_PROBLEMS: Problem[] = [
  // --- FRONTEND & JAVASCRIPT ---
  {
    id: 'promise-all-polyfill',
    title: 'Custom Promise.all Implementation',
    subjectId: 'frontend',
    subjectTitle: 'Frontend & Modern Web',
    difficulty: 'Medium',
    category: 'Asynchronous Programming',
    language: 'javascript',
    description: `Implement a function \`customPromiseAll(promises)\` that behaves identically to the native \`Promise.all\`.

The function takes an array of promises (or non-promise values) and returns a new Promise that:
1. Resolves when all input promises have resolved, with an array containing the resolved values in the same original order.
2. Rejects immediately if any input promise rejects, with that rejection reason.
3. If passed an empty array, it resolves immediately with an empty array.`,
    examples: [
      {
        input: 'promises = [Promise.resolve(1), Promise.resolve(2), 3]',
        output: '[1, 2, 3]',
        explanation: 'All values resolve in order; scalar value 3 is resolved immediately.',
      },
      {
        input: 'promises = [Promise.resolve("ok"), Promise.reject("error")]',
        output: 'Rejection with "error"',
        explanation: 'The second promise rejects, so the entire batch immediately rejects.',
      },
    ],
    constraints: [
      'Do not use native Promise.all or Promise.allSettled.',
      'Input can be empty or contain non-promise values.',
      'Must maintain original array ordering even if later promises resolve faster.',
    ],
    starterCode: `/**
 * Custom implementation of Promise.all
 * @param {Array<Promise|any>} promises
 * @return {Promise<Array<any>>}
 */
function customPromiseAll(promises) {
  // Write your code here
  return new Promise((resolve, reject) => {
    
  });
}`,
    solutionSnippet: `function customPromiseAll(promises) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(promises)) return resolve([]);
    if (promises.length === 0) return resolve([]);
    
    const results = new Array(promises.length);
    let completed = 0;
    
    promises.forEach((p, index) => {
      Promise.resolve(p)
        .then(value => {
          results[index] = value;
          completed++;
          if (completed === promises.length) {
            resolve(results);
          }
        })
        .catch(reject);
    });
  });
}`,
    testCases: [
      {
        input: [[1, 2, 3]],
        expected: [1, 2, 3],
        description: 'Resolves immediate scalar array',
      },
      {
        input: [[]],
        expected: [],
        description: 'Resolves empty array immediately',
      },
      {
        input: [['async-1', 'async-2']],
        expected: ['async-1', 'async-2'],
        description: 'Resolves string promises in order',
      },
    ],
    hints: [
      'Wrap each item in Promise.resolve(item) to handle both raw values and promises uniformly.',
      'Maintain a counter of resolved promises. Do NOT check results.length since array index assignments can create sparse arrays.',
      'Reject immediately upon catching any error.',
    ],
    xpReward: 75,
  },
  {
    id: 'deep-clone-object',
    title: 'Deep Clone with Circular Reference Support',
    subjectId: 'frontend',
    subjectTitle: 'Frontend & Modern Web',
    difficulty: 'Medium',
    category: 'Objects & Memory',
    language: 'javascript',
    description: `Implement a deep clone utility \`deepClone(value)\` that creates an exact structural duplicate of nested JavaScript objects, arrays, and primitive values.

Your function must:
1. Handle nested objects and arrays correctly.
2. Preserve primitive values (numbers, strings, booleans, null, undefined).
3. Handle circular references without entering infinite recursion.`,
    examples: [
      {
        input: 'obj = { a: 1, b: { c: [10, 20] } }',
        output: '{ a: 1, b: { c: [10, 20] } }',
        explanation: 'Modifying clone.b.c[0] must not affect the original object.',
      },
    ],
    constraints: [
      'Do not use structuredClone or JSON.parse(JSON.stringify()).',
      'Must handle arrays and objects recursively.',
    ],
    starterCode: `/**
 * Deep clones an object or array, preserving primitives
 * @param {any} value
 * @return {any}
 */
function deepClone(value, seen = new WeakMap()) {
  // Write your code here
  return value;
}`,
    solutionSnippet: `function deepClone(value, seen = new WeakMap()) {
  if (value === null || typeof value !== 'object') {
    return value;
  }
  if (seen.has(value)) {
    return seen.get(value);
  }
  
  const copy = Array.isArray(value) ? [] : {};
  seen.set(value, copy);
  
  for (const key of Object.keys(value)) {
    copy[key] = deepClone(value[key], seen);
  }
  return copy;
}`,
    testCases: [
      {
        input: [{ name: 'CodeZenith', stats: { stars: 42, tags: ['edu', 'tech'] } }],
        expected: { name: 'CodeZenith', stats: { stars: 42, tags: ['edu', 'tech'] } },
        description: 'Nested object and arrays clone',
      },
      {
        input: [[1, [2, [3, 4]]]],
        expected: [1, [2, [3, 4]]],
        description: 'Deep multi-level array clone',
      },
      {
        input: [42],
        expected: 42,
        description: 'Primitive number value',
      },
    ],
    hints: [
      'Check if the value is null or not an object first to return primitives directly.',
      'Use a WeakMap to track visited objects to prevent circular reference cycles.',
    ],
    xpReward: 60,
  },
  {
    id: 'flatten-nested-array',
    title: 'Flatten Deeply Nested Array',
    subjectId: 'frontend',
    subjectTitle: 'Frontend & Modern Web',
    difficulty: 'Easy',
    category: 'Arrays & Recursion',
    language: 'javascript',
    description: `Write a function \`flattenArray(arr, depth = Infinity)\` that flattens a multi-dimensional array up to a specified depth.

If depth is not specified or is Infinity, flatten all nesting levels completely into a 1D array.`,
    examples: [
      {
        input: 'arr = [1, [2, [3, [4]], 5]], depth = Infinity',
        output: '[1, 2, 3, 4, 5]',
      },
      {
        input: 'arr = [1, [2, [3]]], depth = 1',
        output: '[1, 2, [3]]',
      },
    ],
    constraints: [
      '0 <= depth <= Infinity',
      'Do not use Array.prototype.flat directly.',
    ],
    starterCode: `/**
 * Flattens nested array up to the specified depth
 * @param {Array} arr
 * @param {number} depth
 * @return {Array}
 */
function flattenArray(arr, depth = Infinity) {
  // Write your code here
  return [];
}`,
    solutionSnippet: `function flattenArray(arr, depth = Infinity) {
  const result = [];
  for (const item of arr) {
    if (Array.isArray(item) && depth > 0) {
      result.push(...flattenArray(item, depth - 1));
    } else {
      result.push(item);
    }
  }
  return result;
}`,
    testCases: [
      {
        input: [[1, [2, [3, [4]], 5]], Infinity],
        expected: [1, 2, 3, 4, 5],
        description: 'Deep flattening to 1D',
      },
      {
        input: [[1, [2, [3]]], 1],
        expected: [1, 2, [3]],
        description: 'Flatten single depth layer',
      },
      {
        input: [[1, 2, 3], 2],
        expected: [1, 2, 3],
        description: 'Already flat array',
      },
    ],
    hints: [
      'Iterate through the array and check if Array.isArray(item) and depth > 0.',
      'Use recursion or a stack-based accumulator.',
    ],
    xpReward: 40,
  },

  // --- DATA STRUCTURES & ALGORITHMS (DSA) ---
  {
    id: 'two-sum-sorted',
    title: 'Two Sum in Sorted Array',
    subjectId: 'dsa',
    subjectTitle: 'Data Structures & Algorithms',
    difficulty: 'Easy',
    category: 'Two Pointers',
    language: 'javascript',
    description: `Given a 1-indexed array of integers \`numbers\` that is already sorted in non-decreasing order, find two numbers such that they add up to a specific \`target\` number.

Return the indices of the two numbers, \`[index1, index2]\`, as an integer array of length 2 where \`1 <= index1 < index2 <= numbers.length\`.

Your solution must use only $O(1)$ additional space and run in $O(N)$ time.`,
    examples: [
      {
        input: 'numbers = [2, 7, 11, 15], target = 9',
        output: '[1, 2]',
        explanation: 'numbers[0] + numbers[1] = 2 + 7 = 9. Returning 1-indexed [1, 2].',
      },
      {
        input: 'numbers = [2, 3, 4], target = 6',
        output: '[1, 3]',
        explanation: 'numbers[0] + numbers[2] = 2 + 4 = 6.',
      },
    ],
    constraints: [
      '2 <= numbers.length <= 3 * 10^4',
      '-1000 <= numbers[i] <= 1000',
      'Exactly one valid solution exists.',
    ],
    starterCode: `/**
 * @param {number[]} numbers
 * @param {number} target
 * @return {number[]}
 */
function twoSumSorted(numbers, target) {
  // Write your code here
  return [];
}`,
    solutionSnippet: `function twoSumSorted(numbers, target) {
  let left = 0;
  let right = numbers.length - 1;
  while (left < right) {
    const sum = numbers[left] + numbers[right];
    if (sum === target) {
      return [left + 1, right + 1];
    } else if (sum < target) {
      left++;
    } else {
      right--;
    }
  }
  return [];
}`,
    testCases: [
      {
        input: [[2, 7, 11, 15], 9],
        expected: [1, 2],
        description: 'Standard sorted pair sum',
      },
      {
        input: [[2, 3, 4], 6],
        expected: [1, 3],
        description: 'Ends pair sum',
      },
      {
        input: [[-1, 0], -1],
        expected: [1, 2],
        description: 'Negative values sum',
      },
    ],
    hints: [
      'Since the array is sorted, place one pointer at the beginning and one at the end.',
      'If sum < target, advance left pointer to increase the sum. If sum > target, decrement right.',
    ],
    xpReward: 45,
  },
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses and Delimiters',
    subjectId: 'dsa',
    subjectTitle: 'Data Structures & Algorithms',
    difficulty: 'Easy',
    category: 'Stacks',
    language: 'javascript',
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    examples: [
      {
        input: 's = "()[]{}"',
        output: 'true',
      },
      {
        input: 's = "(]"',
        output: 'false',
      },
      {
        input: 's = "{[]}"',
        output: 'true',
      },
    ],
    constraints: [
      '1 <= s.length <= 10^4',
      's consists of parentheses only ()[]{}',
    ],
    starterCode: `/**
 * @param {string} s
 * @return {boolean}
 */
function isValidParentheses(s) {
  // Write your code here
  return false;
}`,
    solutionSnippet: `function isValidParentheses(s) {
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (const ch of s) {
    if (map[ch]) {
      if (stack.pop() !== map[ch]) return false;
    } else {
      stack.push(ch);
    }
  }
  return stack.length === 0;
}`,
    testCases: [
      {
        input: ['()[]{}'],
        expected: true,
        description: 'Balanced mixed brackets',
      },
      {
        input: ['(]'],
        expected: false,
        description: 'Mismatched closing bracket',
      },
      {
        input: ['{[]}'],
        expected: true,
        description: 'Nested valid brackets',
      },
      {
        input: ['['],
        expected: false,
        description: 'Single unclosed bracket',
      },
    ],
    hints: [
      'Push opening brackets onto a stack.',
      'When encountering a closing bracket, check if the top of the stack matches its opening pair.',
    ],
    xpReward: 40,
  },
  {
    id: 'coin-change-dp',
    title: 'Coin Change Minimum Count',
    subjectId: 'dsa',
    subjectTitle: 'Data Structures & Algorithms',
    difficulty: 'Medium',
    category: 'Dynamic Programming',
    language: 'javascript',
    description: `You are given an integer array \`coins\` representing coins of different denominations and an integer \`amount\` representing a total amount of money.

Return the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return \`-1\`.

You may assume that you have an infinite number of each kind of coin.`,
    examples: [
      {
        input: 'coins = [1, 2, 5], amount = 11',
        output: '3',
        explanation: '11 = 5 + 5 + 1 (3 coins)',
      },
      {
        input: 'coins = [2], amount = 3',
        output: '-1',
        explanation: '3 cannot be formed with only 2-cent coins.',
      },
      {
        input: 'coins = [1], amount = 0',
        output: '0',
      },
    ],
    constraints: [
      '1 <= coins.length <= 12',
      '1 <= coins[i] <= 2^31 - 1',
      '0 <= amount <= 10^4',
    ],
    starterCode: `/**
 * @param {number[]} coins
 * @param {number} amount
 * @return {number}
 */
function coinChange(coins, amount) {
  // Write your code here
  return -1;
}`,
    solutionSnippet: `function coinChange(coins, amount) {
  if (amount === 0) return 0;
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (i - coin >= 0) {
        dp[i] = Math.min(dp[i], dp[i - coin] + 1);
      }
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}`,
    testCases: [
      {
        input: [[1, 2, 5], 11],
        expected: 3,
        description: 'Standard denominations to 11',
      },
      {
        input: [[2], 3],
        expected: -1,
        description: 'Impossible denomination target',
      },
      {
        input: [[1], 0],
        expected: 0,
        description: 'Zero amount requires 0 coins',
      },
      {
        input: [[186, 419, 83, 408], 6249],
        expected: 20,
        description: 'Larger denomination amount',
      },
    ],
    hints: [
      'Define dp[i] as the minimum coins needed to form amount i.',
      'Base case: dp[0] = 0, all other dp entries initialized to Infinity.',
      'For each amount i from 1 to target, check dp[i] = min(dp[i], dp[i - coin] + 1).',
    ],
    xpReward: 85,
  },

  // --- PYTHON & SCRIPTING IDIOMS ---
  {
    id: 'group-anagrams',
    title: 'Group Anagrams by Character Count',
    subjectId: 'python',
    subjectTitle: 'Python & Algorithmic Scripting',
    difficulty: 'Medium',
    category: 'Hash Maps & Strings',
    language: 'javascript',
    description: `Given an array of strings \`strs\`, group the anagrams together. You can return the answer in any order, but sorted clusters inside each group are preferred.

An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.`,
    examples: [
      {
        input: 'strs = ["eat", "tea", "tan", "ate", "nat", "bat"]',
        output: '[["bat"], ["nat", "tan"], ["ate", "eat", "tea"]]',
      },
      {
        input: 'strs = [""]',
        output: '[[""]]',
      },
    ],
    constraints: [
      '1 <= strs.length <= 10^4',
      '0 <= strs[i].length <= 100',
      'strs[i] consists of lowercase English letters.',
    ],
    starterCode: `/**
 * @param {string[]} strs
 * @return {string[][]}
 */
function groupAnagrams(strs) {
  // Write your code here
  return [];
}`,
    solutionSnippet: `function groupAnagrams(strs) {
  const map = new Map();
  for (const s of strs) {
    const key = s.split('').sort().join('');
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key).push(s);
  }
  return Array.from(map.values()).map(g => g.sort()).sort((a, b) => a.length - b.length);
}`,
    testCases: [
      {
        input: [['eat', 'tea', 'tan', 'ate', 'nat', 'bat']],
        expected: [['bat'], ['nat', 'tan'], ['ate', 'eat', 'tea']],
        description: 'Multi anagram groups',
      },
      {
        input: [['a']],
        expected: [['a']],
        description: 'Single letter string',
      },
    ],
    hints: [
      'Sort each string alphabetically to form a unique canonical signature key.',
      'Group strings by this key in a Hash Map / Dictionary.',
    ],
    xpReward: 65,
  },
  {
    id: 'merge-intervals',
    title: 'Merge Overlapping Meeting Intervals',
    subjectId: 'python',
    subjectTitle: 'Python & Algorithmic Scripting',
    difficulty: 'Medium',
    category: 'Intervals & Sorting',
    language: 'javascript',
    description: `Given an array of \`intervals\` where \`intervals[i] = [start_i, end_i]\`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.`,
    examples: [
      {
        input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]',
        output: '[[1,6],[8,10],[15,18]]',
        explanation: 'Since intervals [1,3] and [2,6] overlap, merge them into [1,6].',
      },
      {
        input: 'intervals = [[1,4],[4,5]]',
        output: '[[1,5]]',
        explanation: 'Intervals [1,4] and [4,5] are considered overlapping.',
      },
    ],
    constraints: [
      '1 <= intervals.length <= 10^4',
      'intervals[i].length == 2',
      '0 <= start_i <= end_i <= 10^4',
    ],
    starterCode: `/**
 * @param {number[][]} intervals
 * @return {number[][]}
 */
function mergeIntervals(intervals) {
  // Write your code here
  return [];
}`,
    solutionSnippet: `function mergeIntervals(intervals) {
  if (!intervals.length) return [];
  intervals.sort((a, b) => a[0] - b[0]);
  const merged = [intervals[0]];
  for (let i = 1; i < intervals.length; i++) {
    const current = intervals[i];
    const last = merged[merged.length - 1];
    if (current[0] <= last[1]) {
      last[1] = Math.max(last[1], current[1]);
    } else {
      merged.push(current);
    }
  }
  return merged;
}`,
    testCases: [
      {
        input: [[[1, 3], [2, 6], [8, 10], [15, 18]]],
        expected: [[1, 6], [8, 10], [15, 18]],
        description: 'Standard overlapping meeting intervals',
      },
      {
        input: [[[1, 4], [4, 5]]],
        expected: [[1, 5]],
        description: 'Adjacent overlapping boundary',
      },
      {
        input: [[[1, 4], [0, 4]]],
        expected: [[0, 4]],
        description: 'Unsorted input intervals',
      },
    ],
    hints: [
      'First sort the intervals by their start time: intervals.sort((a, b) => a[0] - b[0]).',
      'Compare each interval start with the current merged segment end.',
    ],
    xpReward: 70,
  },

  // --- SYSTEM DESIGN & BACKEND ARCHITECTURE ---
  {
    id: 'lru-cache-design',
    title: 'LRU (Least Recently Used) Cache Design',
    subjectId: 'systems',
    subjectTitle: 'System Design & Backend Architecture',
    difficulty: 'Hard',
    category: 'Caching Algorithms',
    language: 'javascript',
    description: `Design a data structure that follows the constraints of a **Least Recently Used (LRU) cache**.

Implement the \`LRUCache\` class:
- \`LRUCache(capacity)\`: Initialize the LRU cache with positive size \`capacity\`.
- \`get(key)\`: Return the value of the \`key\` if the key exists, otherwise return \`-1\`. Both \`get\` and \`put\` must mark the key as most recently used.
- \`put(key, value)\`: Update the value of the \`key\` if the \`key\` exists. Otherwise, add the \`key-value\` pair to the cache. If the number of keys exceeds the \`capacity\` from this operation, evict the least recently used key.

Functions must run in $O(1)$ average time complexity.`,
    examples: [
      {
        input: 'cache = new LRUCache(2); cache.put(1, 1); cache.put(2, 2); cache.get(1); // returns 1; cache.put(3, 3); // evicts key 2; cache.get(2); // returns -1',
        output: '[null, null, null, 1, null, -1]',
      },
    ],
    constraints: [
      '1 <= capacity <= 3000',
      '0 <= key <= 10^4',
      '0 <= value <= 10^5',
      'At most 2 * 10^5 calls will be made to get and put.',
    ],
    starterCode: `class LRUCache {
  /**
   * @param {number} capacity
   */
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map();
  }

  /**
   * @param {number} key
   * @return {number}
   */
  get(key) {
    // Write your code here
    return -1;
  }

  /**
   * @param {number} key
   * @param {number} value
   * @return {void}
   */
  put(key, value) {
    // Write your code here
  }
}

// Wrapper for automated test runner
function testLRU(operations, args) {
  let cache = null;
  const output = [];
  for (let i = 0; i < operations.length; i++) {
    const op = operations[i];
    const arg = args[i];
    if (op === 'LRUCache') {
      cache = new LRUCache(arg[0]);
      output.push(null);
    } else if (op === 'put') {
      cache.put(arg[0], arg[1]);
      output.push(null);
    } else if (op === 'get') {
      output.push(cache.get(arg[0]));
    }
  }
  return output;
}`,
    solutionSnippet: `class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map();
  }

  get(key) {
    if (!this.map.has(key)) return -1;
    const value = this.map.get(key);
    this.map.delete(key);
    this.map.set(key, value);
    return value;
  }

  put(key, value) {
    if (this.map.has(key)) {
      this.map.delete(key);
    } else if (this.map.size >= this.capacity) {
      const oldestKey = this.map.keys().next().value;
      this.map.delete(oldestKey);
    }
    this.map.set(key, value);
  }
}`,
    testCases: [
      {
        input: [
          ['LRUCache', 'put', 'put', 'get', 'put', 'get', 'put', 'get', 'get', 'get'],
          [[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]],
        ],
        expected: [null, null, null, 1, null, -1, null, -1, 3, 4],
        description: 'Standard capacity 2 eviction flow',
      },
      {
        input: [
          ['LRUCache', 'put', 'get', 'put', 'get'],
          [[1], [2, 1], [2], [3, 2], [2]],
        ],
        expected: [null, null, 1, null, -1],
        description: 'Capacity 1 single item eviction',
      },
    ],
    hints: [
      'JavaScript Maps remember insertion order! Deleting and re-setting an entry moves it to the newest position.',
      'map.keys().next().value gives the oldest key in O(1) time.',
    ],
    xpReward: 95,
  },
  {
    id: 'token-bucket-limiter',
    title: 'Token Bucket Rate Limiter',
    subjectId: 'systems',
    subjectTitle: 'System Design & Backend Architecture',
    difficulty: 'Medium',
    category: 'Rate Limiting & APIs',
    language: 'javascript',
    description: `Implement a \`TokenBucketRateLimiter\` class commonly used in API gateways to prevent denial-of-service and throttle abusive clients.

The rate limiter has:
- \`capacity\`: Maximum number of tokens the bucket can hold.
- \`refillRatePerSec\`: Tokens replenished per second.

Implement:
- \`allowRequest(tokensRequired, currentTimestampMs)\`: Returns \`true\` if enough tokens exist and consumes them; returns \`false\` if throttled without mutating token count.`,
    examples: [
      {
        input: 'bucket = new TokenBucketRateLimiter(10, 2); bucket.allowRequest(5, 1000); // true',
        output: 'true',
      },
    ],
    constraints: [
      '1 <= capacity <= 1000',
      '1 <= refillRatePerSec <= 100',
      'currentTimestampMs is strictly non-decreasing.',
    ],
    starterCode: `class TokenBucketRateLimiter {
  constructor(capacity, refillRatePerSec) {
    this.capacity = capacity;
    this.refillRatePerSec = refillRatePerSec;
    this.tokens = capacity;
    this.lastRefillMs = 0;
  }

  allowRequest(tokensRequired, currentTimestampMs) {
    // Write your code here
    return true;
  }
}

function testRateLimiter(capacity, rate, requests) {
  const limiter = new TokenBucketRateLimiter(capacity, rate);
  return requests.map(req => limiter.allowRequest(req.tokens, req.time));
}`,
    solutionSnippet: `class TokenBucketRateLimiter {
  constructor(capacity, refillRatePerSec) {
    this.capacity = capacity;
    this.refillRatePerSec = refillRatePerSec;
    this.tokens = capacity;
    this.lastRefillMs = null;
  }

  allowRequest(tokensRequired, currentTimestampMs) {
    if (this.lastRefillMs === null) {
      this.lastRefillMs = currentTimestampMs;
    } else {
      const elapsedSeconds = (currentTimestampMs - this.lastRefillMs) / 1000;
      this.tokens = Math.min(this.capacity, this.tokens + elapsedSeconds * this.refillRatePerSec);
      this.lastRefillMs = currentTimestampMs;
    }

    if (this.tokens >= tokensRequired) {
      this.tokens -= tokensRequired;
      return true;
    }
    return false;
  }
}`,
    testCases: [
      {
        input: [
          5,
          1,
          [
            { tokens: 3, time: 0 },
            { tokens: 3, time: 500 },
            { tokens: 2, time: 2000 },
          ],
        ],
        expected: [true, false, true],
        description: 'Burst consumption followed by refill check',
      },
    ],
    hints: [
      'Calculate time elapsed since last request: (currentTimestampMs - lastRefillMs) / 1000.',
      'Replenish: Math.min(capacity, tokens + elapsed * refillRate).',
      'Only deduct tokens if tokens >= tokensRequired.',
    ],
    xpReward: 80,
  },

  // --- SQL & RELATIONAL DATABASES ---
  {
    id: 'sql-second-highest-salary',
    title: 'Second Highest Salary in Enterprise Staff',
    subjectId: 'sql',
    subjectTitle: 'SQL & Relational Databases',
    difficulty: 'Easy',
    category: 'Subqueries & Aggregations',
    language: 'javascript',
    description: `Given a table \`Employees\` with columns \`id\` and \`salary\`, write a SQL query function \`getSecondHighestSalary(employees)\` (or return the second highest salary value).

If there is no second highest salary (e.g. all employees have the identical salary or fewer than 2 employees exist), return \`null\`.`,
    examples: [
      {
        input: 'Employees = [{ id: 1, salary: 100 }, { id: 2, salary: 200 }, { id: 3, salary: 300 }]',
        output: '200',
      },
      {
        input: 'Employees = [{ id: 1, salary: 100 }]',
        output: 'null',
      },
    ],
    constraints: [
      'Salaries are positive integers.',
      'Duplicate salaries may exist.',
    ],
    starterCode: `/**
 * Returns the second highest distinct salary, or null
 * @param {Array<{id: number, salary: number}>} employees
 * @return {number|null}
 */
function getSecondHighestSalary(employees) {
  // Write your code here (mimicking SQL: SELECT DISTINCT salary FROM Employees ORDER BY salary DESC LIMIT 1 OFFSET 1)
  return null;
}`,
    solutionSnippet: `function getSecondHighestSalary(employees) {
  const distinct = Array.from(new Set(employees.map(e => e.salary))).sort((a, b) => b - a);
  return distinct.length >= 2 ? distinct[1] : null;
}`,
    testCases: [
      {
        input: [[{ id: 1, salary: 100 }, { id: 2, salary: 200 }, { id: 3, salary: 300 }]],
        expected: 200,
        description: 'Distinct three ascending salaries',
      },
      {
        input: [[{ id: 1, salary: 100 }]],
        expected: null,
        description: 'Single employee returns null',
      },
      {
        input: [[{ id: 1, salary: 200 }, { id: 2, salary: 200 }]],
        expected: null,
        description: 'Duplicate salaries with no second distinct',
      },
    ],
    hints: [
      'Equivalent to: SELECT MAX(salary) FROM Employees WHERE salary < (SELECT MAX(salary) FROM Employees).',
      'Filter out duplicates with DISTINCT / Set, sort descending, and inspect element at index 1.',
    ],
    xpReward: 40,
  },
  {
    id: 'sql-department-top-earners',
    title: 'Department Top Earners via Join & Grouping',
    subjectId: 'sql',
    subjectTitle: 'SQL & Relational Databases',
    difficulty: 'Medium',
    category: 'Table Joins & Grouping',
    language: 'javascript',
    description: `Given \`employees\` (with \`id\`, \`name\`, \`salary\`, \`departmentId\`) and \`departments\` (with \`id\`, \`name\`), write a function that finds the highest earner in each department.

Return an array of objects formatted as: \`{ department: string, employee: string, salary: number }\`, sorted by department name ascending.`,
    examples: [
      {
        input: 'employees = [...], departments = [...]',
        output: '[{ department: "IT", employee: "Max", salary: 90000 }, { department: "Sales", employee: "Henry", salary: 80000 }]',
      },
    ],
    constraints: [
      'Each department has at least one employee.',
      'In case of ties, either employee with max salary can be included.',
    ],
    starterCode: `/**
 * @param {Array<{id: number, name: string, salary: number, departmentId: number}>} employees
 * @param {Array<{id: number, name: string}>} departments
 * @return {Array<{department: string, employee: string, salary: number}>}
 */
function findDepartmentTopEarners(employees, departments) {
  // Write your query logic here
  return [];
}`,
    solutionSnippet: `function findDepartmentTopEarners(employees, departments) {
  const deptMap = new Map(departments.map(d => [d.id, d.name]));
  const deptMax = new Map();
  for (const emp of employees) {
    const current = deptMax.get(emp.departmentId);
    if (!current || emp.salary > current.salary) {
      deptMax.set(emp.departmentId, emp);
    }
  }
  const result = [];
  for (const [deptId, emp] of deptMax.entries()) {
    result.push({
      department: deptMap.get(deptId) || 'Unknown',
      employee: emp.name,
      salary: emp.salary,
    });
  }
  return result.sort((a, b) => a.department.localeCompare(b.department));
}`,
    testCases: [
      {
        input: [
          [
            { id: 1, name: 'Joe', salary: 70000, departmentId: 1 },
            { id: 2, name: 'Jim', salary: 90000, departmentId: 1 },
            { id: 3, name: 'Henry', salary: 80000, departmentId: 2 },
            { id: 4, name: 'Sam', salary: 60000, departmentId: 2 },
          ],
          [
            { id: 1, name: 'IT' },
            { id: 2, name: 'Sales' },
          ],
        ],
        expected: [
          { department: 'IT', employee: 'Jim', salary: 90000 },
          { department: 'Sales', employee: 'Henry', salary: 80000 },
        ],
        description: 'Multi department join and highest earner extraction',
      },
    ],
    hints: [
      'Group employees by departmentId and find the max salary record in each group.',
      'Join against the departments table to retrieve the human-readable department name.',
    ],
    xpReward: 65,
  },
];
