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
exports.BrokerInvitationModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const BrokerInvitationSchema = new mongoose_1.Schema({
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ['admin', 'broker'], default: 'broker', required: true },
    phone: { type: String, trim: true },
    title: { type: String, trim: true, default: 'Charter Broker' },
    tokenHash: { type: String, required: true, unique: true, index: true },
    expiresAt: { type: Date, required: true, index: true },
    isUsed: { type: Boolean, default: false, index: true },
    usedAt: { type: Date },
    isRevoked: { type: Boolean, default: false, index: true },
    revokedAt: { type: Date },
    invitedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    invitedByName: { type: String, trim: true },
}, { timestamps: true });
BrokerInvitationSchema.index({ email: 1, isUsed: 1, isRevoked: 1 });
exports.BrokerInvitationModel = mongoose_1.default.model('BrokerInvitation', BrokerInvitationSchema);
