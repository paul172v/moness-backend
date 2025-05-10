"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const tableSchema = new mongoose_1.default.Schema({
    numberOfGuests: Number,
    selectedDate: Date,
    selectedTIme: Number,
});
const Table = mongoose_1.default.model(tableSchema);
exports.default = Table;
