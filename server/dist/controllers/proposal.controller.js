"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.respondPublicProposal = exports.getPublicProposal = exports.deleteProposal = exports.sendProposal = exports.updateProposal = exports.getProposalById = exports.getProposalsByInquiry = exports.createProposal = void 0;
const proposal_service_1 = require("../services/proposal.service");
const createProposal = async (req, res, next) => {
    try {
        const broker = {
            id: req.user?.id || 'broker_1',
            name: req.user?.name || 'Charter Director',
        };
        const proposal = await proposal_service_1.proposalService.createProposal(req.body, broker, req.user);
        res.status(201).json({
            success: true,
            data: proposal,
            message: `Bespoke proposal ${proposal.referenceCode} created successfully.`,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createProposal = createProposal;
const getProposalsByInquiry = async (req, res, next) => {
    try {
        const { inquiryId } = req.params;
        const proposals = await proposal_service_1.proposalService.getByInquiryId(inquiryId, req.user);
        res.status(200).json({
            success: true,
            count: proposals.length,
            data: proposals,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getProposalsByInquiry = getProposalsByInquiry;
const getProposalById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const proposal = await proposal_service_1.proposalService.getById(id, req.user);
        res.status(200).json({
            success: true,
            data: proposal,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getProposalById = getProposalById;
const updateProposal = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updated = await proposal_service_1.proposalService.updateProposal(id, req.body, req.user);
        res.status(200).json({
            success: true,
            data: updated,
            message: 'Proposal updated successfully',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateProposal = updateProposal;
const sendProposal = async (req, res, next) => {
    try {
        const { id } = req.params;
        const broker = {
            id: req.user?.id || 'broker_1',
            name: req.user?.name || 'Charter Director',
        };
        const sent = await proposal_service_1.proposalService.sendProposal(id, broker, req.user);
        res.status(200).json({
            success: true,
            data: sent,
            message: `Proposal dispatched. Client presentation active at /proposal/${sent.clientAccessToken}`,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.sendProposal = sendProposal;
const deleteProposal = async (req, res, next) => {
    try {
        const { id } = req.params;
        await proposal_service_1.proposalService.deleteProposal(id, req.user);
        res.status(200).json({
            success: true,
            message: 'Proposal discarded successfully',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteProposal = deleteProposal;
// Client-Facing Public Endpoints (Token-Authenticated)
const getPublicProposal = async (req, res, next) => {
    try {
        const { token } = req.params;
        const proposal = await proposal_service_1.proposalService.getByAccessToken(token);
        res.status(200).json({
            success: true,
            data: proposal,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getPublicProposal = getPublicProposal;
const respondPublicProposal = async (req, res, next) => {
    try {
        const { token } = req.params;
        const { decision, clientNotes } = req.body;
        const updated = await proposal_service_1.proposalService.clientRespond(token, decision, clientNotes);
        res.status(200).json({
            success: true,
            data: updated,
            message: decision === 'accepted'
                ? 'Proposal accepted. Your Senior Charter Director has been notified and will prepare your formal charter agreement.'
                : 'Thank you for your response. Your Charter Director has been notified.',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.respondPublicProposal = respondPublicProposal;
