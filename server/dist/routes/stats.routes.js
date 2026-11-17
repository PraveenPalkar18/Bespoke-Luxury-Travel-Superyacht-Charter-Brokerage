"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const stats_controller_1 = require("../controllers/stats.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/overview', auth_1.authenticate, (0, auth_1.requirePermission)(['analytics.read.all', 'analytics.read.assigned']), stats_controller_1.getStatsOverview);
exports.default = router;
