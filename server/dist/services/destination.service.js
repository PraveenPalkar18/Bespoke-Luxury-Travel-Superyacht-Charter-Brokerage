"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.destinationService = exports.DestinationService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Destination_1 = require("../models/Destination");
const database_1 = require("../config/database");
const errors_1 = require("../utils/errors");
class DestinationService {
    async getAll(options = {}) {
        (0, database_1.ensureDatabaseConnected)();
        const query = {};
        if (options.onlyPublished !== false) {
            query.isPublished = true;
        }
        if (options.region) {
            query.region = new RegExp(options.region.trim(), 'i');
        }
        if (options.search) {
            const searchRegex = new RegExp(options.search.trim(), 'i');
            query.$or = [
                { name: searchRegex },
                { region: searchRegex },
                { description: searchRegex },
                { tagline: searchRegex },
            ];
        }
        const destinations = await Destination_1.DestinationModel.find(query)
            .sort({ featured: -1, name: 1 })
            .lean();
        return destinations;
    }
    async getByIdOrSlug(idOrSlug) {
        (0, database_1.ensureDatabaseConnected)();
        const isObjectId = mongoose_1.default.Types.ObjectId.isValid(idOrSlug);
        const query = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug };
        const destination = await Destination_1.DestinationModel.findOne(query).lean();
        if (!destination) {
            throw new errors_1.NotFoundError(`Destination not found for identifier or slug: ${idOrSlug}`);
        }
        return destination;
    }
    async create(data) {
        (0, database_1.ensureDatabaseConnected)();
        const created = await Destination_1.DestinationModel.create(data);
        return created.toObject();
    }
    async update(id, data) {
        (0, database_1.ensureDatabaseConnected)();
        const updated = await Destination_1.DestinationModel.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        }).lean();
        if (!updated) {
            throw new errors_1.NotFoundError(`Destination not found with identifier: ${id}`);
        }
        return updated;
    }
}
exports.DestinationService = DestinationService;
exports.destinationService = new DestinationService();
