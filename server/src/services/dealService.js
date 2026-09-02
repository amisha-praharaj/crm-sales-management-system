const Deal = require("../models/Deal");
const Customer = require("../models/Customer");
const User = require("../models/User");

const DEAL_STAGES = [
  "Prospecting",
  "Qualification",
  "Proposal",
  "Negotiation",
  "Closed Won",
  "Closed Lost",
];

// ---------------------------------------------------------
// CREATE DEAL
// ---------------------------------------------------------

const createDeal = async (dealData, userId) => {
  const customer = await Customer.findById(
    dealData.customer
  );

  if (!customer) {
    throw new Error("Customer not found");
  }

  const probability =
    dealData.probability !== undefined
      ? Number(dealData.probability)
      : 0;

  if (probability < 0 || probability > 100) {
    throw new Error(
      "Probability must be between 0 and 100"
    );
  }

  const initialStage =
    dealData.stage || "Prospecting";

  if (!DEAL_STAGES.includes(initialStage)) {
    throw new Error("Invalid deal stage");
  }

  const deal = await Deal.create({
    ...dealData,

    probability,

    // expectedRevenue is calculated by Deal model
    createdBy: userId,

    stageHistory: [
      {
        fromStage: null,
        toStage: initialStage,
        changedBy: userId,
        changedAt: new Date(),
        note: "Deal created",
      },
    ],
  });

  return Deal.findById(deal._id)
    .populate(
      "customer",
      "name email company"
    )
    .populate(
      "assignedTo",
      "name email role"
    )
    .populate(
      "createdBy",
      "name email role"
    )
    .populate(
      "stageHistory.changedBy",
      "name email role"
    );
};

// ---------------------------------------------------------
// GET DEALS
// ---------------------------------------------------------

const getDeals = async (
  user,
  query = {}
) => {
  const {
    search,
    stage,
    assignedTo,
    page = 1,
    limit = 10,
  } = query;

  const filter = {};

  // Sales Executives only see their assigned deals.
  if (user.role === "SALES_EXECUTIVE") {
    filter.assignedTo = user._id;
  } else if (assignedTo) {
    filter.assignedTo = assignedTo;
  }

  // Stage filter.
  if (stage) {
    if (!DEAL_STAGES.includes(stage)) {
      throw new Error("Invalid deal stage");
    }

    filter.stage = stage;
  }

  // Search title.
  if (search) {
    const searchRegex = new RegExp(
      search,
      "i"
    );

    filter.title = searchRegex;
  }

  const currentPage = Math.max(
    parseInt(page, 10) || 1,
    1
  );

  const currentLimit = Math.min(
    Math.max(
      parseInt(limit, 10) || 10,
      1
    ),
    100
  );

  const skip =
    (currentPage - 1) *
    currentLimit;

  const [
    deals,
    total,
  ] = await Promise.all([
    Deal.find(filter)
      .populate(
        "customer",
        "name email company"
      )
      .populate(
        "assignedTo",
        "name email role"
      )
      .populate(
        "createdBy",
        "name email role"
      )
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(currentLimit),

    Deal.countDocuments(filter),
  ]);

  return {
    deals,

    pagination: {
      page: currentPage,
      limit: currentLimit,
      total,
      totalPages:
        Math.ceil(
          total / currentLimit
        ),
    },
  };
};

// ---------------------------------------------------------
// GET DEAL BY ID
// ---------------------------------------------------------

const getDealById = async (
  dealId,
  user
) => {
  const deal = await Deal.findById(
    dealId
  )
    .populate(
      "customer",
      "name email company"
    )
    .populate(
      "assignedTo",
      "name email role"
    )
    .populate(
      "createdBy",
      "name email role"
    )
    .populate(
      "stageHistory.changedBy",
      "name email role"
    );

  if (!deal) {
    throw new Error("Deal not found");
  }

  // Sales Executives only see their deals.
  if (
    user.role === "SALES_EXECUTIVE" &&
    (!deal.assignedTo ||
      deal.assignedTo._id.toString() !==
        user._id.toString())
  ) {
    throw new Error(
      "You are not authorized to access this deal"
    );
  }

  return deal;
};

// ---------------------------------------------------------
// UPDATE DEAL
// ---------------------------------------------------------

const updateDeal = async (
  dealId,
  updateData,
  user
) => {
  const deal = await Deal.findById(
    dealId
  );

  if (!deal) {
    throw new Error("Deal not found");
  }

  // -------------------------------------------------------
  // Permission
  // -------------------------------------------------------

  if (
    user.role === "SALES_EXECUTIVE" &&
    (!deal.assignedTo ||
      deal.assignedTo.toString() !==
        user._id.toString())
  ) {
    throw new Error(
      "You are not authorized to update this deal"
    );
  }

  // Sales Executives cannot change ownership.
  if (
    user.role === "SALES_EXECUTIVE"
  ) {
    delete updateData.assignedTo;
  }

  // Creator cannot be changed.
  delete updateData.createdBy;

  // Stage history cannot be directly submitted.
  delete updateData.stageHistory;

  // Expected revenue is calculated automatically.
  delete updateData.expectedRevenue;

  // -------------------------------------------------------
  // Validate probability
  // -------------------------------------------------------

  if (
    updateData.probability !== undefined
  ) {
    const probability = Number(
      updateData.probability
    );

    if (
      Number.isNaN(probability) ||
      probability < 0 ||
      probability > 100
    ) {
      throw new Error(
        "Probability must be between 0 and 100"
      );
    }

    updateData.probability =
      probability;
  }

  // -------------------------------------------------------
  // Validate value
  // -------------------------------------------------------

  if (
    updateData.value !== undefined
  ) {
    const value = Number(
      updateData.value
    );

    if (
      Number.isNaN(value) ||
      value < 0
    ) {
      throw new Error(
        "Deal value cannot be negative"
      );
    }

    updateData.value = value;
  }

  // -------------------------------------------------------
  // Stage change
  // -------------------------------------------------------

  const oldStage = deal.stage;
  const newStage =
    updateData.stage !== undefined
      ? updateData.stage
      : oldStage;

  if (
    updateData.stage !== undefined &&
    !DEAL_STAGES.includes(
      updateData.stage
    )
  ) {
    throw new Error(
      "Invalid deal stage"
    );
  }

  const stageChanged =
    newStage !== oldStage;

  // -------------------------------------------------------
  // Closed deal rules
  // -------------------------------------------------------

  if (
    (oldStage === "Closed Won" ||
      oldStage === "Closed Lost") &&
    stageChanged
  ) {
    throw new Error(
      "Closed deals cannot be moved to another stage"
    );
  }

  // -------------------------------------------------------
  // Closed Lost / Closed Won
  // -------------------------------------------------------

  if (
    newStage === "Closed Won"
  ) {
    updateData.probability = 100;
  }

  if (
    newStage === "Closed Lost"
  ) {
    updateData.probability = 0;
  }

  // -------------------------------------------------------
  // Apply update
  // -------------------------------------------------------

  Object.assign(
    deal,
    updateData
  );

  // -------------------------------------------------------
  // Add stage history
  // -------------------------------------------------------

  if (stageChanged) {
    deal.stageHistory.push({
      fromStage: oldStage,
      toStage: newStage,
      changedBy: user._id,
      changedAt: new Date(),
      note:
        updateData.stageNote ||
        `Stage changed from ${oldStage} to ${newStage}`,
    });
  }

  // Never save stageNote as a Deal field.
  delete deal.stageNote;

  await deal.save();

  return Deal.findById(
    deal._id
  )
    .populate(
      "customer",
      "name email company"
    )
    .populate(
      "assignedTo",
      "name email role"
    )
    .populate(
      "createdBy",
      "name email role"
    )
    .populate(
      "stageHistory.changedBy",
      "name email role"
    );
};

// ---------------------------------------------------------
// DELETE DEAL
// ---------------------------------------------------------

const deleteDeal = async (
  dealId,
  user
) => {
  const deal = await Deal.findById(
    dealId
  );

  if (!deal) {
    throw new Error("Deal not found");
  }

  // Only Admin can delete.
  if (user.role !== "ADMIN") {
    throw new Error(
      "You are not authorized to delete this deal"
    );
  }

  await deal.deleteOne();

  return deal;
};

// ---------------------------------------------------------
// ASSIGN DEAL
// ---------------------------------------------------------

const assignDeal = async (
  dealId,
  assignedTo,
  user
) => {
  const deal = await Deal.findById(
    dealId
  );

  if (!deal) {
    throw new Error("Deal not found");
  }

  // Admin and Sales Manager can assign.
  if (
    user.role !== "ADMIN" &&
    user.role !== "SALES_MANAGER"
  ) {
    throw new Error(
      "You are not authorized to assign deals"
    );
  }

  const assignedUser =
    await User.findById(
      assignedTo
    );

  if (!assignedUser) {
    throw new Error(
      "Assigned user not found"
    );
  }

  // Deals can only be assigned to Sales Executives.
  if (
    assignedUser.role !==
    "SALES_EXECUTIVE"
  ) {
    throw new Error(
      "Deals can only be assigned to Sales Executives"
    );
  }

  deal.assignedTo =
    assignedUser._id;

  await deal.save();

  return Deal.findById(
    deal._id
  )
    .populate(
      "customer",
      "name email company"
    )
    .populate(
      "assignedTo",
      "name email role"
    )
    .populate(
      "createdBy",
      "name email role"
    )
    .populate(
      "stageHistory.changedBy",
      "name email role"
    );
};

module.exports = {
  createDeal,
  getDeals,
  getDealById,
  updateDeal,
  deleteDeal,
  assignDeal,
};