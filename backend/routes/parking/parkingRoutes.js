const express = require("express");
const {
  getParkings,
  getParking,
  addParking,
  updateParking,
  deleteParking,
} = require("../../controllers/parkingController");

const router = express.Router();

router.get("/", getParkings);
router.get("/:id", getParking);
router.post("/", addParking);
router.put("/:id", updateParking);
router.delete("/:id", deleteParking);

module.exports = router;
