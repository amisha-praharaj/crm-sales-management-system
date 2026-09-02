const User = require("../models/User");

const createUser = async ({
  name,
  email,
  password,
  role,
}) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error(
      "User with this email already exists"
    );
  }

  if (
    !["SALES_MANAGER", "SALES_EXECUTIVE"].includes(role)
  ) {
    throw new Error("Invalid user role");
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  return User.findById(user._id).select("-password");
};

const getUsers = async () => {
  return User.find()
    .select("-password")
    .sort({ createdAt: -1 });
};

const getUserById = async (userId) => {
  const user = await User.findById(userId)
    .select("-password");

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

const updateUser = async (userId, updateData) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  // Prevent password changes through user management.
  delete updateData.password;

  // Prevent changing the user's ID.
  delete updateData._id;

  Object.assign(user, updateData);

  await user.save();

  return User.findById(user._id).select("-password");
};

const updateUserStatus = async (userId, isActive) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  user.isActive = isActive;

  await user.save();

  return User.findById(user._id).select("-password");
};

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  updateUserStatus,
};