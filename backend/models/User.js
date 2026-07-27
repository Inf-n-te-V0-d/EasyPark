const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required."],
        trim: true
    },
    email: {
        type: String,
        required: [true, "Email is required."],
        trim: true
    },
    telephone: {
        type: Number,
        required: [true, "Telephone Number is required."],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});
module.exports = mongoose.model("User", userSchema);