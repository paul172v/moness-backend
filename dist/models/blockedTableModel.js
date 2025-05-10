"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const blockedTableSchema = new mongoose_1.default.Schema({
    firstName: { type: String, required: true, default: "Blocked" },
    lastName: { type: String, required: true, default: "Slot" },
    selectedDate: { type: Date, required: true },
    selectedTime: { type: String, required: true },
});
const BlockedTable = mongoose_1.default.model("BlockedTable", blockedTableSchema);
exports.default = BlockedTable;
