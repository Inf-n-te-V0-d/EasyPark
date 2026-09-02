const express = require("express");
const {
  signin
} = require("../../controllers/authenticationController");

const router = express.Router();


router.post("/", signin);

module.exports = router;
