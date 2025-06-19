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
exports.flemmyngCreateMockData = exports.flemmyngGetOneDessertById = exports.flemmyngDeleteOneDessert = exports.flemmyngUpdateOneDessert = exports.flemmyngCreateOneDessert = exports.flemmyngGetOneSideById = exports.flemmyngDeleteOneSide = exports.flemmyngUpdateOneSide = exports.flemmyngCreateOneSide = exports.flemmyngGetOneMainById = exports.flemmyngDeleteOneMain = exports.flemmyngUpdateOneMain = exports.flemmyngCreateOneMain = exports.flemmyngGetOneStarterById = exports.flemmyngDeleteOneStarter = exports.flemmyngUpdateOneStarter = exports.flemmyngCreateOneStarter = exports.flemmyngGetOneWhileYouWaitById = exports.flemmyngDeleteOneWhileYouWait = exports.flemmyngUpdateOneWhileYouWait = exports.flemmyngCreateOneWhileYouWait = exports.flemmyngGetAll = exports.formatPrice = void 0;
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const appError_1 = __importDefault(require("../utils/appError"));
const handlerFactory_1 = require("./handlerFactory");
const flemmyngModel_1 = require("../models/flemmyngModel");
const flemmyngMenu_1 = require("../dev/flemmyngMenu");
/* -------- Price Formatting Middleware for Updates -------- */
const formatPrice = (req, res, next) => {
    if (req.body.price !== undefined) {
        req.body.price = parseFloat(Number(req.body.price).toFixed(2));
    }
    next();
};
exports.formatPrice = formatPrice;
/* -------- Get All -------- */
exports.flemmyngGetAll = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const whileYouWait = yield flemmyngModel_1.FlemmyngWhileYouWait.find();
    const starters = yield flemmyngModel_1.FlemmyngStarters.find();
    const mains = yield flemmyngModel_1.FlemmyngMains.find();
    const sides = yield flemmyngModel_1.FlemmyngSides.find();
    const desserts = yield flemmyngModel_1.FlemmyngDesserts.find();
    if (!whileYouWait && !starters && !mains && !sides && !desserts)
        return new appError_1.default("No documents could be found", 404);
    res.status(200).json({
        status: "success",
        payload: {
            whileYouWait,
            starters,
            mains,
            sides,
            desserts,
        },
    });
}));
/* -------- While You Wait ------ */
exports.flemmyngCreateOneWhileYouWait = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, price, allergens } = req.body;
    const newWhileYouWaitItem = yield flemmyngModel_1.FlemmyngWhileYouWait.create({
        name,
        price: parseFloat(Number(price).toFixed(2)),
        allergens,
    });
    if (!newWhileYouWaitItem) {
        return next(new appError_1.default("Could not create new While You Wait Item", 404));
    }
    res.status(200).json({
        status: "success",
        menuItem: newWhileYouWaitItem,
    });
}));
exports.flemmyngUpdateOneWhileYouWait = (0, handlerFactory_1.factoryUpdateOne)(flemmyngModel_1.FlemmyngWhileYouWait);
exports.flemmyngDeleteOneWhileYouWait = (0, handlerFactory_1.factoryDeleteOne)(flemmyngModel_1.FlemmyngWhileYouWait);
exports.flemmyngGetOneWhileYouWaitById = (0, handlerFactory_1.factoryGetOneById)(flemmyngModel_1.FlemmyngWhileYouWait);
/* -------- Starters ------ */
exports.flemmyngCreateOneStarter = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, price, allergens, description, options } = req.body;
    const newStarterItem = yield flemmyngModel_1.FlemmyngStarters.create({
        name,
        price: parseFloat(Number(price).toFixed(2)),
        allergens,
        description,
        options,
    });
    if (!newStarterItem) {
        return next(new appError_1.default("Could not create new Starter Item", 404));
    }
    res.status(200).json({
        status: "success",
        menuItem: newStarterItem,
    });
}));
exports.flemmyngUpdateOneStarter = (0, handlerFactory_1.factoryUpdateOne)(flemmyngModel_1.FlemmyngStarters);
exports.flemmyngDeleteOneStarter = (0, handlerFactory_1.factoryDeleteOne)(flemmyngModel_1.FlemmyngStarters);
exports.flemmyngGetOneStarterById = (0, handlerFactory_1.factoryGetOneById)(flemmyngModel_1.FlemmyngStarters);
/* -------- Mains ------ */
exports.flemmyngCreateOneMain = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, price, allergens, description, options } = req.body;
    const newMainItem = yield flemmyngModel_1.FlemmyngMains.create({
        name,
        price: parseFloat(Number(price).toFixed(2)),
        allergens,
        description,
        options,
    });
    if (!newMainItem) {
        return next(new appError_1.default("Could not create new Main Item", 404));
    }
    res.status(200).json({
        status: "success",
        menuItem: newMainItem,
    });
}));
exports.flemmyngUpdateOneMain = (0, handlerFactory_1.factoryUpdateOne)(flemmyngModel_1.FlemmyngMains);
exports.flemmyngDeleteOneMain = (0, handlerFactory_1.factoryDeleteOne)(flemmyngModel_1.FlemmyngMains);
exports.flemmyngGetOneMainById = (0, handlerFactory_1.factoryGetOneById)(flemmyngModel_1.FlemmyngMains);
/* -------- Sides ------ */
exports.flemmyngCreateOneSide = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, price, allergens, options } = req.body;
    const newSideItem = yield flemmyngModel_1.FlemmyngSides.create({
        name,
        price: parseFloat(Number(price).toFixed(2)),
        allergens,
        options,
    });
    if (!newSideItem) {
        return next(new appError_1.default("Could not create new Side Item", 404));
    }
    res.status(200).json({
        status: "success",
        menuItem: newSideItem,
    });
}));
exports.flemmyngUpdateOneSide = (0, handlerFactory_1.factoryUpdateOne)(flemmyngModel_1.FlemmyngSides);
exports.flemmyngDeleteOneSide = (0, handlerFactory_1.factoryDeleteOne)(flemmyngModel_1.FlemmyngSides);
exports.flemmyngGetOneSideById = (0, handlerFactory_1.factoryGetOneById)(flemmyngModel_1.FlemmyngSides);
/* -------- Desserts ------ */
exports.flemmyngCreateOneDessert = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, price, allergens, description, options } = req.body;
    const newDessertItem = yield flemmyngModel_1.FlemmyngDesserts.create({
        name,
        price: parseFloat(Number(price).toFixed(2)),
        allergens,
        description,
        options,
    });
    if (!newDessertItem) {
        return next(new appError_1.default("Could not create new Dessert Item", 404));
    }
    res.status(200).json({
        status: "success",
        menuItem: newDessertItem,
    });
}));
exports.flemmyngUpdateOneDessert = (0, handlerFactory_1.factoryUpdateOne)(flemmyngModel_1.FlemmyngDesserts);
exports.flemmyngDeleteOneDessert = (0, handlerFactory_1.factoryDeleteOne)(flemmyngModel_1.FlemmyngDesserts);
exports.flemmyngGetOneDessertById = (0, handlerFactory_1.factoryGetOneById)(flemmyngModel_1.FlemmyngDesserts);
/* -------- Create Mock Data ------ */
exports.flemmyngCreateMockData = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    yield flemmyngModel_1.FlemmyngWhileYouWait.deleteMany();
    yield flemmyngModel_1.FlemmyngStarters.deleteMany();
    yield flemmyngModel_1.FlemmyngMains.deleteMany();
    yield flemmyngModel_1.FlemmyngSides.deleteMany();
    yield flemmyngModel_1.FlemmyngDesserts.deleteMany();
    const whileYouWait = yield flemmyngModel_1.FlemmyngWhileYouWait.insertMany(flemmyngMenu_1.whileYouWaitArr);
    const starters = yield flemmyngModel_1.FlemmyngStarters.insertMany(flemmyngMenu_1.startersArr);
    const mains = yield flemmyngModel_1.FlemmyngMains.insertMany(flemmyngMenu_1.mainsArr);
    const sides = yield flemmyngModel_1.FlemmyngSides.insertMany(flemmyngMenu_1.sidesArr);
    const desserts = yield flemmyngModel_1.FlemmyngDesserts.insertMany(flemmyngMenu_1.dessertsArr);
    res.status(201).json({
        status: "success",
        message: "Mock data created successfully",
        counts: {
            whileYouWait: whileYouWait.length,
            starters: starters.length,
            mains: mains.length,
            sides: sides.length,
            desserts: desserts.length,
        },
    });
}));
