import mongoose from 'mongoose';

const appointmentSchema = mongoose.Schema({
  name: { type: String, required: true }, // Legacy support
  phone: { type: String, required: true }, // Legacy support
  email: { type: String }, // Legacy support
  
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  service: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
    default: 'pending' 
  },
  
  price: { type: Number, default: 0 },
  paymentStatus: { 
    type: String, 
    enum: ['unpaid', 'paid', 'partial'],
    default: 'unpaid' 
  },
  paymentMethod: { type: String },
  receiptNo: { type: String, unique: true, sparse: true },
  
  handledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String }
}, {
  timestamps: true
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;
