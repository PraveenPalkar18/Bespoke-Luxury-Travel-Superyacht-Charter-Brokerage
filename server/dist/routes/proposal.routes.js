"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const proposal_controller_1 = require("../controllers/proposal.controller");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const validators_1 = require("../validators");
const router = (0, express_1.Router)();
// Public Client Presentation Access (Secure Token-gated)
router.get('/public/:token', proposal_controller_1.getPublicProposal);
router.post('/public/:token/respond', (0, validate_1.validateBody)(validators_1.clientResponseSchema), proposal_controller_1.respondPublicProposal);
// Protected Broker & Admin Operations with Centralized RBAC
router.post('/', auth_1.authenticate, (0, auth_1.requirePermission)('proposals.create'), (0, validate_1.validateBody)(validators_1.createProposalSchema), proposal_controller_1.createProposal);
router.get('/inquiry/:inquiryId', auth_1.authenticate, (0, auth_1.requirePermission)(['proposals.read.all', 'proposals.read.assigned']), proposal_controller_1.getProposalsByInquiry);
router.get('/:id', auth_1.authenticate, (0, auth_1.requirePermission)(['proposals.read.all', 'proposals.read.assigned']), proposal_controller_1.getProposalById);
router.patch('/:id', auth_1.authenticate, (0, auth_1.requirePermission)('proposals.update'), (0, validate_1.validateBody)(validators_1.updateProposalSchema), proposal_controller_1.updateProposal);
router.post('/:id/send', auth_1.authenticate, (0, auth_1.requirePermission)('proposals.dispatch'), proposal_controller_1.sendProposal);
router.delete('/:id', auth_1.authenticate, (0, auth_1.requirePermission)('proposals.create'), proposal_controller_1.deleteProposal);
exports.default = router;
