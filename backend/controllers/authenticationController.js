const bcrypt = require("bcrypt");
const User = require("../models/User");
const { createToken } = require("../middleware/authMiddleware");

const isStrongPassword = (password) =>
  typeof password === "string" &&
  password.length >= 8 &&
  /[a-z]/.test(password) &&
  /[A-Z]/.test(password) &&
  /\d/.test(password) &&
  /[^A-Za-z0-9]/.test(password);

const signup = async (req, res) => {
  try {
    const { name, email, password, telephone, vehicleDetails } = req.body;

    // Check required Fields
    if (!name || !email || !password || !telephone) {
      return res
        .status(400)
        .json({ message: "All required fileds must be provided!" });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.",
      });
    }

    // Email and telephone check

    const normalizedEmail = email.trim().toLowerCase();
    const exsitingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { telephone: telephone.trim() }],
    });
    if (exsitingUser) {
      return res.status(409).json({
        message: "Email or telephone number is already registered.",
      });
    }

    // HASH password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      telephone: telephone.trim(),
      vehicleDetails,
    });
    const savedUser = await user.save();
    const userResponse = savedUser.toObject();
    delete userResponse.password;

    res.status(201).json(userResponse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const signin = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res
        .status(400)
        .json({ message: "Email/telephone and password are required." });
    }

    // Find by email or telephone
    const normalizedIdentifier = identifier.trim().toLowerCase();
    const user = await User.findOne({
      $or: [{ email: normalizedIdentifier }, { telephone: identifier.trim() }],
    });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid credentials.",
      });
    }

    const userResponse = user.toObject();
    delete userResponse.password;
    res.status(200).json({
      message: "Signin Successful.",
      user: userResponse,
      token: createToken(user._id.toString()),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  signup,
  signin,
  isStrongPassword,
};
