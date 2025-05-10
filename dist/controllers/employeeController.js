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
exports.getUserDetailsById = exports.updateOneEmployeePassword = exports.updateOneEmployeeRole = exports.getEmployeesAccessList = exports.deleteOneEmployee = exports.updateOneEmployee = exports.getOneEmployeeById = exports.getOneEmployeeByEmail = exports.getAllEmployees = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const employeeModel_1 = __importDefault(require("../models/employeeModel"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const handlerFactory_1 = require("./handlerFactory");
exports.getAllEmployees = (0, handlerFactory_1.factoryGetAll)(employeeModel_1.default);
exports.getOneEmployeeByEmail = (0, handlerFactory_1.factoryGetOneByEmail)(employeeModel_1.default);
exports.getOneEmployeeById = (0, handlerFactory_1.factoryGetOneById)(employeeModel_1.default);
exports.updateOneEmployee = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let updateFields = Object.assign(Object.assign(Object.assign(Object.assign({}, (req.body.firstName && { firstName: req.body.firstName })), (req.body.middleName
        ? { middleName: req.body.middleName }
        : { middleName: null })), (req.body.lastName && { lastName: req.body.lastName })), (req.body.email && { email: req.body.email }));
    const updatedEmployee = yield employeeModel_1.default.findByIdAndUpdate(req.params.id, updateFields);
    updatedEmployee === null || updatedEmployee === void 0 ? void 0 : updatedEmployee.save();
    res.status(200).json({
        status: "success",
        message: "User updated successfully",
    });
}));
exports.deleteOneEmployee = (0, handlerFactory_1.factoryDeleteOne)(employeeModel_1.default);
exports.getEmployeesAccessList = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const employees = yield employeeModel_1.default.find().select("firstName middleName lastName email role");
    res.status(200).json({
        status: "success",
        payload: { employees },
    });
}));
exports.updateOneEmployeeRole = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield employeeModel_1.default.findByIdAndUpdate(req.body.id, {
        role: req.body.role,
    });
    res.status(200).json({
        status: "success",
        message: "Employee role updated successfully",
    });
}));
exports.updateOneEmployeePassword = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;
    if (!id || !currentPassword || !newPassword) {
        return res.status(400).json({
            status: "fail",
            message: "Missing required fields: id, currentPassword, or newPassword.",
        });
    }
    // 1) Find the employee and include password field
    const employee = yield employeeModel_1.default.findById(id).select("+password");
    if (!employee) {
        return res.status(404).json({
            status: "fail",
            message: "Employee not found.",
        });
    }
    // 2) Check if current password is correct
    const isMatch = yield bcryptjs_1.default.compare(currentPassword, employee.password);
    if (!isMatch) {
        return res.status(401).json({
            status: "fail",
            message: "Current password is incorrect.",
        });
    }
    // 3) Hash new password and save
    employee.password = newPassword;
    employee.passwordChangedAt = new Date();
    yield employee.save();
    res.status(200).json({
        status: "success",
        message: "Password updated successfully.",
    });
}));
exports.getUserDetailsById = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 1) Get token and check if it exists
        let token;
        if (req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer ")) {
            const placeholder = req.headers.authorization.split("Bearer ");
            token = placeholder[1];
        }
        if (!token) {
            return next(res.status(401).json({
                status: "fail",
                message: "No token, you are not logged in",
            }));
        }
        // 2) Function to verify token and return a promise if okay
        const verifyToken = (token) => {
            return new Promise((resolve, reject) => {
                jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(decodedToken);
                    }
                });
            });
        };
        const decoded = yield verifyToken(token);
        // 3) Check if employee still exists
        const cleanId = decoded.employeeId.trim().replace(/^"+|"+$/g, "");
        const currentEmployee = yield employeeModel_1.default.findById(new mongoose_1.default.Types.ObjectId(cleanId));
        if (!currentEmployee) {
            console.log("❌ Employee belonging to token not found");
            return res.status(401).json({
                status: "fail",
                message: "Employee belonging to token not found, you are not logged in",
            });
        }
        // 4) Check if employee changed password after token was issued
        if (currentEmployee.changedPasswordAfter(decoded.iat)) {
            return next(res.status(401).json({
                status: "fail",
                message: "Password changed after token assigned, you are not logged in",
            }));
        }
        // 5: Conditional) Check if user's role matches the specified restricted roles. If no roles are specified then this step is skipped.
        return res.status(200).json({
            status: "success",
            payload: {
                firstName: currentEmployee.firstName,
                middleName: currentEmployee.middleName,
                lastName: currentEmployee.lastName,
                email: currentEmployee.email,
                role: currentEmployee.role,
                id: currentEmployee._id,
            },
        });
    }
    catch (err) {
        console.log(err.message);
        if (err.message === "Invalid signature") {
            console.log("❌ 401: Invalid signature, you are not logged in");
            return next(res.status(401).json({
                status: "fail",
                message: "Invalid signature, you are not logged in",
            }));
        }
        /* Both config.env and document.cookies (in React) should be set with expiry timer */
        /* Remember when changing JWT_EXPIRES_IN, server must be reset for changes to take effect */
        if (err.message === "jwt expired") {
            return next(res.status(401).json({
                status: "fail",
                message: "JWT expired, you are not logged in",
            }));
        }
    }
}));
