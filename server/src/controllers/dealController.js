const {
  createDeal,
  getDeals,
  getDealById,
  updateDeal,
  deleteDeal,
  assignDeal,
} = require("../services/dealService");

// =========================================================
// CREATE DEAL
// =========================================================

const create = async (req, res) => {
  try {
    const {
      title,
      customer,
      value,
    } = req.body;

    if (
      !title ||
      !customer ||
      value === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title, customer and value are required",
      });
    }

    const deal = await createDeal(
      req.body,
      req.user._id
    );

    return res.status(201).json({
      success: true,
      message: "Deal created successfully",
      deal,
    });
  } catch (error) {
    // Customer does not exist
    if (
      error.message ===
      "Customer not found"
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    // Invalid probability
    if (
      error.message ===
      "Probability must be between 0 and 100"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    // Invalid stage
    if (
      error.message ===
      "Invalid deal stage"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    // Mongoose validation
    if (
      error.name === "ValidationError"
    ) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: Object.values(
          error.errors
        ).map(
          (err) => err.message
        ),
      });
    }

    console.error(
      "Create deal error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create deal",
    });
  }
};

// =========================================================
// GET ALL DEALS
// =========================================================

const getAll = async (req, res) => {
  try {
    const result = await getDeals(
      req.user,
      req.query
    );

    return res.status(200).json({
      success: true,
      deals: result.deals,
      pagination:
        result.pagination,
    });
  } catch (error) {
    if (
      error.message ===
      "Invalid deal stage"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error(
      "Get deals error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch deals",
    });
  }
};

// =========================================================
// GET SINGLE DEAL
// =========================================================

const getOne = async (
  req,
  res
) => {
  try {
    const deal = await getDealById(
      req.params.id,
      req.user
    );

    return res.status(200).json({
      success: true,
      deal,
    });
  } catch (error) {
    // Not found
    if (
      error.message ===
      "Deal not found"
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    // Permission
    if (
      error.message.includes(
        "not authorized"
      )
    ) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    console.error(
      "Get deal error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch deal",
    });
  }
};

// =========================================================
// UPDATE DEAL
// =========================================================

const update = async (
  req,
  res
) => {
  try {
    const deal = await updateDeal(
      req.params.id,
      req.body,
      req.user
    );

    return res.status(200).json({
      success: true,
      message:
        "Deal updated successfully",
      deal,
    });
  } catch (error) {
    // -----------------------------------------------------
    // Deal not found
    // -----------------------------------------------------

    if (
      error.message ===
      "Deal not found"
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    // -----------------------------------------------------
    // Authorization
    // -----------------------------------------------------

    if (
      error.message ===
      "You are not authorized to update this deal"
    ) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    // -----------------------------------------------------
    // Closed deal rule
    // -----------------------------------------------------

    if (
      error.message ===
      "Closed deals cannot be moved to another stage"
    ) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    // -----------------------------------------------------
    // Probability validation
    // -----------------------------------------------------

    if (
      error.message ===
      "Probability must be between 0 and 100"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    // -----------------------------------------------------
    // Deal value validation
    // -----------------------------------------------------

    if (
      error.message ===
      "Deal value cannot be negative"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    // -----------------------------------------------------
    // Stage validation
    // -----------------------------------------------------

    if (
      error.message ===
      "Invalid deal stage"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    // -----------------------------------------------------
    // Mongoose validation
    // -----------------------------------------------------

    if (
      error.name === "ValidationError"
    ) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: Object.values(
          error.errors
        ).map(
          (err) => err.message
        ),
      });
    }

    console.error(
      "Update deal error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update deal",
    });
  }
};

// =========================================================
// DELETE DEAL
// =========================================================

const remove = async (
  req,
  res
) => {
  try {
    await deleteDeal(
      req.params.id,
      req.user
    );

    return res.status(200).json({
      success: true,
      message:
        "Deal deleted successfully",
    });
  } catch (error) {
    // Deal not found
    if (
      error.message ===
      "Deal not found"
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    // Permission
    if (
      error.message.includes(
        "not authorized"
      )
    ) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    console.error(
      "Delete deal error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete deal",
    });
  }
};

// =========================================================
// ASSIGN DEAL
// =========================================================

const assign = async (
  req,
  res
) => {
  try {
    const {
      assignedTo,
    } = req.body;

    if (!assignedTo) {
      return res.status(400).json({
        success: false,
        message:
          "assignedTo is required",
      });
    }

    const deal = await assignDeal(
      req.params.id,
      assignedTo,
      req.user
    );

    return res.status(200).json({
      success: true,
      message:
        "Deal assigned successfully",
      deal,
    });
  } catch (error) {
    // -----------------------------------------------------
    // Deal not found
    // -----------------------------------------------------

    if (
      error.message ===
      "Deal not found"
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    // -----------------------------------------------------
    // Assigned user not found
    // -----------------------------------------------------

    if (
      error.message ===
      "Assigned user not found"
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    // -----------------------------------------------------
    // Authorization
    // -----------------------------------------------------

    if (
      error.message.includes(
        "not authorized"
      )
    ) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    // -----------------------------------------------------
    // Only Sales Executives can receive deals
    // -----------------------------------------------------

    if (
      error.message.includes(
        "only be assigned"
      )
    ) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    console.error(
      "Assign deal error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to assign deal",
    });
  }
};

// =========================================================
// EXPORT
// =========================================================

module.exports = {
  create,
  getAll,
  getOne,
  update,
  remove,
  assign,
};