const {
  createActivity,
  getActivities,
  getActivityById,
  updateActivity,
  deleteActivity,
} = require("../services/activityService");

const create = async (req, res) => {
  try {
    const { type, subject } = req.body;

    if (!type || !subject) {
      return res.status(400).json({
        success: false,
        message: "Activity type and subject are required",
      });
    }

    const activity = await createActivity(
      req.body,
      req.user
    );

    return res.status(201).json({
      success: true,
      message: "Activity created successfully",
      activity,
    });
  } catch (error) {
    if (
      error.message === "Assigned user not found" ||
      error.message === "Lead not found" ||
      error.message === "Customer not found" ||
      error.message === "Deal not found"
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message.includes("not authorized")) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Create activity error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create activity",
    });
  }
};

// const getAll = async (req, res) => {
//   try {
//     const activities = await getActivities(req.user);

//     return res.status(200).json({
//       success: true,
//       count: activities.length,
//       activities,
//     });
//   } catch (error) {
//     console.error("Get activities error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch activities",
//     });
//   }
// };
const getAll = async (req, res) => {
  try {
    const result = await getActivities(
      req.user,
      req.query
    );

    return res.status(200).json({
      success: true,
      activities: result.activities,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Get activities error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch activities",
    });
  }
};
const getOne = async (req, res) => {
  try {
    const activity = await getActivityById(
      req.params.id,
      req.user
    );

    return res.status(200).json({
      success: true,
      activity,
    });
  } catch (error) {
    if (error.message === "Activity not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message.includes("not authorized")) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Get activity error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch activity",
    });
  }
};

const update = async (req, res) => {
  try {
    const activity = await updateActivity(
      req.params.id,
      req.body,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: "Activity updated successfully",
      activity,
    });
  } catch (error) {
    if (error.message === "Activity not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message.includes("not authorized")) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(
        (err) => err.message
      );

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: messages,
      });
    }

    console.error("Update activity error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update activity",
    });
  }
};

const remove = async (req, res) => {
  try {
    await deleteActivity(req.params.id, req.user);

    return res.status(200).json({
      success: true,
      message: "Activity deleted successfully",
    });
  } catch (error) {
    if (error.message === "Activity not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message.includes("not authorized")) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Delete activity error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete activity",
    });
  }
};

module.exports = {
  create,
  getAll,
  getOne,
  update,
  remove,
};