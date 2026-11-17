import crypto from 'crypto';
import { ProposalModel } from '../models/Proposal';
import { InquiryModel } from '../models/Inquiry';
import { IProposal, ProposalStatus, AuthUserPayload } from '../types';
import { ensureDatabaseConnected } from '../config/database';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';
import { auditService } from './audit.service';

export class ProposalService {
  private generateReferenceCode(): string {
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `PROP-${year}-${rand}`;
  }

  private generateSecureToken(): string {
    return crypto.randomBytes(20).toString('hex');
  }

  async createProposal(
    data: any,
    broker: { id: string; name: string },
    requestingUser?: AuthUserPayload
  ): Promise<IProposal> {
    ensureDatabaseConnected();

    const inquiry = await InquiryModel.findById(data.inquiryId);
    if (!inquiry) {
      throw new NotFoundError(`Associated enquiry dossier not found: ${data.inquiryId}`);
    }

    // RESOURCE-LEVEL AUTHORIZATION:
    // If requesting user is a broker, they can only create proposals for enquiries assigned to them
    if (requestingUser && requestingUser.role === 'broker') {
      const isAssigned = inquiry.assignedTo?.toString() === requestingUser.id;
      if (!isAssigned) {
        await auditService.log({
          actor: { id: requestingUser.id, email: requestingUser.email, name: requestingUser.name, role: requestingUser.role },
          action: 'unauthorized_access_attempt',
          resourceType: 'proposal',
          metadata: { attemptedAction: 'create_proposal_for_unassigned_enquiry', inquiryId: data.inquiryId },
        });
        throw new ForbiddenError('Access denied: You can only create proposals for enquiries assigned to you.');
      }
    }

    const referenceCode = this.generateReferenceCode();
    const clientAccessToken = this.generateSecureToken();

    const proposal = await ProposalModel.create({
      ...data,
      referenceCode,
      clientAccessToken,
      createdById: broker.id,
      createdByName: broker.name,
      status: 'draft' as ProposalStatus,
    });

    await auditService.log({
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

    return proposal.toObject() as IProposal;
  }

  async getByInquiryId(inquiryId: string, requestingUser?: AuthUserPayload): Promise<IProposal[]> {
    ensureDatabaseConnected();

    // Verify access to the parent inquiry first
    const inquiry = await InquiryModel.findById(inquiryId);
    if (!inquiry) {
      throw new NotFoundError(`Enquiry dossier not found: ${inquiryId}`);
    }

    if (requestingUser && requestingUser.role === 'broker') {
      const isAssigned = inquiry.assignedTo?.toString() === requestingUser.id;
      if (!isAssigned) {
        throw new ForbiddenError('Access denied: You are not authorized to view proposals for this enquiry.');
      }
    }

    const proposals = await ProposalModel.find({ inquiryId })
      .sort({ createdAt: -1 })
      .lean();
    return proposals as unknown as IProposal[];
  }

  async getById(id: string, requestingUser?: AuthUserPayload): Promise<IProposal> {
    ensureDatabaseConnected();
    const proposal = await ProposalModel.findById(id).lean();
    if (!proposal) {
      throw new NotFoundError(`Proposal not found for ID: ${id}`);
    }

    // RESOURCE-LEVEL AUTHORIZATION:
    if (requestingUser && requestingUser.role === 'broker') {
      const isCreator = proposal.createdById === requestingUser.id;
      // Also check if assigned to inquiry
      const inquiry = await InquiryModel.findById(proposal.inquiryId).lean();
      const isAssignedToInquiry = inquiry?.assignedTo?.toString() === requestingUser.id;

      if (!isCreator && !isAssignedToInquiry) {
        await auditService.log({
          actor: { id: requestingUser.id, email: requestingUser.email, name: requestingUser.name, role: requestingUser.role },
          action: 'unauthorized_access_attempt',
          resourceType: 'proposal',
          resourceId: id,
          metadata: { attemptedAction: 'view_proposal' },
        });
        throw new ForbiddenError('Access denied: You are not authorized to view this proposal.');
      }
    }

    return proposal as unknown as IProposal;
  }

  async getByAccessToken(token: string): Promise<IProposal> {
    ensureDatabaseConnected();
    const proposal = await ProposalModel.findOne({ clientAccessToken: token });
    if (!proposal) {
      throw new NotFoundError('Luxury travel proposal not found or link has expired.');
    }

    // Automatically mark as viewed if first time opened by client
    if (proposal.status === 'sent') {
      proposal.status = 'viewed';
      await proposal.save();

      // Log note on inquiry
      await InquiryModel.findByIdAndUpdate(proposal.inquiryId, {
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

    return proposal.toObject() as IProposal;
  }

  async updateProposal(id: string, data: any, requestingUser?: AuthUserPayload): Promise<IProposal> {
    ensureDatabaseConnected();

    const existing = await ProposalModel.findById(id);
    if (!existing) {
      throw new NotFoundError(`Proposal not found for ID: ${id}`);
    }

    // RESOURCE-LEVEL AUTHORIZATION:
    if (requestingUser && requestingUser.role === 'broker') {
      const isCreator = existing.createdById === requestingUser.id;
      const inquiry = await InquiryModel.findById(existing.inquiryId);
      const isAssigned = inquiry?.assignedTo?.toString() === requestingUser.id;

      if (!isCreator && !isAssigned) {
        throw new ForbiddenError('Access denied: You are not authorized to modify this proposal.');
      }
    }

    const updated = await ProposalModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).lean();

    return updated as unknown as IProposal;
  }

  async sendProposal(
    id: string,
    broker: { id: string; name: string },
    requestingUser?: AuthUserPayload
  ): Promise<IProposal> {
    ensureDatabaseConnected();
    const proposal = await ProposalModel.findById(id);
    if (!proposal) {
      throw new NotFoundError(`Proposal not found for ID: ${id}`);
    }

    // RESOURCE-LEVEL AUTHORIZATION:
    if (requestingUser && requestingUser.role === 'broker') {
      const isCreator = proposal.createdById === requestingUser.id;
      const inquiry = await InquiryModel.findById(proposal.inquiryId);
      const isAssigned = inquiry?.assignedTo?.toString() === requestingUser.id;

      if (!isCreator && !isAssigned) {
        throw new ForbiddenError('Access denied: You are not authorized to dispatch this proposal.');
      }
    }

    proposal.status = 'sent';
    await proposal.save();

    await auditService.log({
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
    const inquiry = await InquiryModel.findById(proposal.inquiryId);
    if (inquiry && ['new', 'in_review', 'supplier_contacted'].includes(inquiry.status)) {
      inquiry.status = 'quote_sent';
      inquiry.internalNotes.push({
        _id: undefined as any,
        authorId: broker.id,
        authorName: broker.name,
        content: `Bespoke proposal ${proposal.referenceCode} ("${proposal.title}") dispatched to client ${proposal.clientEmail}.`,
        category: 'internal',
        createdAt: new Date(),
      });
      await inquiry.save();
    }

    return proposal.toObject() as IProposal;
  }

  async clientRespond(
    token: string,
    decision: 'accepted' | 'declined' | 'requested_changes',
    clientNotes?: string
  ): Promise<IProposal> {
    ensureDatabaseConnected();
    const proposal = await ProposalModel.findOne({ clientAccessToken: token });
    if (!proposal) {
      throw new NotFoundError('Proposal not found or access token invalid.');
    }

    proposal.clientFeedback = {
      respondedAt: new Date(),
      decision,
      clientNotes: clientNotes || '',
    };

    if (decision === 'accepted') {
      proposal.status = 'accepted';
    } else if (decision === 'declined') {
      proposal.status = 'declined';
    }

    await proposal.save();

    await auditService.log({
      actor: { role: 'anonymous', name: proposal.clientName, email: proposal.clientEmail },
      action: `client_proposal_${decision}`,
      resourceType: 'proposal',
      resourceId: proposal._id.toString(),
      metadata: { decision, clientNotes },
    });

    // Update Inquiry state
    const inquiry = await InquiryModel.findById(proposal.inquiryId);
    if (inquiry) {
      if (decision === 'accepted') {
        inquiry.status = 'confirmed';
        inquiry.internalNotes.push({
          _id: undefined as any,
          authorId: 'client',
          authorName: `${proposal.clientName} (Client)`,
          content: `CLIENT ACCEPTED PROPOSAL ${proposal.referenceCode}! Total quotation: $${proposal.pricing.totalEstimatedCost.toLocaleString()}. Client notes: "${clientNotes || 'Confirmed and ready for agreement.'}"`,
          category: 'customer_call',
          createdAt: new Date(),
        });
      } else if (decision === 'requested_changes') {
        inquiry.status = 'negotiating';
        inquiry.internalNotes.push({
          _id: undefined as any,
          authorId: 'client',
          authorName: `${proposal.clientName} (Client)`,
          content: `Client requested adjustments for proposal ${proposal.referenceCode}. Notes: "${clientNotes || 'Requested refinements'}"`,
          category: 'customer_call',
          createdAt: new Date(),
        });
      } else {
        inquiry.internalNotes.push({
          _id: undefined as any,
          authorId: 'client',
          authorName: `${proposal.clientName} (Client)`,
          content: `Client declined proposal ${proposal.referenceCode}. Notes: "${clientNotes || 'Declined'}"`,
          category: 'customer_call',
          createdAt: new Date(),
        });
      }
      await inquiry.save();
    }

    return proposal.toObject() as IProposal;
  }

  async deleteProposal(id: string, requestingUser?: AuthUserPayload): Promise<boolean> {
    ensureDatabaseConnected();

    const existing = await ProposalModel.findById(id);
    if (!existing) {
      throw new NotFoundError(`Proposal not found for ID: ${id}`);
    }

    if (requestingUser && requestingUser.role === 'broker') {
      if (existing.createdById !== requestingUser.id) {
        throw new ForbiddenError('Access denied: Brokers can only delete their own draft proposals.');
      }
    }

    await ProposalModel.findByIdAndDelete(id);
    return true;
  }
}

export const proposalService = new ProposalService();
