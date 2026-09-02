const Lead = require("../models/Lead");
const Customer = require("../models/Customer");

const createLead = async (leadData, userId) => {
  const lead = await Lead.create({
    ...leadData,
    createdBy: userId,
  });

  return lead;
};

// const getLeads = async (user) => {
//   const filter = {};

//   // Sales Executives can only see their own leads.
//   if (user.role === "SALES_EXECUTIVE") {
//     filter.assignedTo = user._id;
//   }

//   return Lead.find(filter)
//     .populate("assignedTo", "name email role")
//     .populate("createdBy", "name email role")
//     .sort({ createdAt: -1 });
// };


const getLeads = async (user, query = {}) => {
  const {
    search,
    status,
    source,
    assignedTo,
    page = 1,
    limit = 10,
  } = query;

  const filter = {};

  // Sales Executives can only see their own leads.
  if (user.role === "SALES_EXECUTIVE") {
    filter.assignedTo = user._id;
  } else if (assignedTo) {
    filter.assignedTo = assignedTo;
  }

  // Filter by lead status.
  if (status) {
    filter.status = status;
  }

  // Filter by lead source.
  if (source) {
    filter.source = source;
  }

  // Search by name, email, phone or company.
  if (search) {
    const searchRegex = new RegExp(search, "i");

    filter.$or = [
      { name: searchRegex },
      { email: searchRegex },
      { phone: searchRegex },
      { company: searchRegex },
    ];
  }

  const currentPage = Math.max(parseInt(page, 10) || 1, 1);
  const currentLimit = Math.min(
    Math.max(parseInt(limit, 10) || 10, 1),
    100
  );

  const skip = (currentPage - 1) * currentLimit;

  const [leads, total] = await Promise.all([
    Lead.find(filter)
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email role")
      .populate(
        "convertedCustomer",
        "name email company"
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(currentLimit),

    Lead.countDocuments(filter),
  ]);

  return {
    leads,
    pagination: {
      page: currentPage,
      limit: currentLimit,
      total,
      totalPages: Math.ceil(total / currentLimit),
    },
  };
};

const getLeadById = async (leadId, user) => {
  const lead = await Lead.findById(leadId)
    .populate("assignedTo", "name email role")
    .populate("createdBy", "name email role");

  if (!lead) {
    throw new Error("Lead not found");
  }

  // Sales Executives can only access their assigned leads.
  if (
    user.role === "SALES_EXECUTIVE" &&
    (!lead.assignedTo ||
      lead.assignedTo._id.toString() !== user._id.toString())
  ) {
    throw new Error("You are not authorized to access this lead");
  }

  return lead;
};

const updateLead = async (leadId, updateData, user) => {
  const lead = await Lead.findById(leadId);

  if (!lead) {
    throw new Error("Lead not found");
  }

  // Sales Executives can only update their own leads.
  if (
    user.role === "SALES_EXECUTIVE" &&
    (!lead.assignedTo ||
      lead.assignedTo.toString() !== user._id.toString())
  ) {
    throw new Error("You are not authorized to update this lead");
  }

  // Sales Executives cannot change ownership.
  if (user.role === "SALES_EXECUTIVE") {
    delete updateData.assignedTo;
  }

  Object.assign(lead, updateData);

  await lead.save();

  return lead;
};

const deleteLead = async (leadId, user) => {
  const lead = await Lead.findById(leadId);

  if (!lead) {
    throw new Error("Lead not found");
  }

  // Only Admin can delete leads.
  if (user.role !== "ADMIN") {
    throw new Error("You are not authorized to delete this lead");
  }

  await lead.deleteOne();

  return lead;
};

const assignLead = async (leadId, assignedTo, user) => {
  const lead = await Lead.findById(leadId);

  if (!lead) {
    throw new Error("Lead not found");
  }

  if (
    user.role !== "ADMIN" &&
    user.role !== "SALES_MANAGER"
  ) {
    throw new Error(
      "You are not authorized to assign leads"
    );
  }

  const User = require("../models/User");

  const assignedUser = await User.findById(assignedTo);

  if (!assignedUser) {
    throw new Error("Assigned user not found");
  }

  if (assignedUser.role !== "SALES_EXECUTIVE") {
    throw new Error(
      "Leads can only be assigned to Sales Executives"
    );
  }

  lead.assignedTo = assignedUser._id;

  await lead.save();

  return Lead.findById(lead._id)
    .populate("assignedTo", "name email role")
    .populate("createdBy", "name email role");
};

const convertLeadToCustomer = async (leadId, user) => {
  const lead = await Lead.findById(leadId);

  if (!lead) {
    throw new Error("Lead not found");
  }

  // Only Admin and Sales Manager can convert leads.
  if (
    user.role !== "ADMIN" &&
    user.role !== "SALES_MANAGER"
  ) {
    throw new Error(
      "You are not authorized to convert leads"
    );
  }

  // Only qualified leads can be converted to customers.
  if (lead.status !== "Qualified") {
    throw new Error("Only qualified leads can be converted to a customer");
  }

  // Prevent converting the same lead twice.
  if (lead.status === "Converted" || lead.convertedCustomer) {
    throw new Error("Lead has already been converted");
  }

  const existingCustomer = await Customer.findOne({
    email: lead.email,
  });

  if (existingCustomer) {
    throw new Error(
      "A customer with this email already exists"
    );
  }

  const customer = await Customer.create({
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    company: lead.company,
    notes: lead.notes,
    assignedTo: lead.assignedTo,
    sourceLead: lead._id,
    createdBy: user._id,
  });

  lead.status = "Converted";
  lead.convertedCustomer = customer._id;

  await lead.save();

  return Customer.findById(customer._id)
    .populate("assignedTo", "name email role")
    .populate("createdBy", "name email role")
    .populate("sourceLead", "name email company");
};

module.exports = {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  assignLead,
  convertLeadToCustomer,
};