import express from "express";

const router = express.Router();

import {
  employeeSignUp,
  employeeLogIn,
  employeeProtectAndRestrictTo,
  employeeForgotPasswordSendEmail,
  employeeForgotPasswordChangePassword,
} from "../controllers/employeeAuthController";

import {
  updateOneEmployee,
  getAllEmployees,
  getOneEmployeeById,
  getEmployeesAccessList,
  deleteOneEmployee,
  updateOneEmployeeRole,
  getOneEmployeeByEmail,
  updateOneEmployeePassword,
  getUserDetailsById,
} from "../controllers/employeeController";

//// Authentication Routes
router.route("/sign-up").post(employeeSignUp);
router.route("/log-in").post(employeeLogIn);
router
  .route("/forgot-password/send-email")
  .post(employeeForgotPasswordSendEmail);
router
  .route("/forgot-password/change-password")
  .post(employeeForgotPasswordChangePassword);

////// Manager
//// Set Employees Access Routes
router
  .route("/get-employees-access-list")
  .get(employeeProtectAndRestrictTo("Manager"), getEmployeesAccessList);
router
  .route("/get-employee-by-id/:id")
  .get(employeeProtectAndRestrictTo("Manager"), getOneEmployeeById);
router
  .route("/delete-employee/:id")
  .delete(employeeProtectAndRestrictTo("Manager"), deleteOneEmployee);
router
  .route("/update-employee-access")
  .patch(employeeProtectAndRestrictTo("Manager"), updateOneEmployeeRole);

//// User Details
router.route("/get-user-details-by-id").get(getUserDetailsById);
router.route("/update-user/:id").patch(updateOneEmployee);
router.route("/update-user-password/:id").patch(updateOneEmployeePassword);

//// General Routes for Postman
router
  .route("/get-all")
  .post(employeeProtectAndRestrictTo("Manager", "Allowed"), getAllEmployees); /// Can restrict to specific roles. If no role is specified as arguments then all roles are allowed.
//// Get/Update User Routes
router
  .route("/get-user")
  .post(
    employeeProtectAndRestrictTo("Manager", "Allowed"),
    getOneEmployeeByEmail
  );

export default router;
