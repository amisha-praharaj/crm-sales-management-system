const mongoose = require("mongoose");

const DEAL_STAGES = [
  "Prospecting",
  "Qualification",
  "Proposal",
  "Negotiation",
  "Closed Won",
  "Closed Lost",
];

const dealStageHistorySchema = new mongoose.Schema(
  {
    fromStage: {
      type: String,
      enum: DEAL_STAGES,
      default: null,
    },

    toStage: {
      type: String,
      enum: DEAL_STAGES,
      required: true,
    },

    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    changedAt: {
      type: Date,
      default: Date.now,
    },

    note: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    _id: true,
  }
);

const dealSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Deal title is required"],
      trim: true,
      maxlength: 150,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: [true, "Customer is required"],
    },

    value: {
      type: Number,
      required: [true, "Deal value is required"],
      min: [0, "Deal value cannot be negative"],
    },

    stage: {
      type: String,
      enum: DEAL_STAGES,
      default: "Prospecting",
    },

    // Probability of winning the deal.
    // Stored as a percentage: 0 - 100.
    probability: {
      type: Number,
      min: [0, "Probability cannot be less than 0"],
      max: [100, "Probability cannot be greater than 100"],
      default: 0,
    },

    // Automatically calculated:
    // value * probability / 100
    expectedRevenue: {
      type: Number,
      min: [0, "Expected revenue cannot be negative"],
      default: 0,
    },

    expectedCloseDate: {
      type: Date,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
    },

    // Complete deal stage history.
    stageHistory: {
      type: [dealStageHistorySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// ---------------------------------------------------------
// Automatically calculate expected revenue
// ---------------------------------------------------------

dealSchema.pre("validate", function () {
  const value = Number(this.value) || 0;
  const probability = Number(this.probability) || 0;

  this.expectedRevenue =
    (value * probability) / 100;
});

// ---------------------------------------------------------
// Indexes
// ---------------------------------------------------------

dealSchema.index({ customer: 1 });
dealSchema.index({ assignedTo: 1 });
dealSchema.index({ stage: 1 });
dealSchema.index({ expectedCloseDate: 1 });
dealSchema.index({ createdAt: -1 });

const Deal = mongoose.model("Deal", dealSchema);

module.exports = Deal;

module.exports.DEAL_STAGES = DEAL_STAGES;