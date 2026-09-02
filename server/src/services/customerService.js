const Customer = require("../models/Customer");

const createCustomer = async (customerData, userId) => {
  const existingCustomer = await Customer.findOne({
    email: customerData.email,
  });

  if (existingCustomer) {
    throw new Error("Customer with this email already exists");
  }

  const customer = await Customer.create({
    ...customerData,
    createdBy: userId,
  });

  return customer;
};

// const getCustomers = async (user) => {
//   const filter = {};

//   // Sales Executives can only see customers assigned to them.
//   if (user.role === "SALES_EXECUTIVE") {
//     filter.assignedTo = user._id;
//   }

//   return Customer.find(filter)
//     .populate("assignedTo", "name email role")
//     .populate("createdBy", "name email role")
//     .populate("sourceLead", "name email company")
//     .sort({ createdAt: -1 });
// };

const getCustomers = async (user, query = {}) => {
  const {
    search,
    assignedTo,
    page = 1,
    limit = 10,
  } = query;

  const filter = {};

  // Sales Executives can only see customers assigned to them.
  if (user.role === "SALES_EXECUTIVE") {
    filter.assignedTo = user._id;
  } else if (assignedTo) {
    filter.assignedTo = assignedTo;
  }

  // Search by name, email, phone, or company.
  if (search) {
    const searchRegex = new RegExp(search, "i");

    filter.$or = [
      { name: searchRegex },
      { email: searchRegex },
      { phone: searchRegex },
      { company: searchRegex },
    ];
  }

  const currentPage = Math.max(
    parseInt(page, 10) || 1,
    1
  );

  const currentLimit = Math.min(
    Math.max(parseInt(limit, 10) || 10, 1),
    100
  );

  const skip = (currentPage - 1) * currentLimit;

  const [customers, total] = await Promise.all([
    Customer.find(filter)
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email role")
      .populate("sourceLead", "name email company")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(currentLimit),

    Customer.countDocuments(filter),
  ]);

  return {
    customers,
    pagination: {
      page: currentPage,
      limit: currentLimit,
      total,
      totalPages: Math.ceil(total / currentLimit),
    },
  };
};

const getCustomerById = async (customerId, user) => {
  const customer = await Customer.findById(customerId)
    .populate("assignedTo", "name email role")
    .populate("createdBy", "name email role")
    .populate("sourceLead", "name email company");

  if (!customer) {
    throw new Error("Customer not found");
  }

  if (
    user.role === "SALES_EXECUTIVE" &&
    (!customer.assignedTo ||
      customer.assignedTo._id.toString() !== user._id.toString())
  ) {
    throw new Error(
      "You are not authorized to access this customer"
    );
  }

  return customer;
};

const updateCustomer = async (
  customerId,
  updateData,
  user
) => {
  const customer = await Customer.findById(customerId);

  if (!customer) {
    throw new Error("Customer not found");
  }

  if (
    user.role === "SALES_EXECUTIVE" &&
    (!customer.assignedTo ||
      customer.assignedTo.toString() !== user._id.toString())
  ) {
    throw new Error(
      "You are not authorized to update this customer"
    );
  }

  // Sales Executives cannot change ownership.
  if (user.role === "SALES_EXECUTIVE") {
    delete updateData.assignedTo;
  }

  // Don't allow changing the creator.
  delete updateData.createdBy;

  Object.assign(customer, updateData);

  await customer.save();

  return Customer.findById(customer._id)
    .populate("assignedTo", "name email role")
    .populate("createdBy", "name email role")
    .populate("sourceLead", "name email company");
};

const deleteCustomer = async (customerId, user) => {
  const customer = await Customer.findById(customerId);

  if (!customer) {
    throw new Error("Customer not found");
  }

  // Only Admin can delete customers.
  if (user.role !== "ADMIN") {
    throw new Error(
      "You are not authorized to delete this customer"
    );
  }

  await customer.deleteOne();

  return customer;
};

const assignCustomer = async (
  customerId,
  assignedTo,
  user
) => {
  const customer = await Customer.findById(customerId);

  if (!customer) {
    throw new Error("Customer not found");
  }

  if (
    user.role !== "ADMIN" &&
    user.role !== "SALES_MANAGER"
  ) {
    throw new Error(
      "You are not authorized to assign customers"
    );
  }

  const User = require("../models/User");

  const assignedUser = await User.findById(assignedTo);

  if (!assignedUser) {
    throw new Error("Assigned user not found");
  }

  if (assignedUser.role !== "SALES_EXECUTIVE") {
    throw new Error(
      "Customers can only be assigned to Sales Executives"
    );
  }

  customer.assignedTo = assignedUser._id;

  await customer.save();

  return Customer.findById(customer._id)
    .populate("assignedTo", "name email role")
    .populate("createdBy", "name email role")
    .populate("sourceLead", "name email company");
};

module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  assignCustomer,
};