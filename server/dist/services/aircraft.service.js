"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aircraftService = exports.AircraftService = void 0;
const Aircraft_1 = require("../models/Aircraft");
const database_1 = require("../config/database");
const errors_1 = require("../utils/errors");
class AircraftService {
    async getAll(options = {}) {
        (0, database_1.ensureDatabaseConnected)();
        const page = Math.max(1, options.page || 1);
        const limit = Math.max(1, Math.min(options.limit || 20, 100));
        const skip = (page - 1) * limit;
        const query = {};
        if (options.onlyPublished !== false) {
            query.isPublished = true;
        }
        if (options.category) {
            query.category = options.category;
        }
        if (options.search) {
            const searchRegex = new RegExp(options.search.trim(), 'i');
            query.$or = [
                { name: searchRegex },
                { model: searchRegex },
                { description: searchRegex },
            ];
        }
        const [total, data] = await Promise.all([
            Aircraft_1.AircraftModel.countDocuments(query),
            Aircraft_1.AircraftModel.find(query)
                .sort({ featured: -1, createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
        ]);
        const totalPages = Math.ceil(total / limit) || 1;
        return {
            data: data,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            },
        };
    }
    async getById(id) {
        (0, database_1.ensureDatabaseConnected)();
        const aircraft = await Aircraft_1.AircraftModel.findById(id).lean();
        if (!aircraft) {
            throw new errors_1.NotFoundError(`Aircraft not found with identifier: ${id}`);
        }
        return aircraft;
    }
    async create(data) {
        (0, database_1.ensureDatabaseConnected)();
        const created = await Aircraft_1.AircraftModel.create(data);
        return created.toObject();
    }
    async update(id, data) {
        (0, database_1.ensureDatabaseConnected)();
        const updated = await Aircraft_1.AircraftModel.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        }).lean();
        if (!updated) {
            throw new errors_1.NotFoundError(`Aircraft not found with identifier: ${id}`);
        }
        return updated;
    }
    async delete(id) {
        (0, database_1.ensureDatabaseConnected)();
        const deleted = await Aircraft_1.AircraftModel.findByIdAndDelete(id);
        if (!deleted) {
            throw new errors_1.NotFoundError(`Aircraft not found with identifier: ${id}`);
        }
        return true;
    }
}
exports.AircraftService = AircraftService;
exports.aircraftService = new AircraftService();
