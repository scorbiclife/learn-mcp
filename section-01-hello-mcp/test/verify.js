#!/usr/bin/env node

/**
 * Automated verification script for Section 1 exercises
 *
 * This script tests your MCP server implementation to provide
 * fast feedback on whether each step is completed correctly.
 */

import { spawn } from 'child_process';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Sends a JSON-RPC request to the MCP server and returns the response
 */
function sendRequest(serverProcess, request) {
  return new Promise((resolve, reject) => {
    let stdout = '';
    let stderr = '';
    let timeout;

    const cleanup = () => {
      clearTimeout(timeout);
      serverProcess.stdout.removeAllListeners();
      serverProcess.stderr.removeAllListeners();
    };

    timeout = setTimeout(() => {
      cleanup();
      reject(new Error('Request timed out after 5 seconds'));
    }, 5000);

    serverProcess.stdout.on('data', (data) => {
      stdout += data.toString();

      // Try to parse each line as JSON-RPC response
      const lines = stdout.split('\n');
      for (const line of lines) {
        if (line.trim()) {
          try {
            const response = JSON.parse(line);
            if (response.id === request.id) {
              cleanup();
              resolve(response);
              return;
            }
          } catch (e) {
            // Not valid JSON yet, keep accumulating
          }
        }
      }
    });

    serverProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    serverProcess.stdin.write(JSON.stringify(request) + '\n');
  });
}

/**
 * Start the MCP server
 */
function startServer() {
  const serverPath = join(projectRoot, 'build', 'index.js');
  return spawn('node', [serverPath], {
    stdio: ['pipe', 'pipe', 'pipe'],
  });
}

/**
 * Test suite
 */
const tests = [
  {
    name: 'Part 1: Server starts and responds to ListTools',
    async run() {
      const server = startServer();

      try {
        const response = await sendRequest(server, {
          jsonrpc: '2.0',
          id: 1,
          method: 'tools/list',
          params: {},
        });

        if (!response.result || !response.result.tools) {
          throw new Error('Expected tools list in response');
        }

        const echoTool = response.result.tools.find(t => t.name === 'echo');
        if (!echoTool) {
          throw new Error('Expected "echo" tool to be listed');
        }

        return { passed: true, message: 'Server responds with echo tool' };
      } finally {
        server.kill();
      }
    },
  },
  {
    name: 'Part 2: Echo format changed to "You said: "',
    async run() {
      const server = startServer();

      try {
        const response = await sendRequest(server, {
          jsonrpc: '2.0',
          id: 2,
          method: 'tools/call',
          params: {
            name: 'echo',
            arguments: { message: 'Hello MCP!' },
          },
        });

        if (!response.result || !response.result.content) {
          throw new Error('Expected content in response');
        }

        const text = response.result.content[0]?.text;
        if (!text) {
          throw new Error('Expected text in response content');
        }

        if (!text.startsWith('You said: ')) {
          throw new Error(`Expected format "You said: ...", got "${text}"`);
        }

        return { passed: true, message: 'Echo format is correct' };
      } finally {
        server.kill();
      }
    },
  },
  {
    name: 'Part 3: Message length validation (rejects >100 chars)',
    async run() {
      const server = startServer();

      try {
        const longMessage = 'a'.repeat(101);
        const response = await sendRequest(server, {
          jsonrpc: '2.0',
          id: 3,
          method: 'tools/call',
          params: {
            name: 'echo',
            arguments: { message: longMessage },
          },
        });

        if (!response.error) {
          throw new Error('Expected error for message longer than 100 characters');
        }

        if (!response.error.message.includes('100')) {
          throw new Error('Error message should mention the 100 character limit');
        }

        return { passed: true, message: 'Length validation works correctly' };
      } finally {
        server.kill();
      }
    },
  },
  {
    name: 'Part 3: Message length validation (accepts ≤100 chars)',
    async run() {
      const server = startServer();

      try {
        const validMessage = 'a'.repeat(100);
        const response = await sendRequest(server, {
          jsonrpc: '2.0',
          id: 4,
          method: 'tools/call',
          params: {
            name: 'echo',
            arguments: { message: validMessage },
          },
        });

        if (response.error) {
          throw new Error(`Expected success for 100 char message, got error: ${response.error.message}`);
        }

        return { passed: true, message: 'Accepts messages with exactly 100 characters' };
      } finally {
        server.kill();
      }
    },
  },
  {
    name: 'Part 4: Uppercase parameter (false)',
    async run() {
      const server = startServer();

      try {
        const response = await sendRequest(server, {
          jsonrpc: '2.0',
          id: 5,
          method: 'tools/call',
          params: {
            name: 'echo',
            arguments: { message: 'Hello MCP!', uppercase: false },
          },
        });

        if (response.error) {
          throw new Error(`Expected success, got error: ${response.error.message}`);
        }

        const text = response.result.content[0]?.text;
        if (text !== 'You said: Hello MCP!') {
          throw new Error(`Expected "You said: Hello MCP!", got "${text}"`);
        }

        return { passed: true, message: 'Lowercase mode works' };
      } finally {
        server.kill();
      }
    },
  },
  {
    name: 'Part 4: Uppercase parameter (true)',
    async run() {
      const server = startServer();

      try {
        const response = await sendRequest(server, {
          jsonrpc: '2.0',
          id: 6,
          method: 'tools/call',
          params: {
            name: 'echo',
            arguments: { message: 'Hello MCP!', uppercase: true },
          },
        });

        if (response.error) {
          throw new Error(`Expected success, got error: ${response.error.message}`);
        }

        const text = response.result.content[0]?.text;
        if (text !== 'You said: HELLO MCP!') {
          throw new Error(`Expected "You said: HELLO MCP!", got "${text}"`);
        }

        return { passed: true, message: 'Uppercase mode works' };
      } finally {
        server.kill();
      }
    },
  },
  {
    name: 'Part 4: Uppercase parameter (optional)',
    async run() {
      const server = startServer();

      try {
        const response = await sendRequest(server, {
          jsonrpc: '2.0',
          id: 7,
          method: 'tools/call',
          params: {
            name: 'echo',
            arguments: { message: 'Hello MCP!' },
          },
        });

        if (response.error) {
          throw new Error(`Expected success when uppercase is omitted, got error: ${response.error.message}`);
        }

        return { passed: true, message: 'Uppercase parameter is optional' };
      } finally {
        server.kill();
      }
    },
  },
];

/**
 * Run all tests
 */
async function runTests() {
  log('\n🧪 Running Section 1 Verification Tests\n', 'blue');

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await test.run();
      if (result.passed) {
        log(`✓ ${test.name}`, 'green');
        if (result.message) {
          log(`  ${result.message}`, 'green');
        }
        passed++;
      } else {
        log(`✗ ${test.name}`, 'red');
        if (result.message) {
          log(`  ${result.message}`, 'red');
        }
        failed++;
      }
    } catch (error) {
      log(`✗ ${test.name}`, 'red');
      log(`  ${error.message}`, 'red');
      failed++;
    }
  }

  log(`\n${'='.repeat(50)}`, 'blue');
  log(`Results: ${passed} passed, ${failed} failed`, passed === tests.length ? 'green' : 'yellow');

  if (passed === tests.length) {
    log('\n🎉 All tests passed! You completed Section 1!', 'green');
  } else {
    log('\n💡 Keep going! Fix the failing tests and run "pnpm test" again.', 'yellow');
  }

  process.exit(failed > 0 ? 1 : 0);
}

// Check if build directory exists
try {
  readFileSync(join(projectRoot, 'build', 'index.js'));
} catch (error) {
  log('❌ Build directory not found. Run "pnpm build" first!', 'red');
  process.exit(1);
}

runTests().catch((error) => {
  log(`\n❌ Test runner error: ${error.message}`, 'red');
  process.exit(1);
});
