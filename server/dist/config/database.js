"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = exports.autoSeedIfEmpty = exports.ensureDatabaseConnected = exports.isDatabaseConnected = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const index_1 = require("./index");
const errors_1 = require("../utils/errors");
const redact_1 = require("../utils/redact");
const User_1 = require("../models/User");
const Aircraft_1 = require("../models/Aircraft");
const Yacht_1 = require("../models/Yacht");
const Destination_1 = require("../models/Destination");
const Inquiry_1 = require("../models/Inquiry");
const Proposal_1 = require("../models/Proposal");
const seedData_1 = require("../seed/seedData");
const isDatabaseConnected = () => {
    return mongoose_1.default.connection.readyState === 1;
};
exports.isDatabaseConnected = isDatabaseConnected;
const ensureDatabaseConnected = () => {
    if (mongoose_1.default.connection.readyState !== 1) {
        throw new errors_1.DatabaseUnavailableError('The luxury travel brokerage database is currently unavailable. Please verify MongoDB is running or configure MONGODB_URI in your environment.');
    }
};
exports.ensureDatabaseConnected = ensureDatabaseConnected;
const autoSeedIfEmpty = async () => {
    try {
        const userCount = await User_1.UserModel.countDocuments();
        if (userCount === 0) {
            console.log('[Database Auto-Seed] Initializing clean database with luxury assets...');
            await User_1.UserModel.insertMany((0, seedData_1.getSeedUsers)());
            await Aircraft_1.AircraftModel.insertMany(seedData_1.seedAircraft);
            await Yacht_1.YachtModel.insertMany(seedData_1.seedYachts);
            await Destination_1.DestinationModel.insertMany(seedData_1.seedDestinations);
            await Inquiry_1.InquiryModel.insertMany(seedData_1.seedInquiries);
            await Proposal_1.ProposalModel.insertMany(seedData_1.seedProposals);
            console.log('[Database Auto-Seed] Complete: Seeding successful.');
        }
    }
    catch (err) {
        console.warn('[Database Auto-Seed] Note:', err.message);
    }
};
exports.autoSeedIfEmpty = autoSeedIfEmpty;
let connectionPromise = null;
const connectDatabase = async () => {
    if (mongoose_1.default.connection.readyState === 1) {
        return true;
    }
    if (connectionPromise) {
        return connectionPromise;
    }
    connectionPromise = (async () => {
        try {
            console.log(`[Database] Attempting connection to MongoDB at: ${(0, redact_1.redactMongoUri)(index_1.config.mongoUri)}`);
            await mongoose_1.default.connect(index_1.config.mongoUri, {
                serverSelectionTimeoutMS: 5000,
            });
            console.log('[Database] MongoDB connection established successfully.');
            await (0, exports.autoSeedIfEmpty)();
            return true;
        }
        catch (err) {
            connectionPromise = null;
            console.warn(`[Database] Note: Could not connect to MongoDB server (${err.message}).`);
            console.warn('[Database] Services will return 503 until MongoDB is available at ' + (0, redact_1.redactMongoUri)(index_1.config.mongoUri));
            return false;
        }
    })();
    return connectionPromise;
};
exports.connectDatabase = connectDatabase;
