import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Calendar, Clock, User, Phone, Mail, MessageSquare, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Booking = () => {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', service: '', date: '', time: '', notes: ''
  });
  const [status, setStatus] = useState({ loading: false, success: false, error: '' });

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data } = await api.get('/services');
        setServices(data);
      } catch {
        setStatus(prev => ({ ...prev, error: 'Failed to load services' }));
      }
    };
    fetchServices();
  }, []);

  // Pre-fill user data if logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: '' });
    try {
      await api.post('/appointments', formData);
      setStatus({ loading: false, success: true, error: '' });
      toast.success('Luxury session requested! We will contact you soon.');
      // Keep name and email if logged in, clear others
      setFormData(prev => ({
        name: user ? user.name : '',
        email: user ? user.email : '',
        phone: '',
        service: '',
        date: '',
        time: '',
        notes: ''
      }));
    } catch (err) {
      const msg = err.response?.data?.message || 'Booking failed';
      setStatus({ loading: false, success: false, error: msg });
      toast.error(msg);
    }
  };

  return (
    <div className="bg-[#1a1a1a] min-h-screen text-white py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Sparkles className="text-gold h-12 w-12 mx-auto mb-4 animate-pulse" />
          <h1 className="text-4xl md:text-6xl font-serif font-bold uppercase tracking-widest text-gold mb-4">Book Your Session</h1>
          <p className="text-gray-300 text-sm md:text-lg italic tracking-[0.2em] font-light">Experience luxury at its finest</p>
        </motion.div>
        
        {status.success && (
          <div className="bg-gold/10 border border-gold/50 p-6 mb-8 text-center rounded-sm">
            <p className="text-gold font-bold uppercase tracking-widest text-lg">Booking successful! We will contact you shortly.</p>
          </div>
        )}
        
        {status.error && (
          <div className="bg-red-500/10 border border-red-500/50 p-6 mb-8 text-center rounded-sm">
            <p className="text-red-500 font-bold uppercase tracking-widest">{status.error}</p>
          </div>
        )}

        <motion.form 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit} 
          className="glass-panel p-6 md:p-16 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 blur-[100px] rounded-full -mr-32 -mt-32"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 mb-8 md:mb-10">
            <div className="relative group">
              <label className="flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-gold mb-2 md:mb-3">
                <User className="h-3 w-3 md:h-4 md:w-4" /> Your Name *
              </label>
              <input 
                type="text" 
                name="name" 
                required 
                value={formData.name} 
                onChange={handleChange} 
                placeholder="Full Name"
                readOnly={!!user}
                className={`w-full bg-black/40 border-b border-white/10 group-focus-within:border-gold px-3 md:px-4 py-3 md:py-4 outline-none transition-all placeholder:text-gray-600 text-white text-base md:text-lg ${user ? 'cursor-not-allowed opacity-70' : ''}`} 
              />
            </div>
            <div className="relative group">
              <label className="flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-gold mb-2 md:mb-3">
                <Phone className="h-3 w-3 md:h-4 md:w-4" /> Phone Number *
              </label>
              <input 
                type="tel" 
                name="phone" 
                required 
                value={formData.phone} 
                onChange={handleChange} 
                placeholder="07XX XXX XXX"
                className="w-full bg-black/40 border-b border-white/10 group-focus-within:border-gold px-3 md:px-4 py-3 md:py-4 outline-none transition-all placeholder:text-gray-600 text-white text-base md:text-lg" 
              />
            </div>
          </div>

          <div className="mb-10 group">
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-gold mb-3">
              <Mail className="h-4 w-4" /> Email Address
            </label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              placeholder="email@example.com"
              readOnly={!!user}
              className={`w-full bg-black/40 border-b border-white/10 group-focus-within:border-gold px-4 py-4 outline-none transition-all placeholder:text-gray-600 text-white text-lg ${user ? 'cursor-not-allowed opacity-70' : ''}`} 
            />
          </div>

          <div className="mb-10 group">
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-gold mb-3">
              <Sparkles className="h-4 w-4" /> Select Your Luxury Service *
            </label>
            <select 
              name="service" 
              required 
              value={formData.service} 
              onChange={handleChange} 
              className="w-full bg-black/40 border-b border-white/10 group-focus-within:border-gold px-4 py-4 outline-none transition-all text-white text-lg appearance-none"
            >
              <option value="" className="bg-[#1a1a1a] text-gray-500">-- Choose a luxury service --</option>
              {services.map((s) => (
                <option key={s._id} value={s.name} className="bg-[#1a1a1a] text-white">
                  {s.name} - {s.price}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
            <div className="group">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-gold mb-3">
                <Calendar className="h-4 w-4" /> Preferred Date *
              </label>
              <input 
                type="date" 
                name="date" 
                required 
                min={new Date().toISOString().split('T')[0]}
                value={formData.date} 
                onChange={handleChange} 
                className="w-full bg-black/40 border-b border-white/10 group-focus-within:border-gold px-4 py-4 outline-none transition-all text-white text-lg" 
              />
            </div>
            <div className="group">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-gold mb-3">
                <Clock className="h-4 w-4" /> Preferred Time *
              </label>
              <input 
                type="time" 
                name="time" 
                required 
                value={formData.time} 
                onChange={handleChange} 
                className="w-full bg-black/40 border-b border-white/10 group-focus-within:border-gold px-4 py-4 outline-none transition-all text-white text-lg" 
              />
            </div>
          </div>

          <div className="mb-12 group">
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-gold mb-3">
              <MessageSquare className="h-4 w-4" /> Special Requests / Notes
            </label>
            <textarea 
              name="notes" 
              rows="4" 
              value={formData.notes} 
              onChange={handleChange} 
              placeholder="Any special requests or details..."
              className="w-full bg-black/40 border border-white/10 group-focus-within:border-gold px-4 py-4 outline-none transition-all placeholder:text-gray-600 text-white text-lg"
            ></textarea>
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit" 
            disabled={status.loading} 
            className="w-full btn-gold text-white font-bold text-xl py-6 uppercase tracking-[0.4em] disabled:opacity-50 shadow-gold/20 shadow-2xl rounded-none"
          >
            {status.loading ? 'Requesting Appointment...' : 'Confirm Reservation'}
          </motion.button>
        </motion.form>
        
        <div className="mt-16 text-center text-gray-400 font-light tracking-[0.2em] uppercase text-xs">
            <p>Our concierge will reach out to confirm your reservation within 30 minutes.</p>
        </div>
      </div>
    </div>
  );
};

export default Booking;
