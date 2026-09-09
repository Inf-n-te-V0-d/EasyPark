const cron = require("node-cron");
const Reservation = require("../models/Reservation");
const Parking = require("../models/Parking");

const startReservationScheduler = () => {
  // Run every minute
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();

      // Find reservations whose end time has passed
      const expiredReservations = await Reservation.find({
        status: { $in: ["pending", "confirmed", "checked-in"] },
        endTime: { $lte: now },
      });

      if (expiredReservations.length === 0) {
        return;
      }

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
