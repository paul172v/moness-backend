"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const tableController_1 = require("../controllers/tableController");
const router = express_1.default.Router();
/* ---------- Table Booking Routes ---------- */
router.route("/").get(tableController_1.tableGetAll).post(tableController_1.tableCreateOne);
router.post("/filter/by-date", tableController_1.tableGetManyByDate);
router.post("/filter/by-name", tableController_1.tableGetManyByName);
router.post("/filter/by-email", tableController_1.tableGetManyByEmail);
router
    .route("/:id")
    .get(tableController_1.tableGetOneById)
    .patch(tableController_1.tableUpdateOne)
    .delete(tableController_1.tableDeleteOne);
router.post("/toggle-time-selection", tableController_1.tableToggleTimeSelectionButtons);
/* ---------- Blocked Time Slot Routes ---------- */
router.post("/blocked", tableController_1.blockedTimeSlotCreateOne);
router
    .route("/blocked/:id")
    .get(tableController_1.blockedTimeSlotGetOneById)
    .patch(tableController_1.blockedTimeSlotUpdateOne)
    .delete(tableController_1.blockedTimeSlotDeleteOne);
/* ---------- Maintenance ---------- */
router.route("/prune/prune-all").delete(tableController_1.tablePruneBookings);
exports.default = router;
