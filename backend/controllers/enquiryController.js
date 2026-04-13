import { prisma } from '../config/db.js';
import { sendEnquiryEmail } from '../utils/emailUtils.js';

export const createEnquiry = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    const enquiry = await prisma.enquiry.create({
      data: { name, email, phone, message }
    });
    
    // Send email notification to owner (Background - Non-blocking)
    (async () => {
      try {
        await sendEnquiryEmail({ ...enquiry, _id: enquiry.id });
      } catch (err) {
        console.error('Background Enquiry Notification Error:', err.message);
      }
    })();

    res.status(201).json({ message: 'Enquiry sent successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getEnquiries = async (req, res) => {
  try {
    const enquiries = await prisma.enquiry.findMany({
      orderBy: { createdAt: 'desc' }
    });
    // Map to _id for frontend compatibility
    const mappedEnquiries = enquiries.map(e => ({ ...e, _id: e.id }));
    res.json(mappedEnquiries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteEnquiry = async (req, res) => {
  try {
    const enquiry = await prisma.enquiry.findUnique({ where: { id: req.params.id } });
    if (enquiry) {
      await prisma.enquiry.delete({ where: { id: req.params.id } });
      res.json({ message: 'Enquiry removed' });
    } else {
      res.status(404).json({ message: 'Enquiry not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateEnquiry = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const enquiry = await prisma.enquiry.findUnique({ where: { id: req.params.id } });
    
    if (enquiry) {
      const updatedEnquiry = await prisma.enquiry.update({
        where: { id: req.params.id },
        data: {
          status: status || enquiry.status,
          notes: notes || enquiry.notes,
        }
      });
      res.json({ ...updatedEnquiry, _id: updatedEnquiry.id });
    } else {
      res.status(404).json({ message: 'Enquiry not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
