const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Lead name is required"],
      trim: true,
      maxlength: 100,
    },

    email: {
      type: String,
      required: [true, "Lead email is required"],
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email",
      ],
    },

    phone: {
      type: String,
      required: [true, "Lead phone is required"],
      trim: true,
    },

    company: {
      type: String,
      required: [true, "Company is required"],
      trim: true,
      maxlength: 150,
    },

    source: {
      type: String,
      enum: [
        "Website",
        "Referral",
        "Social Media",
        "Advertisement",
        "Cold Call",
        "Other",
      ],
      default: "Other",
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    status: {
      type: String,
      enum: [
        "New",
        "Contacted",
        "Qualified",
        "Proposal",
        "Converted",
        "Lost",
      ],
      default: "New",
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

   convertedCustomer: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Customer",
  default: null,
}, 

    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Lead = mongoose.model("Lead", leadSchema);

module.exports = Lead;