import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema,
  CallToolResult,
  Tool
} from '@modelcontextprotocol/sdk/types.js';
import { createMcpServerTool } from './tools/create-mcp-server.js';

/**
 * MCP Server Builder - Creates scaffold MCP server projects
 */
export class McpServerBuilder {
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

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  /**
   * Set up tool request handlers
   */
  private setupToolHandlers(): void {
    // Handle tool listing
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'create_mcp_server',
            description: 'Generate a new MCP server project with proper structure and configuration in the current directory',
            inputSchema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'Project name (kebab-case recommended)',
                },
                description: {
                  type: 'string',
                  description: 'Project description',
                },
                author: {
                  type: 'string',
                  description: 'Author name',
                },
                outputPath: {
                  type: 'string',
                  description: 'Target directory (defaults to current working directory)',
                },
                includeResources: {
                  type: 'boolean',
                  description: 'Include resources capability and example resource (default: false)',
                },
                analyzeFiles: {
                  type: 'array',
                  items: {
                    type: 'string'
                  },
                  description: 'File paths to analyze for automatically determining capabilities (will auto-enable resources if data files detected)',
                },
                createSubdirectory: {
                  type: 'boolean',
                  description: 'Create project in a new subdirectory (default: false, creates in current directory)',
                },
              },
              required: ['name'],
            },
          },
        ] as Tool[],
      };
    });

    // Handle tool execution
    this.server.setRequestHandler(CallToolRequestSchema, async (request): Promise<CallToolResult> => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'create_mcp_server':
            return await createMcpServerTool.execute(args);
          
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return {
          content: [
            {
              type: 'text',
              text: `Error executing tool '${name}': ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  /**
   * Set up error handling
   */
  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error('[MCP Server Builder] Error:', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  /**
   * Start the server
   */
  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('[MCP Server Builder] Server started successfully');
  }
}