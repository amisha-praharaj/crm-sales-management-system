const Contact = require("../models/Contact");
const Customer = require("../models/Customer");
const Lead = require("../models/Lead");
const User = require("../models/User");

// ======================================================
// CREATE CONTACT
// ======================================================

const createContact = async (contactData, user) => {
  const {
    customer,
    lead,
    assignedTo,
  } = contactData;

  // Validate customer
  if (customer) {
    const existingCustomer =
      await Customer.findById(customer);

    if (!existingCustomer) {
      throw new Error("Customer not found");
    }
  }

  // Validate lead
  if (lead) {
    const existingLead =
      await Lead.findById(lead);

    if (!existingLead) {
      throw new Error("Lead not found");
    }
  }

  // Only Admin and Sales Manager can assign
  let contactAssignedTo = user._id;

  if (assignedTo) {
    if (
      user.role !== "ADMIN" &&
      user.role !== "SALES_MANAGER"
    ) {
      throw new Error(
        "You are not authorized to assign contacts"
      );
    }

    const assignedUser =
      await User.findById(assignedTo);

    if (!assignedUser) {
      throw new Error("Assigned user not found");
    }

    if (
      assignedUser.role !== "SALES_EXECUTIVE"
    ) {
      throw new Error(
        "Contacts can only be assigned to Sales Executives"
      );
    }

    if (!assignedUser.isActive) {
      throw new Error(
        "Cannot assign contact to an inactive user"
      );
    }

    contactAssignedTo = assignedUser._id;
  }

  const contact = await Contact.create({
    ...contactData,
    assignedTo: contactAssignedTo,
    createdBy: user._id,
  });

  return Contact.findById(contact._id)
    .populate(
      "customer",
      "name email company"
    )
    .populate(
      "lead",
      "name email company status"
    )
    .populate(
      "assignedTo",
      "name email role"
    )
    .populate(
      "createdBy",
      "name email role"
    );
};

// ======================================================
// GET CONTACTS
// ======================================================

const getContacts = async (
  user,
  query = {}
) => {
  const {
    search,
    customer,
    lead,
    assignedTo,
    page = 1,
    limit = 10,
  } = query;

  const filter = {};

  // Sales Executives only see their contacts
  if (user.role === "SALES_EXECUTIVE") {
    filter.assignedTo = user._id;
  } else if (assignedTo) {
    filter.assignedTo = assignedTo;
  }

  // Filter by customer
  if (customer) {
    filter.customer = customer;
  }

  // Filter by lead
  if (lead) {
    filter.lead = lead;
  }

  // Search
  if (search) {
    const searchRegex = new RegExp(
      search,
      "i"
    );

    filter.$or = [
      { name: searchRegex },
      { email: searchRegex },
      { phone: searchRegex },
      { company: searchRegex },
      { jobTitle: searchRegex },
      { department: searchRegex },
    ];
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
    (currentPage - 1) * currentLimit;

  const [
    contacts,
    total,
  ] = await Promise.all([
    Contact.find(filter)
      .populate(
        "customer",
        "name email company"
      )
      .populate(
        "lead",
        "name email company status"
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

    Contact.countDocuments(filter),
  ]);

  return {
    contacts,
    pagination: {
      page: currentPage,
      limit: currentLimit,
      total,
      totalPages: Math.ceil(
        total / currentLimit
      ),
    },
  };
};

// ======================================================
// GET CONTACT BY ID
// ======================================================

const getContactById = async (
  contactId,
  user
) => {
  const contact =
    await Contact.findById(contactId)
      .populate(
        "customer",
        "name email company"
      )
      .populate(
        "lead",
        "name email company status"
      )
      .populate(
        "assignedTo",
        "name email role"
      )
      .populate(
        "createdBy",
        "name email role"
      );

  if (!contact) {
    throw new Error("Contact not found");
  }

  // Sales Executive can only access
  // their assigned contacts.
  if (
    user.role === "SALES_EXECUTIVE" &&
    (!contact.assignedTo ||
      contact.assignedTo._id.toString() !==
        user._id.toString())
  ) {
    throw new Error(
      "You are not authorized to access this contact"
    );
  }

  return contact;
};

// ======================================================
// UPDATE CONTACT
// ======================================================

const updateContact = async (
  contactId,
  updateData,
  user
) => {
  const contact =
    await Contact.findById(contactId);

  if (!contact) {
    throw new Error("Contact not found");
  }

  // Sales Executive can only update
  // their assigned contacts.
  if (
    user.role === "SALES_EXECUTIVE" &&
    (!contact.assignedTo ||
      contact.assignedTo.toString() !==
        user._id.toString())
  ) {
    throw new Error(
      "You are not authorized to update this contact"
    );
  }

  // Validate customer if changed
  if (updateData.customer) {
    const existingCustomer =
      await Customer.findById(
        updateData.customer
      );

    if (!existingCustomer) {
      throw new Error("Customer not found");
    }
  }

  // Validate lead if changed
  if (updateData.lead) {
    const existingLead =
      await Lead.findById(
        updateData.lead
      );

    if (!existingLead) {
      throw new Error("Lead not found");
    }
  }

  // Sales Executives cannot change ownership
  if (user.role === "SALES_EXECUTIVE") {
    delete updateData.assignedTo;
  }

  // Admin / Sales Manager assignment
  if (
    updateData.assignedTo &&
    user.role !== "SALES_EXECUTIVE"
  ) {
    const assignedUser =
      await User.findById(
        updateData.assignedTo
      );

    if (!assignedUser) {
      throw new Error(
        "Assigned user not found"
      );
    }

    if (
      assignedUser.role !==
      "SALES_EXECUTIVE"
    ) {
      throw new Error(
        "Contacts can only be assigned to Sales Executives"
      );
    }

    if (!assignedUser.isActive) {
      throw new Error(
        "Cannot assign contact to an inactive user"
      );
    }
  }

  // Never allow changing creator
  delete updateData.createdBy;

  // Never allow changing ID
  delete updateData._id;

  Object.assign(
    contact,
    updateData
  );

  await contact.save();

  return Contact.findById(contact._id)
    .populate(
      "customer",
      "name email company"
    )
    .populate(
      "lead",
      "name email company status"
    )
    .populate(
      "assignedTo",
      "name email role"
    )
    .populate(
      "createdBy",
      "name email role"
    );
};

// ======================================================
// DELETE CONTACT
// ======================================================

const deleteContact = async (
  contactId,
  user
) => {
  const contact =
    await Contact.findById(contactId);

  if (!contact) {
    throw new Error("Contact not found");
  }

  // Only Admin can delete
  if (user.role !== "ADMIN") {
    throw new Error(
      "You are not authorized to delete this contact"
    );
  }

  await contact.deleteOne();

  return contact;
};

// ======================================================
// ASSIGN CONTACT
// ======================================================

const assignContact = async (
  contactId,
  assignedTo,
  user
) => {
  const contact =
    await Contact.findById(contactId);

  if (!contact) {
    throw new Error("Contact not found");
  }

  // Only Admin and Sales Manager
  if (
    user.role !== "ADMIN" &&
    user.role !== "SALES_MANAGER"
  ) {
    throw new Error(
      "You are not authorized to assign contacts"
    );
  }

  const assignedUser =
    await User.findById(assignedTo);

  if (!assignedUser) {
    throw new Error(
      "Assigned user not found"
    );
  }

  if (
    assignedUser.role !==
    "SALES_EXECUTIVE"
  ) {
    throw new Error(
      "Contacts can only be assigned to Sales Executives"
    );
  }

  if (!assignedUser.isActive) {
    throw new Error(
      "Cannot assign contact to an inactive user"
    );
  }

  contact.assignedTo =
    assignedUser._id;

  await contact.save();

  return Contact.findById(contact._id)
    .populate(
      "customer",
      "name email company"
    )
    .populate(
      "lead",
      "name email company status"
    )
    .populate(
      "assignedTo",
      "name email role"
    )
    .populate(
      "createdBy",
      "name email role"
    );
};

module.exports = {
  createContact,
  getContacts,
  getContactById,
  updateContact,
  deleteContact,
  assignContact,
};