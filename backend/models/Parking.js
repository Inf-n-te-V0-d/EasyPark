const mongoose = require("mongoose");

const parkingSchema = new mongoose.Schema(
  {
    slot : {
        type : String,
        required: [true, "Slot is required."],
        trim: true,
    },
    floor : {
        type : Number,
        required: true,
        trim: true,
    },
    latitude : {
        type : String,
        required: true,
        trim: true,
    },
    longitude : {
        type : String,
        required: true,
        trim: true,
    },
    vehicleType: {
        type: String,
        enum: ["motorcycle", "three_wheel", "light", "heavy"],
        default: "light",
    },

    status : {
        type : String,
        enum : [
            "occupied",
            "available"
        ],
        default : "available"
    },
    vehicleNumber : {
        type : String,
        trim: true,
        default: ""
    }

  },
  { timestamps: true },
);
module.exports = mongoose.model("Parking", parkingSchema);