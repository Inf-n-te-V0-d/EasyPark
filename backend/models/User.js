const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required."],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      trim: true,
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required."],
    },
    telephone: {
      type: String,
      required: [true, "Telephone Number is required."],
      trim: true,
      unique: true,
    },
    vehicleDetails: {
      prefix: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
      },
      suffix: {
        type: String,
        required: true,
      },
    },
    role: {
      type: String,
      enum: ["admin", "customer"],
      default: "customer",
    },
    /*createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },*/
  },
  { timestamps: true },
);
module.exports = mongoose.model("User", userSchema);
