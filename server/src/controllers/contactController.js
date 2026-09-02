const {
  createContact,
  getContacts,
  getContactById,
  updateContact,
  deleteContact,
  assignContact,
} = require("../services/contactService");

// ======================================================
// CREATE
// ======================================================

const create = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
    } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email and phone are required",
      });
    }

    const contact = await createContact(
      req.body,
      req.user
    );

    return res.status(201).json({
      success: true,
      message:
        "Contact created successfully",
      contact,
    });
  } catch (error) {
    if (
      error.message ===
        "Customer not found" ||
      error.message ===
        "Lead not found" ||
      error.message ===
        "Assigned user not found"
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error.message.includes(
        "not authorized"
      ) ||
      error.message.includes(
        "only be assigned"
      ) ||
      error.message.includes(
        "inactive user"
      )
    ) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error.name ===
      "ValidationError"
    ) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: Object.values(
          error.errors
        ).map((err) => err.message),
      });
    }

    console.error(
      "Create contact error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create contact",
    });
  }
};

// ======================================================
// GET ALL
// ======================================================

const getAll = async (req, res) => {
  try {
    const result = await getContacts(
      req.user,
      req.query
    );

    return res.status(200).json({
      success: true,
      contacts: result.contacts,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error(
      "Get contacts error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch contacts",
    });
  }
};

// ======================================================
// GET ONE
// ======================================================

const getOne = async (req, res) => {
  try {
    const contact =
      await getContactById(
        req.params.id,
        req.user
      );

    return res.status(200).json({
      success: true,
      contact,
    });
  } catch (error) {
    if (
      error.message ===
      "Contact not found"
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

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
      "Get contact error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch contact",
    });
  }
};

// ======================================================
// UPDATE
// ======================================================

const update = async (req, res) => {
  try {
    const contact =
      await updateContact(
        req.params.id,
        req.body,
        req.user
      );

    return res.status(200).json({
      success: true,
      message:
        "Contact updated successfully",
      contact,
    });
  } catch (error) {
    if (
      error.message ===
        "Contact not found" ||
      error.message ===
        "Customer not found" ||
      error.message ===
        "Lead not found" ||
      error.message ===
        "Assigned user not found"
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error.message.includes(
        "not authorized"
      ) ||
      error.message.includes(
        "only be assigned"
      ) ||
      error.message.includes(
        "inactive user"
      )
    ) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error.name ===
      "ValidationError"
    ) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: Object.values(
          error.errors
        ).map((err) => err.message),
      });
    }

    console.error(
      "Update contact error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update contact",
    });
  }
};

// ======================================================
// DELETE
// ======================================================

const remove = async (req, res) => {
  try {
    await deleteContact(
      req.params.id,
      req.user
    );

    return res.status(200).json({
      success: true,
      message:
        "Contact deleted successfully",
    });
  } catch (error) {
    if (
      error.message ===
      "Contact not found"
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

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
      "Delete contact error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete contact",
    });
  }
};

// ======================================================
// ASSIGN
// ======================================================

const assign = async (req, res) => {
  try {
    const { assignedTo } =
      req.body;

    if (!assignedTo) {
      return res.status(400).json({
        success: false,
        message:
          "assignedTo is required",
      });
    }

    const contact =
      await assignContact(
        req.params.id,
        assignedTo,
        req.user
      );

    return res.status(200).json({
      success: true,
      message:
        "Contact assigned successfully",
      contact,
    });
  } catch (error) {
    if (
      error.message ===
        "Contact not found" ||
      error.message ===
        "Assigned user not found"
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error.message.includes(
        "not authorized"
      ) ||
      error.message.includes(
        "only be assigned"
      ) ||
      error.message.includes(
        "inactive user"
      )
    ) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    console.error(
      "Assign contact error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to assign contact",
    });
  }
};

module.exports = {
  create,
  getAll,
  getOne,
  update,
  remove,
  assign,
};