"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.store = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = require("../models/User");
const Aircraft_1 = require("../models/Aircraft");
const Yacht_1 = require("../models/Yacht");
const Destination_1 = require("../models/Destination");
const Inquiry_1 = require("../models/Inquiry");
const seedData_1 = require("../seed/seedData");
class DataStore {
    isMongoConnected = false;
    users = [];
    aircraft = [];
    yachts = [];
    destinations = [];
    inquiries = [];
    constructor() {
        this.initFallbackData();
    }
    setMongoConnected(connected) {
        this.isMongoConnected = connected;
    }
    getMongoConnected() {
        return this.isMongoConnected;
    }
    initFallbackData() {
        this.users = (0, seedData_1.getSeedUsers)().map((u) => ({
            ...u,
            createdAt: new Date(),
            updatedAt: new Date(),
        }));
        this.aircraft = seedData_1.seedAircraft.map((a) => ({
            ...a,
            createdAt: new Date(),
            updatedAt: new Date(),
        }));
        this.yachts = seedData_1.seedYachts.map((y) => ({
            ...y,
            createdAt: new Date(),
            updatedAt: new Date(),
        }));
        this.destinations = seedData_1.seedDestinations.map((d) => ({
            ...d,
            createdAt: new Date(),
            updatedAt: new Date(),
        }));
        this.inquiries = seedData_1.seedInquiries.map((i) => ({
            ...i,
            createdAt: new Date(i.createdAt),
            updatedAt: new Date(i.updatedAt),
        }));
    }
    // --- USER OPERATIONS ---
    async findUserByEmail(email) {
        if (this.isMongoConnected) {
            const userDoc = await User_1.UserModel.findOne({ email: email.toLowerCase() });
            if (userDoc)
                return userDoc.toObject();
        }
        const found = this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
        return found ? { ...found } : null;
    }
    async findUserById(id) {
        if (this.isMongoConnected) {
            const userDoc = await User_1.UserModel.findById(id);
            if (userDoc)
                return userDoc.toObject();
        }
        const found = this.users.find((u) => u._id === id);
        return found ? { ...found } : null;
    }
    async getAllBrokers() {
        if (this.isMongoConnected) {
            const users = await User_1.UserModel.find({ isActive: true }).select('name email role title');
            return users.map((u) => ({
                id: u._id.toString(),
                name: u.name,
                email: u.email,
                role: u.role,
                title: u.title,
            }));
        }
        return this.users
            .filter((u) => u.isActive)
            .map((u) => ({
            id: u._id,
            name: u.name,
            email: u.email,
            role: u.role,
            title: u.title,
        }));
    }
    // --- AIRCRAFT OPERATIONS ---
    async getAircraftList(filter) {
        if (this.isMongoConnected) {
            const query = {};
            if (filter?.onlyPublished)
                query.isPublished = true;
            if (filter?.category)
                query.category = filter.category;
            if (filter?.search) {
                query.$or = [
                    { name: { $regex: filter.search, $options: 'i' } },
                    { model: { $regex: filter.search, $options: 'i' } },
                    { description: { $regex: filter.search, $options: 'i' } },
                ];
            }
            const list = await Aircraft_1.AircraftModel.find(query).sort({ featured: -1, range: -1 });
            return list.map((doc) => doc.toObject());
        }
        let result = [...this.aircraft];
        if (filter?.onlyPublished) {
            result = result.filter((a) => a.isPublished);
        }
        if (filter?.category) {
            result = result.filter((a) => a.category.toLowerCase() === filter.category.toLowerCase());
        }
        if (filter?.search) {
            const q = filter.search.toLowerCase();
            result = result.filter((a) => a.name.toLowerCase().includes(q) || a.model.toLowerCase().includes(q) || a.description.toLowerCase().includes(q));
        }
        return result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }
    async getAircraftById(id) {
        if (this.isMongoConnected) {
            const doc = await Aircraft_1.AircraftModel.findById(id);
            return doc ? doc.toObject() : null;
        }
        const found = this.aircraft.find((a) => a._id === id);
        return found ? { ...found } : null;
    }
    async createAircraft(data) {
        if (this.isMongoConnected) {
            const doc = await Aircraft_1.AircraftModel.create(data);
            return doc.toObject();
        }
        const newAircraft = {
            ...data,
            _id: '6724' + Math.random().toString(16).substring(2, 10).padStart(20, '0'),
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.aircraft.unshift(newAircraft);
        return { ...newAircraft };
    }
    async updateAircraft(id, data) {
        if (this.isMongoConnected) {
            const doc = await Aircraft_1.AircraftModel.findByIdAndUpdate(id, { $set: data }, { new: true });
            return doc ? doc.toObject() : null;
        }
        const index = this.aircraft.findIndex((a) => a._id === id);
        if (index === -1)
            return null;
        this.aircraft[index] = { ...this.aircraft[index], ...data, updatedAt: new Date() };
        return { ...this.aircraft[index] };
    }
    async deleteAircraft(id) {
        if (this.isMongoConnected) {
            const res = await Aircraft_1.AircraftModel.findByIdAndDelete(id);
            return !!res;
        }
        const index = this.aircraft.findIndex((a) => a._id === id);
        if (index === -1)
            return false;
        this.aircraft.splice(index, 1);
        return true;
    }
    // --- YACHT OPERATIONS ---
    async getYachtList(filter) {
        if (this.isMongoConnected) {
            const query = {};
            if (filter?.onlyPublished)
                query.isPublished = true;
            if (filter?.region)
                query.regions = { $in: [filter.region] };
            if (filter?.search) {
                query.$or = [
                    { name: { $regex: filter.search, $options: 'i' } },
                    { builder: { $regex: filter.search, $options: 'i' } },
                    { description: { $regex: filter.search, $options: 'i' } },
                ];
            }
            const list = await Yacht_1.YachtModel.find(query).sort({ featured: -1, length: -1 });
            return list.map((doc) => doc.toObject());
        }
        let result = [...this.yachts];
        if (filter?.onlyPublished) {
            result = result.filter((y) => y.isPublished);
        }
        if (filter?.region) {
            const reg = filter.region.toLowerCase();
            result = result.filter((y) => y.regions.some((r) => r.toLowerCase().includes(reg)));
        }
        if (filter?.search) {
            const q = filter.search.toLowerCase();
            result = result.filter((y) => y.name.toLowerCase().includes(q) || y.builder.toLowerCase().includes(q) || y.description.toLowerCase().includes(q));
        }
        return result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }
    async getYachtById(id) {
        if (this.isMongoConnected) {
            const doc = await Yacht_1.YachtModel.findById(id);
            return doc ? doc.toObject() : null;
        }
        const found = this.yachts.find((y) => y._id === id);
        return found ? { ...found } : null;
    }
    async createYacht(data) {
        if (this.isMongoConnected) {
            const doc = await Yacht_1.YachtModel.create(data);
            return doc.toObject();
        }
        const newYacht = {
            ...data,
            _id: '6724' + Math.random().toString(16).substring(2, 10).padStart(20, '0'),
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.yachts.unshift(newYacht);
        return { ...newYacht };
    }
    async updateYacht(id, data) {
        if (this.isMongoConnected) {
            const doc = await Yacht_1.YachtModel.findByIdAndUpdate(id, { $set: data }, { new: true });
            return doc ? doc.toObject() : null;
        }
        const index = this.yachts.findIndex((y) => y._id === id);
        if (index === -1)
            return null;
        this.yachts[index] = { ...this.yachts[index], ...data, updatedAt: new Date() };
        return { ...this.yachts[index] };
    }
    async deleteYacht(id) {
        if (this.isMongoConnected) {
            const res = await Yacht_1.YachtModel.findByIdAndDelete(id);
            return !!res;
        }
        const index = this.yachts.findIndex((y) => y._id === id);
        if (index === -1)
            return false;
        this.yachts.splice(index, 1);
        return true;
    }
    // --- DESTINATION OPERATIONS ---
    async getDestinationList(filter) {
        if (this.isMongoConnected) {
            const query = {};
            if (filter?.onlyPublished)
                query.isPublished = true;
            if (filter?.region)
                query.region = filter.region;
            if (filter?.search) {
                query.$or = [
                    { name: { $regex: filter.search, $options: 'i' } },
                    { tagline: { $regex: filter.search, $options: 'i' } },
                    { description: { $regex: filter.search, $options: 'i' } },
                ];
            }
            const list = await Destination_1.DestinationModel.find(query).sort({ featured: -1, createdAt: 1 });
            return list.map((doc) => doc.toObject());
        }
        let result = [...this.destinations];
        if (filter?.onlyPublished) {
            result = result.filter((d) => d.isPublished);
        }
        if (filter?.region) {
            const reg = filter.region.toLowerCase();
            result = result.filter((d) => d.region.toLowerCase().includes(reg));
        }
        if (filter?.search) {
            const q = filter.search.toLowerCase();
            result = result.filter((d) => d.name.toLowerCase().includes(q) || d.tagline.toLowerCase().includes(q) || d.description.toLowerCase().includes(q));
        }
        return result;
    }
    async getDestinationByIdOrSlug(idOrSlug) {
        if (this.isMongoConnected) {
            let doc = null;
            if (mongoose_1.default.Types.ObjectId.isValid(idOrSlug)) {
                doc = await Destination_1.DestinationModel.findById(idOrSlug);
            }
            if (!doc) {
                doc = await Destination_1.DestinationModel.findOne({ slug: idOrSlug.toLowerCase() });
            }
            return doc ? doc.toObject() : null;
        }
        const found = this.destinations.find((d) => d._id === idOrSlug || d.slug.toLowerCase() === idOrSlug.toLowerCase());
        return found ? { ...found } : null;
    }
    async createDestination(data) {
        if (this.isMongoConnected) {
            const doc = await Destination_1.DestinationModel.create(data);
            return doc.toObject();
        }
        const newDest = {
            ...data,
            _id: '6724' + Math.random().toString(16).substring(2, 10).padStart(20, '0'),
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.destinations.push(newDest);
        return { ...newDest };
    }
    async updateDestination(id, data) {
        if (this.isMongoConnected) {
            const doc = await Destination_1.DestinationModel.findByIdAndUpdate(id, { $set: data }, { new: true });
            return doc ? doc.toObject() : null;
        }
        const index = this.destinations.findIndex((d) => d._id === id);
        if (index === -1)
            return null;
        this.destinations[index] = { ...this.destinations[index], ...data, updatedAt: new Date() };
        return { ...this.destinations[index] };
    }
    // --- INQUIRY OPERATIONS ---
    async createInquiry(data) {
        const randomCodeSuffix = Math.floor(1000 + Math.random() * 9000);
        const referenceCode = `AUR-${new Date().getFullYear()}-${randomCodeSuffix}`;
        const inquiryPayload = {
            ...data,
            preferredContactMethod: data.preferredContactMethod || 'email',
            isFlexibleDates: data.isFlexibleDates ?? false,
            travelPreferences: data.travelPreferences || [],
            referenceCode,
            status: 'new',
            priority: (data.budgetRange.includes('$500k') || data.budgetRange.includes('$1M') ? 'vip' : 'standard'),
            internalNotes: [],
        };
        if (this.isMongoConnected) {
            const doc = await Inquiry_1.InquiryModel.create(inquiryPayload);
            return doc.toObject();
        }
        const newInquiry = {
            ...inquiryPayload,
            _id: '6724' + Math.random().toString(16).substring(2, 10).padStart(20, '0'),
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.inquiries.unshift(newInquiry);
        return { ...newInquiry };
    }
    async getInquiries(filter) {
        if (this.isMongoConnected) {
            const query = {};
            if (filter?.status)
                query.status = filter.status;
            if (filter?.assignedTo)
                query.assignedTo = filter.assignedTo;
            if (filter?.search) {
                query.$or = [
                    { referenceCode: { $regex: filter.search, $options: 'i' } },
                    { customerName: { $regex: filter.search, $options: 'i' } },
                    { email: { $regex: filter.search, $options: 'i' } },
                    { destination: { $regex: filter.search, $options: 'i' } },
                ];
            }
            const docs = await Inquiry_1.InquiryModel.find(query).sort({ createdAt: -1 });
            return docs.map((d) => d.toObject());
        }
        let result = [...this.inquiries];
        if (filter?.status) {
            result = result.filter((i) => i.status === filter.status);
        }
        if (filter?.assignedTo) {
            result = result.filter((i) => i.assignedTo === filter.assignedTo);
        }
        if (filter?.search) {
            const q = filter.search.toLowerCase();
            result = result.filter((i) => i.referenceCode.toLowerCase().includes(q) ||
                i.customerName.toLowerCase().includes(q) ||
                i.email.toLowerCase().includes(q) ||
                i.destination.toLowerCase().includes(q));
        }
        return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    async getInquiryById(id) {
        if (this.isMongoConnected) {
            const doc = await Inquiry_1.InquiryModel.findById(id);
            return doc ? doc.toObject() : null;
        }
        const found = this.inquiries.find((i) => i._id === id || i.referenceCode === id);
        return found ? { ...found } : null;
    }
    async updateInquiry(id, updateData) {
        if (this.isMongoConnected) {
            const doc = await Inquiry_1.InquiryModel.findByIdAndUpdate(id, { $set: updateData }, { new: true });
            return doc ? doc.toObject() : null;
        }
        const index = this.inquiries.findIndex((i) => i._id === id);
        if (index === -1)
            return null;
        this.inquiries[index] = { ...this.inquiries[index], ...updateData, updatedAt: new Date() };
        return { ...this.inquiries[index] };
    }
    async addInternalNote(inquiryId, noteData) {
        const newNote = {
            _id: '6724' + Math.random().toString(16).substring(2, 10).padStart(20, '0'),
            ...noteData,
            createdAt: new Date(),
        };
        if (this.isMongoConnected) {
            const doc = await Inquiry_1.InquiryModel.findByIdAndUpdate(inquiryId, { $push: { internalNotes: newNote } }, { new: true });
            return doc ? doc.toObject() : null;
        }
        const index = this.inquiries.findIndex((i) => i._id === inquiryId);
        if (index === -1)
            return null;
        this.inquiries[index].internalNotes.push(newNote);
        this.inquiries[index].updatedAt = new Date();
        return { ...this.inquiries[index] };
    }
    // --- STATS OVERVIEW ---
    async getStatsOverview() {
        const list = await this.getInquiries();
        const total = list.length;
        const newCount = list.filter((i) => i.status === 'new').length;
        const inProgressCount = list.filter((i) => ['in_review', 'supplier_contacted', 'quote_sent', 'negotiating'].includes(i.status)).length;
        const confirmedCount = list.filter((i) => i.status === 'confirmed').length;
        const serviceCounts = {
            private_jet: 0,
            superyacht: 0,
            both: 0,
            other: 0,
        };
        list.forEach((i) => {
            if (i.requestedServices.includes('both') || (i.requestedServices.includes('private_jet') && i.requestedServices.includes('superyacht'))) {
                serviceCounts.both++;
            }
            else if (i.requestedServices.includes('private_jet')) {
                serviceCounts.private_jet++;
            }
            else if (i.requestedServices.includes('superyacht')) {
                serviceCounts.superyacht++;
            }
            else {
                serviceCounts.other++;
            }
        });
        return {
            totalEnquiries: total,
            newEnquiries: newCount,
            inProgressEnquiries: inProgressCount,
            confirmedEnquiries: confirmedCount,
            serviceDistribution: serviceCounts,
            recentEnquiries: list.slice(0, 5),
        };
    }
}
exports.store = new DataStore();
