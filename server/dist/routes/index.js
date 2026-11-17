"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongoose_1 = __importDefault(require("mongoose"));
const auth_routes_1 = __importDefault(require("./auth.routes"));
const aircraft_routes_1 = __importDefault(require("./aircraft.routes"));
const yacht_routes_1 = __importDefault(require("./yacht.routes"));
const destination_routes_1 = __importDefault(require("./destination.routes"));
const inquiry_routes_1 = __importDefault(require("./inquiry.routes"));
const stats_routes_1 = __importDefault(require("./stats.routes"));
const proposal_routes_1 = __importDefault(require("./proposal.routes"));
const booking_routes_1 = __importDefault(require("./booking.routes"));
const router = (0, express_1.Router)();
router.use('/auth', auth_routes_1.default);
router.use('/aircraft', aircraft_routes_1.default);
router.use('/yachts', yacht_routes_1.default);
router.use('/destinations', destination_routes_1.default);
router.use('/inquiries', inquiry_routes_1.default);
router.use('/stats', stats_routes_1.default);
router.use('/proposals', proposal_routes_1.default);
router.use('/bookings', booking_routes_1.default);
// Health check distinguishing application health from database connectivity
router.get('/health', (_req, res) => {
    const isDbConnected = mongoose_1.default.connection.readyState === 1;
    res.status(200).json({
        status: 'healthy',
        application: 'healthy',
        database: isDbConnected ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString(),
        service: 'Aurelia & Co. Luxury Brokerage API',
    });
});
exports.default = router;
