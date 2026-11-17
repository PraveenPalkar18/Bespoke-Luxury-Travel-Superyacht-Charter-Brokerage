"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDestination = exports.createDestination = exports.getDestinationByIdOrSlug = exports.getAllDestinations = void 0;
const destination_service_1 = require("../services/destination.service");
const getAllDestinations = async (req, res, next) => {
    try {
        const { region, search, all } = req.query;
        const onlyPublished = all !== 'true';
        const destinations = await destination_service_1.destinationService.getAll({
            region: region,
            search: search,
            onlyPublished,
        });
        res.status(200).json({
            success: true,
            count: destinations.length,
            data: destinations,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllDestinations = getAllDestinations;
const getDestinationByIdOrSlug = async (req, res, next) => {
    try {
        const { id } = req.params;
        const destination = await destination_service_1.destinationService.getByIdOrSlug(id);
        res.status(200).json({
            success: true,
            data: destination,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getDestinationByIdOrSlug = getDestinationByIdOrSlug;
const createDestination = async (req, res, next) => {
    try {
        const created = await destination_service_1.destinationService.create(req.body);
        res.status(201).json({
            success: true,
            data: created,
            message: 'Destination created successfully',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createDestination = createDestination;
const updateDestination = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updated = await destination_service_1.destinationService.update(id, req.body);
        res.status(200).json({
            success: true,
            data: updated,
            message: 'Destination updated successfully',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateDestination = updateDestination;
