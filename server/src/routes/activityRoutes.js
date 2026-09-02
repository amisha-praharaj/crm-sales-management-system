const express = require("express");

const {
  create,
  getAll,
  getOne,
  update,
  remove,
} = require("../controllers/activityController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, create);

router.get("/", protect, getAll);

router.get("/:id", protect, getOne);

router.patch("/:id", protect, update);

router.delete("/:id", protect, remove);

module.exports = router;