const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    parkingSlot:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Parking",
        required: true,
    },
    reservationDate:{
        type: Date,
        default: Date.now,
    },
    startTime: {
        type: Date,
        required: true,
    },
    endTime: {
        type: Date,
        required: true,
    },
    vehicleDetails:{
        prefix: String,
        suffix: String
    },
    status:{
        type: String,
        enum: [
            "pending",
            "confirmed",
            "checked-in",
            "completed",
            "cancelled"
        ],
        default: "pending"
    },
    pin: {
        type: String,
        required: true,
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    paymentStatus: {
        type: String,
        enum: [
            "pending",
            "paid",
            "refunded",
        ],
        default: "pending"
    }
}, {timestamps: true});

module.exports = mongoose.model("Reservation", reservationSchema);