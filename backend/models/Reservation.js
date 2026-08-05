const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema({

}, {timestamps: true});

module.exports = mongoose.model("Reservation", reservationSchema);