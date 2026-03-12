import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Calendar, Clock, Sparkles, CheckCircle, Hourglass, History as HistoryIcon } from "lucide-react";
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

  const BookingCard = ({ app, statusType }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-panel p-6 border-gold/20 bg-[#18181B] hover:border-gold/50 transition-all duration-300 shadow-xl mb-4 ${statusType === 'pending' ? 'opacity-70' : ''}`}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <h4 className="text-xl font-bold text-white tracking-wide uppercase">{app.service}</h4>
          <div className="flex flex-wrap gap-4 text-xs text-gray-400 uppercase tracking-widest font-bold">
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gold" /> {app.date}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gold" /> {app.time}
            </span>
          </div>
        </div>
        <div className={`px-4 py-2 border text-[10px] font-black uppercase tracking-[0.2em] ${
          statusType === 'approved' ? 'border-gold/50 text-gold bg-gold/5' :
          statusType === 'pending' ? 'border-white/20 text-gray-400' :
          'border-green-500/30 text-green-500 bg-green-500/5'
        }`}>
          {statusType === 'approved' ? 'Confirmed' : 
           statusType === 'pending' ? 'Awaiting Approval' : 'Completed'}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="bg-[#0F0F0F] min-h-screen text-white py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <Sparkles className="text-gold h-5 w-5 animate-pulse" />
            <span className="text-xs uppercase tracking-[0.5em] text-gold font-black">
              Client Portal
            </span>
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold uppercase tracking-widest text-white mb-4">
            Welcome, <span className="text-gold italic">{user?.name.split(" ")[0]}</span>
          </h1>
          <p className="text-gray-400 text-sm uppercase tracking-widest font-light">Manage your beauty journey and history</p>
        </header>

        {loading ? (
          <div className="py-20 text-center text-gold animate-pulse uppercase tracking-[0.5em] font-black">
            Curating your experience...
          </div>
        ) : (
          <div className="space-y-16">
            
            {/* 1. Selected Services (Confirmed) */}
            <section>
              <div className="flex items-center gap-4 mb-8">
                <CheckCircle className="text-gold h-6 w-6" />
                <h2 className="text-2xl font-serif font-bold uppercase tracking-widest text-gold">Selected Services</h2>
              </div>
              {approvedBookings.length > 0 ? (
                approvedBookings.map(app => <BookingCard key={app._id} app={app} statusType="approved" />)
              ) : (
                <div className="glass-panel p-10 text-center border-white/5 bg-white/[0.02]">
                  <p className="text-gray-500 italic">No confirmed services scheduled.</p>
                </div>
              )}
            </section>

            {/* 2. Pending Services */}
            <section>
              <div className="flex items-center gap-4 mb-8">
                <Hourglass className="text-gray-400 h-6 w-6" />
                <h2 className="text-2xl font-serif font-bold uppercase tracking-widest text-white">Pending Services</h2>
              </div>
              {pendingBookings.length > 0 ? (
                pendingBookings.map(app => <BookingCard key={app._id} app={app} statusType="pending" />)
              ) : (
                <div className="glass-panel p-10 text-center border-white/5 bg-white/[0.02]">
                  <p className="text-gray-500 italic">No pending requests.</p>
                </div>
              )}
            </section>

            {/* 3. History (Completed) */}
            <section>
              <div className="flex items-center gap-4 mb-8">
                <HistoryIcon className="text-gray-400 h-6 w-6" />
                <h2 className="text-2xl font-serif font-bold uppercase tracking-widest text-white">History</h2>
              </div>
              {completedBookings.length > 0 ? (
                completedBookings.map(app => <BookingCard key={app._id} app={app} statusType="completed" />)
              ) : (
                <div className="glass-panel p-10 text-center border-white/5 bg-white/[0.02]">
                  <p className="text-gray-500 italic">No previous visits recorded.</p>
                </div>
              )}
            </section>

            <div className="text-center pt-10">
              <a
                href="/booking"
                className="btn-gold px-12 py-5 inline-block shadow-[0_15px_40px_rgba(255,215,0,0.15)]"
              >
                Secure A New Reservation
              </a>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;
