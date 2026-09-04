const Reservation = require("../models/Reservation");
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
  try {
    const reservation = new Reservation(req.body);
    const savedReservation = await reservation.save();
    res.status(200).json(savedReservation);
  } catch (error) {
    res.status(400).json({ message: error.message });
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
    res.staus(200).json(reservation);
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
};
