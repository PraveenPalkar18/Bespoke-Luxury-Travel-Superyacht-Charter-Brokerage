"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingService = exports.BookingService = void 0;
const Booking_1 = require("../models/Booking");
const Inquiry_1 = require("../models/Inquiry");
const database_1 = require("../config/database");
const errors_1 = require("../utils/errors");
const audit_service_1 = require("./audit.service");
class BookingService {
    async createBookingFromProposal(proposal, inquiry) {
        (0, database_1.ensureDatabaseConnected)();
        // Check if booking already exists for this proposal
        const existing = await Booking_1.BookingModel.findOne({ proposalId: proposal._id.toString() });
        if (existing) {
            return existing.toObject();
        }
        const referenceCode = `BK-${proposal.referenceCode.replace(/^PR-/, '')}`;
        // Determine required independent supplier confirmations
        const hasAircraft = Boolean(proposal.aircraft?.name ||
            inquiry?.requestedServices?.includes('private_jet') ||
            inquiry?.requestedServices?.includes('both'));
        const hasYacht = Boolean(proposal.yacht?.name ||
            inquiry?.requestedServices?.includes('superyacht') ||
            inquiry?.requestedServices?.includes('both'));
        const hasAccommodation = Boolean(inquiry?.requestedServices?.includes('accommodation') ||
            proposal.itinerary?.some((d) => Boolean(d.accommodation)));
        // Ensure at least one supplier is required if none explicitly flagged
        const aircraftRequired = hasAircraft || (!hasYacht && !hasAccommodation);
        const yachtRequired = hasYacht;
        const accommodationRequired = hasAccommodation;
        const booking = await Booking_1.BookingModel.create({
            referenceCode,
            inquiryId: proposal.inquiryId,
            proposalId: proposal._id.toString(),
            clientName: proposal.clientName,
            clientEmail: proposal.clientEmail,
            assignedBrokerId: inquiry?.assignedTo || proposal.createdById,
            status: 'pending_supplier_confirmation',
            supplierConfirmations: {
                aircraft: {
                    required: aircraftRequired,
                    confirmed: false,
                    supplierName: proposal.aircraft?.name,
                },
                yacht: {
                    required: yachtRequired,
                    confirmed: false,
                    supplierName: proposal.yacht?.name,
                },
                accommodation: {
                    required: accommodationRequired,
                    confirmed: false,
                },
            },
            totalAmount: proposal.pricing?.totalEstimatedCost || 0,
        });
        await audit_service_1.auditService.log({
            actor: { role: 'system', name: 'Aurelia Charter Desk' },
            action: 'booking_created_pending_suppliers',
            resourceType: 'booking',
            resourceId: booking._id.toString(),
            metadata: {
                referenceCode: booking.referenceCode,
                inquiryId: booking.inquiryId,
                proposalId: booking.proposalId,
                requiredSuppliers: {
                    aircraft: aircraftRequired,
                    yacht: yachtRequired,
                    accommodation: accommodationRequired,
                },
            },
        });
        return booking.toObject();
    }
    async recordSupplierConfirmation(bookingId, serviceType, details, requestingUser) {
        (0, database_1.ensureDatabaseConnected)();
        const booking = await Booking_1.BookingModel.findById(bookingId);
        if (!booking) {
            throw new errors_1.NotFoundError(`Booking not found for ID: ${bookingId}`);
        }
        // RBAC: Brokers can only confirm suppliers for their assigned bookings
        if (requestingUser && requestingUser.role === 'broker') {
            if (booking.assignedBrokerId !== requestingUser.id) {
                throw new errors_1.ForbiddenError('Access denied: You are not authorized to confirm suppliers for this booking.');
            }
        }
        const confirmation = booking.supplierConfirmations[serviceType];
        if (!confirmation) {
            throw new errors_1.BadRequestError(`Invalid supplier service type: ${serviceType}`);
        }
        // Mark specific supplier confirmed
        confirmation.confirmed = true;
        confirmation.confirmedAt = new Date();
        confirmation.confirmedBy = requestingUser?.id || 'admin';
        if (details.supplierName)
            confirmation.supplierName = details.supplierName;
        if (details.referenceOrContractNumber)
            confirmation.referenceOrContractNumber = details.referenceOrContractNumber;
        if (details.notes)
            confirmation.notes = details.notes;
        // Check if EVERY required supplier has now confirmed
        const supplierKeys = ['aircraft', 'yacht', 'accommodation'];
        const allRequiredConfirmed = supplierKeys.every((k) => !booking.supplierConfirmations[k].required || booking.supplierConfirmations[k].confirmed);
        if (allRequiredConfirmed) {
            booking.status = 'confirmed';
            booking.confirmedAt = new Date();
            booking.confirmedBy = requestingUser?.id || 'admin';
            // Transition associated inquiry to confirmed now that every supplier is verified
            const inquiry = await Inquiry_1.InquiryModel.findById(booking.inquiryId);
            if (inquiry) {
                inquiry.status = 'confirmed';
                inquiry.internalNotes.push({
                    _id: undefined,
                    authorId: requestingUser?.id || 'system',
                    authorName: requestingUser?.name || 'Managing Director',
                    content: `All required supplier confirmations received (Aircraft, Yacht, Accommodation). Booking ${booking.referenceCode} formally CONFIRMED.`,
                    category: 'supplier',
                    createdAt: new Date(),
                });
                await inquiry.save();
            }
            await audit_service_1.auditService.log({
                actor: requestingUser
                    ? { id: requestingUser.id, email: requestingUser.email, name: requestingUser.name, role: requestingUser.role }
                    : { role: 'system', name: 'Managing Director' },
                action: 'booking_confirmed',
                resourceType: 'booking',
                resourceId: booking._id.toString(),
                metadata: {
                    referenceCode: booking.referenceCode,
                    confirmedService: serviceType,
                    allConfirmed: true,
                },
            });
        }
        else {
            // Partial supplier confirmation: booking remains pending_supplier_confirmation
            booking.status = 'pending_supplier_confirmation';
            await audit_service_1.auditService.log({
                actor: requestingUser
                    ? { id: requestingUser.id, email: requestingUser.email, name: requestingUser.name, role: requestingUser.role }
                    : { role: 'system', name: 'Charter Desk' },
                action: 'supplier_confirmed_partial',
                resourceType: 'booking',
                resourceId: booking._id.toString(),
                metadata: {
                    referenceCode: booking.referenceCode,
                    confirmedService: serviceType,
                    pendingOtherSuppliers: true,
                },
            });
        }
        await booking.save();
        return booking.toObject();
    }
    async getBookingById(id, requestingUser) {
        (0, database_1.ensureDatabaseConnected)();
        const booking = await Booking_1.BookingModel.findById(id);
        if (!booking) {
            throw new errors_1.NotFoundError(`Booking not found for ID: ${id}`);
        }
        if (requestingUser && requestingUser.role === 'broker') {
            if (booking.assignedBrokerId !== requestingUser.id) {
                throw new errors_1.ForbiddenError('Access denied: You are not authorized to view this booking.');
            }
        }
        return booking.toObject();
    }
    async getBookingByProposalId(proposalId, requestingUser) {
        (0, database_1.ensureDatabaseConnected)();
        const booking = await Booking_1.BookingModel.findOne({ proposalId });
        if (!booking)
            return null;
        if (requestingUser && requestingUser.role === 'broker') {
            if (booking.assignedBrokerId !== requestingUser.id) {
                throw new errors_1.ForbiddenError('Access denied: You are not authorized to view this booking.');
            }
        }
        return booking.toObject();
    }
    async listBookings(requestingUser) {
        (0, database_1.ensureDatabaseConnected)();
        const query = {};
        if (requestingUser && requestingUser.role === 'broker') {
            query.assignedBrokerId = requestingUser.id;
        }
        const bookings = await Booking_1.BookingModel.find(query).sort({ createdAt: -1 }).lean();
        return bookings;
    }
}
exports.BookingService = BookingService;
exports.bookingService = new BookingService();
