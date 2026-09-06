const express = require("express");
const {
  getParkings,
  getParking,
  addParking,
  updateParking,
  deleteParking,
  releaseParking,
} = require("../../controllers/parkingController");
const { requireAuth, requireAdmin } = require("../../middleware/authMiddleware");

const router = express.Router();

router.get("/", getParkings);
router.get("/:id", getParking);
router.post("/", requireAuth, requireAdmin, addParking);
router.put("/:id", requireAuth, requireAdmin, updateParking);
router.delete("/:id", requireAuth, requireAdmin, deleteParking);
router.post("/:id/release", requireAuth, releaseParking);

module.exports = router;
