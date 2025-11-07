# MCP Server Builder - Product Requirements Document

## 1. Project Overview

### 1.1 Product Name
**MCP Server Builder**

### 1.2 Product Vision
A minimalist, portable MCP (Model Context Protocol) server that enables developers to quickly scaffold and generate basic MCP server projects for VS Code integration. This tool serves as a foundation starter kit that follows all best practices and can be extended for more complex use cases.

### 1.3 Target Audience
- Developers creating MCP servers for VS Code
- Teams wanting to standardize MCP server creation
- Individual contributors looking for a quick-start template
- Developers new to the MCP ecosystem

### 1.4 Problem Statement
Currently, developers must manually set up MCP server projects from scratch, leading to:
- Inconsistent project structures
- Missing best practice implementations
- Time-consuming setup processes
- Potential misconfiguration of the @modelcontextprotocol/sdk

## 2. Functional Requirements

### 2.1 Core Features

#### 2.1.1 MCP Server Scaffolding Tool
- **Tool Name**: `create_mcp_server`
- **Description**: Generates a new MCP server project with proper structure
- **Parameters**:
  - `name` (required): Project name (kebab-case recommended)
  - `description` (optional): Project description
  - `author` (optional): Author name
  - `outputPath` (optional): Target directory (defaults to current working directory)
  - `includeResources` (optional): Include resources capability and example resource (default: false)
  - `analyzeFiles` (optional): File paths to analyze for automatically determining capabilities
  - `createSubdirectory` (optional): Create project in new subdirectory (default: false, creates in current directory)

#### 2.1.2 Generated Project Structure
```
<project-name>/
├── package.json
├── tsconfig.json
├── .gitignore
├── README.md (brief and focused)
├── src/
│   ├── index.ts
│   ├── server.ts
│   ├── tools/
│   │   └── example-tool.ts
│   └── resources/ (optional)
│       └── example-resource.ts
├── dist/ (build output)
├── .vscode/
│   └── settings.json
└── .cursor/
    └── settings.json
```

#### 2.1.3 Template Features
- **TypeScript Configuration**: Strict mode, modern ES modules
- **Package.json**: Proper scripts for build, dev, and start
- **MCP SDK Integration**: Latest @modelcontextprotocol/sdk
- **Example Tool**: Sample tool implementation demonstrating best practices
- **Build System**: TypeScript compilation to `dist/` directory
- **Development Workflow**: Hot reload during development
- **Editor Configuration**: VS Code settings (primary), Cursor settings (secondary)
- **Documentation**: Brief, focused README with essential setup and usage information

### 2.2 Technical Specifications

#### 2.2.1 Technology Stack
- **Runtime**: Node.js (minimum v18)
- **Language**: TypeScript 5.x
- **SDK**: @modelcontextprotocol/sdk (latest stable)
- **Build Tool**: TypeScript compiler (tsc)
- **Package Manager**: npm (compatible with yarn/pnpm)

#### 2.2.2 Dependencies
**Production Dependencies**:
- `@modelcontextprotocol/sdk`: Core MCP functionality
- `zod`: Runtime type validation (if needed for tool parameters)

**Development Dependencies**:
- `typescript`: TypeScript compiler
- `@types/node`: Node.js type definitions
- `tsx`: TypeScript execution for development

#### 2.2.3 Generated Server Capabilities
- **Tools**: Extensible tool registration system (always included)
- **Resources**: Resource access with example implementation (optional via `includeResources` parameter)
- **Prompts**: Custom prompt templates (future enhancement)
- **Logging**: Structured logging with configurable levels
- **Error Handling**: Comprehensive error handling and validation

## 3. Non-Functional Requirements

### 3.1 Performance
- Server startup time: < 500ms
- Tool generation time: < 100ms per template
- Memory footprint: < 50MB for basic server

### 3.2 Compatibility
- **Platform**: macOS (primary), Linux and Windows (secondary)
- **Node.js**: v18+ (LTS versions)
- **Editors**: VS Code (primary), Cursor (secondary support)
- **MCP SDK**: Compatible with current stable release

### 3.3 Usability
- Zero-configuration setup
- Self-contained executable
- Clear documentation and examples
- Intuitive parameter naming

### 3.4 Maintainability
- Modular architecture
- Comprehensive TypeScript types
- Clear separation of concerns
- Minimal external dependencies

## 4. Implementation Details

### 4.1 MCP Server Structure

#### 4.1.1 Main Server File (`src/server.ts`)
```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

// Tool imports
import { createMcpServerTool } from './tools/create-mcp-server.js';

class McpServerBuilder {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'mcp-server-builder',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupTools();
  }

  private setupTools(): void {
    // Register the create_mcp_server tool
    this.server.setRequestHandler('tools/list', createMcpServerTool.list);
    this.server.setRequestHandler('tools/call', createMcpServerTool.call);
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}
```

#### 4.1.2 Tool Implementation Pattern
- Each tool in separate file under `src/tools/`
- Consistent parameter validation using Zod schemas
- Proper error handling and user feedback
- File system operations with appropriate permissions

### 4.2 Generated Templates

#### 4.2.1 Package.json Template
```json
{
  "name": "{{PROJECT_NAME}}",
  "version": "1.0.0",
  "description": "{{PROJECT_DESCRIPTION}}",
  "main": "dist/index.js",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "dev": "tsx src/index.ts",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^latest"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "tsx": "^4.0.0"
  }
}
```

#### 4.2.2 TypeScript Configuration
- Strict mode enabled
- ES2022 target
- Node.js module resolution
- Source maps for debugging
- Proper output directory configuration

#### 4.2.3 README Template Structure
The generated README should be concise and include only essential information:
```markdown
# {{PROJECT_NAME}}

{{PROJECT_DESCRIPTION}}

## Quick Start

npm install
npm run dev

## Scripts

- `npm run build` - Compile TypeScript
- `npm run dev` - Development mode with hot reload
- `npm start` - Run compiled server

## MCP Configuration

Add to your VS Code/Cursor settings:
```json
{
  "mcp.servers": {
    "{{PROJECT_NAME}}": {
      "command": "node",
      "args": ["path/to/dist/index.js"]
    }
  }
}
```

## Development

See `src/tools/` for example implementations.
```

**Total length target: < 100 lines, focus on immediate usability**

## 5. User Experience

### 5.1 Installation
The server should be installable as a standalone MCP server that can be registered in VS Code's or Cursor's MCP configuration. Primary focus on VS Code integration with Cursor as secondary support.

### 5.2 Usage Flow
1. User navigates to their desired project directory
2. User invokes `create_mcp_server` tool from VS Code or Cursor
3. Provides project name and optional parameters
4. Tool generates complete project structure directly in current directory (default) or subdirectory (optional)
5. User can immediately start developing their MCP server without directory navigation
6. Generated project includes brief, focused README with essential setup instructions

### 5.3 Generated Project Experience
- Immediate `npm install` and `npm run dev` capability
- Example tool demonstrates MCP patterns
- Clear file organization and naming conventions
- Built-in development workflow
- Editor-specific configurations (VS Code primary, Cursor secondary)
- Cross-editor compatibility for development

## 6. Success Criteria

### 6.1 Primary Success Metrics
- **Time to First MCP Server**: < 2 minutes from tool invocation to working server
- **Developer Adoption**: Serves as template for future MCP servers
- **Code Quality**: Generated code passes TypeScript strict mode compilation
- **Documentation Quality**: README enables immediate development start

### 6.2 Quality Gates
- All generated code follows @modelcontextprotocol/sdk best practices
- TypeScript compilation without warnings
- Functional example tool included
- Comprehensive error handling
- Platform compatibility (macOS focus)
- Brief, actionable README documentation (< 100 lines, focused on essentials)

## 7. Future Enhancements (Out of Scope for v1)

- Interactive CLI wizard for project configuration
- Multiple template variations (minimal, full-featured, specific domains)
- Integration with popular package managers beyond npm
- VS Code and Cursor extensions for direct integration
- Template customization and plugin system
- Support for additional MCP capabilities (resources, prompts)

## 8. Risk Assessment

### 8.1 Technical Risks
- **MCP SDK Changes**: Mitigation through version pinning and regular updates
- **Node.js Compatibility**: Mitigation through LTS version targeting
- **File System Permissions**: Mitigation through proper error handling

### 8.2 Adoption Risks
- **Documentation Quality**: Mitigation through comprehensive examples
- **Complexity**: Mitigation through minimal, focused scope

## 9. Dependencies and Constraints

### 9.1 External Dependencies
- @modelcontextprotocol/sdk stability and API compatibility
- Node.js ecosystem compatibility
- VS Code MCP integration requirements (primary)
- Cursor MCP integration compatibility (secondary)

### 9.2 Constraints
- Must remain minimal and focused
- macOS primary platform requirement
- TypeScript-only generated code
- No GUI components (CLI/MCP server only)