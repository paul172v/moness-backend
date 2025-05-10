"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const appError_1 = __importDefault(require("./utils/appError"));
const errorController_1 = __importDefault(require("./controllers/errorController"));
const app = (0, express_1.default)();
if (process.env.NODE_ENV === "development") {
    app.use((0, morgan_1.default)("dev"));
}
// Set Security HTTP Headers
app.use(helmet());
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: "10kb" }));
// Data Sanitization against NoSQL query injection
app.use(mongoSanitize());
// Data sanitization against XSS (Cross-Site Scripting Attacks)
app.use(xss());
// Limit requests from same IP
const limiter = rateLimit({
    // Max requests from the same IP per time window
    max: 100,
    // WindowM (M for milliseconds), converted to 1 hour
    windowM: 60 * 60 * 1000,
    // Error Message
    message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/table", limiter);
const tableRoutes_1 = __importDefault(require("./routes/tableRoutes"));
const employeeRoutes_1 = __importDefault(require("./routes/employeeRoutes"));
app.use("/api/v1/table", tableRoutes_1.default);
app.use("/api/v1/employee", employeeRoutes_1.default);
app.all("*", (req, res, next) => {
    next(new appError_1.default(`Can't find ${req.originalUrl} on this server!`, 404));
});
app.use(errorController_1.default);
exports.default = app;
