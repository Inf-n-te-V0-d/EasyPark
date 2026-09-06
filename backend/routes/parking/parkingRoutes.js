const express = require("express");
const {
  getParkings,
  getParking,
  addParking,
  updateParking,
  deleteParking,
  releaseParking,
} = require("../../controllers/parkingController");
const { requireAuth } = require("../../middleware/authMiddleware");

const router = express.Router();

router.get("/", getParkings);
router.get("/:id", getParking);
router.post("/", addParking);
router.put("/:id", updateParking);
router.delete("/:id", deleteParking);
router.post("/:id/release", requireAuth, releaseParking);

module.exports = router;
