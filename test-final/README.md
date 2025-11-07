# final-test-server

Final test in current directory

## Quick Start

```bash
npm install
npm run dev
```

## Scripts

- `npm run build` - Compile TypeScript
- `npm run dev` - Development mode with hot reload
- `npm start` - Run compiled server

## MCP Configuration

Add to your VS Code/Cursor settings:

```json
{
  "mcp.servers": {
    "final-test-server": {
      "command": "node",
      "args": ["path/to/dist/index.js"]
    }
  }
}
```

## Development

See `src/tools/` for example implementations.
