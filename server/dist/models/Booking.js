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
exports.BookingModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const SupplierConfirmationSchema = new mongoose_1.Schema({
    required: { type: Boolean, default: false },
    confirmed: { type: Boolean, default: false },
    supplierName: { type: String, trim: true },
    confirmedAt: { type: Date },
    confirmedBy: { type: String },
    referenceOrContractNumber: { type: String, trim: true },
    notes: { type: String, trim: true },
}, { _id: false });
const BookingSchema = new mongoose_1.Schema({
    referenceCode: { type: String, required: true, unique: true },
    inquiryId: { type: String, required: true, index: true },
    proposalId: { type: String, required: true, index: true },
    clientName: { type: String, required: true, trim: true },
    clientEmail: { type: String, required: true, lowercase: true, trim: true },
    assignedBrokerId: { type: String, required: true, index: true },
    status: {
        type: String,
        enum: ['pending_supplier_confirmation', 'confirmed', 'cancelled'],
        default: 'pending_supplier_confirmation',
        index: true,
    },
    supplierConfirmations: {
        aircraft: {
            type: SupplierConfirmationSchema,
            default: () => ({ required: false, confirmed: false }),
        },
        yacht: {
            type: SupplierConfirmationSchema,
            default: () => ({ required: false, confirmed: false }),
        },
        accommodation: {
            type: SupplierConfirmationSchema,
            default: () => ({ required: false, confirmed: false }),
        },
    },
    totalAmount: { type: Number, required: true },
    confirmedAt: { type: Date },
    confirmedBy: { type: String },
}, { timestamps: true });
BookingSchema.index({ assignedBrokerId: 1, status: 1 });
exports.BookingModel = mongoose_1.default.model('Booking', BookingSchema);
