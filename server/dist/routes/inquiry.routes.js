"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const inquiry_controller_1 = require("../controllers/inquiry.controller");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const validators_1 = require("../validators");
const rateLimiter_1 = require("../middleware/rateLimiter");
const router = (0, express_1.Router)();
// Public multi-step bespoke journey enquiry submission with rate limiter
router.post('/', rateLimiter_1.inquiryLimiter, (0, validate_1.validateBody)(validators_1.createInquirySchema), inquiry_controller_1.createInquiry);
// Protected broker & admin workflow with centralized RBAC permissions
router.get('/', auth_1.authenticate, (0, auth_1.requirePermission)(['enquiries.read.all', 'enquiries.read.assigned']), inquiry_controller_1.getAllInquiries);
router.get('/:id', auth_1.authenticate, (0, auth_1.requirePermission)(['enquiries.read.all', 'enquiries.read.assigned']), inquiry_controller_1.getInquiryById);
router.patch('/:id', auth_1.authenticate, (0, auth_1.requirePermission)('enquiries.update'), (0, validate_1.validateBody)(validators_1.updateInquirySchema), inquiry_controller_1.updateInquiry);
router.post('/:id/notes', auth_1.authenticate, (0, auth_1.requirePermission)('enquiries.update'), (0, validate_1.validateBody)(validators_1.addInternalNoteSchema), inquiry_controller_1.addInternalNote);
exports.default = router;
