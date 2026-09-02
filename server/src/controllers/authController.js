const { registerUser, loginUser } = require("../services/authService");
const { generateToken } = require("../utils/jwt");

const sendTokenResponse = (res, user, statusCode, message) => {
  const token = generateToken(user._id);

  res
    .status(statusCode)
    .cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .json({
      success: true,
      message,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
};

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // Public registration always creates a Sales Executive.
    const user = await registerUser({
      name,
      email,
      password,
      role: "SALES_EXECUTIVE",
    });

    return sendTokenResponse(
      res,
      user,
      201,
      "User registered successfully"
    );
  } catch (error) {
    if (error.message === "User with this email already exists") {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Register error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to register user",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await loginUser({
      email,
      password,
    });

    return sendTokenResponse(
      res,
      user,
      200,
      "Login successful"
    );
  } catch (error) {
    if (
      error.message === "Invalid email or password" ||
      error.message === "User account is inactive"
    ) {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to login",
    });
  }
};

const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
};

const adminTest = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Admin access granted",
    user: {
      id: req.user._id,
      name: req.user.name,
      role: req.user.role,
    },
  });
};

const logout = (req, res) => {
  res
    .clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    })
    .json({
      success: true,
      message: "Logout successful",
    });
};

module.exports = {
  register,
  login,
    getMe,
    adminTest,
  logout,
};