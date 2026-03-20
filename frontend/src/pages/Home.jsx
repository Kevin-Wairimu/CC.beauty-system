import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";
import {
  Sparkles,
  Star,
  Scissors,
  ChevronRight,
  X,
  ShieldCheck,
  Clock,
  Users,
  Heart,
  Smile,
} from "lucide-react";

import { Icon } from "@iconify/react";

const Home = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("");
  const [selectedService, setSelectedService] = useState(null);
  const reviewContainerRef = React.useRef(null);

  const CATEGORY_FALLBACKS = {
    NAILS:
      "https://images.unsplash.com/photo-1604654894610-df490c9a77ca?auto=format&fit=crop&w=800&q=80",
    LASHES:
      "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80",
    WIGS: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80",
    MAKEUP:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80",
    EYEBROWS:
      "https://images.unsplash.com/photo-1522337628061-92f35a78274d?auto=format&fit=crop&w=800&q=80",
    FACIAL: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80",
    HAIR: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80",
    DEFAULT: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80",
  };

  const getFallbackImage = (category) =>
    CATEGORY_FALLBACKS[category] || CATEGORY_FALLBACKS.DEFAULT;

  useEffect(() => {
    // 1. Fetch Services
    const fetchServices = async () => {
      try {
        const { data } = await api.get("/services");
        setServices(data);
        if (data.length > 0) setActiveCategory(data[0].category);
        setLoading(false);
      } catch {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  // 2. Load Trustindex Widget in a separate effect
  useEffect(() => {
    if (reviewContainerRef.current) {
      const scriptId = "trustindex-script-manual";
      if (!document.getElementById(scriptId)) {
        const script = document.createElement("script");
        script.id = scriptId;
        script.src =
          "https://cdn.trustindex.io/loader.js?3cdb1b167b14014af636f4eb4f6";
        script.async = true;
        script.defer = true;
        // Append to our SPECIFIC container instead of body
        reviewContainerRef.current.appendChild(script);
      } else if (window.Trustindex) {
        try {
          window.Trustindex.init();
        } catch (e) {
          console.error("Trustindex failed", e);
        }
      }
    }
  }, []);

  const groupedServices = services.reduce((acc, service) => {
    if (!acc[service.category]) acc[service.category] = [];
    acc[service.category].push(service);
    return acc;
  }, {});

  const categories = Object.keys(groupedServices);

  return (
    <div className="bg-black min-h-screen text-white relative selection:bg-gold selection:text-black">
      {/* 1. HERO SECTION */}
      <section className="relative h-[75vh] flex items-center justify-center overflow-hidden z-10 border-b border-gold/20">
        <div className="absolute inset-0 bg-black/70 z-10" />
        <img
          src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1920&q=80"
          alt="Luxury Spa"
          className="absolute inset-0 w-full h-full object-cover grayscale"
        />

        <div className="relative z-20 text-center px-4 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <span className="text-gold font-black uppercase tracking-[0.8em] text-[10px] mb-2 block">
              Luxury Spa
            </span>
            <span className="text-white/60 font-black uppercase tracking-[0.8em] text-[8px] mb-6 block">
              The Private Collection
            </span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold uppercase tracking-tighter leading-none mb-8 text-white drop-shadow-2xl">
              <span className="text-gold">CC BEAUTY CLINIC</span>
            </h1>
            <p className="text-sm md:text-lg font-light tracking-[0.4em] text-white/80 uppercase mb-12">
              Unrivaled Mastery • Absolute Luxury
            </p>
            <div className="flex justify-center">
              <a
                href="#menu"
                className="btn-gold px-12 py-5 text-xs tracking-widest"
              >
                Explore Our Services
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. INTERACTIVE SERVICE MENU */}
      <section
        id="menu"
        className="relative z-10 py-24 md:py-32 max-w-7xl mx-auto px-4"
      >
        <div className="text-center mb-16 md:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-7xl font-serif font-bold uppercase tracking-widest text-gold mb-4 text-shadow-lg">
              Our Services
            </h2>
            {/* <p className="text-gold/60 uppercase tracking-[0.4em] text-[10px] font-black italic">
              Select a category to discover perfection
            </p> */}
          </motion.div>
        </div>

        {/* Categories - Responsive Layout */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-12 md:mb-20">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 md:px-12 py-4 text-[10px] font-black uppercase tracking-widest border transition-all duration-500 ${
                activeCategory === cat
                  ? "bg-gold text-black border-gold shadow-[0_10px_40px_rgba(212,175,55,0.3)]"
                  : "border-gold/20 text-gold/40 hover:border-gold/60 hover:text-gold"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Services Display */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "circOut" }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8"
            >
              {loading ? (
                <div className="col-span-full py-20 text-center text-gold animate-pulse uppercase text-[10px] tracking-[0.5em] font-black">
                  Refining Masterpieces...
                </div>
              ) : (
                groupedServices[activeCategory]?.map((service) => (
                  <motion.button
                    key={service._id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedService(service)}
                    className="group relative bg-[#050505] border border-gold/10 p-8 md:p-12 text-left hover:border-gold transition-all duration-500 flex flex-col justify-between min-h-[180px] md:min-h-[220px]"
                  >
                    <div className="space-y-3 relative z-10">
                      <div className="flex justify-between items-start gap-4">
                        <h3 className="text-xl md:text-3xl font-serif font-bold text-white group-hover:text-gold transition-colors leading-tight">
                          {service.name}
                        </h3>
                        <span className="text-xl md:text-3xl font-serif font-black text-gold shrink-0">
                          {service.price}
                        </span>
                      </div>
                      <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-white/40 font-bold group-hover:text-white/60 transition-colors line-clamp-1 md:line-clamp-2 italic">
                        {service.description ||
                          "A signature bespoke treatment for the discerning client."}
                      </p>
                    </div>

                    <div className="mt-8 flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-2">
                        <div className="h-px w-10 bg-gold/20 group-hover:w-16 group-hover:bg-gold transition-all duration-700" />
                      </div>
                      <ChevronRight className="h-5 w-5 text-gold group-hover:translate-x-3 transition-transform" />
                    </div>

                    {/* Service Image Background */}
                    <div className="absolute top-0 right-0 w-32 h-32 md:w-56 md:h-56 opacity-10 group-hover:opacity-30 transition-all duration-1000 pointer-events-none overflow-hidden">
                      <img
                        src={
                          service.image || getFallbackImage(service.category)
                        }
                        alt=""
                        className="w-full h-full object-cover grayscale scale-110 group-hover:scale-100 transition-all duration-1000"
                        onError={(e) => {
                          e.target.src = getFallbackImage(service.category);
                        }}
                      />
                    </div>
                  </motion.button>
                ))
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* NEW: GROUP DISCOUNTS SECTION */}
      <section className="py-24 bg-black relative overflow-hidden border-y border-gold/20">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-gold font-black uppercase tracking-[0.5em] text-[10px]">
                Shared Experiences
              </span>
              <h2 className="text-4xl md:text-6xl font-serif font-bold uppercase tracking-widest text-white mt-4">
                Group <span className="text-gold italic">Privileges</span>
              </h2>
              <div className="h-0.5 w-20 bg-gold mx-auto mt-8" />
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Girlies",
                guests: "5 People",
                discount: "15% OFF",
                icon: <Icon icon="mdi:spa" className="h-8 w-8 text-gold" />,
                desc: "The ultimate squad retreat.",
              },
              {
                title: "The Trio",
                guests: "3 People",
                discount: "10% OFF",
                icon: (
                  <Icon
                    icon="mdi:account-group"
                    className="h-8 w-8 text-gold"
                  />
                ),
                desc: "Perfect for best friends.",
              },
              {
                title: "Couples",
                guests: "2 People",
                discount: "5% OFF",
                icon: (
                  <Icon
                    icon="mdi:account-heart"
                    className="h-8 w-8 text-gold"
                  />
                ),
                desc: "Intimate shared luxury.",
              },
              {
                title: "Family",
                guests: "2 Couples + Kids",
                discount: "10% OFF",
                icon: (
                  <Icon
                    icon="mdi:human-male-female-child"
                    className="h-8 w-8 text-gold"
                  />
                ),
                desc: "A legacy of beauty.",
              },
            ].map((offer, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -10 }}
                className="bg-[#080808] border border-gold/10 p-10 text-center space-y-4 hover:border-gold/50 transition-all duration-500"
              >
                <div className="flex justify-center mb-6">{offer.icon}</div>
                <h3 className="text-2xl font-serif font-bold text-white uppercase tracking-tighter">
                  {offer.title}
                </h3>
                <div className="space-y-1">
                  <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">
                    {offer.guests}
                  </p>
                  <p className="text-3xl font-serif font-black text-gold">
                    {offer.discount}
                  </p>
                </div>
                <p className="text-[10px] text-white/60 italic uppercase tracking-widest leading-relaxed pt-6 border-t border-gold/10">
                  {offer.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. LUXURY QUICK-VIEW MODAL */}
      <AnimatePresence>
        {selectedService && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4 md:p-12">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedService(null)}
              className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 40 }}
              className="relative w-full max-w-6xl h-fit max-h-[90vh] bg-black border border-gold/30 shadow-[0_0_150px_rgba(0,0,0,1)] overflow-hidden flex flex-col md:flex-row z-[110]"
            >
              {/* Artistic Side Panel / Mobile Top Banner */}
              <div className="w-full md:w-2/5 h-48 md:h-auto relative overflow-hidden group shrink-0">
                <img
                  src={
                    selectedService.image ||
                    getFallbackImage(selectedService.category)
                  }
                  alt={selectedService.name}
                  className="absolute inset-0 w-full h-full object-cover grayscale-50 opacity-60 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-1000"
                  onError={(e) => {
                    e.target.src = getFallbackImage(selectedService.category);
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-6 left-6 md:bottom-12 md:left-10 space-y-2 md:space-y-4">
                  <Sparkles className="text-gold h-8 w-8 md:h-12 md:w-12 animate-pulse" />
                  <h4 className="text-white font-serif text-xl md:text-3xl italic leading-tight">
                    The Art of <br />
                    Personal Perfection
                  </h4>
                </div>
              </div>

              {/* Content Panel */}
              <div className="flex-1 p-8 md:p-16 flex flex-col justify-between overflow-y-auto custom-scrollbar">
                <button
                  onClick={() => setSelectedService(null)}
                  className="absolute top-6 right-6 md:top-10 md:right-10 p-2 hover:rotate-90 transition-transform duration-500 text-gold hover:brightness-125"
                >
                  <X className="h-10 w-10" />
                </button>

                <div className="space-y-12">
                  <header className="space-y-4 pt-4 md:pt-0">
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-[10px] uppercase tracking-[0.6em] text-gold font-black block"
                    >
                      {/* Exclusive Service */}
                    </motion.span>
                    <motion.h2
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-4xl md:text-7xl font-serif font-bold text-white uppercase tracking-tighter leading-none"
                    >
                      {selectedService.name}
                    </motion.h2>
                  </header>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-10 border-y border-gold/10"
                  >
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase text-gold/40 tracking-[0.3em] font-black">
                        Charge
                      </p>
                      <p className="text-4xl md:text-6xl font-serif font-black text-gold">
                        KSh {selectedService.price}
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                  >
                    {/* <p className="text-white/80 font-light text-xl md:text-2xl leading-relaxed italic border-l-2 border-gold/40 pl-8">
                      "
                      {selectedService.description ||
                        `A handcrafted beauty service designed by our master technicians to enhance your natural radiance.`}
                      "
                    </p> */}

                    <div className="flex flex-wrap gap-4 pt-4">
                      {[
                        "Certified Master Techs",
                        // "Organic Pure Services",
                        "Luxury Environment",
                      ].map((tag) => (
                        <span
                          key={tag}
                          className="px-5 py-3 border border-gold/20 bg-gold/5 text-[9px] uppercase tracking-[0.2em] text-gold font-black"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="pt-12 md:pt-16 pb-4 space-y-6"
                >
                  <Link
                    to="/booking"
                    className="group relative overflow-hidden bg-gold px-12 py-7 flex items-center justify-center gap-4 transition-all duration-500 shadow-[0_0_30px_rgba(212,175,55,0.3)] hover:shadow-[0_0_50px_rgba(212,175,55,0.5)]"
                    onClick={() => setSelectedService(null)}
                  >
                    <span className="relative z-10 text-black text-sm md:text-base font-black uppercase tracking-[0.5em]">
                      Confirm Reservation
                    </span>
                    <ChevronRight className="relative z-10 h-5 w-5 text-black group-hover:translate-x-3 transition-transform" />
                    <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  </Link>

                  {/* <p className="text-center text-[9px] text-gold font-black uppercase tracking-[0.4em] animate-pulse">
                    Requires 24-hour advance booking for material preparation
                  </p> */}
                </motion.div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. REAL-TIME REVIEWS SECTION - Commented Out
      <section id="reviews" className="py-32 bg-black relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <span className="text-gold font-black uppercase tracking-[0.5em] text-[10px] md:text-xs">Live Guest Experience</span>
              <h2 className="text-5xl md:text-8xl font-serif font-bold uppercase tracking-widest text-white leading-tight">
                Guest <span className="text-gold italic">Reviews</span>
              </h2>
              <div className="h-0.5 w-24 bg-gold mx-auto mt-8" />
            </motion.div>
          </div>

          <div 
            ref={reviewContainerRef}
            className="relative glass-panel p-4 md:p-8 border-gold/30 bg-[#050505] min-h-[400px]"
          >
            <div className="ti-widget" data-widget-id="3cdb1b167b14014af636f4eb4f6"></div>
          </div>

          <div className="mt-24 text-center">
            <p className="text-gold/40 text-[10px] uppercase tracking-[0.4em] font-black mb-6 italic">Verified by Google Luxury Services</p>
            <a 
              href="https://www.google.com/maps/place/CC+Beauty+Clinic/@-1.228597,36.8677963,17z/data=!4m8!3m7!1s0x182f3f0032d473b1:0xd4353544f547715e!8m2!3d-1.2286024!4d36.8703712!9m1!1b1" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-6 text-gold hover:text-white transition-all uppercase tracking-[0.5em] text-xs font-black group"
            >
              <Star className="h-5 w-5 fill-gold" />
              Write A Review
              <ChevronRight className="h-5 w-5 group-hover:translate-x-3 transition-transform" />
            </a>
          </div>
        </div>
      </section>
      */}

      {/* FOOTER STATS */}
      <section className="py-32 border-t border-gold/20 bg-black">
        <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-16 md:gap-32">
          <div className="flex flex-col items-center gap-6 group">
            <Star className="h-12 w-12 text-gold animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.5em] font-black text-gold/60 group-hover:text-gold transition-colors">
              5-Star Luxury
            </span>
          </div>
          <div className="flex flex-col items-center gap-6 group">
            <Icon icon="mdi:hair-dryer" className="h-8 w-8 text-gold" />
            <span className="text-[10px] uppercase tracking-[0.5em] font-black text-gold/60 group-hover:text-gold transition-colors">
              Master Craft
            </span>
          </div>
          <div className="flex flex-col items-center gap-6 group">
            <Sparkles className="h-12 w-12 text-gold animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.5em] font-black text-gold/60 group-hover:text-gold transition-colors">
              Pure Luxury
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
