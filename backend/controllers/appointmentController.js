import Appointment from '../models/Appointment.js';
import { sendBookingEmail } from '../utils/emailUtils.js';

export const createAppointment = async (req, res) => {
  try {
    const { name, phone, email, service, date, time, notes } = req.body;
    const appointment = new Appointment({ name, phone, email, service, date, time, notes });
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
    const appointments = await Appointment.find({}).sort({ date: -1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (appointment) {
      await appointment.deleteOne();
      res.json({ message: 'Appointment removed' });
    } else {
      res.status(404).json({ message: 'Appointment not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
