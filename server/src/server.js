const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const connectDB = require("./config/db");
const app = express();
const PORT = process.env.PORT || 5000;

// Import routes

const authRoutes = require("./routes/authRoutes");
const leadRoutes = require("./routes/leadRoutes");
const customerRoutes = require("./routes/customerRoutes");
const dealRoutes = require("./routes/dealRoutes");
const activityRoutes = require("./routes/activityRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const userRoutes = require("./routes/userRoutes");
const contactRoutes = require("./routes/contactRoutes");

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes

app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/deals", dealRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);
app.use(
  "/api/contacts",
  contactRoutes
);


app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CRM API is running",
  });
});

// Health check
// app.get("/api/health", (req, res) => {
//   res.status(200).json({
//     success: true,
//     message: "CRM API is running",
//   });
// });

connectDB();
// Start server
app.listen(PORT, () => {
  console.log(`CRM server running on http://localhost:${PORT}`);
});