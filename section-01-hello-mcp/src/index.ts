#!/usr/bin/env node

/**
 * Section 1: Hello MCP Server
 *
 * This is your first MCP server! It demonstrates the basic structure
 * of an MCP server and exposes a simple "echo" tool.
 *
 * Key concepts:
 * - Server initialization with McpServer
 * - Tool registration with registerTool()
 * - Input validation with Zod schemas
 * - stdio transport
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

/**
 * Step 1: Create the MCP Server
 * The McpServer class is the core of any MCP server.
 */
const server = new McpServer({
  name: "section-01-hello-mcp",
  version: "1.0.0",
});

/**
 * Step 2: Register the echo tool
 * server.registerTool() takes three arguments:
 * 1. Tool name
 * 2. Configuration object (description, input schema)
 * 3. Handler function that receives validated arguments
 */
server.registerTool(
  "echo",
  {
    description:
      "Echoes back the message you send. A simple tool to test MCP communication.",
    inputSchema: {
      message: z.string().describe("The message to echo back"),
    },
  },
  async ({ message }: { message: string }) => {
    return {
      content: [
        {
          type: "text",
          text: `Echo: ${message}`,
        },
      ],
    };
  }
);

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
