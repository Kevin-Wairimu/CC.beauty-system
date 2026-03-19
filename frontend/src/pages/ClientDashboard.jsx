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
          (app) => app.email?.toLowerCase() === user?.email?.toLowerCase() || app.userId === user?._id
        );
        setAppointments(myBookings);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching bookings:", error);
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
          <h4 className="text-xl font-bold text-white tracking-wide uppercase font-serif">{app.service}</h4>
          <div className="flex flex-wrap gap-4 text-[10px] text-gray-400 uppercase tracking-[0.2em] font-black">
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gold" /> {app.date}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gold" /> {app.time}
            </span>
          </div>
        </div>
        <div className={`px-4 py-2 border text-[9px] font-black uppercase tracking-[0.2em] ${
          statusType === 'approved' ? 'border-gold/50 text-gold bg-gold/5' :
          statusType === 'pending' ? 'border-white/10 text-gray-500' :
          'border-green-500/30 text-green-500 bg-green-500/5'
        }`}>
          {statusType === 'approved' ? 'Confirmed Ritual' : 
           statusType === 'pending' ? 'Processing Ritual' : 'Masterpiece Finished'}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="bg-[#0F0F0F] min-h-screen text-white py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-16 text-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center gap-3 mb-6">
            <Sparkles className="text-gold h-4 w-4 animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.5em] text-gold font-black">Guest Sanctuary</span>
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold uppercase tracking-widest text-white mb-4 leading-none">
            Welcome, <span className="text-gold italic">{user?.name?.split(" ")[0]}</span>
          </h1>
          <p className="text-gray-500 text-[10px] uppercase tracking-[0.3em] font-black italic">Refining Your Beauty Ritual History</p>
        </header>

        {loading ? (
          <div className="py-20 text-center text-gold animate-pulse uppercase tracking-[0.4em] text-[10px] font-black">Synchronizing Personal Rituals...</div>
        ) : (
          <div className="space-y-16">
            
            <section>
              <div className="flex items-center gap-4 mb-8">
                <CheckCircle className="text-gold h-5 w-5" />
                <h2 className="text-xl font-serif font-bold uppercase tracking-widest text-gold">Confirmed Rituals</h2>
              </div>
              {approvedBookings.length > 0 ? (
                approvedBookings.map(app => <BookingCard key={app._id} app={app} statusType="approved" />)
              ) : (
                <div className="glass-panel p-10 text-center border-white/5 bg-white/[0.02] italic text-gray-600 text-[10px] uppercase tracking-widest">
                  No confirmed rituals scheduled.
                </div>
              )}
            </section>

            <section>
              <div className="flex items-center gap-4 mb-8">
                <Hourglass className="text-gray-500 h-5 w-5" />
                <h2 className="text-xl font-serif font-bold uppercase tracking-widest text-white">Pending Rituals</h2>
              </div>
              {pendingBookings.length > 0 ? (
                pendingBookings.map(app => <BookingCard key={app._id} app={app} statusType="pending" />)
              ) : (
                <div className="glass-panel p-10 text-center border-white/5 bg-white/[0.02] italic text-gray-600 text-[10px] uppercase tracking-widest">
                  No active requests.
                </div>
              )}
            </section>

            <section>
              <div className="flex items-center gap-4 mb-8">
                <HistoryIcon className="text-gray-500 h-5 w-5" />
                <h2 className="text-xl font-serif font-bold uppercase tracking-widest text-white">The History</h2>
              </div>
              {completedBookings.length > 0 ? (
                completedBookings.map(app => <BookingCard key={app._id} app={app} statusType="completed" />)
              ) : (
                <div className="glass-panel p-10 text-center border-white/5 bg-white/[0.02] italic text-gray-600 text-[10px] uppercase tracking-widest">
                  Your ritual journey begins today.
                </div>
              )}
            </section>

            <div className="text-center pt-10">
              <a href="/booking" className="btn-gold px-12 py-5 inline-block shadow-[0_15px_40px_rgba(255,215,0,0.15)] uppercase text-xs font-black tracking-widest">
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
