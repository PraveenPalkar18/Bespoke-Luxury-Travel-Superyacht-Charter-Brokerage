"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordSupplierConfirmation = exports.getBookingByProposal = exports.getBookingById = exports.listBookings = void 0;
const booking_service_1 = require("../services/booking.service");
const listBookings = async (req, res, next) => {
    try {
        const bookings = await booking_service_1.bookingService.listBookings(req.user);
        res.status(200).json({
            success: true,
            data: bookings,
            total: bookings.length,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.listBookings = listBookings;
const getBookingById = async (req, res, next) => {
    try {
        const booking = await booking_service_1.bookingService.getBookingById(req.params.id, req.user);
        res.status(200).json({
            success: true,
            data: booking,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getBookingById = getBookingById;
const getBookingByProposal = async (req, res, next) => {
    try {
        const booking = await booking_service_1.bookingService.getBookingByProposalId(req.params.proposalId, req.user);
        if (!booking) {
            res.status(404).json({
                success: false,
                message: 'No booking record found for this proposal.',
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: booking,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getBookingByProposal = getBookingByProposal;
const recordSupplierConfirmation = async (req, res, next) => {
    try {
        const { id, serviceType } = req.params;
        const { supplierName, referenceOrContractNumber, notes } = req.body;
        const booking = await booking_service_1.bookingService.recordSupplierConfirmation(id, serviceType, { supplierName, referenceOrContractNumber, notes }, req.user);
        res.status(200).json({
            success: true,
            data: booking,
            message: `Supplier confirmation for ${serviceType} recorded successfully.`,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.recordSupplierConfirmation = recordSupplierConfirmation;
