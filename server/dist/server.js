"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const config_1 = require("./config");
const database_1 = require("./config/database");
const app = (0, app_1.createApp)();
// Lazy database connection helper
let dbInitiated = false;
const initDbIfNeeded = () => {
    if (!dbInitiated && process.env.NODE_ENV !== 'test') {
        dbInitiated = true;
        (0, database_1.connectDatabase)().catch((err) => {
            console.warn('[Database] Connection note:', err.message);
        });
    }
};
// Only bind to port for local development or standalone execution.
// In Vercel or other serverless environments, Vercel manages the HTTP port binding and invocation externally.
if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
    initDbIfNeeded();
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : config_1.config.port;
    app.listen(port, () => {
        console.log(`====================================================`);
        console.log(`  AURELIA & CO. LUXURY TRAVEL BROKERAGE API`);
        console.log(`  Server listening on port ${port}`);
        console.log(`  Environment: ${config_1.config.nodeEnv}`);
        console.log(`  API Health: http://localhost:${port}/api/health`);
        console.log(`====================================================`);
    });
}
// Export Express app instance for both CommonJS and ES Module environments
app.default = app;
module.exports = app;
exports.default = app;
