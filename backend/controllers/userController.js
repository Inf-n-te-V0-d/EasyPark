const User = require("../models/User");
const mongoose = require("mongoose");

// GET all users
const getUsers = async (req, res) => {
    try{
        const users = await User.find().sort({createdAt: -1});
        res.status(200).json(users);
    }catch(error){
        res.status(500).json({message: error.message})
    }
}

// GET a single user
const getUser = async (req, res) => {
    try{
        const user = await User.findById(req.params.id);
        if(!user){
            return res.status(404).json({message: "User not found!"});
        }
        res.status(200).json(user);
    }catch(error){
        res.status(500).json({message: error.message})
    }
}

module.exports = {
    getUsers,
    getUser
}