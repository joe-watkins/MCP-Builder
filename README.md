# MCP Server Builder

A minimalist MCP server that scaffolds basic MCP server projects for VS Code and Cursor.

---

## 👤 For Users

### Installation

```bash
git clone https://github.com/joe-watkins/MCP-Builder.git
cd MCP-Builder
npm install
npm run build
```

### MCP Configuration

Add this to your editor's MCP settings:

**VS Code** (`.vscode/settings.json`):
```json
{
  "mcp.servers": {
    "mcp-server-builder": {
      "command": "node",
      "args": ["/absolute/path/to/MCP-Builder/dist/index.js"]
    }
  }
}
```

**Cursor** (`.cursor/settings.json`):
```json
{
  "mcp.servers": {
    "mcp-server-builder": {
      "command": "node",
      "args": ["/absolute/path/to/MCP-Builder/dist/index.js"]
    }
  }
}
```

**Note:** Replace `/absolute/path/to/MCP-Builder` with the actual absolute path where you cloned this repository.

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

## Tutorial: Your First MCP Server with Example Data

This project includes a fun example JSON dataset to help you create your first MCP server: **Ferengi Rules of Acquisition** from Star Trek! This is perfect for learning how to build an MCP server that serves data.

### 📦 What's Included

The `docs/ferengi-rules-of-acquisition.json` file contains 200+ Rules of Acquisition—the sacred commercial guidelines of the Ferengi species. Each rule includes:
- Rule number
- The rule text
- Source (episode, novel, or game)

### 🚀 Create Your First Server

**Step 1: Copy the example data to a new folder**

```bash
mkdir ferengi-rules-server
cp docs/ferengi-rules-of-acquisition.json ferengi-rules-server/
```

**Step 2: Ask your AI assistant to build the server**

In VS Code/Cursor, simply tell your AI assistant:

> "Create an MCP server in the ferengi-rules-server folder that provides access to Ferengi Rules of Acquisition. Analyze the ferengi-rules-of-acquisition.json file in that directory."

That's it! Your AI assistant will use the `create_mcp_server` tool to:
- ✅ Detect the JSON data file
- ✅ Automatically include the Resources capability
- ✅ Generate a complete MCP server project with all the scaffolding
- ✅ Set up TypeScript, build tools, and development workflow

### 💡 Ideas for Your Server

Once you have the basic server running, you could add:

- **Tools:**
  - `get_rule_by_number` - Fetch a specific rule
  - `search_rules` - Search by keyword
  - `random_rule` - Get a random rule for inspiration
  - `rules_by_source` - Filter by episode or book

- **Resources:**
  - `ferengi://rules/all` - All rules as a resource
  - `ferengi://rules/{number}` - Individual rule by number
  - `ferengi://rules/random` - Random rule

- **Prompts:**
  - Help users apply Ferengi wisdom to their business decisions
  - Generate "Ferengi-style" advice for scenarios

**Example prompts to add these features:**

> "Add a tool called `get_rule_by_number` to the Ferengi server that takes a rule number and returns that specific rule from the JSON file."

> "Add a `search_rules` tool that searches through all the rules and returns any that contain the search keyword in the rule text."

> "Create a `random_rule` tool that returns a random Ferengi Rule of Acquisition for inspiration."

This example demonstrates how any JSON data source can become an MCP server that AI assistants can query and use!

### Generated Project Features

- TypeScript with strict configuration
- MCP SDK integration with best practices
- Example tool implementation
- Optional resources capability (auto-detected or manual)
- Development workflow with hot reload
- Comprehensive build setup

---

## 🛠️ For Developers

### Development Setup

```bash
git clone https://github.com/joe-watkins/MCP-Builder.git
cd MCP-Builder
npm install
npm run dev
```

### Scripts

- `npm run build` - Compile TypeScript
- `npm run dev` - Development mode with hot reload
- `npm start` - Run compiled server

### Project Structure

```
src/
  ├── index.ts           # Entry point
  ├── server.ts          # Main server implementation
  └── tools/
      └── create-mcp-server.ts  # Server generation tool
```

### Contributing

The generated projects include everything needed to start building MCP servers immediately. When making changes to the builder:

1. Test with `npm run dev` for hot reload
2. Build with `npm run build`
3. Test the generated servers to ensure they work correctly