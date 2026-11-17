"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const auth_2 = require("../middleware/auth");
const booking_controller_1 = require("../controllers/booking.controller");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// View bookings
router.get('/', (0, auth_2.requirePermission)('bookings.read.assigned'), booking_controller_1.listBookings);
router.get('/proposal/:proposalId', (0, auth_2.requirePermission)('bookings.read.assigned'), booking_controller_1.getBookingByProposal);
router.get('/:id', (0, auth_2.requirePermission)('bookings.read.assigned'), booking_controller_1.getBookingById);
// Record supplier confirmation (aircraft, yacht, accommodation)
router.patch('/:id/suppliers/:serviceType', (0, auth_2.requirePermission)('bookings.manage'), booking_controller_1.recordSupplierConfirmation);
exports.default = router;
