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
exports.employeeForgotPasswordChangePassword = exports.employeeForgotPasswordSendEmail = exports.employeeProtectAndRestrictTo = exports.employeeLogIn = exports.employeeSignUp = void 0;
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: "./config.env" });
const appError_1 = __importDefault(require("../utils/appError"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const employeeModel_1 = __importDefault(require("../models/employeeModel"));
const email_1 = __importDefault(require("../utils/email"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
//// ✅ Signup appears to be working
exports.employeeSignUp = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;
    const password = req.body.password;
    const newEmployee = yield new employeeModel_1.default({
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password,
    });
    yield newEmployee.save({ validateBeforeSave: true });
    const token = jsonwebtoken_1.default.sign({ employeeId: newEmployee._id }, process.env.JWT_SECRET);
    res.status(201).json({
        status: "success",
        message: "Employee successfully created",
        email: newEmployee.email,
        role: newEmployee.role,
        token: token,
    });
}));
////////// ✅ Login appears to be working
exports.employeeLogIn = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    //// Document.find() always returns an array so we need to make sure "employee" is just a single document so as not to cause errors.
    const employeeArr = yield employeeModel_1.default.find({ email: req.body.email });
    const employee = employeeArr[0];
    if (!employee) {
        return next(new appError_1.default("Could not find employee associated with this email address", 404));
    }
    const validPassword = yield bcryptjs_1.default.compare(req.body.password, employee.password);
    if (!validPassword) {
        return next(new appError_1.default("Invalid password", 400));
    }
    const token = jsonwebtoken_1.default.sign({ employeeId: employee._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
    });
    res.status(200).send({
        status: "success",
        message: "Logged in successfully",
        role: employee.role,
        email: employee.email,
        token,
    });
}));
////////// ✅ Protect and restrict to
const employeeProtectAndRestrictTo = (...roles) => {
    return (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
            const currentEmployee = yield employeeModel_1.default.findById(JSON.stringify(decoded.employeeId) //// It is important that we stringify the data here
            );
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
            if (roles.length > 0 && !roles.includes(currentEmployee.role)) {
                return next(res.status(403).json({
                    status: "fail",
                    message: "You do not have permission to perform this action",
                }));
            }
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
        ///// Upon successful completion of this controller, move onto the next controller in the route
        next();
    }));
};
exports.employeeProtectAndRestrictTo = employeeProtectAndRestrictTo;
////////// ✅ Forgot Password is working, will send email with reset token
exports.employeeForgotPasswordSendEmail = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 1) Find employee by email
        const employee = yield employeeModel_1.default.findOne({ email: req.body.email });
        if (!employee) {
            return next(new appError_1.default("No employee found with this email", 404));
        }
        // 2) Generate Reset Token
        const resetToken = employee.createPasswordResetToken();
        yield employee.save({ validateBeforeSave: false });
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
        const logoPath = path_1.default.resolve(__dirname, "../public/moness-logo.jpg");
        // 5) Send Email via Mailtrap
        yield (0, email_1.default)({
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
    }
    catch (err) {
        // Reset token & expiration if email sending fails
        const employee = yield employeeModel_1.default.findOne({ email: req.body.email });
        if (employee) {
            employee.passwordResetToken = undefined;
            employee.passwordResetExpires = undefined;
            yield employee.save({ validateBeforeSave: false });
        }
        return next(new appError_1.default("There was an error sending the email", 500));
    }
}));
////////// ✅ Reset password is working, token must be included in the body
exports.employeeForgotPasswordChangePassword = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // 1️⃣ Validate input
    const { resetCode, password } = req.body;
    if (!resetCode) {
        console.log("❌ No reset code provided in the request.");
        return next(new appError_1.default("Invalid request. Reset code is missing.", 400));
    }
    if (!password || password.length < 6) {
        return next(new appError_1.default("Password must be at least 6 characters long.", 400));
    }
    console.log("🔍 Received reset code:", resetCode);
    // 2️⃣ Hash the reset token
    const hashedToken = crypto_1.default
        .createHash("sha256")
        .update(resetCode)
        .digest("hex");
    console.log("🔑 Hashed token:", hashedToken);
    // 3️⃣ Find employee by token and ensure token hasn't expired
    const employee = yield employeeModel_1.default.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });
    if (!employee) {
        console.log("❌ Token is invalid or has expired.");
        return next(new appError_1.default("Token is invalid or has expired.", 400));
    }
    console.log("✅ Found employee:", employee.email || employee._id);
    // 4️⃣ Update password and reset token fields
    employee.password = password;
    employee.passwordResetToken = undefined;
    employee.passwordResetExpires = undefined;
    employee.passwordChangedAt = new Date(Date.now());
    yield employee.save({ validateBeforeSave: false });
    // 5️⃣ Check for JWT_SECRET
    if (!process.env.JWT_SECRET) {
        throw new Error("❌ JWT_SECRET is not defined in environment variables.");
    }
    // 6️⃣ Create and send JWT
    const token = jsonwebtoken_1.default.sign({ id: employee._id }, process.env.JWT_SECRET, {
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
}));
