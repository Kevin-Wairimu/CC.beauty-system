import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Calendar, Clock, CheckCircle2, User, Phone, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

const StaffDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyAppointments = async () => {
    try {
      const { data } = await api.get("/appointments");
      // Backend already filters by staffId if user is staff
      setAppointments(data);
      setLoading(false);
    } catch {
      toast.error("Failed to load your schedule");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyAppointments();
  }, []);

  const handleComplete = async (id) => {
    try {
      await api.put(`/appointments/${id}/status`, { status: 'completed' });
      setAppointments(appointments.map(app => app._id === id ? { ...app, status: 'completed' } : app));
      toast.success('Service marked as completed');
    } catch {
      toast.error('Update failed');
    }
  };

  return (
    <div className="bg-[#0F0F0F] min-h-screen text-white py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-16 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Sparkles className="text-gold h-5 w-5 animate-pulse" />
            <span className="text-xs uppercase tracking-[0.5em] text-gold font-black">Staff Portal</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold uppercase tracking-widest text-white mb-4">
            Hello, <span className="text-gold italic">{user?.name.split(" ")[0]}</span>
          </h1>
          <p className="text-gray-400 text-sm uppercase tracking-widest font-light">Your Handcrafted Schedule for Today</p>
        </header>

        {loading ? (
          <div className="py-20 text-center text-gold animate-pulse uppercase tracking-[0.5em] font-black">Syncing Schedule...</div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center gap-4 mb-8">
              <Calendar className="text-gold h-6 w-6" />
              <h2 className="text-2xl font-serif font-bold uppercase tracking-widest text-white">Assigned Rituals</h2>
            </div>

            {appointments.length === 0 ? (
              <div className="glass-panel p-20 text-center border-white/5">
                <p className="text-gray-500 italic">No assigned appointments found for today.</p>
              </div>
            ) : (
              appointments.map((app) => (
                <motion.div
                  key={app._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`glass-panel p-8 bg-[#18181B] border-gold/10 hover:border-gold/30 transition-all ${app.status === 'completed' ? 'opacity-50' : ''}`}
                >
                  <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                    <div className="space-y-4 flex-grow">
                      <div className="flex justify-between items-start">
                        <h3 className="text-2xl font-bold text-white tracking-wide uppercase">{app.service}</h3>
                        <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest border ${
                          app.status === 'completed' ? 'border-green-500/30 text-green-500' : 'border-gold/30 text-gold'
                        }`}>
                          {app.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <p className="text-[9px] uppercase tracking-widest text-gray-500 font-black">Guest Details</p>
                          <div className="flex items-center gap-3">
                            <User className="h-4 w-4 text-gold" />
                            <span className="text-white font-bold">{app.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Phone className="h-4 w-4 text-gold" />
                            <span className="text-gray-400 text-sm">{app.phone}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-[9px] uppercase tracking-widest text-gray-500 font-black">Schedule</p>
                          <div className="flex items-center gap-3 text-white">
                            <Calendar className="h-4 w-4 text-gold" />
                            <span>{app.date}</span>
                          </div>
                          <div className="flex items-center gap-3 text-white">
                            <Clock className="h-4 w-4 text-gold" />
                            <span>{app.time}</span>
                          </div>
                        </div>
                      </div>

                      {app.notes && (
                        <div className="mt-4 p-4 bg-black/40 border-l-2 border-gold italic text-gray-400 text-sm">
                          "{app.notes}"
                        </div>
                      )}
                    </div>

                    {app.status !== 'completed' && (
                      <button
                        onClick={() => handleComplete(app._id)}
                        className="w-full md:w-auto bg-green-600 hover:bg-green-500 text-white px-8 py-4 uppercase text-[10px] font-black tracking-widest transition-all flex items-center justify-center gap-3"
                      >
                        <CheckCircle2 className="h-5 w-5" /> Mark Completed
                      </button>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffDashboard;
