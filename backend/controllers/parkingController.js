const Parking = require("../models/Parking");
const Reservation = require("../models/Reservation");
const mongoose = require("mongoose");

//GET all parkings
const getParkings = async (req, res) => {
  try {
    const parking = await Parking.find().sort({ createdAt: -1 });
    res.status(200).json(parking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//GET a single parking
const getParking = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid Parking ID" });
  }
  try {
    const parking = await Parking.findById(id);
    if (!parking) {
      return res.status(404).json({ message: "Parking not found!" });
    }
    res.status(200).json(parking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADD a parking
const addParking = async (req, res) => {
  try {
    const parking = new Parking(req.body);
    const savedParking = await parking.save();
    res.status(200).json(savedParking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// UPDATE a parking
const updateParking = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid parking ID." });
  }
  try {
    const parking = await Parking.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true, runValidators: true },
    );
    if (!parking) {
      return res.status(404).json({ message: "Parking not found!" });
    }
    res.status(200).json(parking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE a parking
const deleteParking = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: "No sucj ID found!" });
  }
  try {
    const parking = await Parking.findByIdAndDelete(id);
    if (!parking) {
      return res.status(404).json({ message: "Parking not found!" });
    }
    res.status(200).json({ message: "Parking deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Release a reserved slot. Admins may release any occupied slot; users may release their own reservation.
const releaseParking = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid parking ID." });
  }

  try {
    const reservation = await Reservation.findOne({
      parkingSlot: id,
      status: { $in: ["pending", "confirmed", "checked-in"] },
    }).sort({ createdAt: -1 });
    const isAdmin = req.user.role === "admin";
    const ownsReservation = reservation && reservation.user.toString() === req.user._id.toString();

    if (!isAdmin && !ownsReservation) {
      return res.status(403).json({ message: "You can only release your own reserved slot." });
    }

    const parking = await Parking.findByIdAndUpdate(
      id,
      { $set: { status: "available" } },
      { new: true, runValidators: true },
    );
    if (!parking) {
      return res.status(404).json({ message: "Parking not found!" });
    }

    if (reservation) {
      reservation.status = "cancelled";
      await reservation.save();
    }

    res.status(200).json({ parking, reservation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getParkings,
  getParking,
  addParking,
  updateParking,
  deleteParking,
  releaseParking,
};
