import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Calendar, Clock, Sparkles, User, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ClientDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAppointments = async () => {
      try {
        const { data } = await api.get("/appointments");
        // Filter by email (much more reliable than name)
        const myBookings = data.filter(
          (app) => app.email?.toLowerCase() === user?.email?.toLowerCase(),
        );
        setAppointments(myBookings);
        setLoading(false);
      } catch {
        console.error("Error fetching bookings");
        setLoading(false);
      }
    };

    if (user) fetchUserAppointments();
  }, [user]);

  const approvedBookings = appointments.filter(app => app.status === 'approved');
  const pendingBookings = appointments.filter(app => app.status === 'pending');
  const completedBookings = appointments.filter(app => app.status === 'completed');

  // Privilege Logic
  const visitCount = completedBookings.length;
  const points = visitCount * 100;
  const tier = visitCount >= 10 ? 'Diamond Elite' : visitCount >= 5 ? 'Platinum Tier' : 'Gold Tier';
  const tierColor = tier === 'Diamond Elite' ? 'text-blue-400' : tier === 'Platinum Tier' ? 'text-gray-300' : 'text-gold';

  return (
    <div className="bg-[#121212] min-h-screen text-white py-12 md:py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12 md:mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b-2 border-gold/10 pb-8 md:pb-12">
          <div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3 mb-4"
            >
              <Sparkles className="text-gold h-4 w-4 md:h-5 md:w-5" />
              <span className="text-[10px] md:text-xs uppercase tracking-[0.5em] text-gold font-black">
                Elite Member Portal
              </span>
            </motion.div>
            <h1 className="text-4xl md:text-7xl font-serif font-bold uppercase tracking-widest text-white leading-tight">
              Welcome,{" "}
              <span className="text-gold italic">
                {user?.name.split(" ")[0]}
              </span>
            </h1>
          </div>
          <div className="w-full md:w-auto bg-gold/10 border-2 border-gold/30 p-5 md:p-6 px-8 md:px-10 text-center shadow-[0_0_30px_rgba(255,215,0,0.1)] min-w-[180px]">
             <p className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-gray-400 mb-1 md:mb-2 font-bold">Status</p>
             <p className={`font-black uppercase tracking-widest text-base md:text-lg ${tierColor}`}>{tier}</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 md:gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12 md:space-y-16 order-2 lg:order-1">
            
            {/* Approved Section */}
            <div className="space-y-8 md:space-y-10">
                <h2 className="text-xl md:text-2xl font-serif font-bold uppercase tracking-widest text-gold flex items-center gap-4">
                <Star className="h-5 w-5 md:h-6 md:w-6 text-gold" /> Confirmed Masterpieces
                </h2>

                {loading ? (
                <div className="py-10 text-center animate-pulse text-gold uppercase tracking-[0.5em] font-black text-[10px]">Accessing Schedule...</div>
                ) : approvedBookings.length === 0 ? (
                <div className="glass-panel p-12 md:p-16 text-center space-y-8 border-gold/20 bg-white/[0.02]">
                    <p className="text-gray-400 italic font-light text-base md:text-lg">No confirmed sessions yet.</p>
                </div>
                ) : (
                <div className="space-y-4 md:space-y-6">
                    {approvedBookings.map((app) => (
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={app._id}
                        className="glass-panel p-6 md:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 group border-gold/40 bg-[#18181B] shadow-2xl"
                    >
                        <div className="space-y-3">
                        <p className="text-xl md:text-2xl font-bold text-white group-hover:text-gold transition-colors tracking-wide">
                            {app.service}
                        </p>
                        <div className="flex flex-wrap gap-6 md:gap-8 text-[10px] md:text-sm text-gray-400 uppercase tracking-widest font-black">
                            <span className="flex items-center gap-2 md:gap-3">
                            <Calendar className="h-4 w-4 text-gold" /> {app.date}
                            </span>
                            <span className="flex items-center gap-2 md:gap-3">
                            <Clock className="h-4 w-4 text-gold" /> {app.time}
                            </span>
                        </div>
                        </div>
                        <div className="w-full sm:w-auto text-center border-2 border-gold/50 px-5 md:px-6 py-2 bg-gold/10">
                        <span className="text-[10px] uppercase tracking-[0.3em] text-gold font-black">Confirmed</span>
                        </div>
                    </motion.div>
                    ))}
                </div>
                )}
            </div>

            {/* Pending Section */}
            {pendingBookings.length > 0 && (
                <div className="space-y-10">
                    <h3 className="text-xl font-serif font-bold uppercase tracking-widest text-gray-500 flex items-center gap-4">
                        <Clock className="h-5 w-5" /> Pending Requests
                    </h3>
                    <div className="space-y-4">
                        {pendingBookings.map((app) => (
                            <div key={app._id} className="glass-panel p-6 opacity-60 border-white/10 hover:opacity-100 transition-opacity">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-lg font-bold text-gray-200">{app.service}</p>
                                        <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">{app.date} at {app.time}</p>
                                    </div>
                                    <span className="text-[10px] uppercase font-black tracking-widest text-gray-600 border border-white/10 px-3 py-1">Awaiting Prep</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="pt-10">
                <a
                  href="/booking"
                  className="py-4! btn-gold inline-block px-12 shadow-[0_15px_40px_rgba(255,215,0,0.15)] text-white font-bold"
                >
                  Secure A New Slot
                </a>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-10">
            <div className="glass-panel p-10 text-center border-gold/20 bg-[#18181B] shadow-2xl">
              <div className="w-24 h-24 bg-gold/10 border-2 border-gold/30 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(255,215,0,0.1)]">
                <User className="h-12 w-12 text-gold" />
              </div>
              <h3 className="text-2xl font-bold mb-2 uppercase tracking-tighter text-white">
                {user?.name}
              </h3>
              <p className="text-xs text-gray-400 uppercase tracking-[0.2em] mb-8 font-bold">
                {user?.email}
              </p>
              <div className="h-0.5 w-full bg-gold/10 mb-8" />
              <div className="flex justify-around items-center">
                <div className="text-center">
                  <p className="text-gold font-black text-2xl mb-1">
                    {approvedBookings.length}
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-bold">
                    Visits
                  </p>
                </div>
                <div className="w-px h-10 bg-gold/20" />
                <div className="text-center">
                  <p className="text-gold font-black text-2xl mb-1">{points}</p>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-bold">
                    Points
                  </p>
                </div>
              </div>
            </div>

             <div className="bg-gold/10 border-2 border-gold/20 p-8 shadow-xl relative overflow-hidden group">
                <div className="absolute -top-4 -right-4 text-gold/5 group-hover:text-gold/10 transition-colors duration-700">
                    <Star className="h-24 w-24 fill-current" />
                </div>
                <h4 className="text-sm font-black uppercase tracking-[0.3em] text-gold mb-6 flex items-center gap-3 relative z-10">
                   <Star className="h-4 w-4" /> Exclusive Reward
                </h4>
                <p className="text-base text-gray-200 italic leading-relaxed relative z-10 font-medium">
                  "Invite a companion to the CC experience and receive a 10% privilege on your next signature treatment."
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
