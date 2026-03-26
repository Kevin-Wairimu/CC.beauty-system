import Appointment from "../models/Appointment.js";
import Service from "../models/Service.js";
import mongoose from "mongoose";
import {
  sendBookingEmail,
  sendApprovalEmail,
  sendClientBookingEmail,
} from "../utils/emailUtils.js";
import {
  sendBookingSMS,
  sendClientBookingSMS,
  sendClientApprovalSMS,
} from "../utils/smsUtils.js";

// ─── Receipt Number Generator ────────────────────────────────────────────────
// Format: CC-YYYYMMDD-XXXX  e.g. CC-20240315-7492
const generateReceiptNo = () => {
  const date = new Date();
  const datePart = date.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `CC-${datePart}-${rand}`;
};

// ─────────────────────────────────────────────────────────────────────────────

export const createAppointment = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      service,
      date,
      time,
      notes,
      serviceId,
      staffId,
      price,
    } = req.body;
    console.log(
      `[CREATE APPOINTMENT] Incoming staffId: "${staffId}" for service: "${service}"`,
    );

    if (!req.user) {
      return res
        .status(401)
        .json({ message: "Authentication required to book a session." });
    }

    const clientId = req.user._id;

    let validStaffId = null;
    if (staffId && mongoose.Types.ObjectId.isValid(staffId)) {
      validStaffId = staffId;
    }

    // Auto-resolve price from service catalog if not provided
    let resolvedPrice = price || 0;
    if (
      !resolvedPrice &&
      serviceId &&
      mongoose.Types.ObjectId.isValid(serviceId)
    ) {
      const svc = await Service.findById(serviceId);
      if (svc?.price) resolvedPrice = parseFloat(svc.price) || 0;
    }

    const appointment = new Appointment({
      name: name || req.user.name,
      phone,
      email: email || req.user.email,
      service,
      date,
      time,
      notes,
      clientId,
      serviceId,
      staffId: validStaffId,
      price: resolvedPrice,
    });

    const createdAppointment = await appointment.save();

    const populatedAppointment = await Appointment.findById(
      createdAppointment._id,
    )
      .populate("staffId", "name _id")
      .populate("serviceId", "name _id");

    (async () => {
      try {
        await sendBookingEmail(populatedAppointment);
        await sendClientBookingEmail(populatedAppointment);
        console.log(
          `Notifications triggered for appointment: ${createdAppointment._id}`,
        );
      } catch (notifError) {
        console.error("Background Notification Error:", notifError.message);
      }
    })();

    res.status(201).json(createdAppointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────

export const getAppointments = async (req, res) => {
  try {
    let query = {};

    if (req.user) {
      if (req.user.role === "staff") {
        query = { staffId: req.user._id };
      } else if (req.user.role === "client") {
        query = {
          $or: [{ clientId: req.user._id }, { email: req.user.email }],
        };
      }
    }

    const appointments = await Appointment.find(query)
      .populate("clientId", "name email _id")
      .populate("staffId", "name _id")
      .populate("serviceId", "name price _id") // ← include price for auto-resolve
      .populate("handledBy", "name _id")
      .sort({ createdAt: -1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────

export const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (appointment) {
      await appointment.deleteOne();
      res.json({ message: "Appointment removed" });
    } else {
      res.status(404).json({ message: "Appointment not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────

export const updateAppointmentStatus = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate(
      "serviceId",
      "name price",
    ); // ← needed for auto price lookup

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const oldStatus = appointment.status;

    // ── STAFF: restricted update ──────────────────────────────────────────────
    if (req.user.role === "staff") {
      const isMyAppointment =
        appointment.staffId &&
        appointment.staffId.toString() === req.user._id.toString();

      if (!isMyAppointment) {
        return res
          .status(403)
          .json({ message: "Not authorized to update this appointment" });
      }

      if (req.body.price !== undefined || req.body.staffId !== undefined) {
        return res
          .status(403)
          .json({ message: "Staff cannot modify price or assignment" });
      }

      if (req.body.status !== undefined) appointment.status = req.body.status;

      // ── ADMIN / MANAGER: full control ─────────────────────────────────────────
    } else {
      if (req.body.status !== undefined) appointment.status = req.body.status;

      if (req.body.staffId !== undefined) {
        appointment.staffId =
          req.body.staffId && mongoose.Types.ObjectId.isValid(req.body.staffId)
            ? req.body.staffId
            : null;
      }

      // ── AUTO-PRICE ON COMPLETION ───────────────────────────────────────────
      // When marking as completed:
      //   1. Use price already on appointment if it's > 0
      //   2. Otherwise pull from populated serviceId
      //   3. Otherwise fall back to whatever was passed in the body
      // Admin never needs to type a price manually.
      if (req.body.status === "completed") {
        let finalPrice = appointment.price;

        if (!finalPrice || finalPrice === 0) {
          // Try serviceId (populated above)
          const svcPrice = parseFloat(appointment.serviceId?.price);
          if (!isNaN(svcPrice) && svcPrice > 0) {
            finalPrice = svcPrice;
          }
        }

        // Allow explicit override only if admin passes price AND it's > 0
        if (req.body.price !== undefined && parseFloat(req.body.price) > 0) {
          finalPrice = parseFloat(req.body.price);
        }

        appointment.price = finalPrice;
        appointment.paymentStatus = "paid";

        // Generate receipt number if not already set
        if (!appointment.receiptNo) {
          // Ensure uniqueness — retry once on collision
          let receipt = generateReceiptNo();
          const exists = await Appointment.findOne({ receiptNo: receipt });
          if (exists) receipt = generateReceiptNo();
          appointment.receiptNo = receipt;
        }
      } else {
        // Non-completion status update: allow manual paymentStatus if sent
        if (req.body.paymentStatus !== undefined) {
          appointment.paymentStatus = req.body.paymentStatus;
        }
      }
    }

    if (req.user) appointment.handledBy = req.user._id;

    const updatedAppointment = await appointment.save();

    // Approval notifications
    if (
      oldStatus !== "approved" &&
      updatedAppointment.status === "approved" &&
      updatedAppointment.email
    ) {
      (async () => {
        try {
          const populatedForNotif = await Appointment.findById(
            updatedAppointment._id,
          ).populate("staffId", "name _id");
          await sendApprovalEmail(populatedForNotif);
          console.log(
            `Approval email triggered for appointment: ${updatedAppointment._id}`,
          );
        } catch (err) {
          console.error("Background Status Notification Error:", err.message);
        }
      })();
    }

    // Return fully populated so frontend receipt has all fields
    const populated = await Appointment.findById(updatedAppointment._id)
      .populate("clientId", "name email")
      .populate("staffId", "name")
      .populate("serviceId", "name price")
      .populate("handledBy", "name");

    res.json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
