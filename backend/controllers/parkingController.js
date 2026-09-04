const Parking = require("../models/Parking");
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
    return res.staus(404).json({ message: "No such ID found!" });
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
    res.staus(200).json(parking);
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

module.exports = {
  getParkings,
  getParking,
  addParking,
  updateParking,
  deleteParking,
};
