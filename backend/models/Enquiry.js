import mongoose from 'mongoose';

const enquirySchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  message: { type: String, required: true }
}, {
  timestamps: true
});

const Enquiry = mongoose.model('Enquiry', enquirySchema);

export default Enquiry;
