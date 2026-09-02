require("dotenv").config();

const connectDB = require("../src/config/db");
const mongoose = require("mongoose");
const User = require("../src/models/User");

const createAdmin = async () => {
  try {
    await connectDB();

    const existingAdmin = await User.findOne({
      email: "admin@crm.com",
    });

    if (existingAdmin) {
      console.log("Admin already exists");
      await mongoose.disconnect();
      return;
    }

    const admin = await User.create({
      name: "CRM Administrator",
      email: "admin@crm.com",
      password: "Admin@123456",
      role: "ADMIN",
    });

    console.log("Admin created successfully");
    console.log(`Email: ${admin.email}`);
    console.log("Password: Admin@123456");

    await mongoose.disconnect();
  } catch (error) {
    console.error("Failed to create admin:", error.message);
    process.exit(1);
  }
};

createAdmin();