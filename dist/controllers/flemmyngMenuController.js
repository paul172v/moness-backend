"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFlemmyngMenuItemById = exports.deleteFlemmyngMenuItem = exports.updateFlemmyngMenuItem = exports.createFlemmyngMenuItem = exports.getAllFlemmyngMenuData = void 0;
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const appError_1 = __importDefault(require("../utils/appError"));
const handlerFactory_1 = require("./handlerFactory");
const flemmyngMenuModel_1 = __importDefault(require("../models/flemmyngMenuModel"));
// Get all Flemmyng menu items grouped by section
exports.getAllFlemmyngMenuData = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const allItems = yield flemmyngMenuModel_1.default.find();
    const grouped = allItems.reduce((acc, item) => {
        const section = item.section || "uncategorized";
        if (!acc[section])
            acc[section] = [];
        acc[section].push(item);
        return acc;
    }, {});
    res.status(200).json({
        status: "success",
        payload: grouped,
    });
}));
// Create a new item for a specific section
exports.createFlemmyngMenuItem = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const newItem = yield flemmyngMenuModel_1.default.create({
        name: req.body.name,
        price: req.body.price,
        allergens: req.body.allergens || [],
        description: req.body.description || null,
        options: req.body.options || null,
        section: req.body.section,
    });
    if (!newItem) {
        return next(new appError_1.default("Could not create menu item", 400));
    }
    res.status(201).json({
        status: "success",
        item: newItem,
    });
}));
// Update a menu item
exports.updateFlemmyngMenuItem = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const updatedItem = yield flemmyngMenuModel_1.default.findByIdAndUpdate(req.body._id, {
        name: req.body.name,
        price: req.body.price,
        allergens: req.body.allergens || [],
        description: req.body.description || null,
        options: req.body.options || null,
        section: req.body.section,
    }, {
        new: true,
        runValidators: true,
    });
    if (!updatedItem) {
        return next(new appError_1.default("Could not update menu item", 404));
    }
    res.status(200).json({
        status: "success",
        item: updatedItem,
    });
}));
// Delete a menu item
exports.deleteFlemmyngMenuItem = (0, handlerFactory_1.factoryDeleteOne)(flemmyngMenuModel_1.default);
// Get one item by ID (optional, for future use)
exports.getFlemmyngMenuItemById = (0, handlerFactory_1.factoryGetOneById)(flemmyngMenuModel_1.default);
