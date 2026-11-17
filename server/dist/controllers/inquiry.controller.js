"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addInternalNote = exports.updateInquiry = exports.getInquiryById = exports.getAllInquiries = exports.createInquiry = void 0;
const inquiry_service_1 = require("../services/inquiry.service");
const createInquiry = async (req, res, next) => {
    try {
        const created = await inquiry_service_1.inquiryService.create(req.body);
        res.status(201).json({
            success: true,
            data: {
                id: created._id,
                referenceCode: created.referenceCode,
                customerName: created.customerName,
                destination: created.destination,
                status: created.status,
                createdAt: created.createdAt,
            },
            message: 'Your bespoke journey enquiry has been received. A Senior Charter Director has been notified and will contact you promptly.',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createInquiry = createInquiry;
const getAllInquiries = async (req, res, next) => {
    try {
        const { status, search, assignedTo, page, limit } = req.query;
        const result = await inquiry_service_1.inquiryService.getAll({
            status: status,
            search: search,
            assignedTo: assignedTo,
            page: page ? parseInt(page, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
        }, req.user);
        res.status(200).json({
            success: true,
            count: result.data.length,
            data: result.data,
            pagination: result.pagination,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllInquiries = getAllInquiries;
const getInquiryById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const inquiry = await inquiry_service_1.inquiryService.getById(id, req.user);
        res.status(200).json({
            success: true,
            data: inquiry,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getInquiryById = getInquiryById;
const updateInquiry = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updated = await inquiry_service_1.inquiryService.update(id, req.body, req.user);
        res.status(200).json({
            success: true,
            data: updated,
            message: 'Enquiry record updated successfully',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateInquiry = updateInquiry;
const addInternalNote = async (req, res, next) => {
    try {
        const { id } = req.params;
        const author = {
            id: req.user?.id || 'anonymous_broker',
            name: req.user?.name || 'Charter Broker',
        };
        const updated = await inquiry_service_1.inquiryService.addNote(id, req.body, author, req.user);
        res.status(201).json({
            success: true,
            data: updated,
            message: 'Internal dossier memorandum registered successfully',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.addInternalNote = addInternalNote;
