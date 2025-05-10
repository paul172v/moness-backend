"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
        this.isOperational = true; // If it is operational error then it's something we accounted for
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.default = AppError;
