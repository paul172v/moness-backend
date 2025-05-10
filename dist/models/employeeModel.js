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
const crypto_1 = __importDefault(require("crypto"));
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const employeeSchema = new mongoose_1.default.Schema({
    firstName: {
        type: String,
        required: [true, "Employee must have a first name"],
    },
    middleName: {
        type: String,
        optional: true,
    },
    lastName: {
        type: String,
        required: [true, "Employee must have a last name"],
    },
    role: {
        type: String,
        required: [true, "Employee must have a role"],
        default: "Pending",
        enum: ["Manager", "Allowed", "Banned", "Pending"],
    },
    email: {
        type: String,
        required: [true, "Employee must have an email address"],
        unique: [true, "A single email address can only be tied to one account"],
    },
    password: {
        type: String,
        required: [true, "Employee must have a password"],
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
});
employeeSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        // Only run if the password was modified
        if (!this.isModified("password"))
            return next();
        // Hash the password with cost of 12
        this.password = yield bcryptjs_1.default.hash(this.password, 12);
        next();
    });
});
employeeSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified("password") || this.isNew) {
            return next();
        }
        this.passwordChangedAt = new Date(Date.now() - 1000); // The -1000 (1second) is to avoid bugs where there is a delay before the document is saved
        next();
    });
});
employeeSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const passwordChangedTimestamp = this.passwordChangedAt.getTime() / 1000;
        return JWTTimestamp < passwordChangedTimestamp;
    }
    // false means not changed
    return false;
};
employeeSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto_1.default.randomBytes(32).toString("hex");
    this.passwordResetToken = crypto_1.default
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
    this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    return resetToken;
};
const Employee = mongoose_1.default.model("employee", employeeSchema);
exports.default = Employee;
