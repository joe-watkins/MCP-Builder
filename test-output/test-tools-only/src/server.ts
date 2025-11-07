import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema,
  CallToolResult,
  Tool
} from '@modelcontextprotocol/sdk/types.js';
import { exampleTool } from './tools/example-tool.js';

export class TestToolsOnlyServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'test-tools-only',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
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

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error('[test-tools-only] Error:', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('[test-tools-only] Server started successfully');
  }
}
