const express = require("express");
const {
  getUsers,
  getUser,
  addUser,
  updateUser,
  deleteUser,
} = require("../../controllers/userController");

const router = express.Router();

router.get("/", getUsers);
router.get("/:id", getUser);
router.post("/", addUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;
