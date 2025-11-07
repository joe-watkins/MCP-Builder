import { ReadResourceResult } from '@modelcontextprotocol/sdk/types.js';

export const exampleResource = {
  async read(uri: string): Promise<ReadResourceResult> {
    try {
      if (uri === 'example://resource') {
        const content = `This is an example resource content.
Generated at: ${new Date().toISOString()}
URI: ${uri}

This demonstrates how to implement MCP resources in your server.`;

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

      throw new Error(`Resource not found: ${uri}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Error reading resource: ${errorMessage}`);
    }
  },
};
