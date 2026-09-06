const Parking = require("../models/Parking");
const Reservation = require("../models/Reservation");
const mongoose = require("mongoose");

const parkingFields = ({ slot, floor, latitude, longitude, status }) => ({
  slot: typeof slot === "string" ? slot.trim().toUpperCase() : slot,
  floor: Number(floor),
  latitude: String(latitude).trim(),
  longitude: String(longitude).trim(),
  ...(status ? { status } : {}),
});

const requireAdminAccess = (req, res) => {
  if (req.user?.role === "admin") return true;
  res.status(403).json({ message: "Administrator access is required to manage parking slots." });
  return false;
};

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
  if (!requireAdminAccess(req, res)) return;
  try {
    const details = parkingFields(req.body);
    if (!details.slot || !Number.isFinite(details.floor) || !Number.isFinite(Number(details.latitude)) || !Number.isFinite(Number(details.longitude))) {
      return res.status(400).json({ message: "Slot, floor, latitude, and longitude are required." });
    }
    const duplicate = await Parking.findOne({ slot: details.slot, floor: details.floor });
    if (duplicate) {
      return res.status(409).json({ message: "A parking slot with this name already exists on that floor." });
    }
    const parking = new Parking(details);
    const savedParking = await parking.save();
    res.status(200).json(savedParking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// UPDATE a parking
const updateParking = async (req, res) => {
  if (!requireAdminAccess(req, res)) return;
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid parking ID." });
  }
  try {
    const details = parkingFields(req.body);
    if (!details.slot || !Number.isFinite(details.floor) || !Number.isFinite(Number(details.latitude)) || !Number.isFinite(Number(details.longitude))) {
      return res.status(400).json({ message: "Slot, floor, latitude, and longitude are required." });
    }
    const duplicate = await Parking.findOne({ slot: details.slot, floor: details.floor, _id: { $ne: id } });
    if (duplicate) {
      return res.status(409).json({ message: "A parking slot with this name already exists on that floor." });
    }
    const parking = await Parking.findByIdAndUpdate(
      id,
      details,
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
  if (!requireAdminAccess(req, res)) return;
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: "No sucj ID found!" });
  }
  try {
    const activeReservation = await Reservation.exists({
      parkingSlot: id,
      status: { $in: ["pending", "confirmed", "checked-in"] },
    });
    if (activeReservation) {
      return res.status(409).json({ message: "Release the active reservation before deleting this parking slot." });
    }
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
