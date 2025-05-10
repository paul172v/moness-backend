import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import Employee from "../models/employeeModel";
import bcrypt from "bcryptjs";
import catchAsync from "../utils/catchAsync";
import jwt from "jsonwebtoken";

import {
  factoryGetAll,
  factoryGetOneById,
  factoryGetOneByEmail,
  factoryDeleteOne,
} from "./handlerFactory";

export const getAllEmployees = factoryGetAll(Employee);

export const getOneEmployeeByEmail = factoryGetOneByEmail(Employee);

export const getOneEmployeeById = factoryGetOneById(Employee);

export const updateOneEmployee = catchAsync(
  async (req: Request, res: Response) => {
    let updateFields = {
      ...(req.body.firstName && { firstName: req.body.firstName }),
      ...(req.body.middleName
        ? { middleName: req.body.middleName }
        : { middleName: null }),
      ...(req.body.lastName && { lastName: req.body.lastName }),
      ...(req.body.email && { email: req.body.email }),
    };

    const updatedEmployee = await Employee.findByIdAndUpdate(
      req.params.id,
      updateFields
    );

    updatedEmployee?.save();

    res.status(200).json({
      status: "success",
      message: "User updated successfully",
    });
  }
);

export const deleteOneEmployee = factoryDeleteOne(Employee);

export const getEmployeesAccessList = catchAsync(
  async (req: Request, res: Response) => {
    const employees = await Employee.find().select(
      "firstName middleName lastName email role"
    );

    res.status(200).json({
      status: "success",
      payload: { employees },
    });
  }
);

export const updateOneEmployeeRole = catchAsync(
  async (req: Request, res: Response) => {
    await Employee.findByIdAndUpdate(req.body.id, {
      role: req.body.role,
    });

    res.status(200).json({
      status: "success",
      message: "Employee role updated successfully",
    });
  }
);

export const updateOneEmployeePassword = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!id || !currentPassword || !newPassword) {
      return res.status(400).json({
        status: "fail",
        message:
          "Missing required fields: id, currentPassword, or newPassword.",
      });
    }

    // 1) Find the employee and include password field
    const employee = await Employee.findById(id).select("+password");

    if (!employee) {
      return res.status(404).json({
        status: "fail",
        message: "Employee not found.",
      });
    }

    // 2) Check if current password is correct
    const isMatch = await bcrypt.compare(currentPassword, employee.password);
    if (!isMatch) {
      return res.status(401).json({
        status: "fail",
        message: "Current password is incorrect.",
      });
    }

    // 3) Hash new password and save

    employee.password = newPassword;
    employee.passwordChangedAt = new Date();

    await employee.save();

    res.status(200).json({
      status: "success",
      message: "Password updated successfully.",
    });
  }
);

export const getUserDetailsById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1) Get token and check if it exists
      let token;

      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer ")
      ) {
        const placeholder = req.headers.authorization.split("Bearer ");
        token = placeholder[1];
      }

      if (!token) {
        return next(
          res.status(401).json({
            status: "fail",
            message: "No token, you are not logged in",
          })
        );
      }

      // 2) Function to verify token and return a promise if okay
      const verifyToken = (token: string): Promise<any> => {
        return new Promise((resolve, reject) => {
          jwt.verify(
            token,
            process.env.JWT_SECRET as string,
            (err, decodedToken) => {
              if (err) {
                reject(err);
              } else {
                resolve(decodedToken);
              }
            }
          );
        });
      };

      const decoded = await verifyToken(token);

      // 3) Check if employee still exists
      const cleanId = decoded.employeeId.trim().replace(/^"+|"+$/g, "");
      const currentEmployee = await Employee.findById(
        new mongoose.Types.ObjectId(cleanId)
      );

      if (!currentEmployee) {
        console.log("❌ Employee belonging to token not found");
        return res.status(401).json({
          status: "fail",
          message:
            "Employee belonging to token not found, you are not logged in",
        });
      }

      // 4) Check if employee changed password after token was issued
      if (currentEmployee.changedPasswordAfter(decoded.iat)) {
        return next(
          res.status(401).json({
            status: "fail",
            message:
              "Password changed after token assigned, you are not logged in",
          })
        );
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
    } catch (err: any) {
      console.log(err.message);

      if (err.message === "Invalid signature") {
        console.log("❌ 401: Invalid signature, you are not logged in");
        return next(
          res.status(401).json({
            status: "fail",
            message: "Invalid signature, you are not logged in",
          })
        );
      }

      /* Both config.env and document.cookies (in React) should be set with expiry timer */
      /* Remember when changing JWT_EXPIRES_IN, server must be reset for changes to take effect */
      if (err.message === "jwt expired") {
        return next(
          res.status(401).json({
            status: "fail",
            message: "JWT expired, you are not logged in",
          })
        );
      }
    }
  }
);
