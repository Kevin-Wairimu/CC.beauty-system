import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MessageSquare,
  Sparkles,
  Star,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const Booking = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      toast.error("Login first");
      navigate("/login");
    }
  }, [user, loading, navigate]);

  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState({
    appropriate: [],
    others: [],
  });
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    service: "",
    date: "",
    time: "",
    notes: "",
    staffId: "",
  });
  const [status, setStatus] = useState({
    loading: false,
    success: false,
    error: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, staffRes] = await Promise.all([
          api.get("/services"),
          api.get("/auth/staff"),
        ]);
        setServices(servicesRes.data);
        setStaff(staffRes.data);
        setFilteredStaff({ appropriate: [], others: staffRes.data });
      } catch (error) {
        console.error("Booking Data Fetch Error:", error);
        setStatus((prev) => ({ ...prev, error: "Failed to load data" }));
      }
    };
    fetchData();
  }, []);

  // Pre-fill user data if logged in
  useEffect(() => {
    if (user) {
      const handle = setTimeout(() => {
        setFormData((prev) => ({
          ...prev,
          name: user.name || "",
          email: user.email || "",
        }));
      }, 0);
      return () => clearTimeout(handle);
    }
  }, [user]);

  // Filter staff when service changes
  useEffect(() => {
    if (formData.service) {
      const selectedService = services.find((s) => s.name === formData.service);
      if (selectedService) {
        const category = selectedService.category.toUpperCase();

        const appropriate = staff.filter((s) => {
          return s.specialization?.some(
            (spec) => spec.toUpperCase() === category,
          );
        });

        const others = staff.filter((s) => {
          return !s.specialization?.some(
            (spec) => spec.toUpperCase() === category,
          );
        });

        setTimeout(() => setFilteredStaff({ appropriate, others }), 0);
      }
    } else {
      setTimeout(() => setFilteredStaff({ appropriate: [], others: staff }), 0);
    }
  }, [formData.service, staff, services]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: "" });

    const serviceObj = services.find((s) => s.name === formData.service);
    const submissionData = {
      ...formData,
      serviceId: serviceObj?._id,
    };

    try {
      await api.post("/appointments", submissionData);
      setStatus({ loading: false, success: true, error: "" });
      toast.success("Luxury session requested! We will contact you soon.");

      setFormData({
        name: user ? user.name : "",
        email: user ? user.email : "",
        phone: "",
        service: "",
        date: "",
        time: "",
        notes: "",
        staffId: "",
      });
    } catch (err) {
      const msg = err.response?.data?.message || "Booking failed";
      setStatus({ loading: false, success: false, error: msg });
      toast.error(msg);
    }
  };

  const getStaffTitle = (name, specializations) => {
    const specs = (specializations || []).map((s) => s.toUpperCase());
    if (name === "Steve") return "Nail Technician";
    if (name === "Martha") return "Makeup Artist";
    if (name === "Sam")
      return "Makeup Artist, Lash Technician, Nail Technician";
    if (name === "Wangari") return "Hairdresser, Receptionist";
    if (name === "Milka") return "Hairdresser";
    if (name === "Ceisey") return "Wig Stylist, Nail Technician";

    if (specs.length === 0) return "Master Technician";
    return specs
      .map((s) => {
        if (s === "NAILS") return "Nail Technician";
        if (s === "MAKEUP") return "Makeup Artist";
        if (s === "LASHES") return "Lash Technician";
        if (s === "WIGS") return "Wig Stylist";
        if (s === "HAIR") return "Hairdresser";
        if (s === "RECEPTIONIST") return "Receptionist";
        return s;
      })
      .join(", ");
  };

  return (
    <div className="bg-[#0F0F0F] min-h-screen text-white py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Sparkles className="text-gold h-12 w-12 mx-auto mb-4 animate-pulse" />
          <h1 className="text-4xl md:text-6xl font-serif font-bold uppercase tracking-widest text-gold mb-4">
            Secure Your Session
          </h1>
          <p className="text-gray-400 text-sm md:text-lg italic tracking-[0.3em] font-light">
            excellence tailored to you
          </p>
        </motion.div>

        {status.success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gold/10 border border-gold/30 p-8 mb-12 text-center"
          >
            <p className="text-gold font-black uppercase tracking-[0.3em] text-xl">
              Reservation Received
            </p>
            <p className="text-gray-400 text-sm mt-2 font-light">
              Our concierge will contact you shortly to finalize your luxury
              experience.
            </p>
          </motion.div>
        )}

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="glass-panel p-8 md:p-16 shadow-2xl relative overflow-hidden bg-[#121212]"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-gold/[0.03] blur-[120px] rounded-full -mr-48 -mt-48 pointer-events-none"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div className="group">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-gold mb-3">
                <User className="h-3 w-3" /> Full Identity
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="The name on your profile"
                readOnly={!!user}
                className={`w-full bg-black/40 border-b border-white/10 group-focus-within:border-gold px-0 py-4 outline-none transition-all placeholder:text-gray-700 text-white text-lg font-light ${user ? "opacity-60" : ""}`}
              />
            </div>
            <div className="group">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-gold mb-3">
                <Phone className="h-3 w-3" /> Contact Number
              </label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="07XX XXX XXX"
                className="w-full bg-black/40 border-b border-white/10 group-focus-within:border-gold px-0 py-4 outline-none transition-all placeholder:text-gray-700 text-white text-lg font-light"
              />
            </div>
          </div>

          <div className="mb-10 group">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-gold mb-3">
              <Mail className="h-3 w-3" /> Digital Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Your email for confirmation"
              readOnly={!!user}
              className={`w-full bg-black/40 border-b border-white/10 group-focus-within:border-gold px-0 py-4 outline-none transition-all placeholder:text-gray-700 text-white text-lg font-light ${user ? "opacity-60" : ""}`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div className="group">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-gold mb-3">
                <Sparkles className="h-3 w-3" /> Select Service
              </label>
              <select
                name="service"
                required
                value={formData.service}
                onChange={handleChange}
                className="w-full bg-transparent border-b border-white/10 group-focus-within:border-gold py-4 outline-none transition-all text-white text-lg font-light appearance-none cursor-pointer"
              >
                <option value="" className="bg-[#1a1a1a] text-gray-600 italic">
                  -- Browse the collection --
                </option>
                {services.map((s) => (
                  <option
                    key={s._id}
                    value={s.name}
                    className="bg-[#1a1a1a] text-white"
                  >
                    {s.name} (KSh {s.price})
                  </option>
                ))}
              </select>
            </div>

            <div className="group">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-gold mb-3">
                <Star className="h-3 w-3" /> Preferred Specialist
              </label>
              <select
                name="staffId"
                value={formData.staffId}
                onChange={handleChange}
                className="w-full bg-transparent border-b border-white/10 group-focus-within:border-gold py-4 outline-none transition-all text-white text-lg font-light appearance-none cursor-pointer"
              >
                <option value="" className="bg-[#1a1a1a] text-gray-600 italic">
                  -- Any Available Specialist --
                </option>

                {formData.service ? (
                  <>
                    {filteredStaff.appropriate.length > 0 && (
                      <optgroup
                        label="Specialists for this Service"
                        className="bg-[#1a1a1a] text-gold text-xs uppercase font-black"
                      >
                        {filteredStaff.appropriate.map((s) => (
                          <option
                            key={s._id}
                            value={s._id}
                            className="bg-[#1a1a1a] text-white uppercase"
                          >
                            {s.name} - {getStaffTitle(s.name, s.specialization)}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    <optgroup
                      label="All Specialists"
                      className="bg-[#1a1a1a] text-gray-500 text-xs uppercase font-black"
                    >
                      {staff.map((s) => (
                        <option
                          key={s._id}
                          value={s._id}
                          className="bg-[#1a1a1a] text-white uppercase"
                        >
                          {s.name} - {getStaffTitle(s.name, s.specialization)}
                        </option>
                      ))}
                    </optgroup>
                  </>
                ) : (
                  <optgroup
                    label="Our Specialists"
                    className="bg-[#1a1a1a] text-gray-500 text-xs uppercase font-black"
                  >
                    {staff.map((s) => (
                      <option
                        key={s._id}
                        value={s._id}
                        className="bg-[#1a1a1a] text-white uppercase"
                      >
                        {s.name} - {getStaffTitle(s.name, s.specialization)}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div className="group">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-gold mb-3">
                <Calendar className="h-3 w-3" /> Selected Date
              </label>
              <input
                type="date"
                name="date"
                required
                min={new Date().toISOString().split("T")[0]}
                value={formData.date}
                onChange={handleChange}
                className="w-full bg-transparent border-b border-white/10 group-focus-within:border-gold py-4 outline-none transition-all text-white text-lg font-light cursor-pointer"
              />
            </div>
            <div className="group">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-gold mb-3">
                <Clock className="h-3 w-3" /> Selected Time
              </label>
              <input
                type="time"
                name="time"
                required
                value={formData.time}
                onChange={handleChange}
                className="w-full bg-transparent border-b border-white/10 group-focus-within:border-gold py-4 outline-none transition-all text-white text-lg font-light cursor-pointer"
              />
            </div>
          </div>

          <div className="mb-12 group">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-gold mb-3">
              <MessageSquare className="h-3 w-3" /> Special Requests
            </label>
            <textarea
              name="notes"
              rows="3"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Describe your vision for this session..."
              className="w-full bg-black/40 border border-white/10 group-focus-within:border-gold p-6 outline-none transition-all placeholder:text-gray-700 text-white text-lg font-light"
            ></textarea>
          </div>

          <motion.button
            whileHover={{
              scale: 1.01,
              boxShadow: "0 0 40px rgba(212, 175, 55, 0.2)",
            }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={status.loading}
            className="w-full bg-gold text-white font-black text-lg py-6 uppercase tracking-[0.5em] disabled:opacity-50 transition-all duration-500 shadow-2xl"
          >
            {status.loading
              ? "Synchronizing Request..."
              : "Finalize Reservation"}
          </motion.button>
        </motion.form>

        <div className="mt-16 text-center text-gray-600 font-black tracking-[0.4em] uppercase text-[10px]">
          <p>
            Our Studio Director will finalize your service via SMS within 15
            minutes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Booking;
