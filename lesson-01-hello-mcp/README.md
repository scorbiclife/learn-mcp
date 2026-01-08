# Lesson 1: Hello MCP - Your First Server

Welcome to your first MCP server! In this lesson, you'll learn the fundamentals of MCP by building and testing a simple echo server.

## Learning Objectives

By the end of this lesson, you will be able to:
1. ✅ Explain what the Model Context Protocol (MCP) is and its purpose
2. ✅ Understand the client-server architecture of MCP
3. ✅ Identify the three core MCP primitives (we'll focus on Tools in this lesson)
4. ✅ Create and run a basic MCP server
5. ✅ Connect your server to an MCP host and test it

## Core Concepts

### What is MCP?

The Model Context Protocol is an open standard that enables AI models to securely connect to data sources and tools. Think of it as USB-C for AI - a universal connector.

**Key Benefits:**
- **Standardization**: One protocol works with any MCP-compatible AI application
- **Security**: Controlled access to your data and tools
- **Flexibility**: Connect to databases, APIs, file systems, and more

### The Architecture

```
┌─────────────────┐
│   MCP Host      │  (e.g., Claude Desktop, VS Code)
│  ┌───────────┐  │
│  │MCP Client │  │
└──┴─────┬─────┴──┘
         │ stdio/SSE
         │
┌────────▼────────┐
│   MCP Server    │  (Your code!)
│                 │
│  Tools          │
│  Resources      │
│  Prompts        │
└─────────────────┘
```

### The Three Primitives

MCP servers can expose three types of functionality:

1. **Tools**: Functions the AI can call (e.g., search, calculate, API calls)
2. **Resources**: Data the AI can read (e.g., files, database records)
3. **Prompts**: Reusable prompt templates

Today we're focusing on **Tools**.

## Exercise: Build and Test Your Echo Server

### Step 1: Install Dependencies

```bash
cd lesson-01-hello-mcp
npm install
```

### Step 2: Build the Server

```bash
npm run build
```

This compiles your TypeScript code to JavaScript in the `build/` directory.

### Step 3: Understand the Code

Open [src/index.ts](src/index.ts) and review the three main steps:

1. **Server Creation** (lines 27-37): Initialize the MCP server with metadata
2. **Request Handlers** (lines 47-84): Define what tools are available and how they work
3. **Transport Setup** (lines 90-98): Start the server using stdio communication

### Step 4: Test the Server

You have three options to test your server:

#### Option A: Using the MCP Inspector (Recommended for Beginners)

The MCP Inspector is a debugging tool that lets you interact with your server visually.

```bash
npx @modelcontextprotocol/inspector node build/index.js
```

This will:
1. Start your MCP server
2. Open a web interface in your browser
3. Let you see available tools and test them

In the Inspector:
- Click on "Tools" to see your echo tool
- Click "Test" and enter a message like "Hello MCP!"
- See the response

#### Option B: Using Claude Desktop

1. Make sure Claude Desktop is installed
2. Edit your Claude Desktop config file:
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

3. Add your server:

```json
{
  "mcpServers": {
    "hello-mcp": {
      "command": "node",
      "args": [
        "/Volumes/Dev/learn-mcp/lesson-01-hello-mcp/build/index.js"
      ]
    }
  }
}
```

4. Restart Claude Desktop
5. Look for the 🔌 icon - you should see your server connected
6. Ask Claude: "Use the echo tool to repeat 'MCP is working!'"

#### Option C: Manual Testing with Node

For debugging, you can test the tool invocation manually:

```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | node build/index.js
```

### Step 5: Experiment

Try modifying the server:

1. **Change the echo format**: Instead of `Echo: ${message}`, try `You said: ${message}`
2. **Add validation**: What happens if someone sends a very long message? Add a length check.
3. **Add a second parameter**: Add an optional `uppercase` boolean parameter that converts the message to uppercase

Remember to rebuild after changes: `npm run build`

## Review Questions

Test your understanding:

1. **What are the three core primitives in MCP?**
   <details>
   <summary>Answer</summary>
   Tools (functions to call), Resources (data to read), and Prompts (reusable templates)
   </details>

2. **Why does MCP use stdio (standard input/output) for communication?**
   <details>
   <summary>Answer</summary>
   stdio allows MCP servers to run as child processes, which provides security isolation and works across different operating systems without network configuration
   </details>

3. **What are the two request types our echo server handles?**
   <details>
   <summary>Answer</summary>
   ListToolsRequest (to tell clients what tools are available) and CallToolRequest (to execute a specific tool)
   </details>

4. **In the code, what does `inputSchema` define?**
   <details>
   <summary>Answer</summary>
   It defines the parameters the tool accepts, using JSON Schema format. This tells the AI what information it needs to provide when calling the tool.
   </details>

5. **What would happen if you forgot to call `server.connect(transport)`?**
   <details>
   <summary>Answer</summary>
   The server would initialize but never actually start listening for requests. It wouldn't be able to communicate with any MCP clients.
   </details>

## What's Next?

In Lesson 2, we'll explore **Resources** - how to expose data (like files or database records) to AI models through MCP.

You'll learn:
- The difference between Tools and Resources
- How to list and read resources
- Working with URIs and templates
- Building a file system browser

## Troubleshooting

**"Module not found" errors**: Run `npm install` first
**"Command not found: node"**: Make sure Node.js is installed
**Server not appearing in Claude Desktop**: Check the config file path and JSON syntax
**Changes not working**: Remember to run `npm run build` after editing TypeScript files

## Additional Resources

- [MCP Documentation](https://modelcontextprotocol.io)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP Servers Repository](https://github.com/modelcontextprotocol/servers)
