import { TestCase, TestResult, RunResult } from '../types';

/**
 * Deep equality checker for test assertions
 */
export function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') {
    return false;
  }
  if (Array.isArray(a) !== Array.isArray(b)) {
    return false;
  }
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) {
    return false;
  }
  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }
  return true;
}

/**
 * Extracts the primary function name or entrypoint from code snippet
 */
function extractPrimaryFunctionName(code: string): string | null {
  // Check for test helper wrapper first like testLRU or testRateLimiter
  if (code.includes('function testLRU')) return 'testLRU';
  if (code.includes('function testRateLimiter')) return 'testRateLimiter';

  // Regular function declaration: function fnName(
  const fnMatch = code.match(/function\s+([a-zA-Z0-9_$]+)\s*\(/);
  if (fnMatch) return fnMatch[1];

  // const/let/var fnName =
  const varFnMatch = code.match(/(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*(?:function|\([^)]*\)\s*=>)/);
  if (varFnMatch) return varFnMatch[1];

  // Class declaration
  const classMatch = code.match(/class\s+([a-zA-Z0-9_$]+)/);
  if (classMatch) return classMatch[1];

  return null;
}

/**
 * Executes user code against a set of test cases safely in-browser
 */
export async function runTestCases(userCode: string, testCases: TestCase[]): Promise<RunResult> {
  const logs: string[] = [];
  const testResults: TestResult[] = [];
  const startTime = performance.now();

  // Custom log interceptor
  const originalLog = console.log;
  const customLog = (...args: any[]) => {
    logs.push(args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg))).join(' '));
  };

  try {
    const fnName = extractPrimaryFunctionName(userCode);
    if (!fnName) {
      return {
        success: false,
        allPassed: false,
        results: [],
        logs: ['Error: Could not identify a function or class to execute in your code.'],
        totalTimeMs: 0,
        error: 'No executable function found. Ensure you declare a function.',
      };
    }

    // Compile the user code in an isolated scope
    const wrappedCode = `
      ${userCode};
      return typeof ${fnName} !== 'undefined' ? ${fnName} : null;
    `;

    // Intercept console.log during function compilation & execution
    console.log = customLog;
    let targetFn: any;
    try {
      const factory = new Function(wrappedCode);
      targetFn = factory();
    } catch (syntaxErr: any) {
      console.log = originalLog;
      return {
        success: false,
        allPassed: false,
        results: [],
        logs: [`Syntax/Compilation Error: ${syntaxErr.message}`],
        totalTimeMs: Math.round(performance.now() - startTime),
        error: syntaxErr.message,
      };
    }

    if (!targetFn) {
      console.log = originalLog;
      return {
        success: false,
        allPassed: false,
        results: [],
        logs: [`Failed to bind identifier '${fnName}'.`],
        totalTimeMs: Math.round(performance.now() - startTime),
        error: `Failed to bind target function: ${fnName}`,
      };
    }

    // Execute each test case
    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      const testStart = performance.now();
      let actual: any;
      let passed = false;
      let errMessage: string | undefined;

      try {
        // Deep clone input args to prevent mutations between runs
        const inputClone = JSON.parse(JSON.stringify(tc.input));
        const callResult = targetFn(...inputClone);

        // If returned a Promise, await it
        if (callResult && typeof callResult.then === 'function') {
          actual = await Promise.race([
            callResult,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Execution timed out after 3000ms')), 3000)),
          ]);
        } else {
          actual = callResult;
        }

        passed = deepEqual(actual, tc.expected);
      } catch (err: any) {
        passed = false;
        errMessage = err.message || String(err);
      }

      const duration = performance.now() - testStart;
      testResults.push({
        testIndex: i,
        passed,
        input: tc.input,
        expected: tc.expected,
        actual: actual !== undefined ? actual : errMessage,
        executionTimeMs: Math.round(duration * 100) / 100,
        error: errMessage,
      });
    }

    console.log = originalLog;
    const totalTimeMs = Math.round(performance.now() - startTime);
    const allPassed = testResults.every(r => r.passed);

    return {
      success: true,
      allPassed,
      results: testResults,
      logs,
      totalTimeMs,
    };
  } catch (fatalErr: any) {
    console.log = originalLog;
    return {
      success: false,
      allPassed: false,
      results: testResults,
      logs: [...logs, `Fatal Error: ${fatalErr.message}`],
      totalTimeMs: Math.round(performance.now() - startTime),
      error: fatalErr.message,
    };
  } finally {
    console.log = originalLog;
  }
}

/**
 * Freeform code runner for the Playground
 */
export async function runFreeformCode(code: string): Promise<{ logs: string[]; result: any; timeMs: number; error?: string }> {
  const logs: string[] = [];
  const start = performance.now();
  const originalLog = console.log;

  console.log = (...args: any[]) => {
    logs.push(args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg))).join(' '));
  };

  try {
    const wrapped = `
      return (async () => {
        ${code}
      })();
    `;
    const fn = new Function(wrapped);
    const res = await fn();
    const timeMs = Math.round((performance.now() - start) * 100) / 100;
    return {
      logs,
      result: res,
      timeMs,
    };
  } catch (err: any) {
    return {
      logs,
      result: undefined,
      timeMs: Math.round((performance.now() - start) * 100) / 100,
      error: err.message || String(err),
    };
  } finally {
    console.log = originalLog;
  }
}
