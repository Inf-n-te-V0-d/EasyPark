const User = require("../models/User");
const PasswordResetRequest = require("../models/PasswordResetRequest");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const mongoose = require("mongoose");

const getEncryptionKey = () => crypto.createHash("sha256").update(process.env.AUTH_SECRET || "easypark-development-secret").digest();

const encryptOtp = (otp) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(otp, "utf8"), cipher.final()]);
  return [iv.toString("base64url"), cipher.getAuthTag().toString("base64url"), encrypted.toString("base64url")].join(".");
};

const decryptOtp = (value) => {
  const [ivValue, tagValue, encryptedValue] = value.split(".");
  const decipher = crypto.createDecipheriv("aes-256-gcm", getEncryptionKey(), Buffer.from(ivValue, "base64url"));
  decipher.setAuthTag(Buffer.from(tagValue, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(encryptedValue, "base64url")), decipher.final()]).toString("utf8");
};

// GET all users
const getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET a single user
const getUser = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid User ID" });
  }
  try {
    if (req.user._id.toString() !== id && req.user.role !== "admin") {
      return res.status(403).json({ message: "You can only view your own profile." });
    }
    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET a user by identifier
const getUserByIdentifier = async (req, res) => {
  try {
    const { identifier } = req.body;
    if (!identifier) {
      return res
        .status(400)
        .json({ message: "Email or Phone number is required!" });
    }

    const user = await User.findOne({
      $or: [{ email: identifier }, { telephone: identifier }],
    });
    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const requestPasswordReset = async (req, res) => {
  const identifier = String(req.body.identifier || "").trim();
  if (!identifier) {
    return res.status(400).json({ message: "Email or telephone number is required." });
  }

  try {
    const normalizedIdentifier = identifier.toLowerCase();
    const user = await User.findOne({
      $or: [{ email: normalizedIdentifier }, { telephone: identifier }],
    });
    if (!user) {
      return res.status(404).json({ message: "No EasyPark account matches that contact." });
    }

    const existingRequest = await PasswordResetRequest.findOne({
      user: user._id,
      usedAt: null,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (existingRequest) {
      return res.status(200).json({
        message: "A reset OTP is already pending. Please use the OTP sent by the administrator.",
      });
    }

    await PasswordResetRequest.updateMany(
      { user: user._id, usedAt: null },
      { $set: { usedAt: new Date() } },
    );

    const otp = String(crypto.randomInt(100000, 1000000));
    await PasswordResetRequest.create({
      user: user._id,
      contact: user.telephone,
      otpCiphertext: encryptOtp(otp),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    res.status(201).json({ message: "Your reset request was sent to an administrator." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const completePasswordReset = async (req, res) => {
  const identifier = String(req.body.identifier || "").trim();
  const otp = String(req.body.otp || "").trim();
  const newPassword = String(req.body.newPassword || "");
  if (!identifier || !/^\d{6}$/.test(otp) || newPassword.length < 6) {
    return res.status(400).json({ message: "Contact, a 6-digit OTP, and a password of at least 6 characters are required." });
  }

  try {
    const normalizedIdentifier = identifier.toLowerCase();
    const user = await User.findOne({
      $or: [{ email: normalizedIdentifier }, { telephone: identifier }],
    });
    if (!user) return res.status(400).json({ message: "The reset request could not be verified." });

    const resetRequest = await PasswordResetRequest.findOne({ user: user._id, usedAt: null }).sort({ createdAt: -1 });
    if (!resetRequest || resetRequest.expiresAt < new Date()) {
      return res.status(400).json({ message: "That OTP is expired or no longer available." });
    }
    if (decryptOtp(resetRequest.otpCiphertext) !== otp) {
      return res.status(400).json({ message: "The OTP is incorrect." });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    await PasswordResetRequest.deleteOne({ _id: resetRequest._id });
    res.status(200).json({ message: "Password changed successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPasswordResetRequests = async (req, res) => {
  try {
    const requests = await PasswordResetRequest.find({
      usedAt: null,
      deliveredAt: null,
      expiresAt: { $gt: new Date() },
    })
      .populate("user", "name email telephone")
      .sort({ createdAt: -1 })
      .limit(100);
    res.status(200).json(requests.map((request) => ({
      _id: request._id,
      user: request.user,
      contact: request.contact,
      otp: decryptOtp(request.otpCiphertext),
      expiresAt: request.expiresAt,
      usedAt: request.usedAt,
      deliveredAt: request.deliveredAt,
      createdAt: request.createdAt,
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markPasswordResetDelivered = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.requestId)) {
    return res.status(400).json({ message: "Invalid reset request ID." });
  }

  try {
    const request = await PasswordResetRequest.findOneAndUpdate(
      { _id: req.params.requestId, usedAt: null, expiresAt: { $gt: new Date() } },
      { $set: { deliveredAt: new Date() } },
      { new: true },
    );
    if (!request) {
      return res.status(404).json({ message: "That reset request is no longer pending." });
    }
    res.status(200).json({ message: "OTP marked as sent." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADD a user
const addUser = async (req, res) => {
  try {
    const user = new User(req.body);
    const savedUser = await user.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// UPDATE a user
const updateUser = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: "No Such ID found." });
  }
  const isAdmin = req.user?.role === "admin";
  if (!isAdmin && req.user?._id.toString() !== id) {
    return res.status(403).json({ message: "You can only update your own profile." });
  }

  const permittedFields = isAdmin
    ? ["name", "email", "telephone", "vehicleDetails", "role"]
    : ["name", "email", "telephone", "vehicleDetails"];
  const updates = Object.fromEntries(
    permittedFields
      .filter((field) => Object.prototype.hasOwnProperty.call(req.body, field))
      .map((field) => [field, req.body[field]]),
  );
  if (updates.email) updates.email = String(updates.email).trim().toLowerCase();
  if (updates.telephone) updates.telephone = String(updates.telephone).trim();
  if (!Object.keys(updates).length) {
    return res.status(400).json({ message: "No permitted profile fields were provided." });
  }
  try {
    const user = await User.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true },
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE a user
const deleteUser = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: "No Such ID found." });
  }
  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUsers,
  getUser,
  addUser,
  updateUser,
  deleteUser,
  getUserByIdentifier,
  requestPasswordReset,
  completePasswordReset,
  getPasswordResetRequests,
  markPasswordResetDelivered,
};
