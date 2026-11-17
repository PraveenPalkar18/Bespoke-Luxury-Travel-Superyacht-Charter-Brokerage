"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.statsService = exports.StatsService = void 0;
const Inquiry_1 = require("../models/Inquiry");
const Aircraft_1 = require("../models/Aircraft");
const Yacht_1 = require("../models/Yacht");
const Destination_1 = require("../models/Destination");
const database_1 = require("../config/database");
class StatsService {
    async getOverviewStats() {
        (0, database_1.ensureDatabaseConnected)();
        const [totalInquiries, newInquiries, inReviewInquiries, supplierContactedInquiries, quotesSentInquiries, negotiatingInquiries, confirmedInquiries, archivedInquiries, vipInquiries, totalJets, totalYachts, totalDestinations, recentEnquiriesDocs, allInquiriesServices,] = await Promise.all([
            Inquiry_1.InquiryModel.countDocuments(),
            Inquiry_1.InquiryModel.countDocuments({ status: 'new' }),
            Inquiry_1.InquiryModel.countDocuments({ status: 'in_review' }),
            Inquiry_1.InquiryModel.countDocuments({ status: 'supplier_contacted' }),
            Inquiry_1.InquiryModel.countDocuments({ status: 'quote_sent' }),
            Inquiry_1.InquiryModel.countDocuments({ status: 'negotiating' }),
            Inquiry_1.InquiryModel.countDocuments({ status: 'confirmed' }),
            Inquiry_1.InquiryModel.countDocuments({ status: 'archived' }),
            Inquiry_1.InquiryModel.countDocuments({ priority: 'vip' }),
            Aircraft_1.AircraftModel.countDocuments({ isPublished: true }),
            Yacht_1.YachtModel.countDocuments({ isPublished: true }),
            Destination_1.DestinationModel.countDocuments({ isPublished: true }),
            Inquiry_1.InquiryModel.find().sort({ createdAt: -1 }).limit(6).lean(),
            Inquiry_1.InquiryModel.find().select('requestedServices').lean(),
        ]);
        const inProgressEnquiries = inReviewInquiries + supplierContactedInquiries + quotesSentInquiries + negotiatingInquiries;
        // Calculate service distribution
        const serviceDistribution = {
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
            }
            else if (hasJet) {
                serviceDistribution.private_jet++;
            }
            else if (hasYacht) {
                serviceDistribution.superyacht++;
            }
            else {
                serviceDistribution.other++;
            }
        }
        const activeInquiries = totalInquiries - archivedInquiries;
        const conversionRatePercent = activeInquiries > 0 ? Math.round((confirmedInquiries / activeInquiries) * 100) : 0;
        return {
            totalEnquiries: totalInquiries,
            newEnquiries: newInquiries,
            inProgressEnquiries: inProgressEnquiries,
            confirmedEnquiries: confirmedInquiries,
            serviceDistribution,
            recentEnquiries: recentEnquiriesDocs,
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
exports.StatsService = StatsService;
exports.statsService = new StatsService();
