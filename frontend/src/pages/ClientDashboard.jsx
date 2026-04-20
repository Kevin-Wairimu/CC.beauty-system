import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import {
  Calendar,
  Clock,
  Sparkles,
  CheckCircle,
  Hourglass,
  History as HistoryIcon,
  Receipt,
  User,
  Phone,
  Mail,
  Star,
  ChevronRight,
  X,
  Printer,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

const ClientDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [receiptApp, setReceiptApp] = useState(null);
  const [reschedulingApp, setReschedulingApp] = useState(null);
  const [rescheduleData, setRescheduleData] = useState({ date: "", time: "" });
  const [activeTab, setActiveTab] = useState("active");

  const fetchUserAppointments = async () => {
    try {
      const { data } = await api.get("/appointments");
      const myBookings = data.filter(
        (app) =>
          app.email?.toLowerCase() === user?.email?.toLowerCase() ||
          app.userId === user?._id,
      );
      setAppointments(myBookings);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchUserAppointments();
  }, [user]);

  const handleCancel = async (id) => {
    const reason = window.prompt(
      "Please provide a reason for cancelling your reservation:",
    );
    if (reason === null) return; // User cancelled the prompt

    try {
      await api.put(`/appointments/${id}/status`, {
        status: "cancelled",
        cancellationReason: reason || "Cancelled by client",
      });
      toast.success("Reservation cancelled");
      fetchUserAppointments();
    } catch (error) {
      toast.error("Failed to cancel reservation");
    }
  };

  const handleDeleteRecord = async (id) => {
    if (!window.confirm("Erase this visit from your history?")) return;
    try {
      await api.delete(`/appointments/${id}`);
      toast.success("Record removed");
      fetchUserAppointments();
    } catch (error) {
      toast.error("Failed to remove record");
    }
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/appointments/${reschedulingApp._id}/status`, {
        date: rescheduleData.date,
        time: rescheduleData.time,
      });
      toast.success("Session rescheduled");
      setReschedulingApp(null);
      fetchUserAppointments();
    } catch (error) {
      toast.error("Reschedule failed");
    }
  };

  const approvedBookings = appointments.filter((a) => a.status === "approved");
  const pendingBookings = appointments.filter((a) => a.status === "pending");
  const completedBookings = appointments.filter(
    (a) => a.status === "completed",
  );

  const totalSpend = completedBookings.reduce(
    (sum, a) => sum + (parseFloat(a.price) || 0),
    0,
  );

  // ── Booking Card ──────────────────────────────────────────────────────────
  const BookingCard = ({ app, statusType }) => {
    const isCompleted = statusType === "completed";
    const isApproved = statusType === "approved";
    const isPending = statusType === "pending";

    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`glass-panel p-8 bg-[#121212] transition-all duration-300 mb-4 group
          ${isApproved ? "border-gold/30 hover:border-gold/60" : ""}
          ${isPending ? "border-white/5 hover:border-white/10 opacity-75" : ""}
          ${isCompleted ? "border-green-500/10 hover:border-green-500/20" : ""}
        `}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          {/* Service info */}
          <div className="space-y-3 flex-grow">
            <div className="flex items-center gap-3">
              {/* Status dot */}
              <span
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  isApproved
                    ? "bg-gold animate-pulse"
                    : isPending
                      ? "bg-gray-600"
                      : "bg-green-500"
                }`}
              />
              <h4 className="text-xl font-serif font-bold text-white tracking-wide uppercase">
                {app.service}
              </h4>
            </div>

            <div className="flex flex-wrap gap-6 pl-5">
              <span className="flex items-center gap-2 text-[10px] text-gray-400 uppercase tracking-[0.2em] font-black">
                <Calendar className="h-3.5 w-3.5 text-gold" />
                {app.date}
              </span>
              <span className="flex items-center gap-2 text-[10px] text-gray-400 uppercase tracking-[0.2em] font-black">
                <Clock className="h-3.5 w-3.5 text-gold" />
                {app.time}
              </span>
              {app.staffId?.name && (
                <span className="flex items-center gap-2 text-[10px] text-gray-400 uppercase tracking-[0.2em] font-black">
                  <User className="h-3.5 w-3.5 text-gold" />
                  {app.staffId.name}
                </span>
              )}
            </div>

            {/* Price for completed */}
            {isCompleted && app.price > 0 && (
              <p className="pl-5 text-xs text-gold/60 font-black uppercase tracking-widest">
                ksh {parseFloat(app.price).toLocaleString()}
              </p>
            )}
          </div>

          {/* Right side: badge + actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {!isCompleted ? (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setReschedulingApp(app);
                    setRescheduleData({ date: app.date, time: app.time });
                  }}
                  className="p-2 border border-white/10 text-white/40 hover:border-gold/40 hover:text-gold transition-all"
                  title="Reschedule"
                >
                  <Calendar className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleCancel(app._id)}
                  className="p-2 border border-white/10 text-white/40 hover:border-red-500/40 hover:text-red-500 transition-all"
                  title="Cancel"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleDeleteRecord(app._id)}
                className="p-2 border border-white/10 text-white/40 hover:border-red-500/40 hover:text-red-500 transition-all mr-2"
                title="Erase Record"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}

            <span
              className={`px-4 py-2 border text-[9px] font-black uppercase tracking-[0.2em] whitespace-nowrap ${
                isApproved
                  ? "border-gold/50 text-gold bg-gold/5"
                  : isPending
                    ? "border-white/10 text-gray-500"
                    : "border-green-500/30 text-green-500 bg-green-500/5"
              }`}
            >
              {isApproved
                ? "Confirmed"
                : isPending
                  ? "Processing"
                  : "Completed"}
            </span>

            {/* View receipt button for completed */}
            {isCompleted && app.receiptNo && (
              <button
                onClick={() => setReceiptApp(app)}
                className="flex items-center gap-2 border border-white/10 text-white/40 hover:border-gold/40 hover:text-gold px-4 py-2 text-[9px] font-black uppercase tracking-widest transition-all"
              >
                <Receipt className="h-3.5 w-3.5" />
                Receipt
              </button>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  // ── Section wrapper ───────────────────────────────────────────────────────
  const Section = ({ icon, title, color, items, statusType, emptyMsg }) => (
    <section>
      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/5">
        <span className={color}>{icon}</span>
        <h2
          className={`text-sm font-black uppercase tracking-[0.3em] ${color}`}
        >
          {title}
        </h2>
        <span
          className={`ml-auto text-[9px] font-black px-3 py-1 border tracking-widest uppercase ${
            statusType === "approved"
              ? "border-gold/20 text-gold/60"
              : statusType === "pending"
                ? "border-white/10 text-gray-600"
                : "border-green-500/20 text-green-500/60"
          }`}
        >
          {items.length}
        </span>
      </div>
      {items.length > 0 ? (
        items.map((app) => (
          <BookingCard key={app._id} app={app} statusType={statusType} />
        ))
      ) : (
        <div className="glass-panel p-10 text-center border-white/5 bg-white/[0.02] italic text-gray-600 text-[10px] uppercase tracking-widest">
          {emptyMsg}
        </div>
      )}
    </section>
  );

  return (
    <div className="bg-[#0A0A0A] min-h-screen text-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header className="mb-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-4"
          >
            <Sparkles className="text-gold h-4 w-4 animate-pulse" />
            <span className="text-[9px] uppercase tracking-[0.5em] text-gold font-black">
              Guest Sanctuary
            </span>
          </motion.div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
            <div>
              <h1 className="text-3xl md:text-5xl font-serif font-bold uppercase tracking-widest text-white mb-2 leading-none">
                Welcome,{" "}
                <span className="text-gold italic">
                  {user?.name?.split(" ")[0]}
                </span>
              </h1>
              <p className="text-gray-500 text-[9px] uppercase tracking-[0.3em] font-black">
                Your personal beauty service record
              </p>
            </div>

            {/* Stats strip */}
            <div className="grid grid-cols-3 gap-3 shrink-0">
              {[
                {
                  label: "Confirmed",
                  val: approvedBookings.length,
                  color: "text-gold",
                },
                {
                  label: "Completed",
                  val: completedBookings.length,
                  color: "text-green-400",
                },
                {
                  label: "Total Spend",
                  val: `ksh ${totalSpend.toLocaleString()}`,
                  color: "text-white",
                },
              ].map((s, i) => (
                <div
                  key={i}
                  className="bg-white/[0.03] border border-white/5 p-3 text-center min-w-[80px]"
                >
                  <p className="text-[7px] uppercase font-black tracking-widest text-gray-500 mb-1">
                    {s.label}
                  </p>
                  <p className={`text-base font-bold font-serif ${s.color}`}>
                    {s.val}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </header>

        {/* ── Body ───────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-10 h-10 border-t-2 border-gold rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gold animate-pulse uppercase tracking-[0.4em] text-[9px] font-black">
              cc beauty
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* NAVIGATION */}
            <div className="flex gap-1.5 bg-black/40 p-1 mb-12 border border-white/5 w-fit mx-auto overflow-hidden">
              {[
                { id: "active", label: "Active Sessions" },
                { id: "history", label: "Past Visits" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-8 py-3 uppercase tracking-[0.2em] text-[9px] font-black transition-all ${
                    activeTab === tab.id
                      ? "bg-gold text-white shadow-2xl"
                      : "text-gray-500 hover:text-gold"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-12"
            >
              {activeTab === "active" ? (
                <>
                  <Section
                    icon={<CheckCircle className="h-4 w-4" />}
                    title="Confirmed Services"
                    color="text-gold"
                    items={approvedBookings}
                    statusType="approved"
                    emptyMsg="No confirmed services scheduled."
                  />

                  <Section
                    icon={<Hourglass className="h-4 w-4" />}
                    title="Pending Services"
                    color="text-gray-500"
                    items={pendingBookings}
                    statusType="pending"
                    emptyMsg="No active requests awaiting review."
                  />
                </>
              ) : activeTab === "history" ? (
                <Section
                  icon={<HistoryIcon className="h-4 w-4" />}
                  title="Service History"
                  color="text-green-500"
                  items={completedBookings}
                  statusType="completed"
                  emptyMsg="Your service journey begins today."
                />
              ) : (
                <div className="max-w-md mx-auto">
                  <div className="flex items-center gap-4 mb-8 pb-4 border-b border-white/5">
                    <User className="text-gold h-4 w-4" />
                    <h2 className="text-sm font-black uppercase tracking-[0.3em] text-gold">
                      Your Profile Sanctuary
                    </h2>
                  </div>

                  <form onSubmit={handleProfileUpdate} className="space-y-8 glass-panel p-10 bg-[#121212] border-gold/10">
                    <div className="space-y-6">
                      <div className="group">
                        <label className="block text-[9px] font-black uppercase tracking-[0.3em] text-gold/40 mb-3">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={profileData.name}
                          onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                          className="w-full bg-transparent border-b border-white/10 py-2 outline-none focus:border-gold transition-colors text-white font-serif"
                        />
                      </div>

                      <div className="group">
                        <label className="block text-[9px] font-black uppercase tracking-[0.3em] text-gold/40 mb-3">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                          className="w-full bg-transparent border-b border-white/10 py-2 outline-none focus:border-gold transition-colors text-white font-serif"
                        />
                      </div>

                      <div className="group">
                        <label className="block text-[9px] font-black uppercase tracking-[0.3em] text-gold/40 mb-3">
                          Signature Password (Leave blank to keep current)
                        </label>
                        <input
                          type="password"
                          value={profileData.password}
                          onChange={(e) => setProfileData({ ...profileData, password: e.target.value })}
                          className="w-full bg-transparent border-b border-white/10 py-2 outline-none focus:border-gold transition-colors text-white"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="w-full btn-gold py-4 text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                    >
                      {isUpdating ? "Securing Changes..." : "Update Credentials"}
                    </button>
                  </form>
                </div>
              )}
            </motion.div>

            {/* CTA */}
            <div className="text-center pt-12 border-t border-white/5">
              <p className="text-[8px] uppercase tracking-[0.4em] text-gray-600 font-black mb-4">
                Ready for your next visit?
              </p>
              <a
                href="/booking"
                className="btn-gold px-10 py-4 inline-block shadow-[0_15px_40px_rgba(255,215,0,0.1)] uppercase text-[10px] font-black tracking-widest"
              >
                Secure A New Reservation
              </a>
            </div>
          </div>
        )}
      </div>

      {/* ── Receipt Modal ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {receiptApp && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl print:bg-white print:p-0">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="bg-[#0D0D0D] border border-gold/30 w-full max-w-lg shadow-[0_0_100px_rgba(212,175,55,0.1)] print:shadow-none print:border-none print:bg-white"
            >
              {/* Receipt header */}
              <div className="bg-black border-b border-gold/20 p-8 text-center relative print:bg-white">
                <button
                  onClick={() => setReceiptApp(null)}
                  className="absolute top-4 right-4 p-2 text-gold/40 hover:text-gold transition-colors print:hidden"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="flex justify-center mb-3">
                  <Receipt className="h-8 w-8 text-gold" />
                </div>
                <h2 className="text-2xl font-serif font-bold uppercase tracking-widest text-gold print:text-black">
                  CC Beauty Clinic
                </h2>
                <p className="text-[9px] uppercase tracking-[0.5em] text-white/40 print:text-black mt-1">
                  Official Payment Receipt
                </p>
              </div>

              {/* Receipt No + Date */}
              <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02] print:bg-white print:border-black/20">
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-gold/50 font-black print:text-black">
                    Receipt No.
                  </p>
                  <p className="text-lg font-black text-white tracking-widest print:text-black">
                    {receiptApp.receiptNo}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] uppercase tracking-widest text-gold/50 font-black print:text-black">
                    Date
                  </p>
                  <p className="text-sm font-bold text-white/80 print:text-black">
                    {receiptApp.date}
                  </p>
                  <p className="text-xs text-white/40 print:text-black">
                    {receiptApp.time}
                  </p>
                </div>
              </div>

              {/* Body */}
              <div className="px-8 py-8 space-y-6 print:text-black">
                <div className="flex justify-between items-start">
                  <span className="text-[9px] uppercase tracking-widest text-gold/50 font-black w-1/3 print:text-black">
                    Client
                  </span>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white print:text-black">
                      {receiptApp.name}
                    </p>
                    <p className="text-xs text-white/40 print:text-black">
                      {receiptApp.phone}
                    </p>
                    {receiptApp.email && (
                      <p className="text-xs text-white/40 print:text-black">
                        {receiptApp.email}
                      </p>
                    )}
                  </div>
                </div>
                <div className="h-px bg-white/5 print:bg-black/10" />
                <div className="flex justify-between items-start">
                  <span className="text-[9px] uppercase tracking-widest text-gold/50 font-black w-1/3 print:text-black">
                    Service
                  </span>
                  <p className="text-sm font-bold text-white text-right print:text-black">
                    {receiptApp.service}
                  </p>
                </div>
                <div className="h-px bg-white/5 print:bg-black/10" />
                {receiptApp.staffId?.name && (
                  <>
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] uppercase tracking-widest text-gold/50 font-black w-1/3 print:text-black">
                        Specialist
                      </span>
                      <p className="text-sm text-white/70 text-right print:text-black">
                        {receiptApp.staffId.name}
                      </p>
                    </div>
                    <div className="h-px bg-white/5 print:bg-black/10" />
                  </>
                )}
                <div className="flex justify-between items-start">
                  <span className="text-[9px] uppercase tracking-widest text-gold/50 font-black w-1/3 print:text-black">
                    Status
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-widest border border-green-500/30 text-green-500 px-3 py-1 print:text-black print:border-black">
                    {receiptApp.paymentStatus || "Paid"}
                  </span>
                </div>
              </div>

              {/* Total */}
              <div className="mx-8 mb-8 p-6 bg-gold/5 border border-gold/20 print:bg-white print:border-black/20">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black uppercase tracking-[0.3em] text-gold/60 print:text-black">
                    Total Amount Paid
                  </span>
                  <span className="text-3xl font-serif font-black text-gold print:text-black">
                    ksh {parseFloat(receiptApp.price || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="px-8 pb-8 text-center space-y-6">
                <p className="text-[9px] text-white/20 uppercase tracking-[0.3em] print:text-black">
                  Thank you for choosing CC Beauty Clinic
                </p>
                <div className="flex gap-3 print:hidden">
                  <button
                    onClick={() => window.print()}
                    className="flex-1 border border-gold/30 text-gold py-4 text-[10px] font-black uppercase tracking-widest hover:bg-gold hover:text-black transition-all flex items-center justify-center gap-2"
                  >
                    <Printer className="h-4 w-4" /> Print Receipt
                  </button>
                  <button
                    onClick={() => setReceiptApp(null)}
                    className="flex-1 bg-white/5 border border-white/10 text-white/60 py-4 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Reschedule Modal ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {reschedulingApp && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#111111] border-2 border-gold/30 p-10 w-full max-w-md shadow-2xl"
            >
              <h2 className="text-2xl font-serif font-bold uppercase tracking-widest text-gold mb-8 text-center">
                Reschedule Session
              </h2>
              <form onSubmit={handleRescheduleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-widest text-gold font-black">
                    New Date
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split("T")[0]}
                    value={rescheduleData.date}
                    onChange={(e) =>
                      setRescheduleData({
                        ...rescheduleData,
                        date: e.target.value,
                      })
                    }
                    className="w-full bg-black border border-white/10 p-3 text-white outline-none focus:border-gold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-widest text-gold font-black">
                    New Time
                  </label>
                  <input
                    type="time"
                    required
                    value={rescheduleData.time}
                    onChange={(e) =>
                      setRescheduleData({
                        ...rescheduleData,
                        time: e.target.value,
                      })
                    }
                    className="w-full bg-black border border-white/10 p-3 text-white outline-none focus:border-gold"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setReschedulingApp(null)}
                    className="flex-1 border border-white/10 py-4 uppercase text-[10px] font-black tracking-widest"
                  >
                    Keep Original
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gold text-white py-4 uppercase text-[10px] font-black tracking-widest"
                  >
                    Confirm Change
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClientDashboard;
