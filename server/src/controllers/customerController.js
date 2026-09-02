const {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  assignCustomer,
} = require("../services/customerService");

const create = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name, email and phone are required",
      });
    }

    const customer = await createCustomer(
      req.body,
      req.user._id
    );

    return res.status(201).json({
      success: true,
      message: "Customer created successfully",
      customer,
    });
  } catch (error) {
    if (
      error.message ===
      "Customer with this email already exists"
    ) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Create customer error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create customer",
    });
  }
};

// const getAll = async (req, res) => {
//   try {
//     const customers = await getCustomers(req.user);

//     return res.status(200).json({
//       success: true,
//       count: customers.length,
//       customers,
//     });
//   } catch (error) {
//     console.error("Get customers error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch customers",
//     });
//   }
// };

const getAll = async (req, res) => {
  try {
    const result = await getCustomers(
      req.user,
      req.query
    );

    return res.status(200).json({
      success: true,
      count: result.pagination.total,
      customers: result.customers,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Get customers error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch customers",
    });
  }
};

const getOne = async (req, res) => {
  try {
    const customer = await getCustomerById(
      req.params.id,
      req.user
    );

    return res.status(200).json({
      success: true,
      customer,
    });
  } catch (error) {
    if (
      error.message === "Customer not found" ||
      error.message.includes("not authorized")
    ) {
      return res.status(
        error.message === "Customer not found" ? 404 : 403
      ).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Get customer error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch customer",
    });
  }
};

const update = async (req, res) => {
  try {
    const customer = await updateCustomer(
      req.params.id,
      req.body,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      customer,
    });
  } catch (error) {
    if (
      error.message === "Customer not found" ||
      error.message.includes("not authorized")
    ) {
      return res.status(
        error.message === "Customer not found" ? 404 : 403
      ).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Update customer error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update customer",
    });
  }
};

const remove = async (req, res) => {
  try {
    await deleteCustomer(req.params.id, req.user);

    return res.status(200).json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    if (
      error.message === "Customer not found" ||
      error.message.includes("not authorized")
    ) {
      return res.status(
        error.message === "Customer not found" ? 404 : 403
      ).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Delete customer error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete customer",
    });
  }
};

const assign = async (req, res) => {
  try {
    const { assignedTo } = req.body;

    if (!assignedTo) {
      return res.status(400).json({
        success: false,
        message: "assignedTo is required",
      });
    }

    const customer = await assignCustomer(
      req.params.id,
      assignedTo,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: "Customer assigned successfully",
      customer,
    });
  } catch (error) {
    if (
      error.message === "Customer not found" ||
      error.message === "Assigned user not found" ||
      error.message.includes("not authorized") ||
      error.message.includes("only be assigned")
    ) {
      return res.status(
        error.message === "Customer not found" ||
        error.message === "Assigned user not found"
          ? 404
          : 403
      ).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Assign customer error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to assign customer",
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