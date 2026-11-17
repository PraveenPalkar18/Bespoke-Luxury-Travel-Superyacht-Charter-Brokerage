"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.yachtService = exports.YachtService = void 0;
const Yacht_1 = require("../models/Yacht");
const database_1 = require("../config/database");
const errors_1 = require("../utils/errors");
class YachtService {
    async getAll(options = {}) {
        (0, database_1.ensureDatabaseConnected)();
        const page = Math.max(1, options.page || 1);
        const limit = Math.max(1, Math.min(options.limit || 20, 100));
        const skip = (page - 1) * limit;
        const query = {};
        if (options.onlyPublished !== false) {
            query.isPublished = true;
        }
        if (options.region) {
            query.regions = { $in: [new RegExp(options.region.trim(), 'i')] };
        }
        if (options.search) {
            const searchRegex = new RegExp(options.search.trim(), 'i');
            query.$or = [
                { name: searchRegex },
                { builder: searchRegex },
                { description: searchRegex },
                { regions: { $in: [searchRegex] } },
            ];
        }
        const [total, data] = await Promise.all([
            Yacht_1.YachtModel.countDocuments(query),
            Yacht_1.YachtModel.find(query)
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
        const yacht = await Yacht_1.YachtModel.findById(id).lean();
        if (!yacht) {
            throw new errors_1.NotFoundError(`Superyacht not found with identifier: ${id}`);
        }
        return yacht;
    }
    async create(data) {
        (0, database_1.ensureDatabaseConnected)();
        const created = await Yacht_1.YachtModel.create(data);
        return created.toObject();
    }
    async update(id, data) {
        (0, database_1.ensureDatabaseConnected)();
        const updated = await Yacht_1.YachtModel.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        }).lean();
        if (!updated) {
            throw new errors_1.NotFoundError(`Superyacht not found with identifier: ${id}`);
        }
        return updated;
    }
    async delete(id) {
        (0, database_1.ensureDatabaseConnected)();
        const deleted = await Yacht_1.YachtModel.findByIdAndDelete(id);
        if (!deleted) {
            throw new errors_1.NotFoundError(`Superyacht not found with identifier: ${id}`);
        }
        return true;
    }
}
exports.YachtService = YachtService;
exports.yachtService = new YachtService();
