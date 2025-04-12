#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { fetchProjects, fetchLibraryDocumentation } from "./lib/api.js";
import { formatProjectsList, rerankProjects } from "./lib/utils.js";

// Create server instance
const server = new McpServer({
  name: "Takos",
  description: "Retrieves up-to-date documentation and code examples for any library.",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

// Register Takos tools
server.tool(
  "resolve-library-id",
  "Required first step: Resolves a general package name into a Takos-compatible library ID. Must be called before using 'get-library-docs' to retrieve a valid Takos-compatible library ID.",
  {
    libraryName: z
      .string()
      .optional()
      .describe("Optional library name to search for and rerank results based on."),
  },
  async ({ libraryName }) => {
    const projects = await fetchProjects();

    if (!projects) {
      return {
        content: [
          {
            type: "text",
            text: "Failed to retrieve library documentation data from Takos",
          },
        ],
      };
    }

    // Filter projects to only include those with state "finalized"
    const finalizedProjects = projects.filter((project) => project.version.state === "finalized");

    if (finalizedProjects.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: "No finalized documentation libraries available",
          },
        ],
      };
    }

    // Rerank projects if a library name is provided
    const rankedProjects = libraryName
      ? rerankProjects(finalizedProjects, libraryName)
      : finalizedProjects;

    const projectsText = formatProjectsList(rankedProjects);

    return {
      content: [
        {
          type: "text",
          text: "Available libraries and their Takos-compatible library ID:\n\n" + projectsText,
        },
      ],
    };
  }
);

server.tool(
  "get-library-docs",
  "Fetches up-to-date documentation for a library. You must call 'resolve-library-id' first to obtain the exact Takos-compatible library ID required to use this tool.",
  {
    context7CompatibleLibraryID: z
      .string()
      .describe(
        "Exact Takos-compatible library ID (e.g., 'mongodb/docs', 'vercel/nextjs') retrieved from 'resolve-library-id'."
      ),
    topic: z
      .string()
      .optional()
      .describe("Topic to focus documentation on (e.g., 'hooks', 'routing')."),
    tokens: z
      .number()
      .min(5000)
      .optional()
      .describe(
        "Maximum number of tokens of documentation to retrieve (default: 5000). Higher values provide more context but consume more tokens."
      ),
  },
  async ({ context7CompatibleLibraryID, tokens = 5000, topic = "" }) => {
    const documentationText = await fetchLibraryDocumentation(
      context7CompatibleLibraryID,
      tokens,
      topic
    );

    if (!documentationText) {
      return {
        content: [
          {
            type: "text",
            text: "Documentation not found or not finalized for this library. This might have happened because you used an invalid Takos-compatible library ID. To get a valid Takos-compatible library ID, use the 'resolve-library-id' with the package name you wish to retrieve documentation for.",
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: documentationText,
        },
      ],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Takos Documentation MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
