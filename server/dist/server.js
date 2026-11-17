"use strict";
const app_1 = require("./app");
const config_1 = require("./config");
const database_1 = require("./config/database");
const app = (0, app_1.createApp)();
// For local development or standalone execution, connect database and bind to port
if (!process.env.VERCEL && process.env.NODE_ENV !== 'test' && require.main === module) {
    (0, database_1.connectDatabase)().catch((err) => {
        console.warn('[Database] Connection note:', err.message);
    });
    app.listen(config_1.config.port, () => {
        console.log(`====================================================`);
        console.log(`  AURELIA & CO. LUXURY TRAVEL BROKERAGE API`);
        console.log(`  Server running on port ${config_1.config.port}`);
        console.log(`  Environment: ${config_1.config.nodeEnv}`);
        console.log(`  API Health: http://localhost:${config_1.config.port}/api/health`);
        console.log(`====================================================`);
    });
}
// Serverless entrypoint function (2-arity: req, res) delegating to Express
const handler = (req, res) => {
    return app(req, res);
};
// Expose Express properties & methods on handler for full compatibility
Object.setPrototypeOf(handler, app);
handler.default = handler;
handler.app = app;
module.exports = handler;
