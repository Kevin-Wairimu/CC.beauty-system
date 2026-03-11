import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, Trash2, CheckCircle, Clock, User, Phone, 
  MessageSquare, Sparkles, Plus, Edit, X, Layout, Shield
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('appointments');
  
  // Service Form State
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceData, setServiceFormData] = useState({ name: '', category: '', price: '', description: '' });

  const fetchData = async () => {
    try {
      const [appRes, enqRes, serRes] = await Promise.all([
        api.get('/appointments'),
        api.get('/enquiry'),
        api.get('/services')
      ]);
      setAppointments(appRes.data);
      setEnquiries(enqRes.data);
      setServices(serRes.data);
      setLoading(false);
    } catch {
      toast.error('Failed to load dashboard data');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.isAdmin) {
      fetchData();
    }
  }, [user]);

  // Appointment Actions
  const handleDeleteAppointment = async (id) => {
    if (window.confirm('Delete this reservation?')) {
      try {
        await api.delete(`/appointments/${id}`);
        setAppointments(appointments.filter(app => app._id !== id));
        toast.success('Reservation removed');
      } catch {
        toast.error('Failed to delete');
      }
    }
  };

  // Service Actions
  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingService) {
        await api.put(`/services/${editingService._id}`, serviceData);
        toast.success('Service updated');
      } else {
        await api.post('/services', serviceData);
        toast.success('New service added');
      }
      setShowServiceForm(false);
      setEditingService(null);
      setServiceFormData({ name: '', category: '', price: '', description: '' });
      fetchData();
    } catch {
      toast.error('Operation failed');
    }
  };

  const deleteService = async (id) => {
    if (window.confirm('Remove this service from the menu?')) {
      try {
        await api.delete(`/services/${id}`);
        setServices(services.filter(s => s._id !== id));
        toast.success('Service removed');
      } catch {
        toast.error('Failed to delete');
      }
    }
  };

  // Handle Authentication Loading State
  if (authLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#0F0F0F] text-gold">
        <div className="w-16 h-16 border-t-2 border-gold rounded-full animate-spin mb-4"></div>
        <p className="uppercase tracking-[0.5em] text-xs font-black">Verifying Credentials...</p>
      </div>
    );
  }

  if (!user?.isAdmin) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#0F0F0F] text-gold px-4 text-center">
        <Shield className="h-16 w-16 mb-6 opacity-20" />
        <h2 className="text-2xl font-serif font-bold uppercase tracking-[0.3em] mb-4 text-white">Unauthorized Access</h2>
        <p className="text-gray-500 uppercase tracking-widest text-[10px] mb-8">This portal is restricted to CC Beauty Administrators only.</p>
        <a href="/" className="btn-gold !py-3">Return to Studio</a>
      </div>
    );
  }

  return (
    <div className="bg-[#121212] min-h-screen text-white pt-10 pb-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header & Stats */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-gold">
              <div className="bg-gold/10 p-2 border border-gold/20">
                <Layout className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-serif font-bold uppercase tracking-widest">Elite Dashboard</h1>
            </div>
            <p className="text-gray-500 text-xs uppercase tracking-[0.3em]">Studio Management Suite</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full md:w-auto">
            <div className="bg-white/[0.05] border border-white/10 p-4 text-center">
              <p className="text-[10px] text-gray-400 uppercase font-black mb-1">Reservations</p>
              <p className="text-2xl font-bold text-gold">{appointments.length}</p>
            </div>
            <div className="bg-white/[0.05] border border-white/10 p-4 text-center">
              <p className="text-[10px] text-gray-400 uppercase font-black mb-1">Inquiries</p>
              <p className="text-2xl font-bold text-gold">{enquiries.length}</p>
            </div>
            <div className="bg-white/[0.05] border border-white/10 p-4 text-center hidden md:block">
              <p className="text-[10px] text-gray-400 uppercase font-black mb-1">Menu Items</p>
              <p className="text-2xl font-bold text-gold">{services.length}</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-black/40 border border-white/5 p-1 mb-10 w-fit">
          {['appointments', 'enquiries', 'services'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-3 uppercase tracking-widest text-[10px] font-bold transition-all ${activeTab === tab ? 'bg-gold text-white shadow-lg' : 'text-gray-500 hover:text-gold'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-20 text-center text-gold animate-pulse uppercase tracking-widest text-xs">Syncing Studio Data...</div>
        ) : (
          <div className="space-y-6">
            
            {/* APPOINTMENTS TAB */}
            {activeTab === 'appointments' && (
              <div className="grid grid-cols-1 gap-4">
                {appointments.length === 0 ? (
                    <div className="glass-panel p-20 text-center text-gray-500 italic uppercase text-[10px] tracking-widest">No active reservations</div>
                ) : (
                    appointments.map((app) => (
                        <div key={app._id} className="glass-panel p-6 flex flex-col md:flex-row justify-between gap-6 hover:border-gold/40 transition-all">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 flex-grow">
                            <div>
                              <span className="text-[9px] uppercase tracking-widest text-gold font-bold block mb-2">Guest</span>
                              <p className="text-lg font-bold text-white">{app.name}</p>
                              <p className="text-xs text-gray-500 mt-1 flex items-center gap-2"><Phone className="h-3 w-3" /> {app.phone}</p>
                            </div>
                            <div>
                              <span className="text-[9px] uppercase tracking-widest text-gold font-bold block mb-2">Service</span>
                              <p className="text-lg font-light text-gray-200">{app.service}</p>
                              <p className="text-xs italic text-gray-500 mt-1 truncate">"{app.notes || 'No special notes'}"</p>
                            </div>
                            <div>
                              <span className="text-[9px] uppercase tracking-widest text-gold font-bold block mb-2">Schedule</span>
                              <p className="text-lg font-light text-gray-200">{app.date}</p>
                              <p className="text-xs text-gray-500 mt-1 flex items-center gap-2"><Clock className="h-3 w-3" /> {app.time}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <button className="bg-green-500/10 text-green-500 border border-green-500/20 p-3 hover:bg-green-500 hover:text-white transition-all"><CheckCircle className="h-5 w-5" /></button>
                            <button onClick={() => handleDeleteAppointment(app._id)} className="bg-red-500/10 text-red-500 border border-red-500/20 p-3 hover:bg-red-500 hover:text-white transition-all"><Trash2 className="h-5 w-5" /></button>
                          </div>
                        </div>
                      ))
                )}
              </div>
            )}

            {/* SERVICES TAB */}
            {activeTab === 'services' && (
              <div className="space-y-8">
                <div className="flex justify-end">
                  <button 
                    onClick={() => { setEditingService(null); setServiceFormData({ name: '', category: '', price: '', description: '' }); setShowServiceForm(true); }}
                    className="btn-gold !py-2 !px-6 text-[10px] flex items-center gap-2 shadow-[0_0_20px_rgba(255,215,0,0.2)]"
                  >
                    <Plus className="h-4 w-4" /> Add New Service
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.map((s) => (
                    <div key={s._id} className="glass-panel p-6 relative group">
                      <div className="flex justify-between items-start mb-4">
                        <span className="bg-gold/10 text-gold text-[8px] font-bold px-2 py-1 uppercase tracking-widest border border-gold/20">{s.category}</span>
                        <span className="text-xl font-serif font-bold text-gold">{s.price}</span>
                      </div>
                      <h3 className="text-xl font-bold mb-2 text-white">{s.name}</h3>
                      <div className="flex gap-2 mt-6">
                        <button 
                          onClick={() => { setEditingService(s); setServiceFormData(s); setShowServiceForm(true); }}
                          className="flex-1 bg-white/5 border border-white/10 py-2 flex justify-center hover:bg-gold hover:text-white transition-all"
                        ><Edit className="h-4 w-4" /></button>
                        <button 
                          onClick={() => deleteService(s._id)}
                          className="flex-1 bg-red-500/5 border border-red-500/10 py-2 flex justify-center hover:bg-red-500 hover:text-white transition-all"
                        ><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ENQUIRIES TAB */}
            {activeTab === 'enquiries' && (
              <div className="grid grid-cols-1 gap-6">
                {enquiries.length === 0 ? (
                    <div className="glass-panel p-20 text-center text-gray-500 italic uppercase text-[10px] tracking-widest">No active inquiries</div>
                ) : (
                    enquiries.map((enq) => (
                        <div key={enq._id} className="glass-panel p-8 hover:border-gold/30 transition-all">
                          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                            <h3 className="text-2xl font-serif font-bold text-gold">{enq.name}</h3>
                            <div className="flex gap-4 text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                              <span>{enq.email}</span>
                              <span>{enq.phone}</span>
                            </div>
                          </div>
                          <p className="text-gray-300 italic font-light leading-relaxed bg-white/[0.02] p-6 border-l-2 border-gold/30">"{enq.message}"</p>
                        </div>
                      ))
                )}
              </div>
            )}

          </div>
        )}
      </div>

      {/* SERVICE FORM MODAL */}
      {showServiceForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#1a1a1a] border-2 border-gold/30 p-8 md:p-12 w-full max-w-lg shadow-[0_0_100px_rgba(0,0,0,0.8)]">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-serif font-bold uppercase tracking-widest text-gold">{editingService ? 'Edit Service' : 'Add Service'}</h2>
              <button onClick={() => setShowServiceForm(false)} className="p-2 bg-white/5 hover:bg-gold hover:text-black transition-all rounded-full"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleServiceSubmit} className="space-y-8">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gold font-black mb-3">Service Name</label>
                <input required value={serviceData.name} onChange={(e) => setServiceFormData({...serviceData, name: e.target.value})} className="w-full bg-black/50 border-b-2 border-white/10 p-4 outline-none focus:border-gold transition-all text-white" placeholder="e.g. Signature Facial" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gold font-black mb-3">Category</label>
                  <input required value={serviceData.category} onChange={(e) => setServiceFormData({...serviceData, category: e.target.value})} className="w-full bg-black/50 border-b-2 border-white/10 p-4 outline-none focus:border-gold transition-all text-white" placeholder="e.g. NAILS" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gold font-black mb-3">Price Investment</label>
                  <input required value={serviceData.price} onChange={(e) => setServiceFormData({...serviceData, price: e.target.value})} className="w-full bg-black/50 border-b-2 border-white/10 p-4 outline-none focus:border-gold transition-all text-white" placeholder="e.g. 1500/=" />
                </div>
              </div>
              <button type="submit" className="w-full btn-gold !py-5 uppercase tracking-[0.4em] font-black mt-6 shadow-xl shadow-gold/10">Confirm Menu Update</button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Admin;
