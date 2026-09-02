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
      !telephone
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
    try{
        const {identifier, password} = req.body;

        if(!identifier || !password){
            return res.status(400).json({message: "Email/telephone and password are required."});
        }

        // Find by email or telephone
        const user = await User.findOne({
            $or: [
                {email: identifier},
                {telephone: identifier},
            ]
        })
        if(!user){
            return res.staus(401).json({message: "Invalid Credentials."})
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        )
        if(!passwordMatch){
            return res.status(401).json({
                message: "Invalid Password."
            })
        }

        const userResponse = user.toObject();
        delete userResponse.password;
        res.status(200).json({
            message: "Signin Successful.",
            user: userResponse
        });
    }catch(error){
        res.status(500).json({message: error.message});
    }
}


module.exports = {
    signup,
    signin
}