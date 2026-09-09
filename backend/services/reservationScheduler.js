const cron = require("node-cron");
const Reservation = require("../models/Reservation");
const Parking = require("../models/Parking");

const startReservationScheduler = () => {
  // Run every minute
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();

      // Mark reservations as occupied when their scheduled time begins.
      const startedReservations = await Reservation.find({
        status: { $in: ["pending", "confirmed"] },
        startTime: { $lte: now },
        endTime: { $gt: now },
      });

      for (const reservation of startedReservations) {
        const vehicleNumber = reservation.vehicleDetails?.vehicleNumber || "";
        const occupiedParking = await Parking.findOneAndUpdate(
          { _id: reservation.parkingSlot, status: "available" },
          {
            $set: {
              status: "occupied",
              vehicleNumber,
            },
          },
          { new: true },
        );

        if (occupiedParking) {
          console.log(
            `Reservation ${reservation._id} started. ` +
              `Parking slot ${reservation.parkingSlot} is occupied by ${vehicleNumber}.`,
          );
        }
      }

      // Find reservations whose end time has passed
      const expiredReservations = await Reservation.find({
        status: { $in: ["pending", "confirmed", "checked-in"] },
        endTime: { $lte: now },
      });

      for (const reservation of expiredReservations) {
        // Mark reservation as completed
        reservation.status = "completed";
        await reservation.save();

        // Release the parking slot
        await Parking.findByIdAndUpdate(
          reservation.parkingSlot,
          {
            $set: {
              status: "available",
              vehicleNumber: "",
            },
          },
          {
            new: true,
          },
        );

        console.log(
          `Reservation ${reservation._id} completed. ` +
            `Parking slot ${reservation.parkingSlot} released.`,
        );
      }
    } catch (error) {
      console.error("Reservation scheduler error:", error.message);
    }
  });

  console.log("Reservation scheduler started.");
};

module.exports = startReservationScheduler;
