import Appointment from '../models/Appointment.js';
import { sendBookingEmail, sendApprovalEmail, sendClientBookingEmail } from '../utils/emailUtils.js';
import { sendBookingSMS, sendClientBookingSMS, sendClientApprovalSMS } from '../utils/smsUtils.js';

export const createAppointment = async (req, res) => {
  try {
    const { name, phone, email, service, date, time, notes, serviceId, staffId, price } = req.body;
    
    // User must be logged in
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required to book a session.' });
    }

    const clientId = req.user._id;

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
      staffId,
      price: price || 0
    });
    
    const createdAppointment = await appointment.save();
    
    // Populate fields for notifications (name instead of ID)
    const populatedAppointment = await Appointment.findById(createdAppointment._id)
      .populate('staffId', 'name')
      .populate('serviceId', 'name');

    // --- NOTIFICATIONS ---
    try {
      // 1. Notify Business (Email + SMS)
      await sendBookingEmail(populatedAppointment);
      await sendBookingSMS(populatedAppointment);
      
      // 2. Notify Guest (Email + SMS)
      await sendClientBookingEmail(populatedAppointment);
      await sendClientBookingSMS(populatedAppointment);
    } catch (notifError) {
      console.error('Notification logic failed:', notifError.message);
    }

    res.status(201).json(createdAppointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAppointments = async (req, res) => {
  try {
    let query = {};
    
    // Logic: 
    // Admin/Manager: see all
    // Staff: see assigned (staffId)
    // Client: see own (clientId or email)
    
    if (req.user) {
      if (req.user.role === 'staff') {
        query = { staffId: req.user._id };
      } else if (req.user.role === 'client') {
        query = { $or: [{ clientId: req.user._id }, { email: req.user.email }] };
      }
    }

    const appointments = await Appointment.find(query)
      .populate('clientId', 'name email')
      .populate('staffId', 'name')
      .populate('handledBy', 'name')
      .sort({ createdAt: -1 });
      
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (appointment) {
      // Permission: Only Admin or the owner can delete
      await appointment.deleteOne();
      res.json({ message: 'Appointment removed' });
    } else {
      res.status(404).json({ message: 'Appointment not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update appointment status (Approve or Complete)
export const updateAppointmentStatus = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (appointment) {
      const oldStatus = appointment.status;
      
      appointment.status = req.body.status || appointment.status;
      appointment.staffId = req.body.staffId || appointment.staffId;
      
      // Track who handled the approval/change
      if (req.user) {
        appointment.handledBy = req.user._id;
      }
      
      const updatedAppointment = await appointment.save();

      // Trigger approval notifications
      if (oldStatus !== 'approved' && updatedAppointment.status === 'approved' && updatedAppointment.email) {
        const populatedForNotif = await Appointment.findById(updatedAppointment._id).populate('staffId', 'name');
        
        // Notify Guest (Email + SMS)
        await sendApprovalEmail(populatedForNotif);
        await sendClientApprovalSMS(populatedForNotif);
      }

      res.json(updatedAppointment);
    } else {
      res.status(404).json({ message: 'Appointment not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
