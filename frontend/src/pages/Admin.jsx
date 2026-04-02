import React, { useState, useEffect, useMemo, useRef } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import {
  Calendar,
  Trash2,
  CheckCircle,
  Clock,
  User,
  Phone,
  MessageSquare,
  Plus,
  Edit,
  X,
  Layout,
  Shield,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  FileText,
  PieChart,
  Activity,
  ChevronRight,
  ArrowUpRight,
  Search,
  Download,
  UserPlus,
  BarChart3,
  Award,
  Receipt,
  Printer,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// ── Helper: is this appointment from today? ──────────────────────────────────
const isToday = (dateStr) => {
  if (!dateStr) return false;
  const today = new Date();
  // Try parsing app.date (could be "2024-03-15" or "March 15, 2024" etc.)
  const appDate = new Date(dateStr);
  return (
    appDate.getFullYear() === today.getFullYear() &&
    appDate.getMonth() === today.getMonth() &&
    appDate.getDate() === today.getDate()
  );
};

// ── Helper: parse month label from date string ───────────────────────────────
const getMonthYear = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  return d.toLocaleString("default", { month: "short", year: "numeric" });
};

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [services, setServices] = useState([]);
  const [users, setUsers] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("appointments");

  // Receipt modal state
  const [receiptAppointment, setReceiptAppointment] = useState(null);

  // Monthly revenue chart modal
  const [showRevenueChart, setShowRevenueChart] = useState(false);

  // Service Form State
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceData, setServiceFormData] = useState({
    name: "",
    category: "",
    price: "",
    description: "",
    duration: "",
    image: "",
  });
  const [selectedImage, setSelectedImage] = useState(null);

  // User Form State
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userData, setUserFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "client",
    specialization: "",
  });

  // Enquiry Update State
  const [editingEnquiry, setEditingEnquiry] = useState(null);
  const [enquiryUpdateData, setEnquiryUpdateData] = useState({
    status: "",
    notes: "",
  });

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [appRes, enqRes, serRes] = await Promise.all([
        api.get("/appointments").catch(() => ({ data: [] })),
        api.get("/enquiry").catch(() => ({ data: [] })),
        api.get("/services").catch(() => ({ data: [] })),
      ]);

      setAppointments(Array.isArray(appRes.data) ? appRes.data : []);
      setEnquiries(Array.isArray(enqRes.data) ? enqRes.data : []);
      setServices(Array.isArray(serRes.data) ? serRes.data : []);

      const userRole = user?.role?.toLowerCase();
      if (userRole === "admin" || userRole === "manager") {
        const userRes = await api
          .get("/auth/users")
          .catch(() => ({ data: [] }));
        const allUsers = Array.isArray(userRes.data) ? userRes.data : [];
        setUsers(allUsers);
        
        // ✅ Include anyone with a specialization in the ledger (Admin, Manager, or Staff)
        setStaff(
          allUsers.filter((u) => 
            u.role?.toLowerCase() === "staff" || 
            (u.specialization && u.specialization.length > 0)
          ),
        );
      }

      setLoading(false);
    } catch (error) {
      console.error("FetchData Error:", error);
      toast.error("Connection interrupted. Please refresh.");
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const userRole = user?.role?.toLowerCase();
    if (userRole === "admin" || userRole === "manager") fetchData();
  }, [user, fetchData]);

  // ── Analytics ──────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const completed = appointments.filter((a) => a.status === "completed");

    const totalRevenue = completed.reduce(
      (sum, app) => sum + (parseFloat(app.price) || 0),
      0,
    );

    const pendingRevenue = appointments
      .filter((app) => app.status === "approved" || app.status === "pending")
      .reduce((sum, app) => sum + (parseFloat(app.price) || 0), 0);

    // ── Staff stats — TODAY ONLY (resets every 24hrs) ──────────────────────
    const staffStats = {};
    staff.forEach((s) => {
      // Initialize ALL staff members with zero, so they always appear in the ledger
      staffStats[s._id] = {
        _id: s._id,
        name: s.name,
        revenue: 0,
        services: 0,
        specialization: s.specialization || [],
      };
    });

    completed
      .filter((app) => isToday(app.date))
      .forEach((app) => {
        const sId = app.staffId?._id || app.staffId;
        if (sId && staffStats[sId]) {
          staffStats[sId].revenue += parseFloat(app.price || 0);
          staffStats[sId].services += 1;
        }
      });

    // ── Category revenue (all time) ────────────────────────────────────────
    const categoryStats = {};
    completed.forEach((app) => {
      const category = app.serviceCategory || "OTHER";
      if (!categoryStats[category]) categoryStats[category] = 0;
      categoryStats[category] += parseFloat(app.price || 0);
    });

    // ── Monthly revenue chart data ─────────────────────────────────────────
    const monthlyMap = {};
    completed.forEach((app) => {
      const label = getMonthYear(app.date || app.createdAt);
      if (!label) return;
      if (!monthlyMap[label])
        monthlyMap[label] = { month: label, revenue: 0, services: 0 };
      monthlyMap[label].revenue += parseFloat(app.price || 0);
      monthlyMap[label].services += 1;
    });

    // Sort months chronologically
    const monthlyData = Object.values(monthlyMap).sort((a, b) => {
      return new Date(a.month) - new Date(b.month);
    });

    return {
      totalRevenue,
      pendingRevenue,
      completionRate: appointments.length
        ? ((completed.length / appointments.length) * 100).toFixed(1)
        : 0,
      activeEnquiries: enquiries.filter(
        (e) => e.status !== "closed" && e.status !== "resolved",
      ).length,
      staffPerformance: staff.map((s) => staffStats[s._id]),
      categoryRevenue: categoryStats,
      monthlyData,
      todayCompleted: completed.filter((a) => isToday(a.date)).length,
      todayRevenue: completed
        .filter((a) => isToday(a.date))
        .reduce((s, a) => s + parseFloat(a.price || 0), 0),
    };
  }, [appointments, enquiries, staff]);

  // ── Transaction CRUD State ───────────────────────────────────────────
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [transactionData, setTransactionData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    price: "",
    staffId: "",
    date: new Date().toISOString().split("T")[0],
  });

  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTransaction) {
        await api.put(`/appointments/${editingTransaction._id}`, {
          ...transactionData,
          status: "completed",
        });
        toast.success("Transaction Updated");
      } else {
        await api.post("/appointments", {
          ...transactionData,
          status: "completed",
          time: "Manual Entry",
        });
        toast.success("Transaction Added");
      }
      setShowTransactionForm(false);
      setEditingTransaction(null);
      fetchData();
    } catch (err) {
      toast.error("Transaction failed");
    }
  };

  // ── Active appointments (exclude completed/cancelled/rejected) ─────────────
  const activeAppointments = useMemo(
    () =>
      appointments.filter(
        (a) => !["completed", "cancelled", "rejected"].includes(a.status),
      ),
    [appointments],
  );

  // ── Helpers ────────────────────────────────────────────────────────────────
  const getRelevantStaff = (serviceName) => {
    const selectedService = services.find((s) => s.name === serviceName);
    if (!selectedService) return staff;
    const category = selectedService.category.toUpperCase();
    return staff.filter((s) =>
      s.specialization?.some((spec) => spec.toUpperCase() === category),
    );
  };

  const resolvePrice = (app) => {
    if (app.price && parseFloat(app.price) > 0) return parseFloat(app.price);
    const populated = parseFloat(app.serviceId?.price);
    if (!isNaN(populated) && populated > 0) return populated;
    const match = services.find((s) => s.name === app.service);
    return parseFloat(match?.price) || 0;
  };

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...userData,
        specialization: (typeof userData.specialization === "string")
          ? userData.specialization.split(",").map((s) => s.trim().toUpperCase()).filter(s => s !== "")
          : userData.specialization || [],
      };

      if (editingUser) {
        await api.put(`/auth/users/${editingUser._id}/role`, payload);
        toast.success("User Updated");
      } else {
        await api.post("/auth/register", payload);
        toast.success("User Created");
      }
      fetchData();
      setShowUserForm(false);
      setEditingUser(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    }
  };

  const handleUpdateRole = async (userId, role) => {
    try {
      const { data: updatedUser } = await api.put(`/auth/users/${userId}/role`, { role });
      toast.success("Role Updated");

      // If updating yourself, update the auth context to trigger re-routing
      if (userId === user._id) {
        const userInfo = { ...user, role: updatedUser.role };
        localStorage.setItem("userInfo", JSON.stringify(userInfo));
        sessionStorage.setItem("userInfo", JSON.stringify(userInfo));
        // Force refresh to trigger useAuth's initial logic and Login's redirect
        window.location.reload();
      }

      fetchData();
    } catch {
      toast.error("Role update failed");
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Erase this user forever?")) return;
    try {
      await api.delete(`/auth/users/${id}`);
      toast.success("User Removed");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const handleAssignStaff = async (appointmentId, staffId) => {
    try {
      await api.put(`/appointments/${appointmentId}/status`, { staffId });
      fetchData();
      toast.success("Provider Assigned");
    } catch {
      toast.error("Assignment failed");
    }
  };

  const handleApprove = async (appointmentId) => {
    try {
      await api.put(`/appointments/${appointmentId}/status`, {
        status: "approved",
      });
      fetchData();
      toast.success("Service Approved");
    } catch {
      toast.error("Approval failed");
    }
  };

  const handleComplete = async (app) => {
    const resolvedPrice = resolvePrice(app);
    const priceDisplay =
      resolvedPrice > 0
        ? `KSh ${resolvedPrice.toLocaleString()}`
        : "the service price";

    if (
      !window.confirm(
        `Confirm completion and payment of ${priceDisplay} for ${app.service}?`,
      )
    )
      return;

    try {
      const { data: updated } = await api.put(
        `/appointments/${app._id}/status`,
        {
          status: "completed",
          ...(resolvedPrice > 0 && { price: resolvedPrice }),
        },
      );

      await fetchData();
      toast.success("Payment confirmed — receipt generated");
      setReceiptAppointment(updated);
    } catch {
      toast.error("Completion failed");
    }
  };

  const handleDeleteAppointment = async (id) => {
    if (!window.confirm("Erase this record from history?")) return;
    try {
      await api.delete(`/appointments/${id}`);
      fetchData();
      toast.success("Record Erased");
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleUpdateEnquiry = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/enquiry/${editingEnquiry._id}`, enquiryUpdateData);
      toast.success("Enquiry updated");
      setEditingEnquiry(null);
      fetchData();
    } catch {
      toast.error("Update failed");
    }
  };

  const handleDeleteEnquiry = async (id) => {
    if (!window.confirm("Delete this inquiry?")) return;
    try {
      await api.delete(`/enquiry/${id}`);
      fetchData();
      toast.success("Enquiry removed");
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", serviceData.name);
      formData.append("category", serviceData.category);
      formData.append("price", serviceData.price);
      formData.append("description", serviceData.description || "");
      
      if (selectedImage) {
        formData.append("image", selectedImage);
      } else {
        formData.append("image", serviceData.image || "");
      }

      const config = {
        headers: { "Content-Type": "multipart/form-data" },
      };

      if (editingService) {
        await api.put(`/services/${editingService._id}`, formData, config);
        toast.success("Menu Updated");
      } else {
        await api.post("/services", formData, config);
        toast.success("New Service Added");
      }
      fetchData();
      setShowServiceForm(false);
      setEditingService(null);
      setSelectedImage(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    }
  };

  const deleteService = async (id) => {
    if (!window.confirm("Remove this service from menu?")) return;
    try {
      await api.delete(`/services/${id}`);
      fetchData();
      toast.success("Service Removed");
    } catch {
      toast.error("Delete failed");
    }
  };

  const handlePrintReceipt = () => window.print();

  // ── Auth guard ─────────────────────────────────────────────────────────────
  if (authLoading)
    return (
      <div className="h-screen flex items-center justify-center bg-black text-gold font-black uppercase tracking-[0.5em] animate-pulse">
        Authenticating Portal...
      </div>
    );

  const userRole = user?.role?.toLowerCase();
  if (userRole !== "admin" && userRole !== "manager") {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black text-gold p-4 text-center">
        <Shield className="h-20 w-20 mb-8 opacity-20" />
        <h2 className="text-3xl font-serif font-bold uppercase tracking-widest text-white mb-4">
          Access Restricted
        </h2>
        <p className="text-gray-500 uppercase tracking-widest text-xs mb-10">
          This hub is for Director & Management eyes only.
        </p>
        <a
          href="/"
          className="btn-gold !px-10 !py-4 text-xs font-black tracking-widest"
        >
          Return to Sanctuary
        </a>
      </div>
    );
  }

  // Custom tooltip for revenue chart
  const RevenueTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1a1a1a] border border-gold/30 p-4 text-xs">
          <p className="text-gold font-black uppercase tracking-widest mb-2">
            {label}
          </p>
          <p className="text-white font-bold">
            KSh {payload[0]?.value?.toLocaleString()}
          </p>
          <p className="text-gray-400 mt-1">{payload[1]?.value} services</p>
        </div>
      );
    }
    return null;
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="bg-[#0A0A0A] min-h-screen text-white pt-6 pb-12 px-4 md:px-8">
      <div className="max-w-[1440px] mx-auto">
        {/* TOP HUD */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6 border-b border-gold/10 pb-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gold/10 border border-gold/30 flex items-center justify-center">
              <Layout className="text-gold h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-serif font-bold uppercase tracking-tighter">
                Studio <span className="text-gold italic">Director</span>
              </h1>
              <p className="text-[9px] text-gray-500 uppercase font-black tracking-[0.4em]">
                Operational Intelligence Suite
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
            {[
              {
                label: "Total Revenue",
                val: `KSh ${stats.totalRevenue.toLocaleString()}`,
                icon: <DollarSign className="h-3.5 w-3.5" />,
              },
              {
                label: "Pipeline",
                val: `KSh ${stats.pendingRevenue.toLocaleString()}`,
                icon: <Activity className="h-3.5 w-3.5" />,
              },
              {
                label: "Messages",
                val: stats.activeEnquiries,
                icon: <MessageSquare className="h-3.5 w-3.5" />,
              },
              {
                label: "Success",
                val: `${stats.completionRate}%`,
                icon: <TrendingUp className="h-3.5 w-3.5" />,
              },
            ].map((s, i) => (
              <div
                key={i}
                className="bg-white/[0.03] border border-white/5 p-3 min-w-[130px] group hover:border-gold/30 transition-all"
              >
                <div className="flex items-center gap-2 text-gray-500 mb-1 group-hover:text-gold transition-colors">
                  {s.icon}
                  <span className="text-[8px] uppercase font-black tracking-widest">
                    {s.label}
                  </span>
                </div>
                <p className="text-lg font-bold font-serif text-white">
                  {s.val}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* NAVIGATION */}
        <div className="flex gap-1.5 bg-black/40 p-1 mb-8 border border-white/5 w-fit overflow-x-auto no-scrollbar max-w-full">
          {["appointments", "reports", "enquiries", "services", "team"].map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 md:px-8 py-3 uppercase tracking-[0.2em] text-[9px] font-black transition-all whitespace-nowrap ${
                  activeTab === tab
                    ? "bg-gold text-white shadow-2xl"
                    : "text-gray-500 hover:text-gold"
                }`}
              >
                {tab}
              </button>
            ),
          )}
        </div>

        {loading ? (
          <div className="py-32 text-center">
            <div className="w-16 h-16 border-t-2 border-gold rounded-full animate-spin mx-auto mb-6" />
            <p className="text-gold uppercase tracking-[0.5em] text-[10px] font-black">
              cc beauty
            </p>          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* ── APPOINTMENTS TAB ─────────────────────────────────────────── */}
            {activeTab === "appointments" && (
              <div className="space-y-4">
                {/* Active count badge */}
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-[9px] uppercase font-black tracking-widest text-gray-500">
                    Active Queue
                  </span>
                  <span className="bg-gold/10 border border-gold/30 text-gold text-[8px] font-black px-2 py-0.5 uppercase tracking-widest">
                    {activeAppointments.length} pending
                  </span>
                </div>

                {activeAppointments.length === 0 ? (
                  <div className="glass-panel p-20 text-center text-gray-600 italic uppercase text-[9px] tracking-[0.5em]">
                    No services currently queued.
                  </div>
                ) : (
                  activeAppointments.map((app) => {
                    const displayPrice = resolvePrice(app);
                    return (
                      <div
                        key={app._id}
                        className="glass-panel p-6 flex flex-col xl:flex-row justify-between gap-6 group hover:border-gold/40 transition-all duration-700 bg-[#121212] border-white/10"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-grow">
                          {/* Guest */}
                          <div className="space-y-1">
                            <span className="text-[8px] uppercase tracking-widest text-gold font-black flex items-center gap-1.5">
                              <User className="h-2.5 w-2.5" /> The Guest
                            </span>
                            <h3 className="text-xl font-bold text-white tracking-tight">
                              {app.name}
                            </h3>
                            <p className="text-[11px] text-gray-400 font-medium">
                              {app.phone}{" "}
                              <span className="mx-1 text-white/10">|</span>{" "}
                              {app.email}
                            </p>
                            {app.notes && (
                              <div className="mt-3 p-2.5 bg-gold/[0.03] border-l-2 border-gold/30">
                                <p className="text-[8px] uppercase font-black text-gold/60 mb-1">
                                  {app.name}'s Message
                                </p>
                                <p className="text-[10px] text-gray-400 italic font-light leading-relaxed">
                                  "{app.notes}"
                                </p>
                              </div>
                            )}
                            {app.status === "cancelled" &&
                              app.cancellationReason && (
                                <div className="mt-3 p-2.5 bg-red-500/[0.03] border-l-2 border-red-500/30">
                                  <p className="text-[8px] uppercase font-black text-red-500/60 mb-1">
                                    Cancellation Reason
                                  </p>
                                  <p className="text-[10px] text-red-400/70 italic font-light leading-relaxed">
                                    "{app.cancellationReason}"
                                  </p>
                                </div>
                              )}
                          </div>

                          {/* Service + Staff */}
                          <div className="space-y-1">
                            <span className="text-[8px] uppercase tracking-widest text-gold font-black flex items-center gap-1.5">
                              <PieChart className="h-2.5 w-2.5" /> Service &
                              Provider
                            </span>
                            <h3 className="text-xl font-serif text-gray-200">
                              {app.service}
                            </h3>
                            <p className="text-[10px] text-gold/60 font-black uppercase tracking-widest">
                              KSh {displayPrice.toLocaleString()}
                            </p>
                            <div className="pt-1.5">
                              <select
                                value={(() => {
                                  if (!app.staffId) return "";
                                  if (typeof app.staffId === "string")
                                    return app.staffId;
                                  if (
                                    typeof app.staffId === "object" &&
                                    app.staffId._id
                                  )
                                    return app.staffId._id;
                                  return "";
                                })()}
                                onChange={(e) =>
                                  handleAssignStaff(app._id, e.target.value)
                                }
                                className="bg-black border border-white/10 text-gold text-[9px] uppercase font-black px-3 py-1.5 outline-none focus:border-gold transition-all w-full"
                              >
                                <option value="">Unassigned</option>
                                {staff.map((s) => {
                                  const isRelevant = getRelevantStaff(
                                    app.service,
                                  ).some((rs) => rs._id === s._id);
                                  return (
                                    <option key={s._id} value={s._id}>
                                      {s.name} {isRelevant ? "★" : ""} (
                                      {s.specialization?.join(", ")})
                                    </option>
                                  );
                                })}
                              </select>
                            </div>
                          </div>

                          {/* Date/Time */}
                          <div className="space-y-1">
                            <span className="text-[8px] uppercase tracking-widest text-gold font-black flex items-center gap-1.5">
                              <Calendar className="h-2.5 w-2.5" /> Scheduled
                              Time
                            </span>
                            <h3 className="text-xl font-light text-gray-200">
                              {app.date}
                            </h3>
                            <p className="text-[11px] text-gray-400 flex items-center gap-1.5 uppercase font-black tracking-widest">
                              <Clock className="h-2.5 w-2.5 text-gold" />{" "}
                              {app.time}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 border-t xl:border-t-0 xl:border-l border-white/5 pt-4 xl:pt-0 xl:pl-8">
                          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                            {app.status === "pending" && (
                              <button
                                onClick={() => handleApprove(app._id)}
                                className="flex-1 sm:flex-none bg-gold text-white px-6 py-2.5 text-[9px] font-black uppercase hover:brightness-110 transition-all flex items-center justify-center gap-1.5"
                              >
                                <CheckCircle className="h-3.5 w-3.5" /> Confirm
                              </button>
                            )}
                            {app.status === "approved" && (
                              <button
                                onClick={() => handleComplete(app)}
                                className="flex-1 sm:flex-none bg-green-600 text-white px-6 py-2.5 text-[9px] font-black uppercase hover:bg-green-500 transition-all flex items-center justify-center gap-1.5"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Mark Paid · KSh {displayPrice.toLocaleString()}
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteAppointment(app._id)}
                              className="bg-red-500/10 text-red-500 border border-red-500/20 p-2.5 hover:bg-red-500 hover:text-white transition-all"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* ── REPORTS TAB ──────────────────────────────────────────────── */}
            {activeTab === "reports" && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Salon Revenue */}
                  <div className="glass-panel p-8 bg-gradient-to-br from-[#121212] to-black border-gold/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-5">
                      <DollarSign className="h-32 w-32 text-gold" />
                    </div>
                    <div className="flex justify-between items-start mb-8 relative z-10">
                      <div>
                        <h2 className="text-2xl font-serif font-bold text-white uppercase tracking-widest">
                          Salon Performance
                        </h2>
                        <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.3em] mt-1.5">
                          Cumulative Financial Intelligence
                        </p>
                      </div>
                      {/* Graph button — opens monthly revenue chart */}
                      <button
                        onClick={() => setShowRevenueChart(true)}
                        className="h-12 w-12 bg-gold/10 border border-gold/30 flex items-center justify-center text-gold hover:bg-gold hover:text-black transition-all group"
                        title="View monthly revenue chart"
                      >
                        <BarChart3 className="h-6 w-6" />
                      </button>
                    </div>
                    <div className="space-y-6 relative z-10">
                      <div className="flex justify-between items-end border-b border-white/5 pb-4">
                        <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                          Realized Salon Total
                        </span>
                        <span className="text-3xl font-serif font-black text-gold">
                          KSh {stats.totalRevenue.toLocaleString()}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-6 pt-2">
                        <div>
                          <p className="text-[8px] text-gray-500 uppercase font-black mb-1">
                            Services Finished
                          </p>
                          <p className="text-xl font-bold">
                            {
                              appointments.filter(
                                (a) => a.status === "completed",
                              ).length
                            }
                          </p>
                        </div>
                        <div>
                          <p className="text-[8px] text-gray-500 uppercase font-black mb-1">
                            Avg Service Value
                          </p>
                          <p className="text-xl font-bold">
                            KSh{" "}
                            {stats.totalRevenue > 0
                              ? Math.round(
                                  stats.totalRevenue /
                                    appointments.filter(
                                      (a) => a.status === "completed",
                                    ).length,
                                ).toLocaleString()
                              : 0}
                          </p>
                        </div>
                      </div>
                      {/* Today's snapshot */}
                      <div className="border-t border-white/5 pt-4 flex justify-between items-center">
                        <div>
                          <p className="text-[8px] text-gray-500 uppercase font-black mb-1">
                            Today's Revenue
                          </p>
                          <p className="text-lg font-bold text-green-400">
                            KSh {stats.todayRevenue.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[8px] text-gray-500 uppercase font-black mb-1">
                            Today's Services
                          </p>
                          <p className="text-lg font-bold text-green-400">
                            {stats.todayCompleted}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Category Revenue */}
                  <div className="glass-panel p-8 bg-[#121212] border-white/10">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gold mb-6">
                      Category Revenue Breakdown
                    </h3>
                    <div className="space-y-5">
                      {Object.keys(stats.categoryRevenue).length > 0 ? (
                        Object.entries(stats.categoryRevenue).map(
                          ([cat, rev]) => (
                            <div key={cat} className="space-y-1.5">
                              <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                                <span className="text-gray-400">{cat}</span>
                                <span className="text-white">
                                  KSh {rev.toLocaleString()}
                                </span>
                              </div>
                              <div className="h-1 bg-white/5 overflow-hidden">
                                <div
                                  className="h-full bg-gold transition-all duration-1000"
                                  style={{
                                    width: `${(rev / stats.totalRevenue) * 100}%`,
                                  }}
                                />
                              </div>
                              <p className="text-[8px] text-gray-600 text-right">
                                {stats.totalRevenue > 0
                                  ? ((rev / stats.totalRevenue) * 100).toFixed(
                                      1,
                                    )
                                  : 0}
                                % of total
                              </p>
                            </div>
                          ),
                        )
                      ) : (
                        <p className="text-center py-8 text-gray-600 italic uppercase text-[9px] tracking-widest">
                          No service data recorded.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Staff Performance — TODAY ONLY, resets each 24hrs */}
                <div className="glass-panel overflow-hidden border-white/10">
                  <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#0C0C0C]">
                    <div>
                      <h3 className="text-lg font-serif font-bold uppercase tracking-widest text-gold">
                        Specialist Performance Ledger
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-gold opacity-50" />
                    </div>
                  </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {stats.staffPerformance.map((s, idx) => {
                    const avgPerService =
                      s.services > 0 ? Math.round(s.revenue / s.services) : 0;
                    const pctOfToday =
                      stats.todayRevenue > 0
                        ? ((s.revenue / stats.todayRevenue) * 100).toFixed(1)
                        : "0.0";

                    return (
                      <div
                        key={idx}
                        className="glass-panel p-6 bg-[#121212] border-white/10 group hover:border-gold/30 transition-all"
                      >
                        <div className="flex items-center gap-4 mb-6">
                          <div className="h-12 w-12 bg-gold/10 border border-gold/20 flex items-center justify-center text-gold font-bold text-xl">
                            {s.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white tracking-tighter group-hover:text-gold transition-colors">
                              {s.name}
                            </h3>
                            <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">
                              {s.specialization?.join(", ")}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                          <div>
                            <p className="text-[8px] text-gray-500 uppercase font-black mb-1">
                              Services
                            </p>
                            <p className="text-lg font-bold">{s.services}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[8px] text-gray-500 uppercase font-black mb-1">
                              Revenue
                            </p>
                            <p className="text-lg font-serif font-bold text-gold">
                              KSh {s.revenue.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-[8px] text-gray-500 uppercase font-black mb-1">
                              Avg/Service
                            </p>
                            <p className="text-xs font-bold text-gray-400">
                              KSh {avgPerService.toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[8px] text-gray-500 uppercase font-black mb-1">
                              Share
                            </p>
                            <p className="text-xs font-black text-gold">
                              {pctOfToday}%
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 h-1 bg-white/5 overflow-hidden">
                          <div
                            className="h-full bg-gold transition-all duration-1000"
                            style={{ width: `${pctOfToday}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  {stats.staffPerformance.length === 0 && (
                    <div className="col-span-full py-20 text-center text-gray-600 italic uppercase text-[9px] tracking-[0.5em]">
                      No services completed today yet.
                    </div>
                  )}
                </div>
                </div>

                {/* Transaction History */}
                <div className="glass-panel overflow-hidden border-white/10">
                  <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <h3 className="text-lg font-serif font-bold uppercase tracking-widest">
                      Transaction History
                    </h3>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setEditingTransaction(null);
                          setTransactionData({
                            name: "", email: "", phone: "", service: "", price: "", staffId: "", 
                            date: new Date().toISOString().split("T")[0]
                          });
                          setShowTransactionForm(true);
                        }}
                        className="text-[8px] font-black uppercase tracking-widest text-gold flex items-center gap-1.5 border border-gold/30 px-3 py-1.5 hover:bg-gold hover:text-black transition-all"
                      >
                        <Plus className="h-3 w-3" /> Manual Entry
                      </button>
                      <button className="text-[8px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-1.5 border border-white/10 px-3 py-1.5 hover:bg-white/5 transition-all">
                        <Download className="h-3 w-3" /> Export Ledger
                      </button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-black/60 text-[8px] uppercase font-black tracking-widest text-gray-500">
                        <tr>
                          <th className="p-4">Date</th>
                          <th className="p-4">Client</th>
                          <th className="p-4">Service</th>
                          <th className="p-4">Staff</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">Receipt No.</th>
                          <th className="p-4 text-right">Amount</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {appointments
                          .filter((app) => app.status === "completed")
                          .map((app) => (
                            <tr
                              key={app._id}
                              className="hover:bg-white/[0.02] transition-colors"
                            >
                              <td className="p-4 text-[11px] text-gray-400">
                                {app.date}
                              </td>
                              <td className="p-4 font-bold text-xs">
                                {app.name}
                              </td>
                              <td className="p-4 text-[11px] italic">
                                {app.service}
                              </td>
                              <td className="p-4 text-[11px] text-gray-400">
                                {app.staffId?.name ||
                                  app.handledBy?.name ||
                                  "—"}
                              </td>
                              <td className="p-4">
                                <span className="px-2 py-0.5 text-[7px] font-black uppercase tracking-widest border border-green-500/30 text-green-500">
                                  completed
                                </span>
                              </td>
                              <td className="p-4 text-[9px] font-black text-gold/60 tracking-widest">
                                {app.receiptNo || "—"}
                              </td>
                              <td className="p-4 text-right font-serif font-bold text-xs">
                                KSh{" "}
                                {parseFloat(app.price || 0).toLocaleString()}
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex justify-end gap-1.5">
                                  {app.receiptNo && (
                                    <button
                                      onClick={() => setReceiptAppointment(app)}
                                      className="p-1.5 text-gold/60 hover:text-gold border border-gold/10 hover:border-gold/30 transition-all"
                                      title="View Receipt"
                                    >
                                      <Receipt className="h-3.5 w-3.5" />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => {
                                      setEditingTransaction(app);
                                      setTransactionData({
                                        name: app.name,
                                        email: app.email,
                                        phone: app.phone,
                                        service: app.service,
                                        price: app.price,
                                        staffId: app.staffId?._id || app.staffId || "",
                                        date: app.date || new Date().toISOString().split("T")[0]
                                      });
                                      setShowTransactionForm(true);
                                    }}
                                    className="p-1.5 text-gray-500 hover:text-white border border-white/5 hover:border-white/20 transition-all"
                                  >
                                    <Edit className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteAppointment(app._id)}
                                    className="p-1.5 text-red-500/50 hover:text-red-500 border border-red-500/10 hover:border-red-500/30 transition-all"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        {appointments.filter((a) => a.status === "completed")
                          .length === 0 && (
                          <tr>
                            <td
                              colSpan="8"
                              className="p-16 text-center text-gray-600 italic uppercase text-[9px] tracking-[0.5em]"
                            >
                              No completed transactions yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── ENQUIRIES TAB ─────────────────────────────────────────────── */}
            {activeTab === "enquiries" && (
              <div className="grid grid-cols-1 gap-5">
                {enquiries.length === 0 ? (
                  <div className="glass-panel p-24 text-center text-gray-600 italic uppercase text-[9px] tracking-[0.5em]">
                    The message box is empty.
                  </div>
                ) : (
                  enquiries.map((enq) => (
                    <div
                      key={enq._id}
                      className="glass-panel p-8 bg-[#121212] border-white/5 hover:border-gold/20 transition-all duration-500"
                    >
                      <div className="flex flex-col md:flex-row justify-between gap-6 mb-6">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-3">
                            <span
                              className={`px-2 py-0.5 text-[7px] font-black uppercase tracking-widest border ${
                                enq.status === "resolved"
                                  ? "border-green-500 text-green-500"
                                  : "border-gold text-gold"
                              }`}
                            >
                              {enq.status || "new"}
                            </span>
                            <h3 className="text-2xl font-serif font-bold text-white">
                              {enq.name}
                            </h3>
                          </div>
                          <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">
                            {enq.email}{" "}
                            <span className="mx-1 text-white/10">|</span>{" "}
                            {enq.phone}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingEnquiry(enq);
                              setEnquiryUpdateData({
                                status: enq.status || "new",
                                notes: enq.notes || "",
                              });
                            }}
                            className="bg-white/5 border border-white/10 p-3 hover:bg-gold hover:text-black transition-all"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteEnquiry(enq._id)}
                            className="bg-red-500/10 text-red-500 border border-red-500/20 p-3 hover:bg-red-500 hover:text-white transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="bg-black/60 p-6 border-l-3 border-gold shadow-inner text-gray-300 italic text-base font-light leading-relaxed mb-4">
                        "{enq.message}"
                      </div>
                      {enq.notes && (
                        <div className="p-3 bg-gold/5 border border-gold/10 rounded">
                          <p className="text-[8px] uppercase font-black text-gold mb-1">
                            Internal Notes
                          </p>
                          <p className="text-[11px] text-gray-400">
                            {enq.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ── SERVICES TAB ──────────────────────────────────────────────── */}
            {activeTab === "services" && (
              <div className="space-y-8">
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setEditingService(null);
                      setServiceFormData({
                        name: "",
                        category: "",
                        price: "",
                        description: "",
                        duration: "",
                        image: "",
                      });
                      setShowServiceForm(true);
                    }}
                    className="bg-gold text-white px-6 py-3 text-[10px] font-black uppercase tracking-widest flex items-center gap-2.5 hover:scale-105 transition-all shadow-2xl shadow-gold/20"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Service
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.map((s) => (
                    <div
                      key={s._id}
                      className="glass-panel p-6 bg-[#121212] border-white/10 relative overflow-hidden group hover:border-gold/40 transition-all duration-500"
                    >
                      {s.image && (
                        <div className="absolute top-0 right-0 w-24 h-24 opacity-10 group-hover:opacity-20 transition-opacity">
                          <img
                            src={s.image}
                            alt=""
                            className="w-full h-full object-cover grayscale"
                          />
                        </div>
                      )}
                      <div className="flex justify-between items-start mb-6 relative z-10">
                        <span className="bg-gold/10 text-gold text-[8px] font-black px-3 py-1 uppercase tracking-widest border border-gold/30">
                          {s.category}
                        </span>
                        <span className="text-xl font-serif font-black text-gold">
                          KSh {s.price}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-1.5 relative z-10">
                        {s.name}
                      </h3>
                      <div className="flex gap-2 relative z-10">
                        <button
                          onClick={() => {
                            setEditingService(s);
                            setServiceFormData(s);
                            setShowServiceForm(true);
                          }}
                          className="flex-1 bg-white/5 border border-white/10 py-2.5 flex justify-center hover:bg-gold hover:text-black transition-all"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => deleteService(s._id)}
                          className="flex-1 bg-red-500/5 border border-red-500/10 py-2.5 flex justify-center hover:bg-red-500 hover:text-white transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── TEAM TAB ──────────────────────────────────────────────────── */}
            {activeTab === "team" && (
              <div className="space-y-12">
                <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-6">
                  <div>
                    <h2 className="text-2xl font-serif font-bold uppercase tracking-widest text-gold">
                      Talent Hub
                    </h2>
                    <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.3em] mt-1.5">
                      Manage permissions and specializations
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingUser(null);
                      setUserFormData({
                        name: "",
                        email: "",
                        password: "",
                        role: "staff",
                        specialization: "",
                      });
                      setShowUserForm(true);
                    }}
                    className="bg-gold text-white px-6 py-3 text-[10px] font-black uppercase tracking-widest flex items-center gap-2.5"
                  >
                    <UserPlus className="h-3.5 w-3.5" /> Add Member
                  </button>
                </div>

                {/* Personnel Section */}
                <div>
                  <h3 className="text-sm font-black uppercase tracking-[0.4em] text-gold/60 mb-8 flex items-center gap-3">
                    <Shield className="h-4 w-4" /> Personnel & Management
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {users
                      .filter((u) => u.role !== "client")
                      .map((u) => (
                        <div
                          key={u._id}
                          className="glass-panel p-8 bg-[#121212] border-white/5 hover:border-gold/30 transition-all group"
                        >
                          <div className="flex items-center gap-4 mb-8">
                            <div className="h-12 w-12 bg-gold text-black flex items-center justify-center">
                              <User className="h-6 w-6" />
                            </div>
                            <div className="flex-grow">
                              <h3 className="text-xl font-bold text-white tracking-tighter">
                                {u.name}
                              </h3>
                              <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">
                                {u.email}
                              </p>
                              <span className="text-[7px] font-black uppercase tracking-[0.2em] text-gold mt-0.5 block">
                                {u.role}
                              </span>
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <button
                                onClick={() => {
                                  setEditingUser(u);
                                  setUserFormData({
                                    ...u,
                                    password: "",
                                    specialization:
                                      u.specialization?.join(", ") || "",
                                  });
                                  setShowUserForm(true);
                                }}
                                className="p-1.5 bg-white/5 border border-white/10 hover:text-gold transition-colors"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u._id)}
                                className="p-1.5 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                          <div className="space-y-5">
                            <div className="space-y-2">
                              <span className="text-[8px] uppercase tracking-widest text-gold font-black block">
                                Quick Role Toggle
                              </span>
                              <div className="grid grid-cols-2 gap-1.5">
                                {["client", "staff", "manager", "admin"].map(
                                  (role) => (
                                    <button
                                      key={role}
                                      onClick={() =>
                                        handleUpdateRole(u._id, role)
                                      }
                                      disabled={
                                        role === "admin" &&
                                        user.role !== "admin" &&
                                        user.role !== "manager"
                                      }
                                      className={`py-2 text-[7px] font-black uppercase tracking-widest border transition-all ${
                                        u.role === role
                                          ? "bg-gold text-black border-gold"
                                          : "border-white/10 text-gray-500 hover:border-gold/50"
                                      }`}
                                    >
                                      {role}
                                    </button>
                                  ),
                                )}
                              </div>
                            </div>
                            {u.specialization && (
                              <div className="pt-4 border-t border-white/5">
                                <span className="text-[8px] uppercase tracking-widest text-gold font-black block mb-1.5">
                                  Portfolio
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {u.specialization.map((s) => (
                                    <span
                                      key={s}
                                      className="px-1.5 py-0.5 bg-white/5 border border-white/10 text-[7px] font-black uppercase text-gray-400"
                                    >
                                      {s}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Client Section */}
                <div>
                  <h3 className="text-sm font-black uppercase tracking-[0.4em] text-gray-500 mb-8 flex items-center gap-3">
                    <User className="h-4 w-4" /> Client Directory
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {users
                      .filter((u) => u.role === "client")
                      .map((u) => (
                        <div
                          key={u._id}
                          className="glass-panel p-6 bg-[#0F0F0F] border-white/5 hover:border-gold/20 transition-all group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-gold/10 text-gold border border-gold/20 flex items-center justify-center">
                              <User className="h-5 w-5" />
                            </div>
                            <div className="flex-grow">
                              <h3 className="text-lg font-bold text-white tracking-tight">
                                {u.name}
                              </h3>
                              <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">
                                {u.email}
                              </p>
                            </div>
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => {
                                  setEditingUser(u);
                                  setUserFormData({
                                    ...u,
                                    password: "",
                                    specialization: "",
                                  });
                                  setShowUserForm(true);
                                }}
                                className="p-1.5 bg-white/5 border border-white/10 hover:text-gold transition-colors"
                              >
                                <Edit className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u._id)}
                                className="p-1.5 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 transition-all"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    {users.filter((u) => u.role === "client").length === 0 && (
                      <div className="col-span-full py-12 text-center text-gray-600 italic uppercase text-[9px] tracking-widest">
                        No clients registered yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* ── MONTHLY REVENUE CHART MODAL ───────────────────────────────────────── */}
      <AnimatePresence>
        {showRevenueChart && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="bg-[#0D0D0D] border border-gold/30 w-full max-w-4xl shadow-[0_0_100px_rgba(212,175,55,0.1)] overflow-hidden"
            >
              {/* Header */}
              <div className="bg-black border-b border-gold/20 p-8 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-serif font-bold uppercase tracking-widest text-gold">
                    Revenue History
                  </h2>
                  <p className="text-[9px] uppercase tracking-[0.4em] text-white/30 mt-1">
                    Monthly Breakdown · All Time
                  </p>
                </div>
                <button
                  onClick={() => setShowRevenueChart(false)}
                  className="p-3 text-gold/40 hover:text-gold hover:bg-white/5 transition-all"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Summary strip */}
              <div className="grid grid-cols-3 border-b border-white/5 divide-x divide-white/5">
                {[
                  {
                    label: "Total Revenue",
                    val: `KSh ${stats.totalRevenue.toLocaleString()}`,
                  },
                  {
                    label: "Total Services",
                    val: appointments.filter((a) => a.status === "completed")
                      .length,
                  },
                  {
                    label: "Months Active",
                    val: stats.monthlyData.length,
                  },
                ].map((s, i) => (
                  <div key={i} className="p-6 bg-white/[0.02]">
                    <p className="text-[9px] uppercase font-black tracking-widest text-gold/50 mb-1">
                      {s.label}
                    </p>
                    <p className="text-xl font-bold font-serif text-white">
                      {s.val}
                    </p>
                  </div>
                ))}
              </div>

              {/* Chart */}
              <div className="p-8">
                {stats.monthlyData.length > 0 ? (
                  <>
                    {/* Revenue bar chart */}
                    <p className="text-[9px] uppercase font-black tracking-widest text-gold/50 mb-6">
                      Monthly Revenue (KSh)
                    </p>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart
                        data={stats.monthlyData}
                        margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgba(255,255,255,0.05)"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="month"
                          tick={{
                            fill: "#666",
                            fontSize: 10,
                            fontWeight: 700,
                            textTransform: "uppercase",
                          }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fill: "#666", fontSize: 10 }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(v) =>
                            v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v
                          }
                        />
                        <Tooltip content={<RevenueTooltip />} />
                        <Bar
                          dataKey="revenue"
                          fill="#D4AF37"
                          radius={[2, 2, 0, 0]}
                          maxBarSize={48}
                        />
                      </BarChart>
                    </ResponsiveContainer>

                    {/* Services line chart */}
                    <p className="text-[9px] uppercase font-black tracking-widest text-gold/50 mb-6 mt-10">
                      Services Completed Per Month
                    </p>
                    <ResponsiveContainer width="100%" height={160}>
                      <LineChart
                        data={stats.monthlyData}
                        margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgba(255,255,255,0.05)"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="month"
                          tick={{
                            fill: "#666",
                            fontSize: 10,
                            fontWeight: 700,
                          }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fill: "#666", fontSize: 10 }}
                          axisLine={false}
                          tickLine={false}
                          allowDecimals={false}
                        />
                        <Tooltip content={<RevenueTooltip />} />
                        <Line
                          type="monotone"
                          dataKey="services"
                          stroke="#4ade80"
                          strokeWidth={2}
                          dot={{ fill: "#4ade80", r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>

                    {/* Monthly breakdown table */}
                    <div className="mt-10 border border-white/5 overflow-hidden">
                      <table className="w-full text-left">
                        <thead className="bg-black/60 text-[9px] uppercase font-black tracking-widest text-gray-500">
                          <tr>
                            <th className="p-4">Month</th>
                            <th className="p-4 text-center">Services</th>
                            <th className="p-4 text-right">Revenue</th>
                            <th className="p-4 text-right">Avg / Service</th>
                            <th className="p-4 text-right">% of Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {[...stats.monthlyData].reverse().map((row, i) => (
                            <tr
                              key={i}
                              className="hover:bg-white/[0.02] transition-colors"
                            >
                              <td className="p-4 text-xs font-bold text-white">
                                {row.month}
                              </td>
                              <td className="p-4 text-center text-xs text-gray-400">
                                {row.services}
                              </td>
                              <td className="p-4 text-right font-serif font-bold text-gold">
                                KSh {row.revenue.toLocaleString()}
                              </td>
                              <td className="p-4 text-right text-xs text-gray-400">
                                KSh{" "}
                                {row.services > 0
                                  ? Math.round(
                                      row.revenue / row.services,
                                    ).toLocaleString()
                                  : 0}
                              </td>
                              <td className="p-4 text-right text-[10px] font-black text-gold/60">
                                {stats.totalRevenue > 0
                                  ? (
                                      (row.revenue / stats.totalRevenue) *
                                      100
                                    ).toFixed(1)
                                  : 0}
                                %
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <div className="py-32 text-center text-gray-600 italic uppercase text-[10px] tracking-[0.5em]">
                    No completed transactions recorded yet.
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-white/5 text-right">
                <button
                  onClick={() => setShowRevenueChart(false)}
                  className="bg-white/5 border border-white/10 text-white/60 px-8 py-3 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── RECEIPT MODAL ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {receiptAppointment && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl print:bg-white print:p-0">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="bg-[#0D0D0D] border border-gold/30 w-full max-w-lg shadow-[0_0_100px_rgba(212,175,55,0.1)] print:shadow-none print:border-none print:bg-white print:text-black"
            >
              <div className="bg-black print:bg-white border-b border-gold/20 p-8 text-center relative">
                <button
                  onClick={() => setReceiptAppointment(null)}
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

              <div className="px-8 py-6 border-b border-white/5 print:border-black/20 flex justify-between items-center bg-white/[0.02] print:bg-white">
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-gold/50 font-black print:text-black">
                    Receipt No.
                  </p>
                  <p className="text-lg font-black text-white print:text-black tracking-widest">
                    {receiptAppointment.receiptNo}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] uppercase tracking-widest text-gold/50 font-black print:text-black">
                    Date
                  </p>
                  <p className="text-sm font-bold text-white/80 print:text-black">
                    {receiptAppointment.date}
                  </p>
                  <p className="text-xs text-white/40 print:text-black">
                    {receiptAppointment.time}
                  </p>
                </div>
              </div>

              <div className="px-8 py-8 space-y-6 print:text-black">
                <div className="flex justify-between items-start">
                  <span className="text-[9px] uppercase tracking-widest text-gold/50 font-black print:text-black w-1/3">
                    Client
                  </span>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white print:text-black">
                      {receiptAppointment.name}
                    </p>
                    <p className="text-xs text-white/40 print:text-black">
                      {receiptAppointment.phone}
                    </p>
                    {receiptAppointment.email && (
                      <p className="text-xs text-white/40 print:text-black">
                        {receiptAppointment.email}
                      </p>
                    )}
                  </div>
                </div>
                <div className="h-px bg-white/5 print:bg-black/10" />
                <div className="flex justify-between items-start">
                  <span className="text-[9px] uppercase tracking-widest text-gold/50 font-black print:text-black w-1/3">
                    Service
                  </span>
                  <p className="text-sm font-bold text-white print:text-black text-right">
                    {receiptAppointment.service}
                  </p>
                </div>
                <div className="h-px bg-white/5 print:bg-black/10" />
                <div className="flex justify-between items-start">
                  <span className="text-[9px] uppercase tracking-widest text-gold/50 font-black print:text-black w-1/3">
                    Specialist
                  </span>
                  <p className="text-sm text-white/70 print:text-black text-right">
                    {receiptAppointment.staffId?.name ||
                      receiptAppointment.handledBy?.name ||
                      "—"}
                  </p>
                </div>
                <div className="h-px bg-white/5 print:bg-black/10" />
                <div className="flex justify-between items-start">
                  <span className="text-[9px] uppercase tracking-widest text-gold/50 font-black print:text-black w-1/3">
                    Status
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-widest border border-green-500/30 text-green-500 px-3 py-1 print:text-black print:border-black">
                    {receiptAppointment.paymentStatus || "Paid"}
                  </span>
                </div>
              </div>

              <div className="mx-8 mb-8 p-6 bg-gold/5 border border-gold/20 print:bg-white print:border-black/20">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black uppercase tracking-[0.3em] text-gold/60 print:text-black">
                    Total Amount Paid
                  </span>
                  <span className="text-3xl font-serif font-black text-gold print:text-black">
                    KSh{" "}
                    {parseFloat(receiptAppointment.price || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="px-8 pb-8 text-center space-y-6">
                <p className="text-[9px] text-white/20 uppercase tracking-[0.3em] print:text-black">
                  Thank you for choosing CC Beauty Clinic
                </p>
                <div className="flex gap-3 print:hidden">
                  <button
                    onClick={handlePrintReceipt}
                    className="flex-1 border border-gold/30 text-gold py-4 text-[10px] font-black uppercase tracking-widest hover:bg-gold hover:text-black transition-all flex items-center justify-center gap-2"
                  >
                    <Printer className="h-4 w-4" /> Print Receipt
                  </button>
                  <button
                    onClick={() => setReceiptAppointment(null)}
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

      {/* ── SERVICE MODAL ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showServiceForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#111111] border-2 border-gold/30 p-10 md:p-16 w-full max-w-xl shadow-[0_0_150px_rgba(0,0,0,1)]"
            >
              <div className="flex justify-between items-start mb-12">
                <div>
                  <h2 className="text-4xl font-serif font-bold uppercase tracking-widest text-gold">
                    {editingService ? "Refine Service" : "New Collection"}
                  </h2>
                  <p className="text-[10px] uppercase tracking-[0.4em] text-gray-500 font-black mt-2">
                    Curating the Elite Experience
                  </p>
                </div>
                <button
                  onClick={() => setShowServiceForm(false)}
                  className="p-4 bg-white/5 hover:bg-gold hover:text-black transition-all rounded-full"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={handleServiceSubmit} className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-widest text-gold font-black">
                    Service Title
                  </label>
                  <input
                    required
                    value={serviceData.name}
                    onChange={(e) =>
                      setServiceFormData({
                        ...serviceData,
                        name: e.target.value,
                      })
                    }
                    className="w-full bg-black border-b border-white/10 p-4 outline-none focus:border-gold transition-all text-white text-xl font-light"
                    placeholder="e.g. Diamond Glow Facial"
                  />
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-widest text-gold font-black">
                      Category
                    </label>
                    <input
                      required
                      value={serviceData.category}
                      onChange={(e) =>
                        setServiceFormData({
                          ...serviceData,
                          category: e.target.value,
                        })
                      }
                      className="w-full bg-black border-b border-white/10 p-4 outline-none focus:border-gold transition-all text-white font-light"
                      placeholder="e.g. FACIAL"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-widest text-gold font-black">
                      Investment (KSh)
                    </label>
                    <input
                      required
                      value={serviceData.price}
                      onChange={(e) =>
                        setServiceFormData({
                          ...serviceData,
                          price: e.target.value,
                        })
                      }
                      className="w-full bg-black border-b border-white/10 p-4 outline-none focus:border-gold transition-all text-white font-light"
                      placeholder="e.g. 5000"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-widest text-gold font-black">
                      Service Image
                    </label>
                    <div className="flex items-center gap-4">
                      { (selectedImage || serviceData.image) && (
                        <div className="h-12 w-12 border border-gold/30 overflow-hidden bg-black flex-shrink-0">
                          <img 
                            src={selectedImage ? URL.createObjectURL(selectedImage) : serviceData.image} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full bg-black border-b border-white/10 p-3 outline-none focus:border-gold transition-all text-white text-[10px]"
                      />
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-gold text-white py-6 text-lg font-black uppercase tracking-[0.5em] shadow-2xl shadow-gold/20 hover:scale-[1.02] transition-all"
                >
                  Confirm Menu Update
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── USER MODAL ───────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showUserForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#111111] border-2 border-gold/30 p-10 w-full max-w-xl shadow-2xl"
            >
              <div className="flex justify-between items-start mb-10">
                <h2 className="text-3xl font-serif font-bold uppercase tracking-widest text-gold">
                  {editingUser ? "Update Profile" : "New Member"}
                </h2>
                <button
                  onClick={() => setShowUserForm(false)}
                  className="p-2 hover:bg-gold hover:text-black transition-all rounded-full"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleUserSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-widest text-gold font-black">
                      Full Name
                    </label>
                    <input
                      required
                      value={userData.name}
                      onChange={(e) =>
                        setUserFormData({ ...userData, name: e.target.value })
                      }
                      className="w-full bg-black border border-white/10 p-3 text-white outline-none focus:border-gold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-widest text-gold font-black">
                      Email
                    </label>
                    <input
                      required
                      type="email"
                      value={userData.email}
                      onChange={(e) =>
                        setUserFormData({ ...userData, email: e.target.value })
                      }
                      className="w-full bg-black border border-white/10 p-3 text-white outline-none focus:border-gold"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-widest text-gold font-black">
                      Role
                    </label>
                    <select
                      value={userData.role}
                      onChange={(e) =>
                        setUserFormData({ ...userData, role: e.target.value })
                      }
                      className="w-full bg-black border border-white/10 p-3 text-white outline-none focus:border-gold"
                    >
                      <option value="client">Client</option>
                      <option value="staff">Staff</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-widest text-gold font-black">
                      Password {editingUser && "(blank = keep current)"}
                    </label>
                    <input
                      type="password"
                      value={userData.password}
                      onChange={(e) =>
                        setUserFormData({
                          ...userData,
                          password: e.target.value,
                        })
                      }
                      className="w-full bg-black border border-white/10 p-3 text-white outline-none focus:border-gold"
                    />
                  </div>
                </div>
                {(userData.role === "staff" || userData.role === "manager") && (
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-widest text-gold font-black">
                      Specialization (e.g. NAILS, HAIR, WIGS)
                    </label>
                    <input
                      value={userData.specialization}
                      onChange={(e) =>
                        setUserFormData({
                          ...userData,
                          specialization: e.target.value,
                        })
                      }
                      className="w-full bg-black border border-white/10 p-3 text-white outline-none focus:border-gold uppercase"
                    />
                  </div>
                )}
                <button
                  type="submit"
                  className="w-full bg-gold text-white py-4 font-black uppercase tracking-widest mt-4"
                >
                  Save Identity
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── TRANSACTION MODAL ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showTransactionForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#111111] border-2 border-gold/30 p-10 w-full max-w-xl shadow-2xl"
            >
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h2 className="text-3xl font-serif font-bold uppercase tracking-widest text-gold">
                    {editingTransaction ? "Edit Transaction" : "Manual Entry"}
                  </h2>
                  <p className="text-[9px] uppercase tracking-[0.4em] text-gray-500 font-black mt-1">
                    Financial Record Intelligence
                  </p>
                </div>
                <button
                  onClick={() => setShowTransactionForm(false)}
                  className="p-2 hover:bg-gold hover:text-black transition-all rounded-full"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleTransactionSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-widest text-gold font-black">
                      Client Name
                    </label>
                    <input
                      required
                      value={transactionData.name}
                      onChange={(e) => setTransactionData({...transactionData, name: e.target.value})}
                      className="w-full bg-black border border-white/10 p-3 text-white outline-none focus:border-gold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-widest text-gold font-black">
                      Phone
                    </label>
                    <input
                      required
                      value={transactionData.phone}
                      onChange={(e) => setTransactionData({...transactionData, phone: e.target.value})}
                      className="w-full bg-black border border-white/10 p-3 text-white outline-none focus:border-gold"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-widest text-gold font-black">
                      Service Provided
                    </label>
                    <select
                      required
                      value={transactionData.service}
                      onChange={(e) => setTransactionData({...transactionData, service: e.target.value})}
                      className="w-full bg-black border border-white/10 p-3 text-white outline-none focus:border-gold"
                    >
                      <option value="">Select Service</option>
                      {services.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-widest text-gold font-black">
                      Amount (KSh)
                    </label>
                    <input
                      required
                      type="number"
                      value={transactionData.price}
                      onChange={(e) => setTransactionData({...transactionData, price: e.target.value})}
                      className="w-full bg-black border border-white/10 p-3 text-white outline-none focus:border-gold"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-widest text-gold font-black">
                      Provider
                    </label>
                    <select
                      required
                      value={transactionData.staffId}
                      onChange={(e) => setTransactionData({...transactionData, staffId: e.target.value})}
                      className="w-full bg-black border border-white/10 p-3 text-white outline-none focus:border-gold"
                    >
                      <option value="">Select Specialist</option>
                      {staff.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-widest text-gold font-black">
                      Date
                    </label>
                    <input
                      required
                      type="date"
                      value={transactionData.date}
                      onChange={(e) => setTransactionData({...transactionData, date: e.target.value})}
                      className="w-full bg-black border border-white/10 p-3 text-white outline-none focus:border-gold"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-gold text-white py-4 font-black uppercase tracking-widest mt-4 shadow-2xl shadow-gold/20"
                >
                  {editingTransaction ? "Update Record" : "Save Transaction"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── ENQUIRY MODAL ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {editingEnquiry && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#111111] border-2 border-gold/30 p-10 w-full max-w-lg shadow-2xl"
            >
              <h2 className="text-2xl font-serif font-bold uppercase tracking-widest text-gold mb-10 text-center">
                Manage Enquiry
              </h2>
              <form onSubmit={handleUpdateEnquiry} className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-widest text-gold font-black">
                    Resolution Status
                  </label>
                  <select
                    value={enquiryUpdateData.status}
                    onChange={(e) =>
                      setEnquiryUpdateData({
                        ...enquiryUpdateData,
                        status: e.target.value,
                      })
                    }
                    className="w-full bg-black border border-white/10 p-4 text-white uppercase tracking-widest text-xs"
                  >
                    <option value="new">New Inquiry</option>
                    <option value="in-progress">Action Taken</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-widest text-gold font-black">
                    Internal Resolution Notes
                  </label>
                  <textarea
                    value={enquiryUpdateData.notes}
                    onChange={(e) =>
                      setEnquiryUpdateData({
                        ...enquiryUpdateData,
                        notes: e.target.value,
                      })
                    }
                    className="w-full bg-black border border-white/10 p-4 text-white text-sm min-h-[150px] outline-none focus:border-gold"
                    placeholder="Describe action taken or notes for the team..."
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setEditingEnquiry(null)}
                    className="flex-1 border border-white/10 py-4 uppercase text-[10px] font-black tracking-widest"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gold text-white py-4 uppercase text-[10px] font-black tracking-widest"
                  >
                    Update Record
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

export default Admin;
