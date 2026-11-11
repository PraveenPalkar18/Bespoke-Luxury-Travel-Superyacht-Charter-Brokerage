import { createApp } from './app';
import { config } from './config';
import { connectDatabase } from './config/database';

const startServer = async () => {
  const app = createApp();

  const server = app.listen(config.port, () => {
    console.log(`====================================================`);
    console.log(`  AURELIA & CO. LUXURY TRAVEL BROKERAGE API`);
    console.log(`  Server running on port ${config.port}`);
    console.log(`  Environment: ${config.nodeEnv}`);
    console.log(`  API Health: http://localhost:${config.port}/api/health`);
    console.log(`====================================================`);
  });

  // Connect to persistent MongoDB storage
  connectDatabase().catch((err) => {
    console.warn('[Database] Connection note:', err.message);
  });

  return server;
};

startServer().catch((err) => {
  console.error('Fatal server boot failure:', err);
  process.exit(1);
});
