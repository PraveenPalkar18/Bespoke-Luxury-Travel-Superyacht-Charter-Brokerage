"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inquiryService = exports.InquiryService = void 0;
const Inquiry_1 = require("../models/Inquiry");
const database_1 = require("../config/database");
const errors_1 = require("../utils/errors");
const validators_1 = require("../validators");
const audit_service_1 = require("./audit.service");
class InquiryService {
    generateReferenceCode() {
        const year = new Date().getFullYear();
        const randomSuffix = Math.floor(10000 + Math.random() * 90000);
        return `AUR-${year}-${randomSuffix}`;
    }
    async create(data) {
        (0, database_1.ensureDatabaseConnected)();
        const referenceCode = this.generateReferenceCode();
        const inquiryPayload = {
            ...data,
            referenceCode,
            status: 'new',
            internalNotes: [],
        };
        const created = await Inquiry_1.InquiryModel.create(inquiryPayload);
        await audit_service_1.auditService.log({
            actor: { role: 'anonymous', name: data.customerName, email: data.email },
            action: 'enquiry_created',
            resourceType: 'inquiry',
            resourceId: created._id.toString(),
            metadata: {
                referenceCode,
                destination: data.destination,
                requestedServices: data.requestedServices,
            },
        });
        return created.toObject();
    }
    async getAll(options = {}, requestingUser) {
        (0, database_1.ensureDatabaseConnected)();
        const page = Math.max(1, options.page || 1);
        const limit = Math.max(1, Math.min(options.limit || 20, 100));
        const skip = (page - 1) * limit;
        const query = {};
        if (options.status) {
            query.status = options.status;
        }
        // RESOURCE-LEVEL AUTHORIZATION:
        // Brokers can strictly only query their assigned enquiries!
        if (requestingUser && requestingUser.role === 'broker') {
            query.assignedTo = requestingUser.id;
        }
        else if (options.assignedTo) {
            // Admin can filter by broker if requested
            query.assignedTo = options.assignedTo;
        }
        if (options.search) {
            const searchRegex = new RegExp(options.search.trim(), 'i');
            query.$or = [
                { customerName: searchRegex },
                { email: searchRegex },
                { destination: searchRegex },
                { departureLocation: searchRegex },
                { referenceCode: searchRegex },
            ];
        }
        const [total, data] = await Promise.all([
            Inquiry_1.InquiryModel.countDocuments(query),
            Inquiry_1.InquiryModel.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
        ]);
        const totalPages = Math.ceil(total / limit) || 1;
        return {
            data: data,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            },
        };
    }
    async getById(id, requestingUser) {
        (0, database_1.ensureDatabaseConnected)();
        const inquiry = await Inquiry_1.InquiryModel.findById(id).lean();
        if (!inquiry) {
            throw new errors_1.NotFoundError(`Enquiry dossier not found with identifier: ${id}`);
        }
        // RESOURCE-LEVEL AUTHORIZATION:
        // If requesting user is a broker, verify assignment
        if (requestingUser && requestingUser.role === 'broker') {
            const isAssigned = inquiry.assignedTo?.toString() === requestingUser.id;
            if (!isAssigned) {
                await audit_service_1.auditService.log({
                    actor: { id: requestingUser.id, email: requestingUser.email, name: requestingUser.name, role: requestingUser.role },
                    action: 'unauthorized_access_attempt',
                    resourceType: 'inquiry',
                    resourceId: id,
                    metadata: { attemptedAction: 'view_enquiry', actualAssignedTo: inquiry.assignedTo },
                });
                throw new errors_1.ForbiddenError('Access denied: You are not authorized to view this confidential enquiry.');
            }
        }
        return inquiry;
    }
    async update(id, updateData, requestingUser) {
        (0, database_1.ensureDatabaseConnected)();
        const current = await Inquiry_1.InquiryModel.findById(id);
        if (!current) {
            throw new errors_1.NotFoundError(`Enquiry dossier not found with identifier: ${id}`);
        }
        // RESOURCE-LEVEL AUTHORIZATION:
        if (requestingUser && requestingUser.role === 'broker') {
            const isAssigned = current.assignedTo?.toString() === requestingUser.id;
            if (!isAssigned) {
                await audit_service_1.auditService.log({
                    actor: { id: requestingUser.id, email: requestingUser.email, name: requestingUser.name, role: requestingUser.role },
                    action: 'unauthorized_access_attempt',
                    resourceType: 'inquiry',
                    resourceId: id,
                    metadata: { attemptedAction: 'update_enquiry' },
                });
                throw new errors_1.ForbiddenError('Access denied: You are not authorized to modify this enquiry.');
            }
            // Brokers cannot reassign enquiries to other brokers
            if (updateData.assignedTo && updateData.assignedTo !== current.assignedTo?.toString()) {
                throw new errors_1.ForbiddenError('Brokers are not authorized to reassign enquiries. Contact the Managing Director.');
            }
        }
        // Enforce state transition rules
        if (updateData.status && updateData.status !== current.status) {
            const isValid = (0, validators_1.isValidStatusTransition)(current.status, updateData.status);
            if (!isValid) {
                const allowed = validators_1.VALID_STATUS_TRANSITIONS[current.status] || [];
                throw new errors_1.BadRequestError(`Invalid inquiry status transition from "${current.status}" to "${updateData.status}". Permitted transitions: ${allowed.join(', ') || 'None'}.`);
            }
            await audit_service_1.auditService.log({
                actor: requestingUser
                    ? { id: requestingUser.id, email: requestingUser.email, name: requestingUser.name, role: requestingUser.role }
                    : { role: 'system' },
                action: 'enquiry_status_updated',
                resourceType: 'inquiry',
                resourceId: id,
                metadata: { fromStatus: current.status, toStatus: updateData.status },
            });
        }
        // Audit assignment changes
        if (updateData.assignedTo && updateData.assignedTo !== current.assignedTo?.toString()) {
            await audit_service_1.auditService.log({
                actor: requestingUser
                    ? { id: requestingUser.id, email: requestingUser.email, name: requestingUser.name, role: requestingUser.role }
                    : { role: 'system' },
                action: 'enquiry_assigned',
                resourceType: 'inquiry',
                resourceId: id,
                metadata: {
                    previousAssignedTo: current.assignedTo,
                    newAssignedTo: updateData.assignedTo,
                    assignedBrokerName: updateData.assignedBrokerName,
                },
            });
        }
        Object.assign(current, updateData);
        await current.save();
        return current.toObject();
    }
    async addNote(id, noteData, author, requestingUser) {
        (0, database_1.ensureDatabaseConnected)();
        const current = await Inquiry_1.InquiryModel.findById(id);
        if (!current) {
            throw new errors_1.NotFoundError(`Enquiry dossier not found with identifier: ${id}`);
        }
        // RESOURCE-LEVEL AUTHORIZATION:
        if (requestingUser && requestingUser.role === 'broker') {
            const isAssigned = current.assignedTo?.toString() === requestingUser.id;
            if (!isAssigned) {
                await audit_service_1.auditService.log({
                    actor: { id: requestingUser.id, email: requestingUser.email, name: requestingUser.name, role: requestingUser.role },
                    action: 'unauthorized_access_attempt',
                    resourceType: 'inquiry',
                    resourceId: id,
                    metadata: { attemptedAction: 'add_internal_note' },
                });
                throw new errors_1.ForbiddenError('Access denied: You cannot add notes to an enquiry not assigned to you.');
            }
        }
        const note = {
            authorId: author.id,
            authorName: author.name,
            content: noteData.content,
            category: noteData.category || 'internal',
            createdAt: new Date(),
        };
        current.internalNotes.push(note);
        await current.save();
        return current.toObject();
    }
}
exports.InquiryService = InquiryService;
exports.inquiryService = new InquiryService();
