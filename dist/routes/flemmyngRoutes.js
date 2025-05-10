"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const flemmyngController_1 = require("../controllers/flemmyngController");
const router = express_1.default.Router();
/* ---------- Get All Sections ---------- */
router.route("/").get(flemmyngController_1.flemmyngGetAll);
/* ---------- Mock Data ---------- */
router.route("/create-mock-data").post(flemmyngController_1.flemmyngCreateMockData);
/* ---------- While You Wait ---------- */
router.route("/while-you-wait").post(flemmyngController_1.flemmyngCreateOneWhileYouWait);
router
    .route("/while-you-wait/:id")
    .get(flemmyngController_1.flemmyngGetOneWhileYouWaitById)
    .patch(flemmyngController_1.flemmyngUpdateOneWhileYouWait)
    .delete(flemmyngController_1.flemmyngDeleteOneWhileYouWait);
/* ---------- Starters ---------- */
router.route("/starters").post(flemmyngController_1.flemmyngCreateOneStarter);
router
    .route("/starters/:id")
    .get(flemmyngController_1.flemmyngGetOneStarterById)
    .patch(flemmyngController_1.flemmyngUpdateOneStarter)
    .delete(flemmyngController_1.flemmyngDeleteOneStarter);
/* ---------- Mains ---------- */
router.route("/mains").post(flemmyngController_1.flemmyngCreateOneMain);
router
    .route("/mains/:id")
    .get(flemmyngController_1.flemmyngGetOneMainById)
    .patch(flemmyngController_1.flemmyngUpdateOneMain)
    .delete(flemmyngController_1.flemmyngDeleteOneMain);
/* ---------- Sides ---------- */
router.route("/sides").post(flemmyngController_1.flemmyngCreateOneSide);
router
    .route("/sides/:id")
    .get(flemmyngController_1.flemmyngGetOneSideById)
    .patch(flemmyngController_1.flemmyngUpdateOneSide)
    .delete(flemmyngController_1.flemmyngDeleteOneSide);
/* ---------- Desserts ---------- */
router.route("/desserts").post(flemmyngController_1.flemmyngCreateOneDessert);
router
    .route("/desserts/:id")
    .get(flemmyngController_1.flemmyngGetOneDessertById)
    .patch(flemmyngController_1.flemmyngUpdateOneDessert)
    .delete(flemmyngController_1.flemmyngDeleteOneDessert);
exports.default = router;
