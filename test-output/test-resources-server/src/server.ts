import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema,
  CallToolResult,
  Tool,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  Resource
} from '@modelcontextprotocol/sdk/types.js';
import { exampleTool } from './tools/example-tool.js';
import { exampleResource } from './resources/example-resource.js';

export class TestResourcesServerServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'test-resources-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
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
            throw new Error(`Unknown resource: ${uri}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        throw new Error(`Error reading resource '${uri}': ${errorMessage}`);
      }
    });
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error('[test-resources-server] Error:', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('[test-resources-server] Server started successfully');
  }
}
