# Section 1: Hello MCP - Your First Server

Welcome to your first MCP server! In this section, you'll build and test a simple echo server.

## Learning Objectives

By completing this exercise, you will be able to:
- Create a basic MCP server that exposes a tool
- Handle tool listing and execution requests
- Test your MCP server using the Inspector

## Exercise: Build an Echo Tool

**Problem:** You want to create an MCP server with a tool that AI assistants can use to echo messages back.

This exercise uses **automated tests** to give you fast feedback. After each part, you'll run `pnpm test` to verify your implementation is correct. This test-driven approach helps you learn faster!

### Part 1: Setup and Run the Starter Code

**Step 1:** Install the dependencies
```bash
pnpm install
```

**Step 2:** Build the TypeScript code
```bash
pnpm run build
```

**Step 3:** Test the server using the MCP Inspector
```bash
pnpm dlx @modelcontextprotocol/inspector node build/index.js
```

A browser window will open. In the Inspector:
- Click on "Tools" in the left sidebar
- You should see the "echo" tool listed
- Click the "Test" button
- Enter a message like "Hello MCP!"
- Click "Run" and observe the response

**What you should see:** The server returns `Echo: Hello MCP!`

### Part 2: Modify the Echo Format

**Problem:** The current format `Echo: <message>` is boring. Change it to `You said: <message>`.

**Step 4:** Open [src/index.ts](src/index.ts) and find the `registerTool` handler (around line 44)

**Step 5:** Find this line:
```typescript
text: `Echo: ${message}`,
```

**Step 6:** Change it to:
```typescript
text: `You said: ${message}`,
```

**Step 7:** Rebuild and run the automated tests:
```bash
pnpm run build
pnpm test
```

You should see a passing test for Part 2. The test verifies that your echo format is correct.

**Step 8 (Optional):** Manually test in the Inspector:
```bash
pnpm dlx @modelcontextprotocol/inspector node build/index.js
```

Test the tool again with "Hello MCP!" and verify it now returns `You said: Hello MCP!`

### Part 3: Add Message Length Validation

**Problem:** Users might send extremely long messages. Add validation to reject messages longer than 100 characters.

**Step 9:** In the handler function, add a length check before returning:
```typescript
async ({ message }: { message: string }) => {
  if (message.length > 100) {
    throw new Error("Message must be 100 characters or less");
  }

  return {
    // ... rest of your code
  };
}
```

**Step 10:** Rebuild and run the tests:
```bash
pnpm run build
pnpm test
```

The tests will verify that:
- Messages with 101+ characters are rejected
- Messages with exactly 100 characters are accepted

### Part 4: Add an Uppercase Option

**Problem:** Sometimes users want their echo to be in uppercase. Add an optional `uppercase` parameter.

**Step 11:** Update the `inputSchema` to include a new optional `uppercase` property:
```typescript
inputSchema: {
  message: z.string().describe("The message to echo back"),
  uppercase: z.boolean().optional().describe("Convert the message to uppercase"),
},
```

**Step 12:** Update the handler to use the uppercase parameter:
```typescript
async ({ message, uppercase }: { message: string; uppercase?: boolean }) => {
  if (message.length > 100) {
    throw new Error("Message must be 100 characters or less");
  }

  const responseText = uppercase ? message.toUpperCase() : message;

  return {
    content: [
      {
        type: "text",
        text: `You said: ${responseText}`,
      },
    ],
  };
}
```

**Step 13:** Rebuild and run all tests:
```bash
pnpm run build
pnpm test
```

If all tests pass, you'll see:
```
✓ Part 1: Server starts and responds to ListTools
✓ Part 2: Echo format changed to "You said: "
✓ Part 3: Message length validation (rejects >100 chars)
✓ Part 3: Message length validation (accepts ≤100 chars)
✓ Part 4: Uppercase parameter (false)
✓ Part 4: Uppercase parameter (true)
✓ Part 4: Uppercase parameter (optional)

🎉 All tests passed! You completed Section 1!
```

The tests verify that:
- `uppercase: false` keeps the original case
- `uppercase: true` converts to uppercase
- The parameter is optional (works when omitted)

## Review Questions

Answer these questions based on the code you just wrote:

1. **In Part 2, you changed the echo format. What property of the return object did you modify?**
   <details>
   <summary>Answer</summary>
   The `text` property inside the `content` array.
   </details>

2. **In Part 3, what happens when a user sends a message with 101 characters?**
   <details>
   <summary>Answer</summary>
   The code throws an Error with the message "Message must be 100 characters or less", which the MCP client will receive as an error response.
   </details>

3. **In Part 4, you added an `uppercase` parameter. What Zod method did you use to make it optional?**
   <details>
   <summary>Answer</summary>
   `.optional()` - this makes the field not required, so the tool works whether or not the user provides this parameter.
   </details>

4. **Look at your handler code. What line of code actually converts the message to uppercase?**
   <details>
   <summary>Answer</summary>
   `const responseText = uppercase ? message.toUpperCase() : message;` - this uses a ternary operator to conditionally call `.toUpperCase()` based on the uppercase parameter.
   </details>

5. **After modifying the TypeScript code, what command must you always run before testing?**
   <details>
   <summary>Answer</summary>
   `pnpm run build` - this compiles your TypeScript code to JavaScript that Node.js can execute.
   </details>

## Troubleshooting

**"Module not found" errors**: Run `pnpm install` first

**"Command not found: node"**: Make sure Node.js is installed

**Changes not working**: Remember to run `pnpm run build` after editing TypeScript files

**Tests failing**: The error message will tell you what's wrong. Read it carefully and check your code

**Inspector shows old behavior**: Make sure you stopped the previous Inspector session and restarted it after rebuilding

## What's Next?

Once you've completed this exercise, you're ready to explore more MCP concepts. Future sections will cover:
- Resources (exposing data to AI models)
- Prompts (reusable prompt templates)
- Multiple tools in one server
- Error handling patterns
- Real-world use cases
