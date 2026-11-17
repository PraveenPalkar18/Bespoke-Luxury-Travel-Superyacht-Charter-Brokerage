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
exports.InquiryModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const InternalNoteSchema = new mongoose_1.Schema({
    authorId: { type: String, required: true },
    authorName: { type: String, required: true },
    content: { type: String, required: true },
    category: {
        type: String,
        enum: ['internal', 'supplier', 'customer_call'],
        default: 'internal',
    },
}, { timestamps: { createdAt: true, updatedAt: false } });
const InquirySchema = new mongoose_1.Schema({
    referenceCode: { type: String, required: true, unique: true },
    customerName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    preferredContactMethod: {
        type: String,
        enum: ['phone', 'email', 'whatsapp'],
        default: 'email',
    },
    departureLocation: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    departureDate: { type: String, required: true },
    returnDate: { type: String },
    isFlexibleDates: { type: Boolean, default: false },
    travellers: { type: Number, required: true, min: 1 },
    requestedServices: [
        {
            type: String,
            enum: ['private_jet', 'superyacht', 'both', 'accommodation', 'bespoke_experiences'],
        },
    ],
    budgetRange: { type: String, required: true },
    travelPreferences: [{ type: String }],
    specialRequests: { type: String },
    interestedAircraftId: { type: String },
    interestedYachtId: { type: String },
    interestedDestinationId: { type: String },
    status: {
        type: String,
        enum: ['new', 'in_review', 'supplier_contacted', 'quote_sent', 'negotiating', 'confirmed', 'archived'],
        default: 'new',
    },
    priority: {
        type: String,
        enum: ['standard', 'high', 'vip'],
        default: 'standard',
    },
    assignedTo: { type: String },
    assignedBrokerName: { type: String },
    internalNotes: [InternalNoteSchema],
    supplierNotes: { type: String },
}, { timestamps: true });
InquirySchema.index({ status: 1, createdAt: -1 });
InquirySchema.index({ assignedTo: 1, status: 1 });
InquirySchema.index({ email: 1 });
exports.InquiryModel = mongoose_1.default.model('Inquiry', InquirySchema);
