import { Request, Response, NextFunction } from 'express';
import { proposalService } from '../services/proposal.service';
import { AuthenticatedRequest } from '../middleware/auth';

export const createProposal = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const broker = {
      id: req.user?.id || 'broker_1',
      name: req.user?.name || 'Charter Director',
    };
    const proposal = await proposalService.createProposal(req.body, broker, req.user);

    res.status(201).json({
      success: true,
      data: proposal,
      message: `Bespoke proposal ${proposal.referenceCode} created successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

export const getProposalsByInquiry = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { inquiryId } = req.params;
    const proposals = await proposalService.getByInquiryId(inquiryId, req.user);

    res.status(200).json({
      success: true,
      count: proposals.length,
      data: proposals,
    });
  } catch (error) {
    next(error);
  }
};

export const getProposalById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const proposal = await proposalService.getById(id, req.user);

    res.status(200).json({
      success: true,
      data: proposal,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProposal = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const updated = await proposalService.updateProposal(id, req.body, req.user);

    res.status(200).json({
      success: true,
      data: updated,
      message: 'Proposal updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const sendProposal = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const broker = {
      id: req.user?.id || 'broker_1',
      name: req.user?.name || 'Charter Director',
    };
    const sent = await proposalService.sendProposal(id, broker, req.user);

    res.status(200).json({
      success: true,
      data: sent,
      message: `Proposal dispatched. Client presentation active at /proposal/${sent.clientAccessToken}`,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProposal = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    await proposalService.deleteProposal(id, req.user);

    res.status(200).json({
      success: true,
      message: 'Proposal discarded successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Client-Facing Public Endpoints (Token-Authenticated)
export const getPublicProposal = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token } = req.params;
    const proposal = await proposalService.getByAccessToken(token);

    res.status(200).json({
      success: true,
      data: proposal,
    });
  } catch (error) {
    next(error);
  }
};

export const respondPublicProposal = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token } = req.params;
    const { decision, clientNotes } = req.body;
    const updated = await proposalService.clientRespond(token, decision, clientNotes);

    res.status(200).json({
      success: true,
      data: updated,
      message:
        decision === 'accepted'
          ? 'Proposal accepted. Your Senior Charter Director has been notified and will prepare your formal charter agreement.'
          : 'Thank you for your response. Your Charter Director has been notified.',
    });
  } catch (error) {
    next(error);
  }
};
