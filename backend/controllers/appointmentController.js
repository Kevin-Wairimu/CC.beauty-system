import Appointment from '../models/Appointment.js';
import { sendBookingEmail, sendApprovalEmail } from '../utils/emailUtils.js';

export const createAppointment = async (req, res) => {
  try {
    const { name, phone, email, service, date, time, notes, serviceId, staffId } = req.body;
    
    // If logged in, attach clientId
    const clientId = req.user ? req.user._id : null;

    const appointment = new Appointment({ 
      name, phone, email, service, date, time, notes,
      clientId, serviceId, staffId 
    });
    
    const createdAppointment = await appointment.save();
    
    // Send email notification to owner
    await sendBookingEmail(createdAppointment);

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

      // Trigger approval email
      if (oldStatus !== 'approved' && updatedAppointment.status === 'approved' && updatedAppointment.email) {
        await sendApprovalEmail(updatedAppointment);
      }

      res.json(updatedAppointment);
    } else {
      res.status(404).json({ message: 'Appointment not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
