import { prisma } from "../config/db.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { sendResetPasswordEmail } from "../utils/emailUtils.js";

import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const VALID_SPECIALIZATIONS = ["NAILS", "MAKEUP", "LASHES", "WIGS", "HAIR", "EYEBROWS", "FACIAL", "SKIN"];

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// @desc    Google Login
export const googleLogin = async (req, res) => {
  const { idToken } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name, sub: googleId } = ticket.getPayload();

    let user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user) {
      // Create user if not exists
      const salt = await bcrypt.genSalt(10);
      const generatedPassword = await bcrypt.hash(googleId, salt); // Use googleId as seed for dummy password

      user = await prisma.user.create({
        data: {
          name,
          email: email.trim().toLowerCase(),
          password: generatedPassword,
          role: "client",
        },
      });
    }

    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      specialization: user.specialization,
      permissions: {
        approveBookings: user.approveBookings,
        manageStaff: user.manageStaff,
        manageServices: user.manageServices,
      },
      token: generateToken(user.id),
    });
  } catch (error) {
    console.error("Google Login Error:", error.message);
    res.status(401).json({ message: "Google authentication failed" });
  }
};

// @desc    Update user profile
export const updateUserProfile = async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });

  if (user) {
    const data = {
      name: req.body.name || user.name,
      email: (req.body.email || user.email).trim().toLowerCase(),
    };

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data,
    });

    res.json({
      _id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      token: generateToken(updatedUser.id),
    });
  } else {
    res.status(404).json({ message: "User not found" });
  }
};

// @desc    Auth user & get token
export const authUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ 
      where: { email: email.trim().toLowerCase() } 
    });

    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        return res.json({
          _id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          specialization: user.specialization,
          permissions: {
            approveBookings: user.approveBookings,
            manageStaff: user.manageStaff,
            manageServices: user.manageServices,
          },
          token: generateToken(user.id),
        });
      }
    }

    res.status(401).json({ message: "Invalid email or password" });
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ message: "Server connection failed. Please try again." });
  }
};

// @desc    Register a new user
export const registerUser = async (req, res) => {
  const { name, email, password, role, specialization } = req.body;

  try {
    const userExists = await prisma.user.findUnique({ 
      where: { email: email.trim().toLowerCase() } 
    });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        role: role || "client",
        specialization: specialization || [],
      },
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        specialization: user.specialization,
        permissions: {
          approveBookings: user.approveBookings,
          manageStaff: user.manageStaff,
          manageServices: user.manageServices,
        },
        token: generateToken(user.id),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error("Registration Error:", error.message);
    res.status(500).json({ message: "Server connection failed. Please try again." });
  }
};

// @desc    Forgot Password
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({ 
      where: { email: email.trim().toLowerCase() } 
    });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User with this email does not exist" });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    const resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken,
        resetPasswordExpire,
      }
    });

    await sendResetPasswordEmail({ ...user, resetPasswordToken, resetPasswordExpire }, resetToken);
    res.json({ message: "Password reset link sent to your email" });
  } catch (error) {
    console.error("Forgot Password Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset Password
export const resetPassword = async (req, res) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  try {
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken,
        resetPasswordExpire: { gt: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpire: null,
      }
    });

    res.json({ message: "Password reset successful. You can now login." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all staff members (For Booking)
export const getStaff = async (req, res) => {
  try {
    const staff = await prisma.user.findMany({
      where: { 
        OR: [
          { role: "staff" },
          { role: "admin" }
        ]
      },
    });

    const bookableStaff = staff.filter((s) => {
      const specs = (s.specialization || []).map((sp) => sp.toUpperCase());
      return specs.some((sp) => VALID_SPECIALIZATIONS.includes(sp));
    });

    res.json(bookableStaff.map(s => ({ ...s, _id: s.id })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users (Admin only)
export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        specialization: true,
        approveBookings: true,
        manageStaff: true,
        manageServices: true,
      }
    });
    const mappedUsers = users.map(u => ({ ...u, _id: u.id }));
    res.json(mappedUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user details (Admin only)
export const updateUserRole = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (user) {
      const data = {};
      if (req.body.name) data.name = req.body.name;
      if (req.body.email) data.email = req.body.email.trim().toLowerCase();
      if (req.body.role) data.role = req.body.role;
      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        data.password = await bcrypt.hash(req.body.password, salt);
      }
      if (req.body.specialization) data.specialization = req.body.specialization;
      if (req.body.permissions) {
        if (req.body.permissions.approveBookings !== undefined) data.approveBookings = req.body.permissions.approveBookings;
        if (req.body.permissions.manageStaff !== undefined) data.manageStaff = req.body.permissions.manageStaff;
        if (req.body.permissions.manageServices !== undefined) data.manageServices = req.body.permissions.manageServices;
      }

      const updatedUser = await prisma.user.update({
        where: { id: req.params.id },
        data,
      });

      res.json({
        _id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        specialization: updatedUser.specialization,
        permissions: {
          approveBookings: updatedUser.approveBookings,
          manageStaff: updatedUser.manageStaff,
          manageServices: updatedUser.manageServices,
        },
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
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (user) {
      if (user.role === "admin") {
        return res.status(400).json({ message: "Cannot delete admin user" });
      }
      await prisma.user.delete({ where: { id: req.params.id } });
      res.json({ message: "User removed" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
