const express = require("express");

const {
  getStats,
} = require("../controllers/dashboardController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getStats);

module.exports = router;