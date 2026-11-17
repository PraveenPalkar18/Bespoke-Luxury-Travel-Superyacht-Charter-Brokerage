"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runSeed = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("../config");
const User_1 = require("../models/User");
const Aircraft_1 = require("../models/Aircraft");
const Yacht_1 = require("../models/Yacht");
const Destination_1 = require("../models/Destination");
const Inquiry_1 = require("../models/Inquiry");
const Proposal_1 = require("../models/Proposal");
const seedData_1 = require("./seedData");
const runSeed = async () => {
    try {
        console.log('[Seed] Connecting to MongoDB...');
        await mongoose_1.default.connect(config_1.config.mongoUri, { serverSelectionTimeoutMS: 5000 });
        console.log('[Seed] Connected. Clearing existing collections...');
        await Promise.all([
            User_1.UserModel.deleteMany({}),
            Aircraft_1.AircraftModel.deleteMany({}),
            Yacht_1.YachtModel.deleteMany({}),
            Destination_1.DestinationModel.deleteMany({}),
            Inquiry_1.InquiryModel.deleteMany({}),
            Proposal_1.ProposalModel.deleteMany({}),
        ]);
        console.log('[Seed] Inserting luxury users...');
        const users = (0, seedData_1.getSeedUsers)();
        await User_1.UserModel.insertMany(users);
        console.log('[Seed] Inserting luxury private aircraft...');
        await Aircraft_1.AircraftModel.insertMany(seedData_1.seedAircraft);
        console.log('[Seed] Inserting luxury superyacht fleet...');
        await Yacht_1.YachtModel.insertMany(seedData_1.seedYachts);
        console.log('[Seed] Inserting curated destinations...');
        await Destination_1.DestinationModel.insertMany(seedData_1.seedDestinations);
        console.log('[Seed] Inserting demonstration client enquiries...');
        await Inquiry_1.InquiryModel.insertMany(seedData_1.seedInquiries);
        console.log('[Seed] Inserting bespoke travel proposals...');
        await Proposal_1.ProposalModel.insertMany(seedData_1.seedProposals);
        console.log('[Seed] Database successfully seeded with luxury demonstration assets!');
        process.exit(0);
    }
    catch (error) {
        console.error('[Seed Error]', error.message);
        process.exit(1);
    }
};
exports.runSeed = runSeed;
if (require.main === module) {
    (0, exports.runSeed)();
}
