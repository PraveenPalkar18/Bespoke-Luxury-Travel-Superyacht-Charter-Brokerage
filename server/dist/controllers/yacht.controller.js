"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteYacht = exports.updateYacht = exports.createYacht = exports.getYachtById = exports.getAllYachts = void 0;
const yacht_service_1 = require("../services/yacht.service");
const getAllYachts = async (req, res, next) => {
    try {
        const { region, search, all, page, limit } = req.query;
        const onlyPublished = all !== 'true';
        const result = await yacht_service_1.yachtService.getAll({
            region: region,
            search: search,
            onlyPublished,
            page: page ? parseInt(page, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
        });
        res.status(200).json({
            success: true,
            count: result.data.length,
            data: result.data,
            pagination: result.pagination,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllYachts = getAllYachts;
const getYachtById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const yacht = await yacht_service_1.yachtService.getById(id);
        res.status(200).json({
            success: true,
            data: yacht,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getYachtById = getYachtById;
const createYacht = async (req, res, next) => {
    try {
        const created = await yacht_service_1.yachtService.create(req.body);
        res.status(201).json({
            success: true,
            data: created,
            message: 'Superyacht added to catalogue successfully',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createYacht = createYacht;
const updateYacht = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updated = await yacht_service_1.yachtService.update(id, req.body);
        res.status(200).json({
            success: true,
            data: updated,
            message: 'Superyacht updated successfully',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateYacht = updateYacht;
const deleteYacht = async (req, res, next) => {
    try {
        const { id } = req.params;
        await yacht_service_1.yachtService.delete(id);
        res.status(200).json({
            success: true,
            message: 'Superyacht removed from catalogue successfully',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteYacht = deleteYacht;
