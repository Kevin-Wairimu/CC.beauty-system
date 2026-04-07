import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendResetPasswordEmail } from "../utils/emailUtils.js";

const VALID_SPECIALIZATIONS = ["NAILS", "MAKEUP", "LASHES", "WIGS", "HAIR", "EYEBROWS", "FACIAL", "SKIN"];

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// @desc    Auth user & get token
export const authUser = async (req, res) => {
  const { email, password } = req.body;
  console.log(`[LOGIN ATTEMPT] Email: ${email}, Password: ${password}`);

  const user = await User.findOne({ email });
  console.log(`[LOGIN LOOKUP] User found:`, user ? user.email : "null");

  if (user) {
    const isMatch = await user.matchPassword(password);
    console.log(`[LOGIN MATCH] Password match result:`, isMatch);
    if (isMatch) {
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        token: generateToken(user._id),
      });
    }
  }

  res.status(401).json({ message: "Invalid email or password" });
};

// @desc    Register a new user
export const registerUser = async (req, res) => {
  const { name, email, password, role, specialization } = req.body;
  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || "client",
    specialization: specialization || [],
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      specialization: user.specialization,
      permissions: user.permissions,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: "Invalid user data" });
  }
};

// @desc    Forgot Password
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res
      .status(404)
      .json({ message: "User with this email does not exist" });
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();
  await user.save();

  try {
    await sendResetPasswordEmail(user, resetToken);
    res.json({ message: "Password reset link sent to your email" });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.status(500).json({ message: "Email could not be sent" });
  }
};

// @desc    Reset Password
export const resetPassword = async (req, res) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired reset token" });
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.json({ message: "Password reset successful. You can now login." });
};

// @desc    Get all users (Admin only)
// @desc    Get all staff members (For Booking)
export const getStaff = async (req, res) => {
  try {
    const staff = await User.find({ role: "staff" }).select("-password");

    // Only return staff who have AT LEAST ONE valid beauty specialization
    const bookableStaff = staff.filter((s) => {
      const specs = (s.specialization || []).map((sp) => sp.toUpperCase());
      return specs.some((sp) => VALID_SPECIALIZATIONS.includes(sp));
    });

    if (bookableStaff.length === 0) throw new Error("No staff found");
    res.json(bookableStaff);
  } catch (error) {
    console.warn("Staff database error, returning MOCK STAFF:", error.message);
    const mockStaff = [
      { _id: "s1", name: "Ceisey Wairimu", role: "staff", specialization: ["NAILS", "MAKEUP"] },
      { _id: "s2", name: "Martha", role: "staff", specialization: ["HAIR", "LASHES"] }
    ];
    res.json(mockStaff);
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user details (Admin only)
export const updateUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.role = req.body.role || user.role;

      if (req.body.password) {
        user.password = req.body.password;
      }

      if (req.body.specialization) {
        user.specialization = req.body.specialization;
      }

      if (req.body.permissions) {
        user.permissions = { ...user.permissions, ...req.body.permissions };
      }

      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        specialization: updatedUser.specialization,
        permissions: updatedUser.permissions,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete user (Admin only)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      if (user.role === "admin") {
        return res.status(400).json({ message: "Cannot delete admin user" });
      }
      await user.deleteOne();
      res.json({ message: "User removed" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
