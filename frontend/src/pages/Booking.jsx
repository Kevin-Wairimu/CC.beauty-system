import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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

// ✅ Only these specializations qualify someone as a bookable specialist
const VALID_SPECS = ["NAILS", "MAKEUP", "LASHES", "WIGS", "HAIR", "EYEBROWS", "FACIAL", "SKIN"];

const Booking = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Removed mandatory login redirect

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
        const fetchedServices = servicesRes.data;
        setServices(fetchedServices);

        // Pre-select service if passed from Home
        if (location.state?.serviceName) {
          const matchedService = fetchedServices.find(
            (s) => s.name === location.state.serviceName
          );
          if (matchedService) {
            setFormData((prev) => ({ ...prev, service: matchedService.name }));
          }
        }

        const specialists = staffRes.data.filter((s) => {
          const role = s.role?.toLowerCase();
          if (role !== "staff" && role !== "admin") return false;
          const specs = (s.specialization || []).map((sp) => sp.toUpperCase());
          return specs.some((sp) => VALID_SPECS.includes(sp));
        });

        setStaff(specialists);
        setFilteredStaff({ appropriate: [], others: specialists });
      } catch (error) {
        console.error("Booking Data Fetch Error:", error);
        setStatus((prev) => ({ ...prev, error: "Failed to load data" }));
      }
    };
    fetchData();
  }, [location.state]);

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

  useEffect(() => {
    if (formData.service && services.length > 0 && staff.length > 0) {
      const selectedService = services.find((s) => s.name === formData.service);
      if (selectedService) {
        const category = (selectedService.category || "").toUpperCase().trim();

        // 1. Filter Recommended
        const appropriate = staff.filter((s) =>
          (s.specialization || []).some(
            (spec) => spec.toUpperCase().trim() === category
          )
        );

        // 2. Filter Others (exclude recommended to avoid duplicates)
        const appropriateIds = new Set(appropriate.map((s) => s._id));
        const others = staff.filter((s) => !appropriateIds.has(s._id));

        setFilteredStaff({ appropriate, others });
      }
    } else {
      setFilteredStaff({ appropriate: [], others: staff });
    }
  }, [formData.service, staff, services]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      // Reset staffId if service changes to force re-evaluation of recommendations
      if (name === "service") {
        newData.staffId = "";
      }
      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: "" });

    const serviceObj = services.find((s) => s.name === formData.service);
    const submissionData = { ...formData, serviceId: serviceObj?._id };

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

  // Title derived only from VALID_SPECS — RECEPTIONIST and unknowns stripped
  const getStaffTitle = (specializations) => {
    const specs = (specializations || [])
      .map((s) => s.toUpperCase());

    if (specs.length === 0) return "Master Technician";

    return specs
      .map((s) => {
        if (s === "NAILS") return "Nail Technician";
        if (s === "MAKEUP") return "Makeup Artist";
        if (s === "LASHES") return "Lash Technician";
        if (s === "WIGS") return "Wig Stylist";
        if (s === "HAIR") return "Hairdresser";
        if (s === "EYEBROWS") return "Eyebrow Specialist";
        if (s === "FACIAL") return "Esthetician";
        if (s === "SKIN") return "Skin Specialist";
        if (s === "RECEPTIONIST") return "Receptionist";
        if (s === "LOCTICIAN") return "Loctician";
        // Convert to Title Case for others
        return s.charAt(0) + s.slice(1).toLowerCase();
      })
      .join(", ");
  };

  return (
    <div className="bg-[#0F0F0F] min-h-screen text-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <Sparkles className="text-gold h-10 w-10 mx-auto mb-4 animate-pulse" />
          <h1 className="text-3xl md:text-5xl font-serif font-bold uppercase tracking-widest text-gold mb-4">
            Secure Your Session
          </h1>
          <p className="text-gray-400 text-xs md:text-base italic tracking-[0.3em] font-light">
            excellence tailored to you
          </p>
        </motion.div>

        {status.success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gold/10 border border-gold/30 p-6 mb-10 text-center"
          >
            <p className="text-gold font-black uppercase tracking-[0.3em] text-lg">
              Reservation Received
            </p>
            <p className="text-gray-400 text-[10px] mt-2 font-light">
              Our concierge will contact you shortly to finalize your luxury
              experience.
            </p>
          </motion.div>
        )}

        {status.error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/30 p-4 mb-10 text-center"
          >
            <p className="text-red-500 uppercase text-[10px] tracking-widest font-black">
              {status.error === "Failed to load data" 
                ? "The connection is taking longer than expected. The server might be waking up. Please try refreshing."
                : status.error}
            </p>
          </motion.div>
        )}

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="glass-panel p-6 md:p-10 shadow-2xl relative overflow-hidden bg-[#121212]"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-gold/[0.03] blur-[120px] rounded-full -mr-48 -mt-48 pointer-events-none"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="group">
              <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-gold mb-2">
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
                className={`w-full bg-black/40 border-b border-white/10 group-focus-within:border-gold px-0 py-3 outline-none transition-all placeholder:text-gray-700 text-white text-base font-light ${
                  user ? "opacity-60" : ""
                }`}
              />
            </div>
            <div className="group">
              <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-gold mb-2">
                <Phone className="h-3 w-3" /> Contact Number
              </label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="07XX XXX XXX"
                className="w-full bg-black/40 border-b border-white/10 group-focus-within:border-gold px-0 py-3 outline-none transition-all placeholder:text-gray-700 text-white text-base font-light"
              />
            </div>
          </div>

          <div className="mb-8 group">
            <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-gold mb-2">
              <Mail className="h-3 w-3" /> Digital Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Your email for confirmation"
              readOnly={!!user}
              className={`w-full bg-black/40 border-b border-white/10 group-focus-within:border-gold px-0 py-3 outline-none transition-all placeholder:text-gray-700 text-white text-base font-light ${
                user ? "opacity-60" : ""
              }`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="group">
              <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-gold mb-2">
                <Sparkles className="h-3 w-3" /> Select Service
              </label>
              <select
                name="service"
                required
                value={formData.service}
                onChange={handleChange}
                className="w-full bg-transparent border-b border-white/10 group-focus-within:border-gold py-3 outline-none transition-all text-white text-base font-light appearance-none cursor-pointer"
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
                    {s.name} (ksh {s.price})
                  </option>
                ))}
              </select>
            </div>

            <div className="group">
              <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-gold mb-2">
                <Star className="h-3 w-3" /> Preferred Specialist
              </label>
              <select
                name="staffId"
                value={formData.staffId}
                onChange={handleChange}
                className="w-full bg-transparent border-b border-white/10 group-focus-within:border-gold py-3 outline-none transition-all text-white text-base font-light appearance-none cursor-pointer"
              >
                <option value="" className="bg-[#1a1a1a] text-gray-600 italic">
                  -- Any Available Specialist --
                </option>

                {formData.service ? (
                  <>
                    {filteredStaff.appropriate.length > 0 && (
                      <optgroup
                        label="✦ Recommended for this Service"
                        className="bg-[#1a1a1a] text-gold text-[10px] uppercase font-black"
                      >
                        {filteredStaff.appropriate.map((s) => (
                          <option
                            key={s._id}
                            value={s._id}
                            className="bg-[#1a1a1a] text-white uppercase"
                          >
                            {s.name} — {getStaffTitle(s.specialization)}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {filteredStaff.others.length > 0 && (
                      <optgroup
                        label="Other Specialists"
                        className="bg-[#1a1a1a] text-gray-500 text-[10px] uppercase font-black"
                      >
                        {filteredStaff.others.map((s) => (
                          <option
                            key={s._id}
                            value={s._id}
                            className="bg-[#1a1a1a] text-white uppercase"
                          >
                            {s.name} — {getStaffTitle(s.specialization)}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </>
                ) : (
                  <optgroup
                    label="Our Specialists"
                    className="bg-[#1a1a1a] text-gray-500 text-[10px] uppercase font-black"
                  >
                    {staff.map((s) => (
                      <option
                        key={s._id}
                        value={s._id}
                        className="bg-[#1a1a1a] text-white uppercase"
                      >
                        {s.name} — {getStaffTitle(s.specialization)}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="group">
              <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-gold mb-2">
                <Calendar className="h-3 w-3" /> Selected Date
              </label>
              <input
                type="date"
                name="date"
                required
                min={new Date().toISOString().split("T")[0]}
                value={formData.date}
                onChange={handleChange}
                className="w-full bg-transparent border-b border-white/10 group-focus-within:border-gold py-3 outline-none transition-all text-white text-base font-light cursor-pointer"
              />
            </div>
            <div className="group">
              <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-gold mb-2">
                <Clock className="h-3 w-3" /> Selected Time
              </label>
              <input
                type="time"
                name="time"
                required
                value={formData.time}
                onChange={handleChange}
                className="w-full bg-transparent border-b border-white/10 group-focus-within:border-gold py-3 outline-none transition-all text-white text-base font-light cursor-pointer"
              />
            </div>
          </div>

          <div className="mb-10 group">
            <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-gold mb-2">
              <MessageSquare className="h-3 w-3" /> Special Requests
            </label>
            <textarea
              name="notes"
              rows="3"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Describe your vision for this session..."
              className="w-full bg-black/40 border border-white/10 group-focus-within:border-gold p-4 outline-none transition-all placeholder:text-gray-700 text-white text-base font-light"
            ></textarea>
          </div>

          <motion.button
            whileHover={{
              scale: 1.01,
              boxShadow: "0 0 40px rgba(212, 175, 55, 0.1)",
            }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={status.loading}
            className="w-full bg-gold text-white font-black text-base py-4 md:py-5 uppercase tracking-[0.5em] disabled:opacity-50 transition-all duration-500 shadow-2xl"
          >
            {status.loading
              ? "cc beauty"
              : "Finalize Reservation"}
          </motion.button>
        </motion.form>

        <div className="mt-12 text-center text-gray-600 font-black tracking-[0.4em] uppercase text-[9px]">
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
