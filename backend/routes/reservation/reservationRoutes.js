const express = require("express");
const { requireAuth } = require("../../middleware/authMiddleware");
const {
    getReservations,
    getReservation,
    addReservation,
    updateReservation,
    deleteReservation,
    getReservationsByUser,
} = require("../../controllers/reservationController");

const router = express.Router();

router.get("/", getReservations);
router.get("/user/:userId", requireAuth, getReservationsByUser);
router.get("/:id", getReservation);
router.post("/", requireAuth, addReservation);
router.put("/:id", updateReservation);
router.delete("/:id", deleteReservation);

module.exports = router;