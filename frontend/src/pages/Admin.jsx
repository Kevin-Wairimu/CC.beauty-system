import React, { useState, useEffect, useMemo } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, Trash2, CheckCircle, Clock, User, Phone, 
  MessageSquare, Plus, Edit, X, Layout, Shield, CheckCircle2,
  TrendingUp, DollarSign, FileText, PieChart, Activity,
  ChevronRight, ArrowUpRight, Search, Download
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [services, setServices] = useState([]);
  const [users, setUsers] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('appointments');
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceData, setServiceFormData] = useState({ 
    name: '', category: '', price: '', description: '', duration: '', image: '' 
  });

  // Enquiry Update State
  const [editingEnquiry, setEditingEnquiry] = useState(null);
  const [enquiryUpdateData, setEnquiryUpdateData] = useState({ status: '', notes: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appRes, enqRes, serRes] = await Promise.all([
        api.get('/appointments').catch(() => ({ data: [] })),
        api.get('/enquiry').catch(() => ({ data: [] })),
        api.get('/services').catch(() => ({ data: [] }))
      ]);
      
      setAppointments(Array.isArray(appRes.data) ? appRes.data : []);
      setEnquiries(Array.isArray(enqRes.data) ? enqRes.data : []);
      setServices(Array.isArray(serRes.data) ? serRes.data : []);
      
      const userRole = user?.role?.toLowerCase();
      if (userRole === 'admin' || userRole === 'manager') {
        const userRes = await api.get('/auth/users').catch(() => ({ data: [] }));
        const allUsers = Array.isArray(userRes.data) ? userRes.data : [];
        setUsers(allUsers);
        setStaff(allUsers.filter(u => ['staff', 'manager', 'admin'].includes(u.role?.toLowerCase())));
      }
      
      setLoading(false);
    } catch (error) {
      console.error('FetchData Error:', error);
      toast.error('Syncing error. Please refresh.');
      setLoading(false);
    }
  };

  useEffect(() => {
    const userRole = user?.role?.toLowerCase();
    if (userRole === 'admin' || userRole === 'manager') {
      fetchData();
    }
  }, [user]);

  // --- ANALYTICS CALCULATIONS ---
  const stats = useMemo(() => {
    const totalRevenue = appointments
      .filter(app => app.status === 'completed')
      .reduce((sum, app) => sum + (parseFloat(app.price) || 0), 0);
    
    const pendingRevenue = appointments
      .filter(app => app.status === 'approved' || app.status === 'pending')
      .reduce((sum, app) => sum + (parseFloat(app.price) || 0), 0);

    return {
      totalRevenue,
      pendingRevenue,
      completionRate: appointments.length ? ((appointments.filter(a => a.status === 'completed').length / appointments.length) * 100).toFixed(1) : 0,
      activeEnquiries: enquiries.filter(e => e.status !== 'closed' && e.status !== 'resolved').length
    };
  }, [appointments, enquiries]);

  // --- HANDLERS ---
  const getRelevantStaff = (serviceName) => {
    const selectedService = services.find(s => s.name === serviceName);
    if (!selectedService) return staff;
    
    const category = selectedService.category.toUpperCase();
    return staff.filter(s => 
      s.specialization?.some(spec => spec.toUpperCase() === category)
    );
  };

  const handleUpdateRole = async (userId, role) => {
    try {
      await api.put(`/auth/users/${userId}/role`, { role });
      toast.success('Role Updated');
      fetchData();
    } catch {
      toast.error('Role update failed');
    }
  };

  const handleUpdateSpecialization = async (userId, specializationString) => {
    const specialization = specializationString.split(',').map(s => s.trim().toUpperCase()).filter(s => s !== '');
    try {
      await api.put(`/auth/users/${userId}/role`, { specialization });
      toast.success('Specializations Updated');
      fetchData();
    } catch {
      toast.error('Update failed');
    }
  };

  const handleAssignStaff = async (appointmentId, staffId) => {
    try {
      await api.put(`/appointments/${appointmentId}/status`, { staffId });
      fetchData();
      toast.success('Provider Assigned');
    } catch {
      toast.error('Assignment failed');
    }
  };

  const handleApprove = async (appointmentId) => {
    try {
      await api.put(`/appointments/${appointmentId}/status`, { status: 'approved' });
      setAppointments(appointments.map(app => app._id === appointmentId ? { ...app, status: 'approved' } : app));
      toast.success('Ritual Approved');
    } catch {
      toast.error('Approval failed');
    }
  };

  const handleComplete = async (appointmentId, price) => {
    const finalPrice = window.prompt("Enter final amount paid (KSh):", price || "0");
    if (finalPrice === null) return;

    try {
      await api.put(`/appointments/${appointmentId}/status`, { 
        status: 'completed', 
        paymentStatus: 'paid',
        price: parseFloat(finalPrice) 
      });
      fetchData();
      toast.success('Masterpiece Finished & Paid');
    } catch {
      toast.error('Completion failed');
    }
  };

  const handleDeleteAppointment = async (id) => {
    if (!window.confirm('Erase this record from history?')) return;
    try {
      await api.delete(`/appointments/${id}`);
      setAppointments(appointments.filter(a => a._id !== id));
      toast.success('Record Erased');
    } catch { toast.error('Delete failed'); }
  };


  // Enquiry Handlers
  const handleUpdateEnquiry = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/enquiry/${editingEnquiry._id}`, enquiryUpdateData);
      toast.success('Enquiry updated');
      setEditingEnquiry(null);
      fetchData();
    } catch { toast.error('Update failed'); }
  };

  const handleDeleteEnquiry = async (id) => {
    if (!window.confirm('Delete this inquiry?')) return;
    try {
      await api.delete(`/enquiry/${id}`);
      setEnquiries(enquiries.filter(e => e._id !== id));
      toast.success('Enquiry removed');
    } catch { toast.error('Delete failed'); }
  };

  // Service Handlers
  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingService) {
        await api.put(`/services/${editingService._id}`, serviceData);
        toast.success('Menu Updated');
      } else {
        await api.post('/services', serviceData);
        toast.success('New Ritual Added');
      }
      fetchData();
      setShowServiceForm(false);
      setEditingService(null);
    } catch { toast.error('Save failed'); }
  };

  const deleteService = async (id) => {
    if (!window.confirm('Remove this service from menu?')) return;
    try {
      await api.delete(`/services/${id}`);
      setServices(services.filter(s => s._id !== id));
      toast.success('Service Removed');
    } catch { toast.error('Delete failed'); }
  };

  if (authLoading) return <div className="h-screen flex items-center justify-center bg-black text-gold font-black uppercase tracking-[0.5em] animate-pulse">Authenticating Portal...</div>;

  const userRole = user?.role?.toLowerCase();
  if (userRole !== 'admin' && userRole !== 'manager') {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black text-gold p-4 text-center">
        <Shield className="h-20 w-20 mb-8 opacity-20" />
        <h2 className="text-3xl font-serif font-bold uppercase tracking-widest text-white mb-4 font-serif">Access Restricted</h2>
        <p className="text-gray-500 uppercase tracking-widest text-xs mb-10">This hub is for Director & Management eyes only.</p>
        <a href="/" className="btn-gold !px-10 !py-4 text-xs font-black tracking-widest">Return to Sanctuary</a>
      </div>
    );
  }

  return (
    <div className="bg-[#0A0A0A] min-h-screen text-white pt-10 pb-20 px-4 md:px-10">
      <div className="max-w-[1600px] mx-auto">
        
        {/* TOP HUD */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-8 border-b border-gold/10 pb-12">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="h-12 w-12 bg-gold/10 border border-gold/30 flex items-center justify-center">
                <Layout className="text-gold h-6 w-6" />
              </div>
              <div>
                <h1 className="text-4xl font-serif font-bold uppercase tracking-tighter">
                  Studio <span className="text-gold italic">Director</span>
                </h1>
                <p className="text-[10px] text-gray-500 uppercase font-black tracking-[0.4em]">Operational Intelligence Suite</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full lg:w-auto">
            {[
              { label: 'Revenue', val: `KSh ${stats.totalRevenue.toLocaleString()}`, icon: <DollarSign className="h-4 w-4" /> },
              { label: 'Pending', val: `KSh ${stats.pendingRevenue.toLocaleString()}`, icon: <Activity className="h-4 w-4" /> },
              { label: 'Active Enq', val: stats.activeEnquiries, icon: <MessageSquare className="h-4 w-4" /> },
              { label: 'Rate', val: `${stats.completionRate}%`, icon: <TrendingUp className="h-4 w-4" /> }
            ].map((s, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/5 p-4 min-w-[140px] group hover:border-gold/30 transition-all">
                <div className="flex items-center gap-2 text-gray-500 mb-1 group-hover:text-gold transition-colors">
                  {s.icon}
                  <span className="text-[9px] uppercase font-black tracking-widest">{s.label}</span>
                </div>
                <p className="text-xl font-bold font-serif text-white">{s.val}</p>
              </div>
            ))}
          </div>
        </div>

        {/* NAVIGATION */}
        <div className="flex gap-2 bg-black/40 p-1 mb-12 border border-white/5 w-fit overflow-x-auto no-scrollbar max-w-full">
          {['appointments', 'reports', 'enquiries', 'services', userRole === 'admin' && 'team'].filter(Boolean).map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-10 py-4 uppercase tracking-[0.2em] text-[10px] font-black transition-all whitespace-nowrap ${activeTab === tab ? 'bg-gold text-white shadow-2xl' : 'text-gray-500 hover:text-gold'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-40 text-center">
            <div className="w-20 h-20 border-t-2 border-gold rounded-full animate-spin mx-auto mb-8" />
            <p className="text-gold uppercase tracking-[0.5em] text-xs font-black">Syncing Database Integrity...</p>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            
            {/* APPOINTMENTS TAB */}
            {activeTab === 'appointments' && (
              <div className="space-y-6">
                {appointments.length === 0 ? (
                  <div className="glass-panel p-32 text-center text-gray-600 italic uppercase text-[10px] tracking-[0.5em]">No rituals currently queued.</div>
                ) : (
                  appointments.map((app) => (
                    <div key={app._id} className={`glass-panel p-8 flex flex-col xl:flex-row justify-between gap-8 group hover:border-gold/40 transition-all duration-700 bg-[#121212] ${app.status === 'completed' ? 'opacity-40 border-white/5' : 'border-white/10'}`}>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 flex-grow">
                        <div className="space-y-2">
                          <span className="text-[9px] uppercase tracking-widest text-gold font-black flex items-center gap-2"><User className="h-3 w-3" /> The Guest</span>
                          <h3 className="text-2xl font-bold text-white tracking-tight">{app.name}</h3>
                          <p className="text-xs text-gray-400 font-medium">{app.phone} <span className="mx-2 text-white/10">|</span> {app.email}</p>
                        </div>
                        <div className="space-y-2">
                          <span className="text-[9px] uppercase tracking-widest text-gold font-black flex items-center gap-2"><PieChart className="h-3 w-3" /> Service Selection</span>
                          <h3 className="text-2xl font-serif text-gray-200">{app.service}</h3>
                          <div className="pt-2">
                            <select 
                              value={app.staffId?._id || ''} 
                              onChange={(e) => handleAssignStaff(app._id, e.target.value)}
                              className="bg-black border border-white/10 text-gold text-[10px] uppercase font-black px-4 py-2 outline-none focus:border-gold transition-all w-full"
                            >
                              <option value="">Unassigned</option>
                              {getRelevantStaff(app.service).map(s => (
                                <option key={s._id} value={s._id}>
                                  {s.name} ({s.specialization?.join(', ')})
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <span className="text-[9px] uppercase tracking-widest text-gold font-black flex items-center gap-2"><Calendar className="h-3 w-3" /> Scheduled Time</span>
                          <h3 className="text-2xl font-light text-gray-200">{app.date}</h3>
                          <p className="text-xs text-gray-400 flex items-center gap-2 uppercase font-black tracking-widest"><Clock className="h-3 w-3 text-gold" /> {app.time}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 border-t xl:border-t-0 xl:border-l border-white/5 pt-6 xl:pt-0 xl:pl-10">
                        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                          {app.status === 'pending' && (
                            <button onClick={() => handleApprove(app._id)} className="flex-1 sm:flex-none bg-gold text-white px-8 py-3 text-[10px] font-black uppercase hover:brightness-110 transition-all flex items-center justify-center gap-2">
                              <CheckCircle className="h-4 w-4" /> Confirm
                            </button>
                          )}
                          {app.status === 'approved' && (
                            <button onClick={() => handleComplete(app._id, app.price)} className="flex-1 sm:flex-none bg-green-600 text-white px-8 py-3 text-[10px] font-black uppercase hover:bg-green-500 transition-all flex items-center justify-center gap-2">
                              <CheckCircle2 className="h-4 w-4" /> Mark Paid
                            </button>
                          )}
                          <button onClick={() => handleDeleteAppointment(app._id)} className="bg-red-500/10 text-red-500 border border-red-500/20 p-3 hover:bg-red-500 hover:text-white transition-all"><Trash2 className="h-5 w-5" /></button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* REPORTS TAB */}
            {activeTab === 'reports' && (
              <div className="space-y-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Revenue Card */}
                  <div className="glass-panel p-10 bg-gradient-to-br from-[#121212] to-black border-gold/20">
                    <div className="flex justify-between items-start mb-10">
                      <div>
                        <h2 className="text-3xl font-serif font-bold text-white uppercase tracking-widest">Financial Analytics</h2>
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] mt-2">Revenue & Payment Intelligence</p>
                      </div>
                      <div className="h-14 w-14 bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
                        <TrendingUp className="h-8 w-8" />
                      </div>
                    </div>
                    
                    <div className="space-y-8">
                      <div className="flex justify-between items-end border-b border-white/5 pb-6">
                        <span className="text-xs text-gray-400 font-black uppercase tracking-widest">Realized Revenue (Paid)</span>
                        <span className="text-4xl font-serif font-black text-gold">KSh {stats.totalRevenue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-end border-b border-white/5 pb-6">
                        <span className="text-xs text-gray-400 font-black uppercase tracking-widest">Projected Pipeline (Confirmed)</span>
                        <span className="text-2xl font-serif text-white/60">KSh {stats.pendingRevenue.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Operational Summary */}
                  <div className="glass-panel p-10 bg-[#121212] border-white/10">
                    <h3 className="text-xs font-black uppercase tracking-widest text-gold mb-8">Performance Overview</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="p-6 bg-black/40 border border-white/5">
                        <p className="text-[9px] text-gray-500 font-black uppercase mb-2">Total Bookings</p>
                        <p className="text-3xl font-bold">{appointments.length}</p>
                      </div>
                      <div className="p-6 bg-black/40 border border-white/5">
                        <p className="text-[9px] text-gray-500 font-black uppercase mb-2">Completed</p>
                        <p className="text-3xl font-bold text-green-500">{appointments.filter(a => a.status === 'completed').length}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* History Table */}
                <div className="glass-panel overflow-hidden border-white/10">
                  <div className="p-8 border-b border-white/5 flex justify-between items-center">
                    <h3 className="text-xl font-serif font-bold uppercase tracking-widest">Transaction History</h3>
                    <button className="text-[9px] font-black uppercase tracking-widest text-gold flex items-center gap-2 border border-gold/30 px-4 py-2 hover:bg-gold hover:text-black transition-all">
                      <Download className="h-3 w-3" /> Export Ledger
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-black/60 text-[9px] uppercase font-black tracking-widest text-gray-500">
                        <tr>
                          <th className="p-6">Date</th>
                          <th className="p-6">Client</th>
                          <th className="p-6">Service</th>
                          <th className="p-6">Status</th>
                          <th className="p-6 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {appointments.map((app) => (
                          <tr key={app._id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="p-6 text-xs text-gray-400">{app.date}</td>
                            <td className="p-6 font-bold text-sm">{app.name}</td>
                            <td className="p-6 text-xs italic">{app.service}</td>
                            <td className="p-6">
                              <span className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest border ${
                                app.status === 'completed' ? 'border-green-500/30 text-green-500' : 
                                app.status === 'approved' ? 'border-gold/30 text-gold' : 'border-white/10 text-gray-500'
                              }`}>
                                {app.status}
                              </span>
                            </td>
                            <td className="p-6 text-right font-serif font-bold">KSh {parseFloat(app.price || 0).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ENQUIRIES TAB (CRUD) */}
            {activeTab === 'enquiries' && (
              <div className="grid grid-cols-1 gap-6">
                {enquiries.length === 0 ? (
                  <div className="glass-panel p-32 text-center text-gray-600 italic uppercase text-[10px] tracking-[0.5em]">The message box is empty.</div>
                ) : (
                  enquiries.map((enq) => (
                    <div key={enq._id} className={`glass-panel p-10 bg-[#121212] border-white/5 hover:border-gold/20 transition-all duration-500`}>
                      <div className="flex flex-col md:flex-row justify-between gap-8 mb-8">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest border ${
                              enq.status === 'resolved' ? 'border-green-500 text-green-500' : 'border-gold text-gold'
                            }`}>
                              {enq.status || 'new'}
                            </span>
                            <h3 className="text-3xl font-serif font-bold text-white">{enq.name}</h3>
                          </div>
                          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{enq.email} <span className="mx-2 text-white/10">|</span> {enq.phone}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => { setEditingEnquiry(enq); setEnquiryUpdateData({ status: enq.status || 'new', notes: enq.notes || '' }); }} className="bg-white/5 border border-white/10 p-4 hover:bg-gold hover:text-black transition-all"><Edit className="h-5 w-5" /></button>
                          <button onClick={() => handleDeleteEnquiry(enq._id)} className="bg-red-500/10 text-red-500 border border-red-500/20 p-4 hover:bg-red-500 hover:text-white transition-all"><Trash2 className="h-5 w-5" /></button>
                        </div>
                      </div>
                      <div className="bg-black/60 p-8 border-l-4 border-gold shadow-inner text-gray-300 italic text-lg font-light leading-relaxed mb-6">
                        "{enq.message}"
                      </div>
                      {enq.notes && (
                        <div className="p-4 bg-gold/5 border border-gold/10 rounded">
                          <p className="text-[9px] uppercase font-black text-gold mb-1">Internal Notes</p>
                          <p className="text-xs text-gray-400">{enq.notes}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* SERVICES TAB (CRUD) */}
            {activeTab === 'services' && (
              <div className="space-y-10">
                <div className="flex justify-end">
                  <button onClick={() => { setEditingService(null); setServiceFormData({ name: '', category: '', price: '', description: '', duration: '', image: '' }); setShowServiceForm(true); }} className="bg-gold text-white px-8 py-4 text-xs font-black uppercase tracking-widest flex items-center gap-3 hover:scale-105 transition-all shadow-2xl shadow-gold/20">
                    <Plus className="h-4 w-4" /> Add Bespoke Ritual
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {services.map((s) => (
                    <div key={s._id} className="glass-panel p-8 bg-[#121212] border-white/10 relative overflow-hidden group hover:border-gold/40 transition-all duration-500">
                      {s.image && (
                        <div className="absolute top-0 right-0 w-32 h-32 opacity-10 group-hover:opacity-20 transition-opacity">
                          <img src={s.image} alt="" className="w-full h-full object-cover grayscale" />
                        </div>
                      )}
                      <div className="flex justify-between items-start mb-8 relative z-10">
                        <span className="bg-gold/10 text-gold text-[9px] font-black px-4 py-1.5 uppercase tracking-widest border border-gold/30">{s.category}</span>
                        <span className="text-2xl font-serif font-black text-gold">KSh {s.price}</span>
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2 relative z-10">{s.name}</h3>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-10">{s.duration || '60 mins'}</p>
                      <div className="flex gap-2 relative z-10">
                        <button onClick={() => { setEditingService(s); setServiceFormData(s); setShowServiceForm(true); }} className="flex-1 bg-white/5 border border-white/10 py-3 flex justify-center hover:bg-gold hover:text-black transition-all"><Edit className="h-4 w-4" /></button>
                        <button onClick={() => deleteService(s._id)} className="flex-1 bg-red-500/5 border border-red-500/10 py-3 flex justify-center hover:bg-red-500 hover:text-white transition-all"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TEAM TAB (CRUD) */}
            {activeTab === 'team' && userRole === 'admin' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-8">
                  <div>
                    <h2 className="text-3xl font-serif font-bold uppercase tracking-widest text-gold">Talent Hub</h2>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] mt-2">Manage permissions and specializations</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <input 
                        type="text" 
                        placeholder="Search by name or email..." 
                        className="bg-black/40 border border-white/10 pl-12 pr-6 py-3 text-[10px] uppercase tracking-widest text-white outline-none focus:border-gold w-[300px]"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {users.map((u) => (
                    <div key={u._id} className="glass-panel p-10 bg-[#121212] border-white/5 hover:border-gold/30 transition-all group">
                      <div className="flex items-center gap-6 mb-10">
                        <div className={`h-16 w-16 border flex items-center justify-center transition-all duration-500 ${u.role !== 'client' ? 'bg-gold text-black border-gold' : 'bg-gold/10 text-gold border-gold/20'}`}>
                          <User className="h-8 w-8" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-white tracking-tighter">{u.name}</h3>
                          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{u.email}</p>
                          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-gold mt-1 block">{u.role}</span>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-3">
                          <span className="text-[9px] uppercase tracking-widest text-gold font-black block">Access Authorization</span>
                          <div className="grid grid-cols-2 gap-2">
                            {['client', 'staff', 'manager', 'admin'].map((role) => (
                              <button
                                key={role}
                                onClick={() => handleUpdateRole(u._id, role)}
                                disabled={role === 'admin' && user._id !== u._id}
                                className={`py-2.5 text-[8px] font-black uppercase tracking-widest border transition-all ${u.role === role ? 'bg-gold text-black border-gold' : 'border-white/10 text-gray-500 hover:border-gold/50'}`}
                              >
                                {role}
                              </button>
                            ))}
                          </div>
                        </div>

                        {u.role !== 'client' && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-6 border-t border-white/5 space-y-4">
                            <span className="text-[9px] uppercase tracking-widest text-gold font-black block">Specialist Portfolio</span>
                            <input 
                              type="text"
                              defaultValue={u.specialization?.join(', ')}
                              onBlur={(e) => handleUpdateSpecialization(u._id, e.target.value)}
                              placeholder="e.g. NAILS, WIGS, MAKEUP"
                              className="w-full bg-black/60 border border-white/10 p-4 text-[11px] text-white outline-none focus:border-gold transition-all uppercase tracking-widest"
                            />
                            <p className="text-[8px] text-gray-600 uppercase font-black tracking-tighter">Enter categories matching the Menu (comma separated)</p>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </motion.div>
        )}
      </div>

      {/* SERVICE MODAL */}
      <AnimatePresence>
        {showServiceForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#111111] border-2 border-gold/30 p-10 md:p-16 w-full max-w-xl shadow-[0_0_150px_rgba(0,0,0,1)]">
              <div className="flex justify-between items-start mb-12">
                <div>
                  <h2 className="text-4xl font-serif font-bold uppercase tracking-widest text-gold">{editingService ? 'Refine Ritual' : 'New Collection'}</h2>
                  <p className="text-[10px] uppercase tracking-[0.4em] text-gray-500 font-black mt-2">Curating the Elite Experience</p>
                </div>
                <button onClick={() => setShowServiceForm(false)} className="p-4 bg-white/5 hover:bg-gold hover:text-black transition-all rounded-full"><X className="h-6 w-6" /></button>
              </div>
              <form onSubmit={handleServiceSubmit} className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-widest text-gold font-black">Ritual Title</label>
                  <input required value={serviceData.name} onChange={(e) => setServiceFormData({...serviceData, name: e.target.value})} className="w-full bg-black border-b border-white/10 p-4 outline-none focus:border-gold transition-all text-white text-xl font-light" placeholder="e.g. Diamond Glow Facial" />
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-widest text-gold font-black">Category</label>
                    <input required value={serviceData.category} onChange={(e) => setServiceFormData({...serviceData, category: e.target.value})} className="w-full bg-black border-b border-white/10 p-4 outline-none focus:border-gold transition-all text-white font-light" placeholder="e.g. FACIAL" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-widest text-gold font-black">Duration</label>
                    <input required value={serviceData.duration} onChange={(e) => setServiceFormData({...serviceData, duration: e.target.value})} className="w-full bg-black border-b border-white/10 p-4 outline-none focus:border-gold transition-all text-white font-light" placeholder="e.g. 90 Mins" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-widest text-gold font-black">Investment (KSh)</label>
                    <input required value={serviceData.price} onChange={(e) => setServiceFormData({...serviceData, price: e.target.value})} className="w-full bg-black border-b border-white/10 p-4 outline-none focus:border-gold transition-all text-white font-light" placeholder="e.g. 5000" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-widest text-gold font-black">Image URL</label>
                    <input value={serviceData.image} onChange={(e) => setServiceFormData({...serviceData, image: e.target.value})} className="w-full bg-black border-b border-white/10 p-4 outline-none focus:border-gold transition-all text-white font-light" placeholder="https://..." />
                  </div>
                </div>
                <button type="submit" className="w-full bg-gold text-white py-6 text-lg font-black uppercase tracking-[0.5em] shadow-2xl shadow-gold/20 hover:scale-[1.02] transition-all">Confirm Menu Update</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ENQUIRY MODAL */}
      <AnimatePresence>
        {editingEnquiry && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#111111] border-2 border-gold/30 p-10 w-full max-w-lg shadow-2xl">
              <h2 className="text-2xl font-serif font-bold uppercase tracking-widest text-gold mb-10 text-center">Manage Enquiry</h2>
              <form onSubmit={handleUpdateEnquiry} className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-widest text-gold font-black">Resolution Status</label>
                  <select 
                    value={enquiryUpdateData.status} 
                    onChange={(e) => setEnquiryUpdateData({...enquiryUpdateData, status: e.target.value})}
                    className="w-full bg-black border border-white/10 p-4 text-white uppercase tracking-widest text-xs"
                  >
                    <option value="new">New Inquiry</option>
                    <option value="in-progress">Action Taken</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-widest text-gold font-black">Internal Resolution Notes</label>
                  <textarea 
                    value={enquiryUpdateData.notes} 
                    onChange={(e) => setEnquiryUpdateData({...enquiryUpdateData, notes: e.target.value})}
                    className="w-full bg-black border border-white/10 p-4 text-white text-sm min-h-[150px] outline-none focus:border-gold"
                    placeholder="Describe action taken or notes for the team..."
                  />
                </div>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setEditingEnquiry(null)} className="flex-1 border border-white/10 py-4 uppercase text-[10px] font-black tracking-widest">Cancel</button>
                  <button type="submit" className="flex-1 bg-gold text-white py-4 uppercase text-[10px] font-black tracking-widest">Update Record</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Admin;
