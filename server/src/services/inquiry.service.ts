import { InquiryModel } from '../models/Inquiry';
import { IInquiry, IInternalNote, InquiryStatus, PaginatedResult, AuthUserPayload } from '../types';
import { ensureDatabaseConnected } from '../config/database';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';
import { isValidStatusTransition, VALID_STATUS_TRANSITIONS } from '../validators';
import { auditService } from './audit.service';

export interface InquiryFilterOptions {
  status?: InquiryStatus;
  search?: string;
  assignedTo?: string;
  page?: number;
  limit?: number;
}

export class InquiryService {
  private generateReferenceCode(): string {
    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    return `AUR-${year}-${randomSuffix}`;
  }

  async create(data: Partial<IInquiry>): Promise<IInquiry> {
    ensureDatabaseConnected();

    const referenceCode = this.generateReferenceCode();
    const inquiryPayload = {
      ...data,
      referenceCode,
      status: 'new' as InquiryStatus,
      internalNotes: [],
    };

    const created = await InquiryModel.create(inquiryPayload);

    await auditService.log({
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

    return created.toObject() as IInquiry;
  }

  async getAll(
    options: InquiryFilterOptions = {},
    requestingUser?: AuthUserPayload
  ): Promise<PaginatedResult<IInquiry>> {
    ensureDatabaseConnected();

    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, Math.min(options.limit || 20, 100));
    const skip = (page - 1) * limit;

    const query: any = {};
    if (options.status) {
      query.status = options.status;
    }

    // RESOURCE-LEVEL AUTHORIZATION:
    // Brokers can strictly only query their assigned enquiries!
    if (requestingUser && requestingUser.role === 'broker') {
      query.assignedTo = requestingUser.id;
    } else if (options.assignedTo) {
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
      InquiryModel.countDocuments(query),
      InquiryModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data: data as unknown as IInquiry[],
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

  async getById(id: string, requestingUser?: AuthUserPayload): Promise<IInquiry> {
    ensureDatabaseConnected();
    const inquiry = await InquiryModel.findById(id).lean();
    if (!inquiry) {
      throw new NotFoundError(`Enquiry dossier not found with identifier: ${id}`);
    }

    // RESOURCE-LEVEL AUTHORIZATION:
    // If requesting user is a broker, verify assignment
    if (requestingUser && requestingUser.role === 'broker') {
      const isAssigned = inquiry.assignedTo?.toString() === requestingUser.id;
      if (!isAssigned) {
        await auditService.log({
          actor: { id: requestingUser.id, email: requestingUser.email, name: requestingUser.name, role: requestingUser.role },
          action: 'unauthorized_access_attempt',
          resourceType: 'inquiry',
          resourceId: id,
          metadata: { attemptedAction: 'view_enquiry', actualAssignedTo: inquiry.assignedTo },
        });
        throw new ForbiddenError('Access denied: You are not authorized to view this confidential enquiry.');
      }
    }

    return inquiry as unknown as IInquiry;
  }

  async update(
    id: string,
    updateData: Partial<IInquiry>,
    requestingUser?: AuthUserPayload
  ): Promise<IInquiry> {
    ensureDatabaseConnected();

    const current = await InquiryModel.findById(id);
    if (!current) {
      throw new NotFoundError(`Enquiry dossier not found with identifier: ${id}`);
    }

    // RESOURCE-LEVEL AUTHORIZATION:
    if (requestingUser && requestingUser.role === 'broker') {
      const isAssigned = current.assignedTo?.toString() === requestingUser.id;
      if (!isAssigned) {
        await auditService.log({
          actor: { id: requestingUser.id, email: requestingUser.email, name: requestingUser.name, role: requestingUser.role },
          action: 'unauthorized_access_attempt',
          resourceType: 'inquiry',
          resourceId: id,
          metadata: { attemptedAction: 'update_enquiry' },
        });
        throw new ForbiddenError('Access denied: You are not authorized to modify this enquiry.');
      }

      // Brokers cannot reassign enquiries to other brokers
      if (updateData.assignedTo && updateData.assignedTo !== current.assignedTo?.toString()) {
        throw new ForbiddenError('Brokers are not authorized to reassign enquiries. Contact the Managing Director.');
      }
    }

    // Enforce state transition rules
    if (updateData.status && updateData.status !== current.status) {
      const isValid = isValidStatusTransition(current.status, updateData.status);
      if (!isValid) {
        const allowed = VALID_STATUS_TRANSITIONS[current.status] || [];
        throw new BadRequestError(
          `Invalid inquiry status transition from "${current.status}" to "${updateData.status}". Permitted transitions: ${allowed.join(', ') || 'None'}.`
        );
      }

      await auditService.log({
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
      await auditService.log({
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

    return current.toObject() as IInquiry;
  }

  async addNote(
    id: string,
    noteData: { content: string; category?: 'internal' | 'supplier' | 'customer_call' },
    author: { id: string; name: string },
    requestingUser?: AuthUserPayload
  ): Promise<IInquiry> {
    ensureDatabaseConnected();

    const current = await InquiryModel.findById(id);
    if (!current) {
      throw new NotFoundError(`Enquiry dossier not found with identifier: ${id}`);
    }

    // RESOURCE-LEVEL AUTHORIZATION:
    if (requestingUser && requestingUser.role === 'broker') {
      const isAssigned = current.assignedTo?.toString() === requestingUser.id;
      if (!isAssigned) {
        await auditService.log({
          actor: { id: requestingUser.id, email: requestingUser.email, name: requestingUser.name, role: requestingUser.role },
          action: 'unauthorized_access_attempt',
          resourceType: 'inquiry',
          resourceId: id,
          metadata: { attemptedAction: 'add_internal_note' },
        });
        throw new ForbiddenError('Access denied: You cannot add notes to an enquiry not assigned to you.');
      }
    }

    const note: Partial<IInternalNote> = {
      authorId: author.id,
      authorName: author.name,
      content: noteData.content,
      category: noteData.category || 'internal',
      createdAt: new Date(),
    };

    current.internalNotes.push(note as any);
    await current.save();

    return current.toObject() as IInquiry;
  }
}

export const inquiryService = new InquiryService();
