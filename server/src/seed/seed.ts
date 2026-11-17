import mongoose from 'mongoose';
import { config } from '../config';
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
} from './seedData';

export const runSeed = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('[Seed] Connected. Clearing existing collections...');

    await Promise.all([
      UserModel.deleteMany({}),
      AircraftModel.deleteMany({}),
      YachtModel.deleteMany({}),
      DestinationModel.deleteMany({}),
      InquiryModel.deleteMany({}),
      ProposalModel.deleteMany({}),
    ]);

    console.log('[Seed] Inserting luxury users...');
    const users = getSeedUsers();
    await UserModel.insertMany(users);

    console.log('[Seed] Inserting luxury private aircraft...');
    await AircraftModel.insertMany(seedAircraft);

    console.log('[Seed] Inserting luxury superyacht fleet...');
    await YachtModel.insertMany(seedYachts);

    console.log('[Seed] Inserting curated destinations...');
    await DestinationModel.insertMany(seedDestinations);

    console.log('[Seed] Inserting demonstration client enquiries...');
    await InquiryModel.insertMany(seedInquiries);

    console.log('[Seed] Inserting bespoke travel proposals...');
    await ProposalModel.insertMany(seedProposals);

    console.log('[Seed] Database successfully seeded with luxury demonstration assets!');
    process.exit(0);
  } catch (error: any) {
    console.error('[Seed Error]', error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  runSeed();
}

