"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProposalModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ItineraryDaySchema = new mongoose_1.Schema({
    dayNumber: { type: Number, required: true },
    title: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    highlights: [{ type: String }],
    transportMode: {
        type: String,
        enum: ['private_jet', 'superyacht', 'helicopter', 'chauffeur', 'leisure'],
        default: 'leisure',
    },
    accommodation: { type: String },
    image: { type: String },
}, { _id: false });
const ProposalPricingSchema = new mongoose_1.Schema({
    currency: { type: String, enum: ['USD', 'EUR', 'GBP'], default: 'USD' },
    aircraftCharterPrice: { type: Number, default: 0 },
    yachtCharterPrice: { type: Number, default: 0 },
    estimatedAPA: { type: Number, default: 0 },
    conciergeAndCrewGratuity: { type: Number, default: 0 },
    taxesAndFees: { type: Number, default: 0 },
    totalEstimatedCost: { type: Number, required: true },
}, { _id: false });
const ProposalAircraftSpecSchema = new mongoose_1.Schema({
    aircraftId: { type: String },
    name: { type: String, required: true },
    model: { type: String, required: true },
    category: { type: String, required: true },
    departureFBO: { type: String },
    arrivalFBO: { type: String },
    flightHours: { type: Number },
    passengerCount: { type: Number },
    featuredImage: { type: String },
}, { _id: false });
const ProposalYachtSpecSchema = new mongoose_1.Schema({
    yachtId: { type: String },
    name: { type: String, required: true },
    builder: { type: String, required: true },
    lengthFeet: { type: Number, required: true },
    embarkationPort: { type: String, required: true },
    disembarkationPort: { type: String, required: true },
    charterDays: { type: Number, required: true },
    guestCount: { type: Number },
    featuredImage: { type: String },
}, { _id: false });
const ProposalSchema = new mongoose_1.Schema({
    inquiryId: { type: String, required: true, index: true },
    referenceCode: { type: String, required: true, unique: true },
    title: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    clientName: { type: String, required: true, trim: true },
    clientEmail: { type: String, required: true, lowercase: true, trim: true },
    createdById: { type: String, required: true },
    createdByName: { type: String, required: true },
    status: {
        type: String,
        enum: ['draft', 'sent', 'viewed', 'accepted', 'declined', 'expired'],
        default: 'draft',
        index: true,
    },
    validUntil: { type: Date, required: true },
    clientAccessToken: { type: String, required: true, unique: true },
    executiveSummary: { type: String, required: true },
    brokerPersonalNote: { type: String },
    aircraft: ProposalAircraftSpecSchema,
    yacht: ProposalYachtSpecSchema,
    itinerary: [ItineraryDaySchema],
    pricing: { type: ProposalPricingSchema, required: true },
    inclusions: [{ type: String }],
    exclusions: [{ type: String }],
    paymentTerms: {
        type: String,
        default: '50% deposit upon formal charter agreement execution. Balance and estimated APA due 30 days prior to departure.',
    },
    clientFeedback: {
        respondedAt: { type: Date },
        decision: { type: String, enum: ['accepted', 'declined', 'requested_changes'] },
        clientNotes: { type: String },
    },
}, { timestamps: true });
ProposalSchema.index({ inquiryId: 1, createdAt: -1 });
exports.ProposalModel = mongoose_1.default.model('Proposal', ProposalSchema);
