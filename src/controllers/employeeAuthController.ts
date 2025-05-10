import { Request, Response, NextFunction } from "express";
import sgMail from "@sendgrid/mail";
import path from "path";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config({ path: "./config.env" });
import AppError from "../utils/appError";
import jwt from "jsonwebtoken";
import Employee from "../models/employeeModel";
import sendEmail from "../utils/email";
import bcrypt from "bcryptjs";
import catchAsync from "../utils/catchAsync";

//// ✅ Signup appears to be working
export const employeeSignUp = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;
    const password = req.body.password;

    const newEmployee = await new Employee({
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: password,
    });

    await newEmployee.save({ validateBeforeSave: true });

    const token = jwt.sign(
      { employeeId: newEmployee._id },
      process.env.JWT_SECRET as string
    );

    res.status(201).json({
      status: "success",
      message: "Employee successfully created",
      email: newEmployee.email,
      role: newEmployee.role,
      token: token,
    });
  }
);

////////// ✅ Login appears to be working
export const employeeLogIn = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    //// Document.find() always returns an array so we need to make sure "employee" is just a single document so as not to cause errors.
    const employeeArr = await Employee.find({ email: req.body.email });
    const employee = employeeArr[0];

    if (!employee) {
      return next(
        new AppError(
          "Could not find employee associated with this email address",
          404
        )
      );
    }

    const validPassword = await bcrypt.compare(
      req.body.password,
      employee.password
    );

    if (!validPassword) {
      return next(new AppError("Invalid password", 400));
    }

    const token = jwt.sign(
      { employeeId: employee._id },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1h",
      }
    );

    res.status(200).send({
      status: "success",
      message: "Logged in successfully",
      role: employee.role,
      email: employee.email,
      token,
    });
  }
);

////////// ✅ Protect and restrict to
export const employeeProtectAndRestrictTo = (...roles: string[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
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
      const currentEmployee = await Employee.findById(
        JSON.stringify(decoded.employeeId) //// It is important that we stringify the data here
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
      if (roles.length > 0 && !roles.includes(currentEmployee.role)) {
        return next(
          res.status(403).json({
            status: "fail",
            message: "You do not have permission to perform this action",
          })
        );
      }
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

    ///// Upon successful completion of this controller, move onto the next controller in the route
    next();
  });
};

////////// ✅ Forgot Password is working, will send email with reset token
export const employeeForgotPasswordSendEmail = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1) Find employee by email
      const employee = await Employee.findOne({ email: req.body.email });
      if (!employee) {
        return next(new AppError("No employee found with this email", 404));
      }

      // 2) Generate Reset Token
      const resetToken = employee.createPasswordResetToken();
      await employee.save({ validateBeforeSave: false });

      // 3) Construct Reset URL & Email Content
      const resetUrl = `http://localhost:5173/forgot-password/change-password/${resetToken}`;
      const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Password Reset</title>
          <style>
            .container {
              font-family: Arial, sans-serif;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              text-align: center;
            }
            .link {
              color: rgb(3, 87, 58);
              font-weight: bold;
              text-decoration: none;
              display: inline-block;
              margin-top: 10px;
              padding: 10px 20px;
              border: 1px solid rgb(3, 87, 58);
              border-radius: 5px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <img src="cid:monessLogo" alt="Moness Staff Portal" width="200" />
            <h2>Password Reset Request</h2>
            <p>Hello,</p>
            <p>
              You have requested a password reset for the Moness Staff Portal.
              Please follow the link below to reset your password:
            </p>
            <a class="link" href="${resetUrl}">Reset Your Password</a>
            <p>
              If you did not request a password reset, please ignore this email or
              contact support.
            </p>
            <p>Thank you!</p>
          </div>
        </body>
      </html>`;

      // 4) Define Path to Logo Image
      const logoPath = path.resolve(__dirname, "../public/moness-logo.jpg");

      // 5) Send Email via Mailtrap
      await sendEmail({
        email: employee.email,
        subject: "Moness Staff Portal: Password Reset",
        html,
        attachments: [
          {
            filename: "moness-logo.jpg",
            path: logoPath,
            cid: "monessLogo",
          },
        ],
      });

      res.status(200).json({
        status: "success",
        message: "Token sent to email",
      });
    } catch (err) {
      // Reset token & expiration if email sending fails
      const employee = await Employee.findOne({ email: req.body.email });
      if (employee) {
        employee.passwordResetToken = undefined;
        employee.passwordResetExpires = undefined;
        await employee.save({ validateBeforeSave: false });
      }

      return next(new AppError("There was an error sending the email", 500));
    }
  }
);

////////// ✅ Reset password is working, token must be included in the body
export const employeeForgotPasswordChangePassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1️⃣ Validate input
    const { resetCode, password } = req.body;

    if (!resetCode) {
      console.log("❌ No reset code provided in the request.");
      return next(new AppError("Invalid request. Reset code is missing.", 400));
    }

    if (!password || password.length < 6) {
      return next(
        new AppError("Password must be at least 6 characters long.", 400)
      );
    }

    console.log("🔍 Received reset code:", resetCode);

    // 2️⃣ Hash the reset token
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetCode)
      .digest("hex");
    console.log("🔑 Hashed token:", hashedToken);

    // 3️⃣ Find employee by token and ensure token hasn't expired
    const employee = await Employee.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!employee) {
      console.log("❌ Token is invalid or has expired.");
      return next(new AppError("Token is invalid or has expired.", 400));
    }

    console.log("✅ Found employee:", employee.email || employee._id);

    // 4️⃣ Update password and reset token fields
    employee.password = password;
    employee.passwordResetToken = undefined;
    employee.passwordResetExpires = undefined;
    employee.passwordChangedAt = new Date(Date.now());

    await employee.save({ validateBeforeSave: false });

    // 5️⃣ Check for JWT_SECRET
    if (!process.env.JWT_SECRET) {
      throw new Error("❌ JWT_SECRET is not defined in environment variables.");
    }

    // 6️⃣ Create and send JWT
    const token = jwt.sign({ id: employee._id }, process.env.JWT_SECRET, {
      expiresIn: "10min",
    });

    console.log("🔐 JWT issued for employee:", employee._id);

    // 7️⃣ Send response
    res.status(200).json({
      status: "success",
      message: "Password successfully changed. Employee is logged in.",
      token,
      payload: employee,
    });
  }
);
