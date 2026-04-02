import React, { useState } from "react";
import api from "../api/axios";
import { Mail, Phone, MapPin, Send, Sparkles } from "lucide-react";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [status, setStatus] = useState({
    loading: false,
    success: false,
    error: "",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: "" });
    try {
      await api.post("/enquiry", formData);
      setStatus({ loading: false, success: true, error: "" });
      toast.success("Message sent! Our concierge will respond soon.");
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch {
      setStatus({
        loading: false,
        success: false,
        error: "Failed to send message.",
      });
      toast.error("Failed to send message. Please try again.");
    }
  };

  return (
    <div className="bg-[#1a1a1a] min-h-screen text-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Sparkles className="text-gold h-10 w-10 mx-auto mb-4 animate-pulse" />
          <h1 className="text-3xl md:text-5xl font-serif font-bold uppercase tracking-widest text-gold mb-4">
            Contact Our Clinic
          </h1>
          <p className="text-gray-300 text-xs md:text-base italic tracking-[0.2em] font-light uppercase">
            We are here to assist your beauty journey
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-panel p-6 md:p-8 hover:border-gold/50 transition-all duration-500"
            >
              <div className="flex items-start gap-4">
                <div className="bg-gold/10 p-3 border border-gold/20">
                  <Phone className="text-gold h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-gold font-bold uppercase tracking-[0.2em] text-[10px] mb-2">
                    Direct Phone
                  </h3>
                  <p className="text-gray-100 font-light text-base md:text-lg tracking-wide">
                    +254 759 934 198
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-panel p-6 md:p-8 hover:border-gold/50 transition-all duration-500"
            >
              <div className="flex items-start gap-4">
                <div className="bg-gold/10 p-3 border border-gold/20">
                  <Mail className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <h3 className="text-gold font-bold uppercase tracking-[0.2em] text-[10px] mb-2">
                    Email Inquiries
                  </h3>
                  <p className="text-gray-100 font-light text-base md:text-lg tracking-wide">
                    ccbeautyclinic21@gmail.com
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-panel p-6 md:p-8 hover:border-gold/50 transition-all duration-500"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gold/10 p-3 border border-gold/20">
                  <MapPin className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <h3 className="text-gold font-bold uppercase tracking-[0.2em] text-[10px] mb-2">
                    Clinic Location
                  </h3>
                  <p className="text-gray-100 font-light text-base md:text-lg tracking-wide leading-relaxed">
                    CC Beauty Clinic,
                    <br />
                    Kilimanjaro City Arcade,
                    <br />
                    Nairobi, Kenya
                  </p>
                </div>
              </div>
              {/* Map Preview */}
              <div className="w-full h-40 rounded-lg overflow-hidden border border-gold/20 group">
                <iframe
                  title="map"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  src="https://maps.google.com/maps?q=CC+Beauty+Clinic,+Kilimanjaro+city+arcade,+Nairobi,+Kenya&t=&z=17&ie=UTF8&iwloc=&output=embed"
                  className="grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                ></iframe>
              </div>
            </motion.div>
          </div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2"
          >
            <form
              onSubmit={handleSubmit}
              className="glass-panel p-6 md:p-10 shadow-2xl relative h-full"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-[100px] rounded-full pointer-events-none"></div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="group">
                  <label className="block text-[9px] font-bold uppercase tracking-[0.3em] text-gold mb-2">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-black/40 border-b border-white/10 group-focus-within:border-gold px-3 py-3 outline-none transition-all text-white text-base"
                  />
                </div>
                <div className="group">
                  <label className="block text-[9px] font-bold uppercase tracking-[0.3em] text-gold mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-black/40 border-b border-white/10 group-focus-within:border-gold px-3 py-3 outline-none transition-all text-white text-base"
                  />
                </div>
              </div>

              <div className="mb-8 group">
                <label className="block text-[9px] font-bold uppercase tracking-[0.3em] text-gold mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-black/40 border-b border-white/10 group-focus-within:border-gold px-3 py-3 outline-none transition-all text-white text-base"
                />
              </div>

              <div className="mb-10 group">
                <label className="block text-[9px] font-bold uppercase tracking-[0.3em] text-gold mb-2">
                  How can we assist you? *
                </label>
                <textarea
                  name="message"
                  required
                  rows="3"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full bg-black/40 border border-white/10 group-focus-within:border-gold px-3 py-3 outline-none transition-all text-white text-base"
                ></textarea>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={status.loading}
                className="w-full btn-gold text-base py-4 uppercase tracking-[0.4em] disabled:opacity-50 flex items-center justify-center gap-3 rounded-none"
              >
                {status.loading ? (
                  "Sending Request..."
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Message
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
