"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.proposalService = exports.ProposalService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const Proposal_1 = require("../models/Proposal");
const Inquiry_1 = require("../models/Inquiry");
const database_1 = require("../config/database");
const errors_1 = require("../utils/errors");
const audit_service_1 = require("./audit.service");
const booking_service_1 = require("./booking.service");
class ProposalService {
    generateReferenceCode() {
        const year = new Date().getFullYear();
        const rand = Math.floor(1000 + Math.random() * 9000);
        return `PROP-${year}-${rand}`;
    }
    generateSecureToken() {
        return crypto_1.default.randomBytes(20).toString('hex');
    }
    async createProposal(data, broker, requestingUser) {
        (0, database_1.ensureDatabaseConnected)();
        const inquiry = await Inquiry_1.InquiryModel.findById(data.inquiryId);
        if (!inquiry) {
            throw new errors_1.NotFoundError(`Associated enquiry dossier not found: ${data.inquiryId}`);
        }
        // RESOURCE-LEVEL AUTHORIZATION:
        // If requesting user is a broker, they can only create proposals for enquiries assigned to them
        if (requestingUser && requestingUser.role === 'broker') {
            const isAssigned = inquiry.assignedTo?.toString() === requestingUser.id;
            if (!isAssigned) {
                await audit_service_1.auditService.log({
                    actor: { id: requestingUser.id, email: requestingUser.email, name: requestingUser.name, role: requestingUser.role },
                    action: 'unauthorized_access_attempt',
                    resourceType: 'proposal',
                    metadata: { attemptedAction: 'create_proposal_for_unassigned_enquiry', inquiryId: data.inquiryId },
                });
                throw new errors_1.ForbiddenError('Access denied: You can only create proposals for enquiries assigned to you.');
            }
        }
        const referenceCode = this.generateReferenceCode();
        const clientAccessToken = this.generateSecureToken();
        const proposal = await Proposal_1.ProposalModel.create({
            ...data,
            referenceCode,
            clientAccessToken,
            createdById: broker.id,
            createdByName: broker.name,
            status: 'draft',
        });
        await audit_service_1.auditService.log({
            actor: requestingUser
                ? { id: requestingUser.id, email: requestingUser.email, name: requestingUser.name, role: requestingUser.role }
                : { id: broker.id, name: broker.name, role: 'broker' },
            action: 'proposal_created',
            resourceType: 'proposal',
            resourceId: proposal._id.toString(),
            metadata: {
                referenceCode,
                inquiryId: data.inquiryId,
                clientName: data.clientName,
                totalCost: data.pricing?.totalEstimatedCost,
            },
        });
        return proposal.toObject();
    }
    async getByInquiryId(inquiryId, requestingUser) {
        (0, database_1.ensureDatabaseConnected)();
        // Verify access to the parent inquiry first
        const inquiry = await Inquiry_1.InquiryModel.findById(inquiryId);
        if (!inquiry) {
            throw new errors_1.NotFoundError(`Enquiry dossier not found: ${inquiryId}`);
        }
        if (requestingUser && requestingUser.role === 'broker') {
            const isAssigned = inquiry.assignedTo?.toString() === requestingUser.id;
            if (!isAssigned) {
                throw new errors_1.ForbiddenError('Access denied: You are not authorized to view proposals for this enquiry.');
            }
        }
        const proposals = await Proposal_1.ProposalModel.find({ inquiryId })
            .sort({ createdAt: -1 })
            .lean();
        return proposals;
    }
    async getById(id, requestingUser) {
        (0, database_1.ensureDatabaseConnected)();
        const proposal = await Proposal_1.ProposalModel.findById(id).lean();
        if (!proposal) {
            throw new errors_1.NotFoundError(`Proposal not found for ID: ${id}`);
        }
        // RESOURCE-LEVEL AUTHORIZATION:
        if (requestingUser && requestingUser.role === 'broker') {
            const isCreator = proposal.createdById === requestingUser.id;
            // Also check if assigned to inquiry
            const inquiry = await Inquiry_1.InquiryModel.findById(proposal.inquiryId).lean();
            const isAssignedToInquiry = inquiry?.assignedTo?.toString() === requestingUser.id;
            if (!isCreator && !isAssignedToInquiry) {
                await audit_service_1.auditService.log({
                    actor: { id: requestingUser.id, email: requestingUser.email, name: requestingUser.name, role: requestingUser.role },
                    action: 'unauthorized_access_attempt',
                    resourceType: 'proposal',
                    resourceId: id,
                    metadata: { attemptedAction: 'view_proposal' },
                });
                throw new errors_1.ForbiddenError('Access denied: You are not authorized to view this proposal.');
            }
        }
        return proposal;
    }
    async getByAccessToken(token) {
        (0, database_1.ensureDatabaseConnected)();
        const proposal = await Proposal_1.ProposalModel.findOne({ clientAccessToken: token });
        if (!proposal) {
            throw new errors_1.NotFoundError('Luxury travel proposal not found or link has expired.');
        }
        // Automatically mark as viewed if first time opened by client
        if (proposal.status === 'sent') {
            proposal.status = 'viewed';
            await proposal.save();
            // Log note on inquiry
            await Inquiry_1.InquiryModel.findByIdAndUpdate(proposal.inquiryId, {
                $push: {
                    internalNotes: {
                        authorId: 'system',
                        authorName: 'Aurelia Concierge System',
                        content: `Client viewed digital proposal presentation (${proposal.referenceCode}).`,
                        category: 'customer_call',
                        createdAt: new Date(),
                    },
                },
            });
        }
        return proposal.toObject();
    }
    async updateProposal(id, data, requestingUser) {
        (0, database_1.ensureDatabaseConnected)();
        const existing = await Proposal_1.ProposalModel.findById(id);
        if (!existing) {
            throw new errors_1.NotFoundError(`Proposal not found for ID: ${id}`);
        }
        // RESOURCE-LEVEL AUTHORIZATION:
        if (requestingUser && requestingUser.role === 'broker') {
            const isCreator = existing.createdById === requestingUser.id;
            const inquiry = await Inquiry_1.InquiryModel.findById(existing.inquiryId);
            const isAssigned = inquiry?.assignedTo?.toString() === requestingUser.id;
            if (!isCreator && !isAssigned) {
                throw new errors_1.ForbiddenError('Access denied: You are not authorized to modify this proposal.');
            }
        }
        const updated = await Proposal_1.ProposalModel.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        }).lean();
        return updated;
    }
    async sendProposal(id, broker, requestingUser) {
        (0, database_1.ensureDatabaseConnected)();
        const proposal = await Proposal_1.ProposalModel.findById(id);
        if (!proposal) {
            throw new errors_1.NotFoundError(`Proposal not found for ID: ${id}`);
        }
        // RESOURCE-LEVEL AUTHORIZATION:
        if (requestingUser && requestingUser.role === 'broker') {
            const isCreator = proposal.createdById === requestingUser.id;
            const inquiry = await Inquiry_1.InquiryModel.findById(proposal.inquiryId);
            const isAssigned = inquiry?.assignedTo?.toString() === requestingUser.id;
            if (!isCreator && !isAssigned) {
                throw new errors_1.ForbiddenError('Access denied: You are not authorized to dispatch this proposal.');
            }
        }
        proposal.status = 'sent';
        await proposal.save();
        await audit_service_1.auditService.log({
            actor: requestingUser
                ? { id: requestingUser.id, email: requestingUser.email, name: requestingUser.name, role: requestingUser.role }
                : { id: broker.id, name: broker.name, role: 'broker' },
            action: 'proposal_dispatched',
            resourceType: 'proposal',
            resourceId: id,
            metadata: {
                referenceCode: proposal.referenceCode,
                clientEmail: proposal.clientEmail,
            },
        });
        // Update associated inquiry status to 'quote_sent' if currently in earlier stage
        const inquiry = await Inquiry_1.InquiryModel.findById(proposal.inquiryId);
        if (inquiry && ['new', 'in_review', 'supplier_contacted'].includes(inquiry.status)) {
            inquiry.status = 'quote_sent';
            inquiry.internalNotes.push({
                _id: undefined,
                authorId: broker.id,
                authorName: broker.name,
                content: `Bespoke proposal ${proposal.referenceCode} ("${proposal.title}") dispatched to client ${proposal.clientEmail}.`,
                category: 'internal',
                createdAt: new Date(),
            });
            await inquiry.save();
        }
        return proposal.toObject();
    }
    async clientRespond(token, decision, clientNotes) {
        (0, database_1.ensureDatabaseConnected)();
        const proposal = await Proposal_1.ProposalModel.findOne({ clientAccessToken: token });
        if (!proposal) {
            throw new errors_1.NotFoundError('Proposal not found or access token invalid.');
        }
        proposal.clientFeedback = {
            respondedAt: new Date(),
            decision,
            clientNotes: clientNotes || '',
        };
        if (decision === 'accepted') {
            proposal.status = 'accepted';
        }
        else if (decision === 'declined') {
            proposal.status = 'declined';
        }
        await proposal.save();
        await audit_service_1.auditService.log({
            actor: { role: 'anonymous', name: proposal.clientName, email: proposal.clientEmail },
            action: `client_proposal_${decision}`,
            resourceType: 'proposal',
            resourceId: proposal._id.toString(),
            metadata: { decision, clientNotes },
        });
        // Update Inquiry state and create booking
        const inquiry = await Inquiry_1.InquiryModel.findById(proposal.inquiryId);
        if (inquiry) {
            if (decision === 'accepted') {
                // Business Rule: Proposal acceptance NEVER automatically confirms a booking.
                // It creates a booking in pending_supplier_confirmation status.
                const booking = await booking_service_1.bookingService.createBookingFromProposal(proposal, inquiry);
                inquiry.status = 'supplier_contacted';
                inquiry.internalNotes.push({
                    _id: undefined,
                    authorId: 'client',
                    authorName: `${proposal.clientName} (Client)`,
                    content: `CLIENT ACCEPTED PROPOSAL ${proposal.referenceCode}. Booking ${booking.referenceCode} created with status pending_supplier_confirmation. Awaiting independent supplier confirmations (Aircraft, Yacht, Accommodation). Client notes: "${clientNotes || 'Accepted'}"`,
                    category: 'customer_call',
                    createdAt: new Date(),
                });
            }
            else if (decision === 'requested_changes') {
                inquiry.status = 'negotiating';
                inquiry.internalNotes.push({
                    _id: undefined,
                    authorId: 'client',
                    authorName: `${proposal.clientName} (Client)`,
                    content: `Client requested adjustments for proposal ${proposal.referenceCode}. Notes: "${clientNotes || 'Requested refinements'}"`,
                    category: 'customer_call',
                    createdAt: new Date(),
                });
            }
            else {
                inquiry.internalNotes.push({
                    _id: undefined,
                    authorId: 'client',
                    authorName: `${proposal.clientName} (Client)`,
                    content: `Client declined proposal ${proposal.referenceCode}. Notes: "${clientNotes || 'Declined'}"`,
                    category: 'customer_call',
                    createdAt: new Date(),
                });
            }
            await inquiry.save();
        }
        return proposal.toObject();
    }
    async deleteProposal(id, requestingUser) {
        (0, database_1.ensureDatabaseConnected)();
        const existing = await Proposal_1.ProposalModel.findById(id);
        if (!existing) {
            throw new errors_1.NotFoundError(`Proposal not found for ID: ${id}`);
        }
        if (requestingUser && requestingUser.role === 'broker') {
            if (existing.createdById !== requestingUser.id) {
                throw new errors_1.ForbiddenError('Access denied: Brokers can only delete their own draft proposals.');
            }
        }
        await Proposal_1.ProposalModel.findByIdAndDelete(id);
        return true;
    }
}
exports.ProposalService = ProposalService;
exports.proposalService = new ProposalService();
