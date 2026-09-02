const {
  getDashboardStats,
} = require("../services/dashboardService");

const getStats = async (req, res) => {
  try {
    const dashboard = await getDashboardStats(req.user);

    return res.status(200).json({
      success: true,
      dashboard,
    });
  } catch (error) {
    console.error("Dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data",
    });
  }
};

module.exports = {
  getStats,
};