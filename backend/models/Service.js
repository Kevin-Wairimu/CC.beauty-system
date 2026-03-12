import mongoose from 'mongoose';

const serviceSchema = mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: String, required: true },
  duration: { type: String, default: '60 mins' },
  assignedStaff: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  image: { type: String },
  description: { type: String }
}, {
  timestamps: true
});

const Service = mongoose.model('Service', serviceSchema);

export default Service;
