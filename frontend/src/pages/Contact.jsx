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
    } catch (err) {
      setStatus({
        loading: false,
        success: false,
        error: "Failed to send message.",
      });
      toast.error("Failed to send message. Please try again.");
    }
  };

  return (
    <div className="bg-[#1a1a1a] min-h-screen text-white py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <Sparkles className="text-gold h-12 w-12 mx-auto mb-4 animate-pulse" />
          <h1 className="text-4xl md:text-6xl font-serif font-bold uppercase tracking-widest text-gold mb-4">
            Contact Our Studio
          </h1>
          <p className="text-gray-300 text-sm md:text-lg italic tracking-[0.2em] font-light uppercase">
            We are here to assist your beauty journey
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-panel p-10 hover:border-gold/50 transition-all duration-500"
            >
              <div className="flex items-start gap-6">
                <div className="bg-gold/10 p-4 border border-gold/20">
                  <Phone className="text-gold h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-gold font-bold uppercase tracking-[0.2em] text-xs mb-3">
                    Direct Phone
                  </h3>
                  <p className="text-gray-100 font-light text-lg tracking-wide">
                    +254 759 934 198
                  </p>
                  {/* <p className="text-gray-100 font-light text-lg tracking-wide">
                    +254 711 111 111
                  </p> */}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-panel p-10 hover:border-gold/50 transition-all duration-500"
            >
              <div className="flex items-start gap-6">
                <div className="bg-gold/10 p-4 border border-gold/20">
                  <Mail className="h-6 w-6 text-gold" />
                </div>
                <div>
                  <h3 className="text-gold font-bold uppercase tracking-[0.2em] text-xs mb-3">
                    Email Inquiries
                  </h3>
                  <p className="text-gray-100 font-light text-lg tracking-wide">
                    ccbeautyclinic21@gmail.com
                  </p>
                  {/* <p className="text-gray-100 font-light text-lg tracking-wide">
                    ccbeautyclinic21@gmail.com
                  </p> */}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-panel p-10 hover:border-gold/50 transition-all duration-500"
            >
              <div className="flex items-start gap-6">
                <div className="bg-gold/10 p-4 border border-gold/20">
                  <MapPin className="h-6 w-6 text-gold" />
                </div>
                <div>
                  <h3 className="text-gold font-bold uppercase tracking-[0.2em] text-xs mb-3">
                    Studio Location
                  </h3>
                  <p className="text-gray-100 font-light text-lg tracking-wide leading-relaxed mb-4">
                    CC Beauty Clinic,
                    <br />
                    Kilimanjaro City Arcade,
                    <br />
                    Cross Road, Nairobi CBD
                  </p>
                  <a
                    href="https://www.google.com/maps/search/CC+Beauty+Clinic+Kilimanjaro+City+Arcade+Nairobi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-gold hover:text-white transition-colors text-xs font-bold uppercase tracking-widest border-b border-gold/30 pb-1"
                  >
                    Get Directions
                  </a>
                </div>
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
              className="glass-panel p-8 md:p-16 shadow-2xl relative h-full"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-[100px] rounded-full pointer-events-none"></div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
                <div className="group">
                  <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-gold mb-3">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-black/40 border-b border-white/10 group-focus-within:border-gold px-4 py-4 outline-none transition-all text-white text-lg"
                  />
                </div>
                <div className="group">
                  <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-gold mb-3">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-black/40 border-b border-white/10 group-focus-within:border-gold px-4 py-4 outline-none transition-all text-white text-lg"
                  />
                </div>
              </div>

              <div className="mb-10 group">
                <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-gold mb-3">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-black/40 border-b border-white/10 group-focus-within:border-gold px-4 py-4 outline-none transition-all text-white text-lg"
                />
              </div>

              <div className="mb-12 group">
                <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-gold mb-3">
                  How can we assist you? *
                </label>
                <textarea
                  name="message"
                  required
                  rows="4"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full bg-black/40 border border-white/10 group-focus-within:border-gold px-4 py-4 outline-none transition-all text-white text-lg"
                ></textarea>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={status.loading}
                className="w-full btn-gold text-xl py-6 uppercase tracking-[0.4em] disabled:opacity-50 flex items-center justify-center gap-4 rounded-none"
              >
                {status.loading ? (
                  "Sending Request..."
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Send Message
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>

        {/* Map Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-20 max-w-4xl mx-auto"
        >
          <div className="glass-panel p-2 border-gold/20 bg-black/40 overflow-hidden shadow-2xl h-[300px]">
            <iframe
              title="CC Beauty Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.81823456789!2d36.82654321!3d-1.28456789!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f10d600000001%3A0xabcdef1234567890!2sKilimanjaro%20City%20Arcade!5e0!3m2!1sen!2ske!4v1710240000000!5m2!1sen!2ske"
              width="100%"
              height="100%"
              style={{ border: 0, filter: 'grayscale(1) invert(0.9) contrast(1.2)' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
