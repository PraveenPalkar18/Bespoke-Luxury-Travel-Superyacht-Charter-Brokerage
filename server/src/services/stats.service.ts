import { InquiryModel } from '../models/Inquiry';
import { AircraftModel } from '../models/Aircraft';
import { YachtModel } from '../models/Yacht';
import { DestinationModel } from '../models/Destination';
import { ensureDatabaseConnected } from '../config/database';
import { IInquiry } from '../types';

export interface ServiceDistribution {
  private_jet: number;
  superyacht: number;
  both: number;
  other: number;
}

export interface DashboardStats {
  totalEnquiries: number;
  newEnquiries: number;
  inProgressEnquiries: number;
  confirmedEnquiries: number;
  serviceDistribution: ServiceDistribution;
  recentEnquiries: IInquiry[];
  overview: {
    totalInquiries: number;
    newInquiries: number;
    inReviewInquiries: number;
    supplierContactedInquiries: number;
    quotesSentInquiries: number;
    confirmedInquiries: number;
    archivedInquiries: number;
    vipInquiries: number;
  };
  fleet: {
    totalJets: number;
    totalYachts: number;
    totalDestinations: number;
  };
  pipelineValue: {
    estimatedDealsCount: number;
    conversionRatePercent: number;
  };
}

export class StatsService {
  async getOverviewStats(): Promise<DashboardStats> {
    ensureDatabaseConnected();

    const [
      totalInquiries,
      newInquiries,
      inReviewInquiries,
      supplierContactedInquiries,
      quotesSentInquiries,
      negotiatingInquiries,
      confirmedInquiries,
      archivedInquiries,
      vipInquiries,
      totalJets,
      totalYachts,
      totalDestinations,
      recentEnquiriesDocs,
      allInquiriesServices,
    ] = await Promise.all([
      InquiryModel.countDocuments(),
      InquiryModel.countDocuments({ status: 'new' }),
      InquiryModel.countDocuments({ status: 'in_review' }),
      InquiryModel.countDocuments({ status: 'supplier_contacted' }),
      InquiryModel.countDocuments({ status: 'quote_sent' }),
      InquiryModel.countDocuments({ status: 'negotiating' }),
      InquiryModel.countDocuments({ status: 'confirmed' }),
      InquiryModel.countDocuments({ status: 'archived' }),
      InquiryModel.countDocuments({ priority: 'vip' }),
      AircraftModel.countDocuments({ isPublished: true }),
      YachtModel.countDocuments({ isPublished: true }),
      DestinationModel.countDocuments({ isPublished: true }),
      InquiryModel.find().sort({ createdAt: -1 }).limit(6).lean(),
      InquiryModel.find().select('requestedServices').lean(),
    ]);

    const inProgressEnquiries =
      inReviewInquiries + supplierContactedInquiries + quotesSentInquiries + negotiatingInquiries;

    // Calculate service distribution
    const serviceDistribution: ServiceDistribution = {
      private_jet: 0,
      superyacht: 0,
      both: 0,
      other: 0,
    };

    for (const item of allInquiriesServices) {
      const services = item.requestedServices || [];
      const hasJet = services.includes('private_jet');
      const hasYacht = services.includes('superyacht');
      const hasBoth = services.includes('both') || (hasJet && hasYacht);

      if (hasBoth) {
        serviceDistribution.both++;
      } else if (hasJet) {
        serviceDistribution.private_jet++;
      } else if (hasYacht) {
        serviceDistribution.superyacht++;
      } else {
        serviceDistribution.other++;
      }
    }

    const activeInquiries = totalInquiries - archivedInquiries;
    const conversionRatePercent =
      activeInquiries > 0 ? Math.round((confirmedInquiries / activeInquiries) * 100) : 0;

    return {
      totalEnquiries: totalInquiries,
      newEnquiries: newInquiries,
      inProgressEnquiries: inProgressEnquiries,
      confirmedEnquiries: confirmedInquiries,
      serviceDistribution,
      recentEnquiries: recentEnquiriesDocs as unknown as IInquiry[],
      overview: {
        totalInquiries,
        newInquiries,
        inReviewInquiries,
        supplierContactedInquiries,
        quotesSentInquiries,
        confirmedInquiries,
        archivedInquiries,
        vipInquiries,
      },
      fleet: {
        totalJets,
        totalYachts,
        totalDestinations,
      },
      pipelineValue: {
        estimatedDealsCount: inProgressEnquiries,
        conversionRatePercent,
      },
    };
  }
}

export const statsService = new StatsService();
