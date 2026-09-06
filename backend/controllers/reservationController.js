const Reservation = require("../models/Reservation");
const Parking = require("../models/Parking");
const User = require("../models/User");
const mongoose = require("mongoose");

//GET all reservations
const getReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find().sort({ createdAt: -1 });
    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//GET a single reservation
const getReservation = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid Reservation ID" });
  }
  try {
    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found!" });
    }
    res.status(200).json(reservation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADD a reservation
const addReservation = async (req, res) => {
  let reservedParking;
  try {
    const { parkingSlot, startTime, endTime, vehicleDetails = {}, totalAmount = 0 } = req.body;
    const user = req.user._id;
    const vehicleNumber = String(vehicleDetails.vehicleNumber || "").trim();

    if (!vehicleNumber) {
      return res.status(400).json({ message: "Vehicle number is required." });
    }

    if (!mongoose.Types.ObjectId.isValid(user) || !mongoose.Types.ObjectId.isValid(parkingSlot)) {
      return res.status(400).json({ message: "Valid user and parking slot are required." });
    }

    if (!await User.exists({ _id: user })) {
      return res.status(404).json({ message: "User not found." });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
      return res.status(400).json({ message: "A valid reservation time range is required." });
    }

    reservedParking = await Parking.findOneAndUpdate(
      { _id: parkingSlot, status: "available" },
      { $set: { status: "occupied", vehicleNumber } },
      { new: true },
    );
    if (!reservedParking) {
      return res.status(409).json({ message: "That parking space is no longer available." });
    }

    const reservation = new Reservation({
      user,
      parkingSlot,
      startTime: start,
      endTime: end,
      vehicleDetails: { ...vehicleDetails, vehicleNumber },
      totalAmount: Number(totalAmount) || 0,
      pin: String(Math.floor(100000 + Math.random() * 900000)),
      status: "confirmed",
    });
    const savedReservation = await reservation.save();
    res.status(201).json(await savedReservation.populate("parkingSlot"));
  } catch (error) {
    if (reservedParking) {
      await Parking.findByIdAndUpdate(reservedParking._id, { $set: { status: "available", vehicleNumber: "" } });
    }
    res.status(400).json({ message: error.message });
  }
};

const getReservationsByUser = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
    return res.status(400).json({ message: "Invalid user ID." });
  }
  if (req.user._id.toString() !== req.params.userId && req.user.role !== "admin") {
    return res.status(403).json({ message: "You can only view your own reservations." });
  }
  try {
    const reservations = await Reservation.find({ user: req.params.userId })
      .populate("parkingSlot")
      .sort({ createdAt: -1 });
    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE a reservation
const updateReservation = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.staus(404).json({ message: "No such ID found!" });
  }
  try {
    const reservation = await Reservation.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true, runValidators: true },
    );
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found!" });
    }
    if (reservation.status === "cancelled") {
      await Parking.findByIdAndUpdate(reservation.parkingSlot, { $set: { status: "available", vehicleNumber: "" } });
    }
    res.status(200).json(reservation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE a reservation
const deleteReservation = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: "No sucj ID found!" });
  }
  try {
    const reservation = await Reservation.findByIdAndDelete(id);
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found!" });
    }
    await Parking.findByIdAndUpdate(reservation.parkingSlot, { $set: { status: "available", vehicleNumber: "" } });
    res.status(200).json({ message: "Reservation deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getReservations,
  getReservation,
  addReservation,
  updateReservation,
  deleteReservation,
  getReservationsByUser,
};
