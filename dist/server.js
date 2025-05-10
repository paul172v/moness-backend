"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = require("path");
const app_1 = __importDefault(require("./app"));
const mongoose_1 = __importDefault(require("mongoose"));
const mail_1 = __importDefault(require("@sendgrid/mail"));
dotenv_1.default.config({ path: (0, path_1.resolve)("./config.env") });
const DB = process.env.DB_URL.replace("<PASSWORD>", process.env.DB_PASSWORD);
mongoose_1.default.connect(DB).then(() => console.log("✅ Connected to database"));
const port = process.env.PORT || 3000;
app_1.default.listen(port, () => console.log(`Listening on port... ${port}`));
mail_1.default.setApiKey(process.env.SENDGRID_API_KEY);
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbXBsb3llZUlkIjoiNjdkOGJmM2U3YmZiNDI5MzY1MmJjMmM3IiwiaWF0IjoxNzQyMjU4NzU5LCJleHAiOjE3NDIyNjIzNTl9.DERAsly_OfmfSLaP67UyeLTXJOCbgpjSeBNoxtXDABs
