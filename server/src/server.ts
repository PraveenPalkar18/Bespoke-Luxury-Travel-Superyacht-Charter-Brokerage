import { createApp } from './app';
import { config } from './config';
import { connectDatabase } from './config/database';

const app = createApp();

// For local development or standalone execution, connect database and bind to port
if (!process.env.VERCEL && process.env.NODE_ENV !== 'test' && require.main === module) {
  connectDatabase().catch((err) => {
    console.warn('[Database] Connection note:', err.message);
  });

  app.listen(config.port, () => {
    console.log(`====================================================`);
    console.log(`  AURELIA & CO. LUXURY TRAVEL BROKERAGE API`);
    console.log(`  Server running on port ${config.port}`);
    console.log(`  Environment: ${config.nodeEnv}`);
    console.log(`  API Health: http://localhost:${config.port}/api/health`);
    console.log(`====================================================`);
  });
}

// Serverless entrypoint function (2-arity: req, res) delegating to Express
const handler = (req: any, res: any) => {
  return app(req, res);
};

// Expose Express properties & methods on handler for full compatibility
Object.setPrototypeOf(handler, app);
(handler as any).default = handler;
(handler as any).app = app;

export = handler;
