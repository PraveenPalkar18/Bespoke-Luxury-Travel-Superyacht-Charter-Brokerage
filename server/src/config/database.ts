import mongoose from 'mongoose';
import { config } from './index';
import { DatabaseUnavailableError } from '../utils/errors';
import { UserModel } from '../models/User';
import { AircraftModel } from '../models/Aircraft';
import { YachtModel } from '../models/Yacht';
import { DestinationModel } from '../models/Destination';
import { InquiryModel } from '../models/Inquiry';
import {
  getSeedUsers,
  seedAircraft,
  seedYachts,
  seedDestinations,
  seedInquiries,
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
      console.log('[Database Auto-Seed] Complete: Seeding successful.');
    }
  } catch (err: any) {
    console.warn('[Database Auto-Seed] Note:', err.message);
  }
};

export const connectDatabase = async (): Promise<boolean> => {
  try {
    console.log(`[Database] Attempting connection to MongoDB at: ${config.mongoUri}`);
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 4000,
    });
    console.log('[Database] MongoDB connection established successfully.');
    await autoSeedIfEmpty();
    return true;
  } catch (err: any) {
    console.warn(
      `[Database] Note: Could not connect to MongoDB server (${err.message}).`
    );
    console.warn(
      '[Database] Services will return 503 until MongoDB is available at ' + config.mongoUri
    );
    return false;
  }
};
