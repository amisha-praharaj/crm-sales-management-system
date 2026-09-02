const Lead = require("../models/Lead");
const Customer = require("../models/Customer");
const Deal = require("../models/Deal");
const Activity = require("../models/Activity");

const getDashboardStats = async (user) => {
  const isExecutive = user.role === "SALES_EXECUTIVE";

  /*
   * Sales Executives only see records assigned to themselves.
   * Admin and Sales Manager see the complete sales data.
   */
  const leadFilter = isExecutive
    ? { assignedTo: user._id }
    : {};

  const customerFilter = isExecutive
    ? { assignedTo: user._id }
    : {};

  const dealFilter = isExecutive
    ? { assignedTo: user._id }
    : {};

  const activityFilter = isExecutive
    ? { assignedTo: user._id }
    : {};

  const [
    totalLeads,
    totalCustomers,
    totalDeals,
    convertedLeads,
    pipeline,
    activities,
    recentActivities,
    upcomingActivities,
    overdueCount,
    expectedRevenueResult,
  ] = await Promise.all([
    // ======================================================
    // TOTAL LEADS
    // ======================================================

    Lead.countDocuments(leadFilter),

    // ======================================================
    // TOTAL CUSTOMERS
    // ======================================================

    Customer.countDocuments(customerFilter),

    // ======================================================
    // TOTAL DEALS
    // ======================================================

    Deal.countDocuments(dealFilter),

    // ======================================================
    // CONVERTED LEADS
    // ======================================================

    Lead.countDocuments({
      ...leadFilter,
      status: "Converted",
    }),

    // ======================================================
    // DEAL PIPELINE
    // ======================================================

    Deal.aggregate([
      {
        $match: dealFilter,
      },

      {
        $group: {
          _id: "$stage",
          totalValue: {
            $sum: "$value",
          },
          expectedRevenue: {
            $sum: {
              $ifNull: ["$expectedRevenue", 0],
            },
          },
          count: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          totalValue: -1,
        },
      },
    ]),

    // ======================================================
    // ACTIVITY STATISTICS
    // ======================================================

    Activity.aggregate([
      {
        $match: activityFilter,
      },

      {
        $group: {
          _id: "$status",
          count: {
            $sum: 1,
          },
        },
      },
    ]),

    // ======================================================
    // RECENT ACTIVITIES
    // ======================================================

    Activity.find(activityFilter)
      .populate(
        "assignedTo",
        "name email role"
      )
      .populate(
        "createdBy",
        "name email role"
      )
      .populate(
        "lead",
        "name email company"
      )
      .populate(
        "customer",
        "name email company"
      )
      .populate(
        "deal",
        "title value stage"
      )
      .sort({
        createdAt: -1,
      })
      .limit(5),

    // ======================================================
    // UPCOMING ACTIVITIES
    // ======================================================

    Activity.find({
      ...activityFilter,
      status: "Pending",
      dueDate: {
        $gte: new Date(),
      },
    })
      .populate(
        "assignedTo",
        "name email role"
      )
      .populate(
        "createdBy",
        "name email role"
      )
      .populate(
        "lead",
        "name email company"
      )
      .populate(
        "customer",
        "name email company"
      )
      .populate(
        "deal",
        "title value stage"
      )
      .sort({
        dueDate: 1,
      })
      .limit(5),

    // ======================================================
    // OVERDUE ACTIVITIES
    // ======================================================

    Activity.countDocuments({
      ...activityFilter,
      status: "Pending",
      dueDate: {
        $lt: new Date(),
      },
    }),

    // ======================================================
    // EXPECTED REVENUE
    // ======================================================

    Deal.aggregate([
      {
        $match: dealFilter,
      },

      {
        $group: {
          _id: null,
          expectedRevenue: {
            $sum: {
              $ifNull: ["$expectedRevenue", 0],
            },
          },
        },
      },
    ]),
  ]);

  // ======================================================
  // PIPELINE CALCULATIONS
  // ======================================================

  const totalPipelineValue = pipeline.reduce(
    (total, item) =>
      total + (item.totalValue || 0),
    0
  );

  const totalExpectedRevenue =
    expectedRevenueResult[0]?.expectedRevenue || 0;

  // Active pipeline excludes closed deals.
  const activePipeline = pipeline
    .filter(
      (item) =>
        item._id !== "Closed Won" &&
        item._id !== "Closed Lost"
    )
    .reduce(
      (total, item) =>
        total + (item.totalValue || 0),
      0
    );

  // ======================================================
  // ACTIVITY STATISTICS
  // ======================================================

  const activityStats = {
    Pending: 0,
    Completed: 0,
    Cancelled: 0,
    Overdue: overdueCount,
  };

  activities.forEach((item) => {
    if (item._id) {
      activityStats[item._id] = item.count;
    }
  });

  // ======================================================
  // WON / LOST DEALS
  // ======================================================

  const wonDeals = pipeline.find(
    (item) => item._id === "Closed Won"
  );

  const lostDeals = pipeline.find(
    (item) => item._id === "Closed Lost"
  );

  const closedDealsCount =
    (wonDeals?.count || 0) +
    (lostDeals?.count || 0);

  // ======================================================
  // CONVERSION RATE
  // ======================================================

  const conversionRate =
    totalLeads > 0
      ? Number(
          (
            (convertedLeads / totalLeads) *
            100
          ).toFixed(2)
        )
      : 0;

  // ======================================================
  // WIN RATE
  // ======================================================

  const winRate =
    closedDealsCount > 0
      ? Number(
          (
            ((wonDeals?.count || 0) /
              closedDealsCount) *
            100
          ).toFixed(2)
        )
      : 0;

  // ======================================================
  // RESPONSE
  // ======================================================

  return {
    totals: {
      leads: totalLeads,
      customers: totalCustomers,
      deals: totalDeals,
      convertedLeads,
    },

    conversion: {
      rate: conversionRate,
      convertedLeads,
      totalLeads,
    },

    pipeline: {
      totalValue: totalPipelineValue,

      activeValue: activePipeline,

      expectedRevenue: totalExpectedRevenue,

      stages: pipeline,

      wonValue: wonDeals?.totalValue || 0,
      wonCount: wonDeals?.count || 0,

      lostValue: lostDeals?.totalValue || 0,
      lostCount: lostDeals?.count || 0,

      winRate,
    },

    activities: {
      stats: activityStats,
      recent: recentActivities,
      upcoming: upcomingActivities,
    },
  };
};

module.exports = {
  getDashboardStats,
};