# Takos MCP - Up-to-date Docs For Any Cursor Prompt

## ❌ Without Takos

LLMs rely on outdated or generic information about the libraries you use. You get:

- ❌ Code examples are outdated and based on year-old training data
- ❌ Hallucinated APIs don't even exist
- ❌ Generic answers for old package versions

## ✅ With Takos

Takos MCP pulls up-to-date, version-specific documentation and code examples straight from the source — and places them directly into your prompt.

Add `use takos` to your question in Cursor:

```
"How do I use the new Next.js `after` function? use takos"
```

```
"How do I invalidate a query in React Query? use takos"
```

```
"How do I protect a route with NextAuth? use takos"
```

Takos fetches up-to-date documentation and working code examples right into your LLM's context.

- 1️⃣ Ask your question naturally
- 2️⃣ Tell the LLM to `use takos`
- 3️⃣ Get working code answers

No tab-switching, no hallucinated APIs that don't exist, no outdated code generations.

## 🛠️ Getting Started

### Requirements

- Node.js >= v18.0.0
- Cursor, Windsurf, Claude Desktop or another MCP Client

### Install in Cursor

Go to: `Settings` -> `Cursor Settings` -> `MCP` -> `Add new global MCP server`

Paste this into your Cursor `~/.cursor/mcp.json` file. See [Cursor MCP docs](https://docs.cursor.com/context/model-context-protocol) for more info. 

```json
{
  "mcpServers": {
    "takos": {
      "command": "npx",
      "args": ["-y", "@takosai/takos-mcp"]
    }
  }
}
```

### Install in Windsurf

Add this to your Windsurf MCP config file. See [Windsurf MCP docs](https://docs.windsurf.com/windsurf/mcp) for more info.

```json
{
  "mcpServers": {
    "takos": {
      "command": "npx",
      "args": ["-y", "@takosai/takos-mcp"]
    }
  }
}
```

### Available Tools

- `resolve-library-id`: Resolves a general library name into a Takos-compatible library ID.
  - `libraryName` (optional): Search and rerank results
- `get-library-docs`: Fetches documentation for a library using a Takos-compatible library ID.
  - `context7CompatibleLibraryID` (required)
  - `topic` (optional): Focus the docs on a specific topic (e.g., "routing", "hooks")
  - `tokens` (optional, default 5000): Max number of tokens to return

## Development

Clone the project and install dependencies:

```bash
bun i
```

Build:

```bash
bun run build
```

### Local Configuration Example

```json
{
  "mcpServers": {
    "takos": {
      "command": "npx",
      "args": ["tsx", "/path/to/folder/takos-mcp/src/index.ts"]
    }
  }
}
```

### Testing with MCP Inspector

```bash
npx -y @modelcontextprotocol/inspector npx @takosai/takos-mcp
```

## License

MIT
