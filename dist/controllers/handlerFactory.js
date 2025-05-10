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
exports.factoryUpdateOneMenuItem = exports.factoryCreateMenuItem = exports.factoryDeleteOne = exports.factoryUpdateOne = exports.factoryGetOneByEmail = exports.factoryGetOneById = exports.factoryGetAll = void 0;
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const appError_1 = __importDefault(require("../utils/appError"));
const factoryGetAll = (model) => (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const documents = yield model.find();
    if (!documents)
        return new appError_1.default("No documents of this type could be found", 404);
    res.status(200).json({
        status: "success",
        results: documents.length,
        payload: documents,
    });
}));
exports.factoryGetAll = factoryGetAll;
const factoryGetOneById = (model) => (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.params.id);
    const document = yield model.findById(req.params.id);
    console.log(document);
    if (!document)
        return new appError_1.default("No document with this ID could be found", 404);
    res.status(200).json({
        status: "success",
        payload: document,
    });
}));
exports.factoryGetOneById = factoryGetOneById;
const factoryGetOneByEmail = (model) => (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const document = yield model.find({ email: req.body.email });
    if (!document)
        return new appError_1.default("No document with this ID could be found", 404);
    res.status(200).json({
        status: "success",
        payload: document,
    });
}));
exports.factoryGetOneByEmail = factoryGetOneByEmail;
const factoryUpdateOne = (model) => (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const updatedDocument = yield model.findByIdAndUpdate(req.params.id, req.body);
    if (!updatedDocument)
        return new appError_1.default("No document with this ID could be found", 404);
    res.status(201).json({
        status: "success",
        message: "Document updated successfully",
        payload: updatedDocument,
    });
}));
exports.factoryUpdateOne = factoryUpdateOne;
const factoryDeleteOne = (model) => (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const document = yield model.findByIdAndDelete(req.params.id);
    if (!document) {
        return new appError_1.default("No document with this ID could be found", 404);
    }
    const updatedMenu = yield model.find();
    res.status(404).json({
        status: "success",
        message: "Document removed successfully",
        payload: updatedMenu,
    });
}));
exports.factoryDeleteOne = factoryDeleteOne;
const factoryCreateMenuItem = (model) => (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let body = Object.assign(Object.assign(Object.assign({}, (req.body.name && { name: req.body.name })), (req.body.dietary && { dietary: req.body.dietary })), (req.body.description
        ? { description: req.body.description }
        : { description: null }));
    if (req.body.description && req.body.description.length > 241)
        return new appError_1.default("Description can only be 241 character long", 400);
    yield model.create(body);
    const updatedMenu = yield model.find();
    res.status(200).json({
        status: "success",
        message: "Document created successfully",
        payload: updatedMenu,
    });
}));
exports.factoryCreateMenuItem = factoryCreateMenuItem;
const factoryUpdateOneMenuItem = (model) => (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let updateFields = Object.assign(Object.assign(Object.assign({}, (req.body.name && { name: req.body.name })), (req.body.dietary && { dietary: req.body.dietary })), (req.body.description
        ? { description: req.body.description }
        : { description: null }));
    if (req.body.description && req.body.description.length > 241) {
        new appError_1.default("Description can only be 241 characters long", 400);
        return res.status(400).json({
            status: "fail",
            message: "Description can only be 241 characters long",
        });
    }
    const updatedItem = yield model.findByIdAndUpdate(req.body.id, updateFields);
    updatedItem === null || updatedItem === void 0 ? void 0 : updatedItem.save();
    const updatedMenu = yield model.find();
    res.status(200).json({
        status: "success",
        message: "Item updated successfully",
        payload: updatedMenu,
    });
}));
exports.factoryUpdateOneMenuItem = factoryUpdateOneMenuItem;
