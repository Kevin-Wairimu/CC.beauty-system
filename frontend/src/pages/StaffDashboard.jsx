import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import {
  Calendar,
  Clock,
  CheckCircle2,
  User,
  Phone,
  Sparkles,
  History as HistoryIcon,
  Hourglass,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

const StaffDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");

  const fetchStaffAppointments = React.useCallback(async () => {
    try {
      const { data } = await api.get("/appointments");
      // Filter for appointments assigned to this staff member
      const myJobs = data.filter(
        (app) => app.staffId?._id === user?._id || app.staffId === user?._id,
      );
      setAppointments(myJobs);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching staff bookings:", error);
      toast.error("Failed to load your schedule");
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    if (user) {
      fetchStaffAppointments();
    }
  }, [user, fetchStaffAppointments]);

  const handleComplete = async (appointmentId) => {
    try {
      await api.put(`/appointments/${appointmentId}/status`, {
        status: "completed",
      });
      toast.success("Service marked as completed!");
      fetchStaffAppointments();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const activeJobs = appointments.filter(
    (a) => a.status === "approved" || a.status === "pending",
  );
  const historyJobs = appointments.filter((a) => a.status === "completed");

  const Section = ({ icon, title, color, items, emptyMsg }) => (
    <section className="space-y-6">
      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/5">
        <span className={color}>{icon}</span>
        <h2
          className={`text-sm font-black uppercase tracking-[0.3em] ${color}`}
        >
          {title}
        </h2>
        <span className="ml-auto text-[10px] font-black px-3 py-1 border border-white/10 text-gray-500 tracking-widest uppercase">
          {items.length}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.length > 0 ? (
          items.map((app) => (
            <motion.div
              key={app._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`glass-panel p-6 md:p-8 border-gold/20 bg-[#18181B] relative overflow-hidden ${
                app.status === "completed" ? "opacity-60" : ""
              }`}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl md:text-2xl font-serif font-bold text-white uppercase tracking-tight">
                    {app.service}
                  </h3>
                  <p className="text-[9px] text-gold uppercase font-black tracking-widest mt-1">
                    {app.status === "approved"
                      ? "Confirmed Service"
                      : app.status === "pending"
                        ? "Awaiting Review"
                        : "Session History"}
                  </p>
                </div>
                <div
                  className={`px-2.5 py-1 text-[7px] font-black uppercase tracking-widest border ${
                    app.status === "completed"
                      ? "border-green-500 text-green-500"
                      : app.status === "pending"
                        ? "border-gray-500 text-gray-500"
                        : "border-gold text-gold"
                  }`}
                >
                  {app.status}
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-4 text-gray-300">
                  <User className="h-3.5 w-3.5 text-gold" />
                  <span className="text-sm font-bold uppercase">
                    {app.name}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-gray-400">
                  <Phone className="h-3.5 w-3.5 text-gold" />
                  <span className="text-[11px]">{app.phone}</span>
                </div>
                <div className="flex items-center gap-6 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-gold" />
                    <span className="text-[11px] uppercase font-bold">
                      {app.date}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-gold" />
                    <span className="text-[11px] uppercase font-bold">
                      {app.time}
                    </span>
                  </div>
                </div>
              </div>

              {app.status !== "completed" && app.status !== "pending" && (
                <button
                  onClick={() => handleComplete(app._id)}
                  className="w-full bg-gold text-black py-3.5 uppercase text-[9px] font-black tracking-[0.3em] hover:bg-white transition-all duration-500 shadow-xl"
                >
                  Mark As Completed
                </button>
              )}
            </motion.div>
          ))
        ) : (
          <div className="col-span-full glass-panel p-16 text-center border-white/5 bg-white/[0.02]">
            <p className="text-gray-500 italic uppercase tracking-widest text-[10px]">
              {emptyMsg}
            </p>
          </div>
        )}
      </div>
    </section>
  );

  return (
    <div className="bg-[#0F0F0F] min-h-screen text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <Sparkles className="text-gold h-4 w-4 animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.5em] text-gold font-black">
              Staff Portal
            </span>
          </motion.div>
          <h1 className="text-3xl md:text-5xl font-serif font-bold uppercase tracking-widest text-white mb-2">
            Hello, <span className="text-gold italic">{user?.name}</span>
          </h1>
          <p className="text-gray-400 text-xs uppercase tracking-widest font-light">
            Your specialized service terminal
          </p>
        </header>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-t-2 border-gold rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gold animate-pulse uppercase tracking-[0.5em] font-black text-[10px]">
              Synchronizing Schedule...
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* NAVIGATION */}
            <div className="flex gap-1.5 bg-black/40 p-1 mb-12 border border-white/5 w-fit mx-auto overflow-hidden">
              {[
                { id: "active", label: "Active Jobs" },
                { id: "history", label: "Session History" },
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

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
              >
                {activeTab === "active" ? (
                  <div className="space-y-12">
                    <Section
                      icon={<CheckCircle2 className="h-4 w-4" />}
                      title="Current Assignments"
                      color="text-gold"
                      items={activeJobs.filter((j) => j.status === "approved")}
                      emptyMsg="No active assignments for today."
                    />
                    <Section
                      icon={<Hourglass className="h-4 w-4" />}
                      title="Pending Approvals"
                      color="text-gray-500"
                      items={activeJobs.filter((j) => j.status === "pending")}
                      emptyMsg="No pending requests in your queue."
                    />
                  </div>
                ) : (
                  <Section
                    icon={<HistoryIcon className="h-4 w-4" />}
                    title="Service History"
                    color="text-green-500"
                    items={historyJobs}
                    emptyMsg="Your service history begins with your first session."
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffDashboard;
