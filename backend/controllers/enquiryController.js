import Enquiry from '../models/Enquiry.js';
import { sendEnquiryEmail } from '../utils/emailUtils.js';

export const createEnquiry = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    const enquiry = new Enquiry({ name, email, phone, message });
    await enquiry.save();
    
    // Send email notification to owner
    await sendEnquiryEmail(enquiry);

    res.status(201).json({ message: 'Enquiry sent successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find({}).sort({ createdAt: -1 });
    res.json(enquiries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteEnquiry = async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);
    if (enquiry) {
      await enquiry.deleteOne();
      res.json({ message: 'Enquiry removed' });
    } else {
      res.status(404).json({ message: 'Enquiry not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
