import { DuplicateServerServer } from './server.js';

async function main() {
  const server = new DuplicateServerServer();
  await server.start();
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
