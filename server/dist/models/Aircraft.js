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
exports.AircraftModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const AircraftSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    category: {
        type: String,
        enum: ['Ultra Long-Range', 'Heavy Jet', 'Super Midsize', 'Midsize', 'VIP Airliner'],
        required: true,
    },
    passengerCapacity: { type: Number, required: true, min: 1 },
    range: { type: Number, required: true, min: 100 },
    cruiseSpeed: { type: Number, required: true, min: 200 },
    cabinHeight: { type: String, required: true },
    baggageCapacity: { type: String, required: true },
    hourlyRateEstimate: { type: Number },
    amenities: [{ type: String }],
    images: [{ type: String }],
    featuredImage: { type: String, required: true },
    description: { type: String, required: true },
    editorialSummary: { type: String, required: true },
    isPublished: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
}, { timestamps: true });
AircraftSchema.index({ isPublished: 1, category: 1 });
AircraftSchema.index({ featured: 1 });
exports.AircraftModel = mongoose_1.default.model('Aircraft', AircraftSchema);
