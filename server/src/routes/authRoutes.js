const express = require("express");

const {
  register,
  login,
  logout,
  getMe,
  adminTest
} = require("../controllers/authController");

const router = express.Router();
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.post("/logout", logout);
router.get(
  "/admin-test",
  protect,
  authorize("ADMIN"),
  adminTest
);
module.exports = router;