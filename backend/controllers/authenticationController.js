const bcrypt = require("bcrypt");
const User = require("../models/User");
const signup = async (req, res) => {
  try {
    const { name, email, password, telephone, vehicleDetails } = req.body;

    // Check required Fields
    if (
      !name ||
      !email ||
      !password ||
      !telephone ||
      !vehicleDetails?.prefix ||
      !vehicleDetails?.suffix
    ) {
      return res
        .status(400)
        .json({ message: "All required fileds must be provided!" });
    }

    // Email and telephone check

    const exsitingUser = await User.findOne({
      $or: [{ email }, { telephone }],
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
      email,
      password: hashedPassword,
      telephone,
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
    
}


module.exports = {
    signup,
    signin
}