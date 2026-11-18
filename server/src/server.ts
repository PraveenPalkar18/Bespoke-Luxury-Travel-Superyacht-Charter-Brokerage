import { createApp } from './app';
import { config } from './config';
import { connectDatabase } from './config/database';

const app = createApp();

// Lazy database connection helper
let dbInitiated = false;
const initDbIfNeeded = () => {
  if (!dbInitiated && process.env.NODE_ENV !== 'test') {
    dbInitiated = true;
    connectDatabase().catch((err) => {
      console.warn('[Database] Connection note:', err.message);
    });
  }
};

// Bind to port for local development, standalone execution, or Vercel service runtime
if (process.env.NODE_ENV !== 'test') {
  initDbIfNeeded();
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : config.port;
  app.listen(port, () => {
    console.log(`====================================================`);
    console.log(`  AURELIA & CO. LUXURY TRAVEL BROKERAGE API`);
    console.log(`  Server listening on port ${port}`);
    console.log(`  Environment: ${config.nodeEnv}`);
    console.log(`  API Health: http://localhost:${port}/api/health`);
    console.log(`====================================================`);
  });
}

// Export Express app instance for both CommonJS and ES Module environments
(app as any).default = app;
module.exports = app;
export default app;
