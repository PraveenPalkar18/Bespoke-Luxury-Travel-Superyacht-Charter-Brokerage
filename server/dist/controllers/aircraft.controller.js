"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAircraft = exports.updateAircraft = exports.createAircraft = exports.getAircraftById = exports.getAllAircraft = void 0;
const aircraft_service_1 = require("../services/aircraft.service");
const getAllAircraft = async (req, res, next) => {
    try {
        const { category, search, all, page, limit } = req.query;
        const onlyPublished = all !== 'true';
        const result = await aircraft_service_1.aircraftService.getAll({
            category: category,
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
exports.getAllAircraft = getAllAircraft;
const getAircraftById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const aircraft = await aircraft_service_1.aircraftService.getById(id);
        res.status(200).json({
            success: true,
            data: aircraft,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAircraftById = getAircraftById;
const createAircraft = async (req, res, next) => {
    try {
        const created = await aircraft_service_1.aircraftService.create(req.body);
        res.status(201).json({
            success: true,
            data: created,
            message: 'Aircraft created successfully',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createAircraft = createAircraft;
const updateAircraft = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updated = await aircraft_service_1.aircraftService.update(id, req.body);
        res.status(200).json({
            success: true,
            data: updated,
            message: 'Aircraft updated successfully',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateAircraft = updateAircraft;
const deleteAircraft = async (req, res, next) => {
    try {
        const { id } = req.params;
        await aircraft_service_1.aircraftService.delete(id);
        res.status(200).json({
            success: true,
            message: 'Aircraft removed from fleet successfully',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteAircraft = deleteAircraft;
