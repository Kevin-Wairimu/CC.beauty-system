import mongoose from 'mongoose';

const enquirySchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  message: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['new', 'in-progress', 'resolved', 'closed'],
    default: 'new' 
  },
  notes: { type: String }
}, {
  timestamps: true
});

const Enquiry = mongoose.model('Enquiry', enquirySchema);

export default Enquiry;
