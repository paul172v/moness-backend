"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const employeeAuthController_1 = require("../controllers/employeeAuthController");
const employeeController_1 = require("../controllers/employeeController");
//// Authentication Routes
router.route("/sign-up").post(employeeAuthController_1.employeeSignUp);
router.route("/log-in").post(employeeAuthController_1.employeeLogIn);
router
    .route("/forgot-password/send-email")
    .post(employeeAuthController_1.employeeForgotPasswordSendEmail);
router
    .route("/forgot-password/change-password")
    .post(employeeAuthController_1.employeeForgotPasswordChangePassword);
////// Manager
//// Set Employees Access Routes
router
    .route("/get-employees-access-list")
    .get((0, employeeAuthController_1.employeeProtectAndRestrictTo)("Manager"), employeeController_1.getEmployeesAccessList);
router
    .route("/get-employee-by-id/:id")
    .get((0, employeeAuthController_1.employeeProtectAndRestrictTo)("Manager"), employeeController_1.getOneEmployeeById);
router
    .route("/delete-employee/:id")
    .delete((0, employeeAuthController_1.employeeProtectAndRestrictTo)("Manager"), employeeController_1.deleteOneEmployee);
router
    .route("/update-employee-access")
    .patch((0, employeeAuthController_1.employeeProtectAndRestrictTo)("Manager"), employeeController_1.updateOneEmployeeRole);
//// User Details
router.route("/get-user-details-by-id").get(employeeController_1.getUserDetailsById);
router.route("/update-user/:id").patch(employeeController_1.updateOneEmployee);
router.route("/update-user-password/:id").patch(employeeController_1.updateOneEmployeePassword);
//// General Routes for Postman
router
    .route("/get-all")
    .post((0, employeeAuthController_1.employeeProtectAndRestrictTo)("Manager", "Allowed"), employeeController_1.getAllEmployees); /// Can restrict to specific roles. If no role is specified as arguments then all roles are allowed.
//// Get/Update User Routes
router
    .route("/get-user")
    .post((0, employeeAuthController_1.employeeProtectAndRestrictTo)("Manager", "Allowed"), employeeController_1.getOneEmployeeByEmail);
exports.default = router;
