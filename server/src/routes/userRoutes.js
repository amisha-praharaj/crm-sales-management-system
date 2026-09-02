const express = require("express");

const {
  create,
  getAll,
  getOne,
  update,
  updateStatus,
} = require("../controllers/userController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// Only Admin can manage users.

router.post(
  "/",
  protect,
  authorize("ADMIN"),
  create
);

router.get(
  "/",
  protect,
  authorize("ADMIN"),
  getAll
);

router.get(
  "/:id",
  protect,
  authorize("ADMIN"),
  getOne
);

router.patch(
  "/:id",
  protect,
  authorize("ADMIN"),
  update
);

router.patch(
  "/:id/status",
  protect,
  authorize("ADMIN"),
  updateStatus
);

module.exports = router;