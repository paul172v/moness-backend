import express from "express";
import cors from "cors";
import morgan from "morgan";
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");

import AppError from "./utils/appError";
import globalErrorHandler from "./controllers/errorController";

const app = express();

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Set Security HTTP Headers
app.use(helmet());

app.use(cors());

app.use(express.json({ limit: "10kb" }));

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

import tableRouter from "./routes/tableRoutes";
import employeeRouter from "./routes/employeeRoutes";

app.use("/api/v1/table", tableRouter);
app.use("/api/v1/employee", employeeRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;
