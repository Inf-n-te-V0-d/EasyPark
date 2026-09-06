const express = require("express");
const { requireAuth, requireAdmin } = require("../../middleware/authMiddleware");
const {
  getUsers,
  getUser,
  addUser,
  updateUser,
  deleteUser,
  requestPasswordReset,
  completePasswordReset,
  getPasswordResetRequests,
  markPasswordResetDelivered,
} = require("../../controllers/userController");

const router = express.Router();

router.get("/", getUsers);
router.post("/password-reset/request", requestPasswordReset);
router.post("/password-reset/complete", completePasswordReset);
router.get("/password-reset/requests", requireAuth, requireAdmin, getPasswordResetRequests);
router.post("/password-reset/requests/:requestId/sent", requireAuth, requireAdmin, markPasswordResetDelivered);
router.get("/:id", requireAuth, getUser);
router.post("/", addUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;
