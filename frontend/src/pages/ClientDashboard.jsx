import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Calendar, Clock, Sparkles, User, Heart, Star } from "lucide-react";
import { motion } from "framer-motion";

const ClientDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAppointments = async () => {
      try {
        const { data } = await api.get("/appointments");
        const myBookings = data.filter(
          (app) => app.name.toLowerCase() === user?.name.toLowerCase(),
        );
        setAppointments(myBookings);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching bookings");
        setLoading(false);
      }
    };

    if (user) fetchUserAppointments();
  }, [user]);

  return (
    <div className="bg-[#121212] min-h-screen text-white py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <header className="mb-16 flex flex-col md:flex-row justify-between items-end gap-8 border-b-2 border-gold/10 pb-12">
          <div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3 mb-4"
            >
              <Sparkles className="text-gold h-5 w-5" />
              <span className="text-xs uppercase tracking-[0.5em] text-gold font-black">
                Member Portal
              </span>
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-serif font-bold uppercase tracking-widest text-white">
              Welcome,{" "}
              <span className="text-gold italic">
                {user?.name.split(" ")[0]}
              </span>
            </h1>
          </div>
          {/* <div className="bg-gold/10 border-2 border-gold/30 p-6 px-10 text-center shadow-[0_0_30px_rgba(255,215,0,0.1)]">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-2 font-bold">
              Status
            </p>
            <p className="text-gold font-black uppercase tracking-widest text-lg">
              Gold Tier
            </p>
          </div> */}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">
            <h2 className="text-2xl font-serif font-bold uppercase tracking-widest text-gold flex items-center gap-4">
              <Calendar className="h-6 w-6" /> Your Schedule
            </h2>

            {loading ? (
              <div className="py-20 text-center animate-pulse text-gold uppercase tracking-[0.5em] font-black text-sm">
                Accessing Luxury Records...
              </div>
            ) : appointments.length === 0 ? (
              <div className="glass-panel p-16 text-center space-y-8 border-gold/20">
                <p className="text-gray-300 italic font-light text-xl">
                  You have no upcoming luxury sessions scheduled.
                </p>
                <a
                  href="/booking"
                  className="btn-gold inline-block !py-4 px-12 shadow-[0_15px_40px_rgba(255,215,0,0.15)]"
                >
                  Secure A New Slot
                </a>
              </div>
            ) : (
              <div className="space-y-6">
                {appointments.map((app) => (
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={app._id}
                    className="glass-panel p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 group hover:border-gold/50 transition-all duration-500 bg-[#18181B]"
                  >
                    <div className="space-y-3">
                      <p className="text-2xl font-bold text-white group-hover:text-gold transition-colors tracking-wide">
                        {app.service}
                      </p>
                      <div className="flex flex-wrap gap-8 text-sm text-gray-400 uppercase tracking-widest font-black">
                        <span className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-gold" /> {app.date}
                        </span>
                        <span className="flex items-center gap-3">
                          <Clock className="h-4 w-4 text-gold" /> {app.time}
                        </span>
                      </div>
                    </div>
                    <div className="w-full sm:w-auto text-center border border-gold/30 px-6 py-2 bg-gold/5">
                      <span className="text-xs uppercase tracking-[0.3em] text-gold font-black">
                        Confirmed
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar / Profile Card */}
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
              <div className="h-[2px] w-full bg-gold/10 mb-8" />
              <div className="flex justify-around items-center">
                <div className="text-center">
                  <p className="text-gold font-black text-2xl mb-1">
                    {appointments.length}
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-bold">
                    Visits
                  </p>
                </div>
                <div className="w-[1px] h-10 bg-gold/20" />
                <div className="text-center">
                  <p className="text-gold font-black text-2xl mb-1">0</p>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-bold">
                    Points
                  </p>
                </div>
              </div>
            </div>

            {/* <div className="bg-gold/10 border-2 border-gold/20 p-8 shadow-xl relative overflow-hidden group">
                <div className="absolute -top-4 -right-4 text-gold/5 group-hover:text-gold/10 transition-colors duration-700">
                    <Star className="h-24 w-24 fill-current" />
                </div>
                <h4 className="text-sm font-black uppercase tracking-[0.3em] text-gold mb-6 flex items-center gap-3 relative z-10">
                   <Star className="h-4 w-4" /> Exclusive Reward
                </h4>
                <p className="text-base text-gray-200 italic leading-relaxed relative z-10 font-medium">
                  "Invite a companion to the CC experience and receive a 10% privilege on your next signature treatment."
                </p>
             </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
