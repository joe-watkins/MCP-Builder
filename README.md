# MCP Server Builder

A minimalist MCP server that scaffolds basic MCP server projects for VS Code and Cursor.

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
    "mcp-server-builder": {
      "command": "node",
      "args": ["path/to/dist/index.js"]
    }
  }
}
```

## Usage

Once configured, use the `create_mcp_server` tool to generate new MCP server projects:

- **name** (required): Project name (kebab-case recommended)
- **description** (optional): Project description  
- **author** (optional): Author name
- **outputPath** (optional): Target directory (defaults to current working directory)
- **includeResources** (optional): Force include resources capability (default: false)
- **analyzeFiles** (optional): File paths to analyze for auto-determining capabilities
- **createSubdirectory** (optional): Create project in new subdirectory (default: false)

### 🧠 Intelligent File Analysis

The builder can analyze your files to automatically determine what capabilities to include:

```json
{
  "name": "my-smart-server",
  "analyzeFiles": ["./data.json", "./config.yaml", "./docs/"]
}
```

**Auto-detects Resources for:**
- Data files: `.json`, `.yaml`, `.xml`, `.csv`, `.txt`, `.md`
- Config files: `.config`, `.env`, files named "config"
- Directories containing data files
- Files with structured content (JSON/YAML patterns)

### 📁 Directory Behavior

**Default (Current Directory):**
```json
{
  "name": "my-server"
}
```
→ Creates files directly in current directory

**Subdirectory Mode:**
```json
{
  "name": "my-server",
  "createSubdirectory": true
}
```
→ Creates `./my-server/` subdirectory with files

## Generated Project Features

- TypeScript with strict configuration
- MCP SDK integration with best practices
- Example tool implementation
- VS Code and Cursor editor configurations
- Development workflow with hot reload
- Comprehensive build setup

## Development

The generated projects include everything needed to start building MCP servers immediately.