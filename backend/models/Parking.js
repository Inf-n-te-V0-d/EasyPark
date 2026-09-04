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
    longtitude : {
        type : String,
        required: true,
        trim: true,
    },

    status : {
        type : String,
        enum : [
            "occupied",
            "available"
        ],
        default : "available"
    }

  },
  { timestamps: true },
);
module.exports = mongoose.model("Parking", parkingSchema);