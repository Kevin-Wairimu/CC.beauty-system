import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Calendar, Clock, CheckCircle2, User, Phone, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from 'react-hot-toast';

const StaffDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStaffAppointments = async () => {
    try {
      const { data } = await api.get("/appointments");
      // Filter for appointments assigned to this staff member
      const myJobs = data.filter(app => app.staffId?._id === user?._id || app.staffId === user?._id);
      setAppointments(myJobs);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching staff bookings:", error);
      toast.error("Failed to load your schedule");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchStaffAppointments();
  }, [user]);

  const handleComplete = async (appointmentId) => {
    try {
      await api.put(`/appointments/${appointmentId}/status`, { status: 'completed' });
      setAppointments(appointments.map(app => 
        app._id === appointmentId ? { ...app, status: 'completed' } : app
      ));
      toast.success('Service marked as completed!');
    } catch {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="bg-[#0F0F0F] min-h-screen text-white py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="mb-16 text-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center gap-3 mb-6">
            <Sparkles className="text-gold h-5 w-5 animate-pulse" />
            <span className="text-xs uppercase tracking-[0.5em] text-gold font-black">Staff Portal</span>
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold uppercase tracking-widest text-white mb-4">
            Hello, <span className="text-gold italic">{user?.name}</span>
          </h1>
          <p className="text-gray-400 text-sm uppercase tracking-widest font-light">Your assigned beauty rituals for today</p>
        </header>

        {loading ? (
          <div className="py-20 text-center text-gold animate-pulse uppercase tracking-[0.5em] font-black">Synchronizing Schedule...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {appointments.length === 0 ? (
              <div className="col-span-full glass-panel p-20 text-center border-white/5 bg-white/[0.02]">
                <p className="text-gray-500 italic uppercase tracking-widest text-xs">No assigned appointments found.</p>
              </div>
            ) : (
              appointments.map((app) => (
                <motion.div
                  key={app._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`glass-panel p-8 border-gold/20 bg-[#18181B] relative overflow-hidden ${app.status === 'completed' ? 'opacity-50' : ''}`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-2xl font-serif font-bold text-white uppercase tracking-tight">{app.service}</h3>
                      <p className="text-[10px] text-gold uppercase font-black tracking-widest mt-1">Confirmed Ritual</p>
                    </div>
                    <div className={`px-3 py-1 text-[8px] font-black uppercase tracking-widest border ${app.status === 'completed' ? 'border-green-500 text-green-500' : 'border-gold text-gold'}`}>
                      {app.status}
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-4 text-gray-300">
                      <User className="h-4 w-4 text-gold" />
                      <span className="text-sm font-bold uppercase">{app.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-gray-400">
                      <Phone className="h-4 w-4 text-gold" />
                      <span className="text-xs">{app.phone}</span>
                    </div>
                    <div className="flex items-center gap-6 pt-4 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gold" />
                        <span className="text-xs uppercase font-bold">{app.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gold" />
                        <span className="text-xs uppercase font-bold">{app.time}</span>
                      </div>
                    </div>
                  </div>

                  {app.status !== 'completed' && (
                    <button 
                      onClick={() => handleComplete(app._id)}
                      className="w-full bg-gold text-black py-4 uppercase text-[10px] font-black tracking-[0.3em] hover:bg-white transition-all duration-500"
                    >
                      Mark As Completed
                    </button>
                  )}
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
