import { prisma } from "../config/db.js";
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
      sessionId, // Links multiple services booked together in one visit
    } = req.body;

    const clientId = req.user ? req.user.id : null;

    // Verify staffId exists if provided to prevent foreign key crashes
    let validStaffId = null;
    if (staffId) {
      const staffExists = await prisma.user.findUnique({ where: { id: staffId } });
      if (staffExists) validStaffId = staffId;
    }

    // Normalize serviceId: treat empty string as "not provided" to avoid
    // sending an invalid foreign key value to Prisma
    let validServiceId = null;
    let resolvedPrice = parseFloat(price) || 0;
    if (serviceId) {
      const svc = await prisma.service.findUnique({ where: { id: serviceId } });
      if (svc) {
        validServiceId = serviceId;
        if (!resolvedPrice && svc.price) resolvedPrice = parseFloat(svc.price) || 0;
      }
    }

    const appointment = await prisma.appointment.create({
      data: {
        name: name || (req.user ? req.user.name : ""),
        phone,
        email: email || (req.user ? req.user.email : ""),
        service,
        date,
        time,
        notes,
        clientId,
        serviceId: validServiceId,
        staffId: validStaffId,
        price: resolvedPrice,
        sessionId: sessionId || null,
      },
      include: {
        staff: { select: { id: true, name: true } },
        serviceRelation: { select: { id: true, name: true } },
      }
    });

    const mappedAppointment = { 
      ...appointment, 
      _id: appointment.id,
      staffId: appointment.staff ? { ...appointment.staff, _id: appointment.staff.id } : null,
      serviceId: appointment.serviceRelation ? { ...appointment.serviceRelation, _id: appointment.serviceRelation.id } : null,
    };

    (async () => {
      try {
        await sendBookingEmail(mappedAppointment);
        await sendClientBookingEmail(mappedAppointment);
        await sendBookingSMS(mappedAppointment);
        await sendClientBookingSMS(mappedAppointment);
      } catch (notifError) {
        console.error("Background Notification Error:", notifError.message);
      }
    })();

    res.status(201).json(mappedAppointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────

export const getAppointments = async (req, res) => {
  try {
    const includeDeleted = req.query.includeDeleted === 'true';
    const where = {};
    
    if (!includeDeleted) {
      where.isDeleted = false;
    }

    if (req.user) {
      if (req.user.role === "staff") {
        where.staffId = req.user.id;
      } else if (req.user.role === "client") {
        where.OR = [
          { clientId: req.user.id },
          { email: req.user.email }
        ];
      }
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        client: { select: { id: true, name: true, email: true } },
        staff: { select: { id: true, name: true } },
        serviceRelation: { select: { id: true, name: true, price: true } },
        handledBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const mappedAppointments = appointments.map(app => ({
      ...app,
      _id: app.id,
      clientId: app.client ? { ...app.client, _id: app.client.id } : null,
      staffId: app.staff ? { ...app.staff, _id: app.staff.id } : null,
      serviceId: app.serviceRelation ? { ...app.serviceRelation, _id: app.serviceRelation.id } : null,
      handledBy: app.handledBy ? { ...app.handledBy, _id: app.handledBy.id } : null,
    }));

    res.json(mappedAppointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────

export const deleteAppointment = async (req, res) => {
  try {
    const appointment = await prisma.appointment.findUnique({ where: { id: req.params.id } });
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (req.user.role !== "admin" && req.user.role !== "manager") {
      const isMyAppointment =
        (appointment.clientId && appointment.clientId === req.user.id) ||
        appointment.email?.toLowerCase() === req.user.email?.toLowerCase();

      if (!isMyAppointment) {
        return res.status(403).json({ message: "Not authorized to remove this record" });
      }
    }

    // Soft delete: set isDeleted to true
    await prisma.appointment.update({
      where: { id: req.params.id },
      data: { isDeleted: true }
    });
    
    res.json({ message: "Appointment removed from view" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────

export const updateAppointmentStatus = async (req, res) => {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: req.params.id },
      include: { serviceRelation: true }
    });

    if (!appointment || appointment.isDeleted) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const oldStatus = appointment.status;
    const data = {};

    if (req.user.role === "client") {
      const isMyAppointment =
        (appointment.clientId && appointment.clientId === req.user.id) ||
        appointment.email?.toLowerCase() === req.user.email?.toLowerCase();

      if (!isMyAppointment) {
        return res.status(403).json({ message: "Not authorized to modify this reservation" });
      }

      if (req.body.status === "cancelled") {
        data.status = "cancelled";
        if (req.body.cancellationReason) {
          data.cancellationReason = req.body.cancellationReason;
        }
      } else if (req.body.date || req.body.time) {
        if (req.body.date) data.date = req.body.date;
        if (req.body.time) data.time = req.body.time;
      } else {
        return res.status(403).json({ message: "Clients can only cancel or reschedule sessions" });
      }

    } else if (req.user.role === "staff") {
      const isMyAppointment = appointment.staffId && appointment.staffId === req.user.id;

      if (!isMyAppointment) {
        return res.status(403).json({ message: "Not authorized to update this appointment" });
      }

      if (req.body.price !== undefined || req.body.staffId !== undefined) {
        return res.status(403).json({ message: "Staff cannot modify price or assignment" });
      }

      if (req.body.status !== undefined) data.status = req.body.status;

    } else {
      if (req.body.status !== undefined) data.status = req.body.status;
      if (req.body.staffId !== undefined) data.staffId = req.body.staffId || null;

      if (req.body.status === "completed") {
        let finalPrice = appointment.price;

        if (!finalPrice || finalPrice === 0) {
          const svcPrice = parseFloat(appointment.serviceRelation?.price);
          if (!isNaN(svcPrice) && svcPrice > 0) finalPrice = svcPrice;
        }

        if (req.body.price !== undefined && parseFloat(req.body.price) > 0) {
          finalPrice = parseFloat(req.body.price);
        }

        data.price = finalPrice;
        data.paymentStatus = "paid";

        if (!appointment.receiptNo) {
          let receipt = generateReceiptNo();
          const exists = await prisma.appointment.findUnique({ where: { receiptNo: receipt } });
          if (exists) receipt = generateReceiptNo();
          data.receiptNo = receipt;
        }
      } else {
        if (req.body.paymentStatus !== undefined) data.paymentStatus = req.body.paymentStatus;
      }
    }

    if (req.user) data.handledById = req.user.id;

    const updatedAppointment = await prisma.appointment.update({
      where: { id: req.params.id },
      data,
      include: {
        client: { select: { id: true, name: true, email: true } },
        staff: { select: { id: true, name: true } },
        serviceRelation: { select: { id: true, name: true, price: true } },
        handledBy: { select: { id: true, name: true } },
      }
    });

    if (oldStatus !== "approved" && updatedAppointment.status === "approved") {
      (async () => {
        try {
          const mappedForNotif = {
            ...updatedAppointment,
            _id: updatedAppointment.id,
            staffId: updatedAppointment.staff ? { ...updatedAppointment.staff, _id: updatedAppointment.staff.id } : null,
          };
          if (updatedAppointment.email) await sendApprovalEmail(mappedForNotif);
          if (updatedAppointment.phone) await sendClientApprovalSMS(mappedForNotif);
        } catch (err) {
          console.error("Background Status Notification Error:", err.message);
        }
      })();
    }

    res.json({
      ...updatedAppointment,
      _id: updatedAppointment.id,
      clientId: updatedAppointment.client ? { ...updatedAppointment.client, _id: updatedAppointment.client.id } : null,
      staffId: updatedAppointment.staff ? { ...updatedAppointment.staff, _id: updatedAppointment.staff.id } : null,
      serviceId: updatedAppointment.serviceRelation ? { ...updatedAppointment.serviceRelation, _id: updatedAppointment.serviceRelation.id } : null,
      handledBy: updatedAppointment.handledBy ? { ...updatedAppointment.handledBy, _id: updatedAppointment.handledBy.id } : null,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};