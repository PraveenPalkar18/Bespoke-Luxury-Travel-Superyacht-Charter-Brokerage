"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStatsOverview = exports.getOverviewStats = void 0;
const stats_service_1 = require("../services/stats.service");
const getOverviewStats = async (req, res, next) => {
    try {
        const stats = await stats_service_1.statsService.getOverviewStats();
        res.status(200).json({
            success: true,
            data: stats,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getOverviewStats = getOverviewStats;
exports.getStatsOverview = exports.getOverviewStats;
