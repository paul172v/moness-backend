"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const flemmyngMenuController_1 = require("../controllers/flemmyngMenuController");
const router = express_1.default.Router();
router
    .route("/get-all-flemmyng-menu-data-interface")
    .get(flemmyngMenuController_1.getAllFlemmyngMenuData);
router.route("/create-new-item").post(flemmyngMenuController_1.createFlemmyngMenuItem);
router.route("/update-one-item-by-id/:id").patch(flemmyngMenuController_1.updateFlemmyngMenuItem);
router.route("/delete-one-item-by-id/:id").delete(flemmyngMenuController_1.deleteFlemmyngMenuItem);
exports.default = router;
