"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlemmyngDesserts = exports.FlemmyngSides = exports.FlemmyngMains = exports.FlemmyngStarters = exports.FlemmyngWhileYouWait = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const menuItemSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    allergens: { type: [String] },
    description: { type: String },
    options: { type: String },
});
menuItemSchema.pre("save", function (next) {
    this.price = Number(this.price.toFixed(2));
    next();
});
exports.FlemmyngWhileYouWait = mongoose_1.default.model("FlemmyngWhileYouWait", menuItemSchema);
exports.FlemmyngStarters = mongoose_1.default.model("FlemmyngStarters", menuItemSchema);
exports.FlemmyngMains = mongoose_1.default.model("FlemmyngMains", menuItemSchema);
exports.FlemmyngSides = mongoose_1.default.model("FlemmyngSides", menuItemSchema);
exports.FlemmyngDesserts = mongoose_1.default.model("FlemmyngDesserts", menuItemSchema);
