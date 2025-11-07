import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

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
            text: `Original message: "${message}"\nProcessed message: "${processedMessage}"`,
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        content: [
          {
            type: 'text',
            text: `Error in example tool: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  },
};
