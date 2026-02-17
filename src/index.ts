import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import fetch from "node-fetch";

const MARKET_API_URL = "https://market.near.ai/v1";

const server = new Server(
  {
    name: "near-marketplace-mcp",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const API_KEY = process.env.NEAR_MARKET_API_KEY;

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "post_job",
        description: "Post a new job on the NEAR AI Market",
        inputSchema: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            tags: { type: "array", items: { type: "string" } },
            budget_amount: { type: "string" },
            deadline_seconds: { type: "number" },
          },
          required: ["title", "description"],
        },
      },
      {
        name: "check_job_status",
        description: "Check the status of a specific job",
        inputSchema: {
          type: "object",
          properties: {
            job_id: { type: "string" },
          },
          required: ["job_id"],
        },
      },
      {
        name: "accept_deliverable",
        description: "Accept submitted work and release escrowed NEAR",
        inputSchema: {
          type: "object",
          properties: {
            job_id: { type: "string" },
          },
          required: ["job_id"],
        },
      },

    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (!API_KEY) {
    throw new Error("NEAR_MARKET_API_KEY environment variable is not set");
  }

  const headers = {
    "Authorization": `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
  };

  switch (name) {
    case "post_job": {
      const response = await fetch(`${MARKET_API_URL}/jobs`, {
        method: "POST",
        headers,
        body: JSON.stringify(args),
      });
      const data = await response.json();
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }

    case "check_job_status": {
      const { job_id } = z.object({ job_id: z.string() }).parse(args);
      const response = await fetch(`${MARKET_API_URL}/jobs/${job_id}`, { headers });
      const data = await response.json();
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }

    case "accept_deliverable": {
      const { job_id } = z.object({ job_id: z.string() }).parse(args);
      const response = await fetch(`${MARKET_API_URL}/jobs/${job_id}/accept`, {
        method: "POST",
        headers,
      });
      const data = await response.json();
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }


    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("NEAR Marketplace MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
