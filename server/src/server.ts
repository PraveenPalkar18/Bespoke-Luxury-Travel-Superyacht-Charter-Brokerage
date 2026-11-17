import { createApp } from './app';
import { config } from './config';
import { connectDatabase } from './config/database';

const app = createApp();

// Initiate database connection
connectDatabase().catch((err) => {
  console.warn('[Database] Connection note:', err.message);
});

// For local development or standalone execution, bind to port
if (!process.env.VERCEL && process.env.NODE_ENV !== 'test' && require.main === module) {
  app.listen(config.port, () => {
    console.log(`====================================================`);
    console.log(`  AURELIA & CO. LUXURY TRAVEL BROKERAGE API`);
    console.log(`  Server running on port ${config.port}`);
    console.log(`  Environment: ${config.nodeEnv}`);
    console.log(`  API Health: http://localhost:${config.port}/api/health`);
    console.log(`====================================================`);
  });
}

// Export app for both CommonJS (module.exports) and ES module environments (Vercel serverless execution)
(app as any).default = app;
export = app;
