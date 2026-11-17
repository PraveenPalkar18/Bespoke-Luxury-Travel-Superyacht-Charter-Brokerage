import mongoose from 'mongoose';
import { config } from './index';
import { DatabaseUnavailableError } from '../utils/errors';
import { redactMongoUri } from '../utils/redact';
import { UserModel } from '../models/User';
import { AircraftModel } from '../models/Aircraft';
import { YachtModel } from '../models/Yacht';
import { DestinationModel } from '../models/Destination';
import { InquiryModel } from '../models/Inquiry';
import { ProposalModel } from '../models/Proposal';
import {
  getSeedUsers,
  seedAircraft,
  seedYachts,
  seedDestinations,
  seedInquiries,
  seedProposals,
} from '../seed/seedData';

export const isDatabaseConnected = (): boolean => {
  return mongoose.connection.readyState === 1;
};

export const ensureDatabaseConnected = (): void => {
  if (mongoose.connection.readyState !== 1) {
    throw new DatabaseUnavailableError(
      'The luxury travel brokerage database is currently unavailable. Please verify MongoDB is running or configure MONGODB_URI in your environment.'
    );
  }
};

export const autoSeedIfEmpty = async (): Promise<void> => {
  try {
    const userCount = await UserModel.countDocuments();
    if (userCount === 0) {
      console.log('[Database Auto-Seed] Initializing clean database with luxury assets...');
      await UserModel.insertMany(getSeedUsers());
      await AircraftModel.insertMany(seedAircraft);
      await YachtModel.insertMany(seedYachts);
      await DestinationModel.insertMany(seedDestinations);
      await InquiryModel.insertMany(seedInquiries);
      await ProposalModel.insertMany(seedProposals);
      console.log('[Database Auto-Seed] Complete: Seeding successful.');
    }
  } catch (err: any) {
    console.warn('[Database Auto-Seed] Note:', err.message);
  }
};

let connectionPromise: Promise<boolean> | null = null;

export const connectDatabase = async (): Promise<boolean> => {
  if (mongoose.connection.readyState === 1) {
    return true;
  }
  if (connectionPromise) {
    return connectionPromise;
  }
  connectionPromise = (async () => {
    try {
      console.log(`[Database] Attempting connection to MongoDB at: ${redactMongoUri(config.mongoUri)}`);
      await mongoose.connect(config.mongoUri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log('[Database] MongoDB connection established successfully.');
      await autoSeedIfEmpty();
      return true;
    } catch (err: any) {
      connectionPromise = null;
      console.warn(
        `[Database] Note: Could not connect to MongoDB server (${err.message}).`
      );
      console.warn(
        '[Database] Services will return 503 until MongoDB is available at ' + redactMongoUri(config.mongoUri)
      );
      return false;
    }
  })();
  return connectionPromise;
};
