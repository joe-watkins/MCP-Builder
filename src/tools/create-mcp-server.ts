import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface CreateMcpServerArgs {
  name: string;
  description?: string;
  author?: string;
  outputPath?: string;
  includeResources?: boolean;
  analyzeFiles?: string[]; // File paths to analyze for determining capabilities
  createSubdirectory?: boolean; // Whether to create a subdirectory (default: false)
}

/**
 * Tool for creating MCP server projects
 */
export const createMcpServerTool = {
  async execute(args: any): Promise<CallToolResult> {
    try {
      const { name, description = '', author = '', outputPath = process.cwd(), includeResources = false, analyzeFiles = [], createSubdirectory = false } = args as CreateMcpServerArgs;

      // Validate project name
      if (!name || typeof name !== 'string') {
        throw new Error('Project name is required and must be a string');
      }

      // Sanitize project name (kebab-case)
      const projectName = name.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      if (!projectName) {
        throw new Error('Invalid project name. Please use alphanumeric characters and hyphens.');
      }

      // Analyze files to determine capabilities
      let shouldIncludeResources = includeResources;
      let analysisResult = '';
      
      if (analyzeFiles.length > 0) {
        const analysis = await this.analyzeFilesForCapabilities(analyzeFiles);
        shouldIncludeResources = shouldIncludeResources || analysis.needsResources;
        analysisResult = analysis.summary;
      }

      const projectPath = createSubdirectory ? path.join(outputPath, projectName) : outputPath;
      
      if (createSubdirectory) {
        // Check if subdirectory already exists
        try {
          await fs.access(projectPath);
          throw new Error(`Directory '${projectName}' already exists in ${outputPath}`);
        } catch (error: any) {
          if (error.code !== 'ENOENT') {
            throw error;
          }
        }

        // Create project subdirectory
        await fs.mkdir(projectPath, { recursive: true });
      } else {
        // Working in current directory - check if it already has MCP server files
        try {
          await fs.access(path.join(projectPath, 'package.json'));
          const existingPackage = JSON.parse(await fs.readFile(path.join(projectPath, 'package.json'), 'utf-8'));
          if (existingPackage.dependencies && existingPackage.dependencies['@modelcontextprotocol/sdk']) {
            throw new Error(`Directory already contains an MCP server project. Use a different directory or set createSubdirectory: true.`);
          }
        } catch (error: any) {
          if (error.code !== 'ENOENT' && error.message.includes('MCP server')) {
            throw error;
          }
          // package.json doesn't exist or isn't an MCP server, continue
        }

        // Ensure the output directory exists
        await fs.mkdir(projectPath, { recursive: true });
      }

      // Create all project files
      await Promise.all([
        this.createPackageJson(projectPath, projectName, description, author),
        this.createTsConfig(projectPath),
        this.createGitIgnore(projectPath),
        this.createReadme(projectPath, projectName, description),
        this.createSourceFiles(projectPath, projectName, shouldIncludeResources),
      ]);

      const nextSteps = createSubdirectory 
        ? `🚀 Next steps:\n   cd ${projectName}\n   npm install\n   npm run dev\n\n`
        : `🚀 Next steps:\n   npm install\n   npm run dev\n\n`;

      return {
        content: [
          {
            type: 'text',
            text: `✅ Successfully created MCP server project '${projectName}'\n\n` +
                  `📁 Location: ${projectPath}\n\n` +
                  `🎯 Capabilities: Tools${shouldIncludeResources ? ' + Resources' : ''}\n\n` +
                  (analysisResult ? `🔍 Analysis: ${analysisResult}\n\n` : '') +
                  nextSteps +
                  `📖 See README.md for configuration instructions.`,
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        content: [
          {
            type: 'text',
            text: `❌ Failed to create MCP server project: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  },

  async createPackageJson(projectPath: string, name: string, description: string, author: string): Promise<void> {
    const packageJson = {
      name,
      version: '1.0.0',
      description: description || `MCP server for ${name}`,
      main: 'dist/index.js',
      type: 'module',
      scripts: {
        build: 'tsc',
        dev: 'tsx src/index.ts',
        start: 'node dist/index.js',
        clean: 'rm -rf dist'
      },
      keywords: ['mcp', 'model-context-protocol'],
      author,
      license: 'MIT',
      dependencies: {
        '@modelcontextprotocol/sdk': '^1.0.0'
      },
      devDependencies: {
        typescript: '^5.3.0',
        '@types/node': '^20.10.0',
        tsx: '^4.6.0'
      },
      engines: {
        node: '>=18.0.0'
      }
    };

    await fs.writeFile(
      path.join(projectPath, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
  },

  async createTsConfig(projectPath: string): Promise<void> {
    const tsConfig = {
      compilerOptions: {
        target: 'ES2022',
        module: 'ESNext',
        moduleResolution: 'Node',
        allowSyntheticDefaultImports: true,
        esModuleInterop: true,
        allowJs: true,
        strict: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        outDir: './dist',
        rootDir: './src',
        sourceMap: true,
        declaration: true,
        declarationMap: true,
        removeComments: false,
        noEmitOnError: true,
        resolveJsonModule: true
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist', '**/*.test.ts']
    };

    await fs.writeFile(
      path.join(projectPath, 'tsconfig.json'),
      JSON.stringify(tsConfig, null, 2)
    );
  },

  async createGitIgnore(projectPath: string): Promise<void> {
    const gitIgnore = `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
dist/
build/
*.tsbuildinfo

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env
.env.test
.env.production

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
`;

    await fs.writeFile(path.join(projectPath, '.gitignore'), gitIgnore);
  },

  async createReadme(projectPath: string, name: string, description: string): Promise<void> {
    const readme = `# ${name}

${description || `MCP server for ${name}`}

## Quick Start

\`\`\`bash
npm install
npm run dev
\`\`\`

## Scripts

- \`npm run build\` - Compile TypeScript
- \`npm run dev\` - Development mode with hot reload
- \`npm start\` - Run compiled server

## MCP Configuration

### VS Code

Add to your VS Code settings (\`.vscode/settings.json\`):

\`\`\`json
{
  "mcp.servers": {
    "${name}": {
      "command": "node",
      "args": ["/absolute/path/to/${name}/dist/index.js"]
    }
  }
}
\`\`\`

### Cursor

Add to your Cursor settings (\`.cursor/settings.json\`):

\`\`\`json
{
  "mcp.servers": {
    "${name}": {
      "command": "node",
      "args": ["/absolute/path/to/${name}/dist/index.js"]
    }
  }
}
\`\`\`

**Note:** Replace \`/absolute/path/to/${name}\` with the actual absolute path to this project directory.

## Development

See \`src/tools/\` for example implementations.
`;

    await fs.writeFile(path.join(projectPath, 'README.md'), readme);
  },

  async createSourceFiles(projectPath: string, projectName: string, includeResources: boolean = false): Promise<void> {
    const srcPath = path.join(projectPath, 'src');
    const toolsPath = path.join(srcPath, 'tools');
    
    await fs.mkdir(srcPath, { recursive: true });
    await fs.mkdir(toolsPath, { recursive: true });
    
    if (includeResources) {
      const resourcesPath = path.join(srcPath, 'resources');
      await fs.mkdir(resourcesPath, { recursive: true });
    }

    // Create index.ts
    const indexContent = `import { ${this.toPascalCase(projectName)}Server } from './server.js';

async function main() {
  const server = new ${this.toPascalCase(projectName)}Server();
  await server.start();
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
`;

    await fs.writeFile(path.join(srcPath, 'index.ts'), indexContent);

    // Create server.ts
    const serverContent = `import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema,
  CallToolResult,
  Tool${includeResources ? ',\n  ListResourcesRequestSchema,\n  ReadResourceRequestSchema,\n  Resource' : ''}
} from '@modelcontextprotocol/sdk/types.js';
import { exampleTool } from './tools/example-tool.js';${includeResources ? '\nimport { exampleResource } from \'./resources/example-resource.js\';' : ''}

export class ${this.toPascalCase(projectName)}Server {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: '${projectName}',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},${includeResources ? '\n          resources: {},' : ''}
        },
      }
    );

    this.setupHandlers();
    this.setupErrorHandling();
  }

  private setupHandlers(): void {
    // Tools handlers
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'example_tool',
            description: 'An example tool that demonstrates MCP server capabilities',
            inputSchema: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  description: 'Message to process',
                },
              },
              required: ['message'],
            },
          },
        ] as Tool[],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request): Promise<CallToolResult> => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'example_tool':
            return await exampleTool.execute(args);
          
          default:
            throw new Error(\`Unknown tool: \${name}\`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return {
          content: [
            {
              type: 'text',
              text: \`Error executing tool '\${name}': \${errorMessage}\`,
            },
          ],
          isError: true,
        };
      }
    });${includeResources ? `

    // Resources handlers
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: 'example://resource',
            name: 'Example Resource',
            description: 'An example resource that demonstrates MCP server capabilities',
            mimeType: 'text/plain',
          },
        ] as Resource[],
      };
    });

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      try {
        switch (uri) {
          case 'example://resource':
            return await exampleResource.read(uri);
          
          default:
            throw new Error(\`Unknown resource: \${uri}\`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        throw new Error(\`Error reading resource '\${uri}': \${errorMessage}\`);
      }
    });` : ''}
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error('[${projectName}] Error:', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('[${projectName}] Server started successfully');
  }
}
`;

    await fs.writeFile(path.join(srcPath, 'server.ts'), serverContent);

    // Create example tool
    const exampleToolContent = `import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

interface ExampleToolArgs {
  message: string;
}

export const exampleTool = {
  async execute(args: any): Promise<CallToolResult> {
    try {
      const { message } = args as ExampleToolArgs;

      if (!message || typeof message !== 'string') {
        throw new Error('Message is required and must be a string');
      }

      // Example processing - reverse the message
      const processedMessage = message.split('').reverse().join('');

      return {
        content: [
          {
            type: 'text',
            text: \`Original message: "\${message}"\\nProcessed message: "\${processedMessage}"\`,
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        content: [
          {
            type: 'text',
            text: \`Error in example tool: \${errorMessage}\`,
          },
        ],
        isError: true,
      };
    }
  },
};
`;

    await fs.writeFile(path.join(toolsPath, 'example-tool.ts'), exampleToolContent);

    // Create example resource if resources are enabled
    if (includeResources) {
      const resourcesPath = path.join(srcPath, 'resources');
      const exampleResourceContent = `import { ReadResourceResult } from '@modelcontextprotocol/sdk/types.js';

export const exampleResource = {
  async read(uri: string): Promise<ReadResourceResult> {
    try {
      if (uri === 'example://resource') {
        const content = \`This is an example resource content.
Generated at: \${new Date().toISOString()}
URI: \${uri}

This demonstrates how to implement MCP resources in your server.\`;

        return {
          contents: [
            {
              uri,
              mimeType: 'text/plain',
              text: content,
            },
          ],
        };
      }

      throw new Error(\`Resource not found: \${uri}\`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(\`Error reading resource: \${errorMessage}\`);
    }
  },
};
`;

      await fs.writeFile(path.join(resourcesPath, 'example-resource.ts'), exampleResourceContent);
    }
  },

  async analyzeFilesForCapabilities(filePaths: string[]): Promise<{needsResources: boolean; summary: string}> {
    let needsResources = false;
    const analysisPoints: string[] = [];

    for (const filePath of filePaths) {
      try {
        // Check if file exists
        await fs.access(filePath);
        
        // Get file stats and extension
        const stats = await fs.stat(filePath);
        const ext = path.extname(filePath).toLowerCase();
        const fileName = path.basename(filePath);
        
        // File type analysis
        const dataFileTypes = ['.json', '.yaml', '.yml', '.xml', '.csv', '.txt', '.md', '.log'];
        const codeFileTypes = ['.js', '.ts', '.py', '.java', '.go', '.rs', '.cpp', '.c'];
        const configFileTypes = ['.config', '.conf', '.ini', '.env'];
        
        if (dataFileTypes.includes(ext) || fileName.includes('data') || fileName.includes('content')) {
          needsResources = true;
          analysisPoints.push(`📄 ${fileName}: Data file detected - will expose as resource`);
        } else if (stats.isDirectory()) {
          // If it's a directory, analyze its contents
          const dirContents = await fs.readdir(filePath);
          const hasDataFiles = dirContents.some(file => {
            const fileExt = path.extname(file).toLowerCase();
            return dataFileTypes.includes(fileExt);
          });
          
          if (hasDataFiles) {
            needsResources = true;
            analysisPoints.push(`📁 ${fileName}/: Directory with data files - will expose as resources`);
          }
        } else if (codeFileTypes.includes(ext)) {
          analysisPoints.push(`⚙️ ${fileName}: Code file detected - will create corresponding tools`);
        } else if (configFileTypes.includes(ext) || fileName.includes('config')) {
          needsResources = true;
          analysisPoints.push(`⚙️ ${fileName}: Config file - will expose as resource`);
        } else {
          // Try to read a small portion to determine content type
          if (stats.size < 1024 * 1024) { // Only for files < 1MB
            try {
              const content = await fs.readFile(filePath, 'utf-8');
              
              // Check for structured data patterns
              if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
                needsResources = true;
                analysisPoints.push(`🔍 ${fileName}: JSON-like content detected - will expose as resource`);
              } else if (content.includes('---') && (content.includes(':') || content.includes('-'))) {
                needsResources = true;
                analysisPoints.push(`🔍 ${fileName}: YAML-like content detected - will expose as resource`);
              } else if (content.length > 100) {
                needsResources = true;
                analysisPoints.push(`📝 ${fileName}: Text content detected - will expose as resource`);
              }
            } catch {
              // If we can't read as text, treat as binary resource
              needsResources = true;
              analysisPoints.push(`📦 ${fileName}: Binary file - will expose as resource`);
            }
          }
        }
        
      } catch (error) {
        analysisPoints.push(`❌ ${filePath}: File not accessible`);
      }
    }

    const summary = analysisPoints.length > 0 
      ? `Analyzed ${filePaths.length} file(s):\n${analysisPoints.join('\n')}`
      : `No files analyzed`;

    return { needsResources, summary };
  },

  toPascalCase(str: string): string {
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }
};