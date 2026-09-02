const express = require("express");

const {
  create,
  getAll,
  getOne,
  update,
  remove,
  assign,
} = require("../controllers/customerController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/", protect, create);

router.get("/", protect, getAll);

router.get("/:id", protect, getOne);


router.patch(
  "/:id/assign",
  protect,
  authorize("ADMIN", "SALES_MANAGER"),
  assign
);

router.patch("/:id", protect, update);

router.delete(
  "/:id",
  protect,
  authorize("ADMIN"),
  remove
);

module.exports = router;