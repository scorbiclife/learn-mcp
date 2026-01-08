#!/usr/bin/env node

/**
 * Lesson 1: Hello MCP Server
 *
 * This is your first MCP server! It demonstrates the basic structure
 * of an MCP server and exposes a simple "echo" tool.
 *
 * Key concepts:
 * - Server initialization
 * - Tool registration
 * - Request handling
 * - stdio transport
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

/**
 * Step 1: Create the MCP Server
 * The Server class is the core of any MCP server.
 */
const server = new Server(
  {
    name: "lesson-01-hello-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {}, // This server provides tools
    },
  }
);

/**
 * Step 2: Register Tool Handlers
 * MCP uses a request/response pattern. We need to handle two types of requests:
 * 1. ListTools - tells the client what tools are available
 * 2. CallTool - executes a specific tool
 */

// Handler for listing available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "echo",
        description: "Echoes back the message you send. A simple tool to test MCP communication.",
        inputSchema: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "The message to echo back",
            },
          },
          required: ["message"],
        },
      },
    ],
  };
});

// Handler for executing tools
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "echo") {
    const message = args?.message as string;

    if (!message) {
      throw new Error("Message parameter is required");
    }

    return {
      content: [
        {
          type: "text",
          text: `Echo: ${message}`,
        },
      ],
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

/**
 * Step 3: Start the Server
 * MCP servers communicate over stdio (standard input/output).
 * This allows them to be spawned as child processes by MCP hosts.
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // The server is now running and waiting for requests!
  console.error("Hello MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
