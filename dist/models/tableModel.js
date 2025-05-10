"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const tableSchema = new mongoose_1.default.Schema({
    email: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    numberOfGuests: { type: Number, required: true },
    occasion: { type: String, required: false },
    requests: { type: String, required: false },
    selectedDate: { type: Date, required: true },
    selectedTime: { type: String, required: true },
    tel: { type: String, required: true },
    termsAccepted: { type: Boolean, required: true },
});
const Table = mongoose_1.default.model("Table", tableSchema);
exports.default = Table;
