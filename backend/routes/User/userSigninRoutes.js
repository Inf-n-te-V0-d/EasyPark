const express = require("express");
const {
  getUser,
  getUserByIdentifier,
} = require("../../controllers/userController");

const router = express.Router();

// GET a user by ID
router.get("/:id", getUser);

// GET a user BY identifier
router.post("/find", getUserByIdentifier);

module.exports = router;
