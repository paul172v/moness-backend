import express from "express";
import {
  flemmyngGetAll,
  flemmyngCreateMockData,

  // While You Wait
  flemmyngCreateOneWhileYouWait,
  flemmyngGetOneWhileYouWaitById,
  flemmyngUpdateOneWhileYouWait,
  flemmyngDeleteOneWhileYouWait,

  // Starters
  flemmyngCreateOneStarter,
  flemmyngGetOneStarterById,
  flemmyngUpdateOneStarter,
  flemmyngDeleteOneStarter,

  // Mains
  flemmyngCreateOneMain,
  flemmyngGetOneMainById,
  flemmyngUpdateOneMain,
  flemmyngDeleteOneMain,

  // Sides
  flemmyngCreateOneSide,
  flemmyngGetOneSideById,
  flemmyngUpdateOneSide,
  flemmyngDeleteOneSide,

  // Desserts
  flemmyngCreateOneDessert,
  flemmyngGetOneDessertById,
  flemmyngUpdateOneDessert,
  flemmyngDeleteOneDessert,
} from "../controllers/flemmyngController";

const router = express.Router();

/* ---------- Get All Sections ---------- */
router.route("/").get(flemmyngGetAll);

/* ---------- Mock Data ---------- */
router.route("/create-mock-data").post(flemmyngCreateMockData);

/* ---------- While You Wait ---------- */
router.route("/while-you-wait").post(flemmyngCreateOneWhileYouWait);
router
  .route("/while-you-wait/:id")
  .get(flemmyngGetOneWhileYouWaitById)
  .patch(flemmyngUpdateOneWhileYouWait)
  .delete(flemmyngDeleteOneWhileYouWait);

/* ---------- Starters ---------- */
router.route("/starters").post(flemmyngCreateOneStarter);
router
  .route("/starters/:id")
  .get(flemmyngGetOneStarterById)
  .patch(flemmyngUpdateOneStarter)
  .delete(flemmyngDeleteOneStarter);

/* ---------- Mains ---------- */
router.route("/mains").post(flemmyngCreateOneMain);
router
  .route("/mains/:id")
  .get(flemmyngGetOneMainById)
  .patch(flemmyngUpdateOneMain)
  .delete(flemmyngDeleteOneMain);

/* ---------- Sides ---------- */
router.route("/sides").post(flemmyngCreateOneSide);
router
  .route("/sides/:id")
  .get(flemmyngGetOneSideById)
  .patch(flemmyngUpdateOneSide)
  .delete(flemmyngDeleteOneSide);

/* ---------- Desserts ---------- */
router.route("/desserts").post(flemmyngCreateOneDessert);
router
  .route("/desserts/:id")
  .get(flemmyngGetOneDessertById)
  .patch(flemmyngUpdateOneDessert)
  .delete(flemmyngDeleteOneDessert);

export default router;
