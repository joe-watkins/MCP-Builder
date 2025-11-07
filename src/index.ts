import { McpServerBuilder } from './server.js';

async function main() {
  const server = new McpServerBuilder();
  await server.start();
}

main().catch((error) => {
  console.error('Failed to start MCP Server Builder:', error);
  process.exit(1);
});