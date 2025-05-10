"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const testControllers_1 = require("../controllers/testControllers");
// import factory from "../controllers/handlerFactory";
const router = express_1.default.Router();
router.use(testControllers_1.testGet);
router.route("/").get(testControllers_1.testGet);
exports.default = router;
