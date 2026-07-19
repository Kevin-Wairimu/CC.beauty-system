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
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";

// ✅ Only these specializations qualify someone as a bookable specialist
const VALID_SPECS = ["NAILS", "MAKEUP", "LASHES", "WIGS", "HAIR", "EYEBROWS", "FACIAL", "SKIN"];

const emptyBookingRow = () => ({
  id: crypto.randomUUID(),
  service: "",
  date: "",
  time: "",
  staffId: "",
});

const Booking = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Removed mandatory login redirect

  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);

  // Shared contact info across all services in this session
  const [contact, setContact] = useState({
    name: "",
    phone: "",
    email: "",
    notes: "",
  });

  // One or more service bookings submitted together
  const [bookings, setBookings] = useState([emptyBookingRow()]);

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
            setBookings((prev) => {
              const next = [...prev];
              next[0] = { ...next[0], service: matchedService.name };
              return next;
            });
          }
        }

        const specialists = staffRes.data.filter((s) => {
          const role = s.role?.toLowerCase();
          if (role !== "staff" && role !== "admin") return false;
          const specs = (s.specialization || []).map((sp) => sp.toUpperCase());
          return specs.some((sp) => VALID_SPECS.includes(sp));
        });

        setStaff(specialists);
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
        setContact((prev) => ({
          ...prev,
          name: user.name || "",
          email: user.email || "",
        }));
      }, 0);
      return () => clearTimeout(handle);
    }
  }, [user]);

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContact((prev) => ({ ...prev, [name]: value }));
  };

  const handleBookingChange = (id, field, value) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        const updated = { ...b, [field]: value };
        // Reset staffId if service changes to force re-evaluation of recommendations
        if (field === "service") {
          updated.staffId = "";
        }
        return updated;
      })
    );
  };

  const addBookingRow = () => {
    setBookings((prev) => [...prev, emptyBookingRow()]);
  };

  const removeBookingRow = (id) => {
    setBookings((prev) => (prev.length > 1 ? prev.filter((b) => b.id !== id) : prev));
  };

  // Recommended vs other staff for a given service name
  const getFilteredStaffForService = (serviceName) => {
    if (!serviceName || services.length === 0 || staff.length === 0) {
      return { appropriate: [], others: staff };
    }
    const selectedService = services.find((s) => s.name === serviceName);
    if (!selectedService) return { appropriate: [], others: staff };

    const category = (selectedService.category || "").toUpperCase().trim();

    const appropriate = staff.filter((s) =>
      (s.specialization || []).some(
        (spec) => spec.toUpperCase().trim() === category
      )
    );
    const appropriateIds = new Set(appropriate.map((s) => s._id));
    const others = staff.filter((s) => !appropriateIds.has(s._id));

    return { appropriate, others };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic guard: every row needs a service, date, and time
    const incomplete = bookings.some((b) => !b.service || !b.date || !b.time);
    if (incomplete) {
      toast.error("Please complete every service row before submitting.");
      return;
    }

    setStatus({ loading: true, success: false, error: "" });

    try {
      const requests = bookings.map((b) => {
        const serviceObj = services.find((s) => s.name === b.service);
        const submissionData = {
          name: contact.name,
          phone: contact.phone,
          email: contact.email,
          notes: contact.notes,
          service: b.service,
          serviceId: serviceObj?._id,
          date: b.date,
          time: b.time,
          staffId: b.staffId,
        };
        return api.post("/appointments", submissionData);
      });

      const results = await Promise.allSettled(requests);
      const failed = results.filter((r) => r.status === "rejected");

      if (failed.length === 0) {
        setStatus({ loading: false, success: true, error: "" });
        toast.success(
          bookings.length > 1
            ? `${bookings.length} luxury sessions requested! We will contact you soon.`
            : "Luxury session requested! We will contact you soon."
        );
        setContact({
          name: user ? user.name : "",
          email: user ? user.email : "",
          phone: "",
          notes: "",
        });
        setBookings([emptyBookingRow()]);
      } else {
        const firstError =
          failed[0].reason?.response?.data?.message || "Booking failed";
        const msg =
          failed.length === bookings.length
            ? firstError
            : `${bookings.length - failed.length} of ${bookings.length} sessions booked. ${failed.length} failed: ${firstError}`;
        setStatus({ loading: false, success: failed.length < bookings.length, error: msg });
        toast.error(msg);
      }
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

          {/* Shared contact info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="group">
              <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-gold mb-2">
                <User className="h-3 w-3" /> Full Identity
              </label>
              <input
                type="text"
                name="name"
                required
                value={contact.name}
                onChange={handleContactChange}
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
                value={contact.phone}
                onChange={handleContactChange}
                placeholder="07XX XXX XXX"
                className="w-full bg-black/40 border-b border-white/10 group-focus-within:border-gold px-0 py-3 outline-none transition-all placeholder:text-gray-700 text-white text-base font-light"
              />
            </div>
          </div>

          <div className="mb-10 group">
            <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-gold mb-2">
              <Mail className="h-3 w-3" /> Digital Address
            </label>
            <input
              type="email"
              name="email"
              value={contact.email}
              onChange={handleContactChange}
              placeholder="Your email for confirmation"
              readOnly={!!user}
              className={`w-full bg-black/40 border-b border-white/10 group-focus-within:border-gold px-0 py-3 outline-none transition-all placeholder:text-gray-700 text-white text-base font-light ${
                user ? "opacity-60" : ""
              }`}
            />
          </div>

          {/* Multi-service rows */}
          <div className="mb-6 flex items-center justify-between">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gold">
              Your Services
            </p>
            <span className="text-[9px] text-gray-500 uppercase tracking-widest">
              {bookings.length} {bookings.length === 1 ? "service" : "services"}
            </span>
          </div>

          <AnimatePresence initial={false}>
            {bookings.map((booking, index) => {
              const { appropriate, others } = getFilteredStaffForService(
                booking.service
              );

              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="mb-8 border border-white/10 p-5 md:p-6 relative"
                >
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-500">
                      Service {index + 1}
                    </p>
                    {bookings.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeBookingRow(booking.id)}
                        className="text-gray-500 hover:text-red-500 transition-colors"
                        aria-label="Remove this service"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="group">
                      <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-gold mb-2">
                        <Sparkles className="h-3 w-3" /> Select Service
                      </label>
                      <select
                        required
                        value={booking.service}
                        onChange={(e) =>
                          handleBookingChange(booking.id, "service", e.target.value)
                        }
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
                        value={booking.staffId}
                        onChange={(e) =>
                          handleBookingChange(booking.id, "staffId", e.target.value)
                        }
                        className="w-full bg-transparent border-b border-white/10 group-focus-within:border-gold py-3 outline-none transition-all text-white text-base font-light appearance-none cursor-pointer"
                      >
                        <option value="" className="bg-[#1a1a1a] text-gray-600 italic">
                          -- Any Available Specialist --
                        </option>

                        {booking.service ? (
                          <>
                            {appropriate.length > 0 && (
                              <optgroup
                                label="✦ Recommended for this Service"
                                className="bg-[#1a1a1a] text-gold text-[10px] uppercase font-black"
                              >
                                {appropriate.map((s) => (
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
                            {others.length > 0 && (
                              <optgroup
                                label="Other Specialists"
                                className="bg-[#1a1a1a] text-gray-500 text-[10px] uppercase font-black"
                              >
                                {others.map((s) => (
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group">
                      <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-gold mb-2">
                        <Calendar className="h-3 w-3" /> Selected Date
                      </label>
                      <input
                        type="date"
                        required
                        min={new Date().toISOString().split("T")[0]}
                        value={booking.date}
                        onChange={(e) =>
                          handleBookingChange(booking.id, "date", e.target.value)
                        }
                        className="w-full bg-transparent border-b border-white/10 group-focus-within:border-gold py-3 outline-none transition-all text-white text-base font-light cursor-pointer"
                      />
                    </div>
                    <div className="group">
                      <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-gold mb-2">
                        <Clock className="h-3 w-3" /> Selected Time
                      </label>
                      <input
                        type="time"
                        required
                        value={booking.time}
                        onChange={(e) =>
                          handleBookingChange(booking.id, "time", e.target.value)
                        }
                        className="w-full bg-transparent border-b border-white/10 group-focus-within:border-gold py-3 outline-none transition-all text-white text-base font-light cursor-pointer"
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          <button
            type="button"
            onClick={addBookingRow}
            className="w-full mb-10 flex items-center justify-center gap-2 border border-dashed border-gold/40 text-gold text-[10px] font-black uppercase tracking-[0.3em] py-4 hover:bg-gold/5 transition-all"
          >
            <Plus className="h-3.5 w-3.5" /> Add Another Service
          </button>

          <div className="mb-10 group">
            <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-gold mb-2">
              <MessageSquare className="h-3 w-3" /> Special Requests
            </label>
            <textarea
              name="notes"
              rows="3"
              value={contact.notes}
              onChange={handleContactChange}
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
              : bookings.length > 1
              ? `Finalize ${bookings.length} Reservations`
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