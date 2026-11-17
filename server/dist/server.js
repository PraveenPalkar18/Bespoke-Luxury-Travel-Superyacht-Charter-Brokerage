"use strict";
const app_1 = require("./app");
const config_1 = require("./config");
const database_1 = require("./config/database");
const app = (0, app_1.createApp)();
// Initiate database connection
(0, database_1.connectDatabase)().catch((err) => {
    console.warn('[Database] Connection note:', err.message);
});
// For local development or standalone execution, bind to port
if (!process.env.VERCEL && process.env.NODE_ENV !== 'test' && require.main === module) {
    app.listen(config_1.config.port, () => {
        console.log(`====================================================`);
        console.log(`  AURELIA & CO. LUXURY TRAVEL BROKERAGE API`);
        console.log(`  Server running on port ${config_1.config.port}`);
        console.log(`  Environment: ${config_1.config.nodeEnv}`);
        console.log(`  API Health: http://localhost:${config_1.config.port}/api/health`);
        console.log(`====================================================`);
    });
}
// Export app for both CommonJS (module.exports) and ES module environments (Vercel serverless execution)
app.default = app;
module.exports = app;
