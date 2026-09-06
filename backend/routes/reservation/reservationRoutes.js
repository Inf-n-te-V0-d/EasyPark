const express = require("express");
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
router.get("/user/:userId", getReservationsByUser);
router.get("/:id", getReservation);
router.post("/", addReservation);
router.put("/:id", updateReservation);
router.delete("/:id", deleteReservation);

module.exports = router;