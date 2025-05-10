import express from "express";
import {
  tableGetAll,
  tableCreateOne,
  tableGetManyByDate,
  tableGetManyByName,
  tableGetManyByEmail,
  tableGetOneById,
  tableUpdateOne,
  tableDeleteOne,
  tableToggleTimeSelectionButtons,
  tablePruneBookings,
  blockedTimeSlotCreateOne,
  blockedTimeSlotGetOneById,
  blockedTimeSlotUpdateOne,
  blockedTimeSlotDeleteOne,
} from "../controllers/tableController";

const router = express.Router();

/* ---------- Table Booking Routes ---------- */
router.route("/").get(tableGetAll).post(tableCreateOne);

router.post("/filter/by-date", tableGetManyByDate);
router.post("/filter/by-name", tableGetManyByName);
router.post("/filter/by-email", tableGetManyByEmail);

router
  .route("/:id")
  .get(tableGetOneById)
  .patch(tableUpdateOne)
  .delete(tableDeleteOne);

router.post("/toggle-time-selection", tableToggleTimeSelectionButtons);

/* ---------- Blocked Time Slot Routes ---------- */
router.post("/blocked", blockedTimeSlotCreateOne);

router
  .route("/blocked/:id")
  .get(blockedTimeSlotGetOneById)
  .patch(blockedTimeSlotUpdateOne)
  .delete(blockedTimeSlotDeleteOne);

/* ---------- Maintenance ---------- */
router.route("/prune/prune-all").delete(tablePruneBookings);

export default router;
