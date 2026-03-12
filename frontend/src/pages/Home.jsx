import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import { Sparkles, Star, Scissors, ChevronRight, X, ShieldCheck, Clock } from 'lucide-react';

const Home = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  const reviewContainerRef = React.useRef(null);
  
  useEffect(() => {
    // 1. Fetch Services
    const fetchServices = async () => {
      try {
        const { data } = await api.get('/services');
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
      const scriptId = 'trustindex-script-manual';
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = "https://cdn.trustindex.io/loader.js?3cdb1b167b14014af636f4eb4f6";
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
    <div className="bg-[#0F0F0F] min-h-screen text-white relative selection:bg-gold selection:text-black">
      
      {/* 1. HERO SECTION */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden z-10 border-b border-gold/10">
        <div className="absolute inset-0 bg-black/60 z-10" />
        <img src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1920&q=80" alt="Luxury Spa" className="absolute inset-0 w-full h-full object-cover grayscale-[0.3]" />

        <div className="relative z-20 text-center px-4 max-w-6xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
            <span className="text-gold font-black uppercase tracking-[0.8em] text-xs mb-6 block">The Private Collection</span>
            <h1 className="text-5xl md:text-8xl lg:text-9xl font-serif font-bold uppercase tracking-tighter leading-none mb-8 text-white drop-shadow-2xl">
              CC <span className="text-gold italic">BEAUTY</span>
            </h1>
            <p className="text-sm md:text-2xl font-light tracking-[0.2em] md:tracking-[0.4em] text-gray-200 uppercase mb-12">Unrivaled Mastery • Absolute Luxury</p>
            <div className="flex justify-center">
              <a href="#menu" className="btn-gold px-10 md:px-16 py-4 md:py-6 text-sm md:text-base tracking-widest">Explore Our Menu</a> 
            </div>

          </motion.div>
        </div>
      </section>

      {/* 2. INTERACTIVE SERVICE MENU */}
      <section id="menu" className="relative z-10 py-20 md:py-32 max-w-7xl mx-auto px-4">
        <div className="text-center mb-12 md:mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-7xl font-serif font-bold uppercase tracking-widest text-gold mb-4 md:mb-6 text-shadow-lg">The Collection</h2>
              <p className="text-gray-400 uppercase tracking-[0.3em] md:tracking-[0.4em] text-[10px] md:text-xs font-bold italic">Select a category to discover perfection</p>
            </motion.div>
        </div>

        {/* Categories - Responsive Layout */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-10 md:mb-16">
            {categories.map((cat) => (
                <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 md:px-10 py-3 md:py-4 text-[9px] md:text-xs font-black uppercase tracking-widest border transition-all duration-500 ${
                        activeCategory === cat ? 'bg-gold text-black border-gold shadow-[0_10px_30px_rgba(255,215,0,0.2)]' : 'border-gold/10 text-gray-500 hover:border-gold/40 hover:text-gold'
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
                        <div className="col-span-full py-20 text-center text-gold animate-pulse uppercase text-[10px] tracking-[0.5em] font-black">Refining Masterpieces...</div>
                    ) : (
                        groupedServices[activeCategory]?.map((service) => (
                            <motion.button
                                key={service._id}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedService(service)}
                                className="group relative bg-[#121212] border border-gold/5 p-6 md:p-10 text-left hover:border-gold/30 transition-all duration-500 flex flex-col justify-between min-h-[160px] md:min-h-[200px]"
                            >
                                <div className="space-y-2">
                                    <div className="flex justify-between items-start gap-4">
                                      <h3 className="text-lg md:text-3xl font-serif font-bold text-white group-hover:text-gold transition-colors leading-tight">{service.name}</h3>
                                      <span className="text-xl md:text-3xl font-serif font-black text-gold shrink-0">{service.price}</span>
                                    </div>
                                    <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-gray-500 font-bold group-hover:text-gray-400 transition-colors line-clamp-1 md:line-clamp-2 italic">
                                      {service.description || "A signature bespoke treatment for the discerning client."}
                                    </p>
                                </div>
                                
                                <div className="mt-6 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className="h-px w-8 bg-gold/30 group-hover:w-12 transition-all duration-500" />
                                    <span className="text-[8px] md:text-[10px] uppercase tracking-[0.3em] text-gold font-black opacity-0 group-hover:opacity-100 transition-all">View Ritual</span>
                                  </div>
                                  <ChevronRight className="h-4 w-4 text-gold group-hover:translate-x-2 transition-transform" />
                                </div>

                                {/* Subtle background texture or glow on hover */}
                                <div className="absolute inset-0 bg-gradient-to-br from-gold/0 via-transparent to-gold/0 group-hover:from-gold/[0.03] transition-all pointer-events-none" />
                            </motion.button>
                        ))
                    )}
                </motion.div>
            </AnimatePresence>
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
                    className="absolute inset-0 bg-black/98 backdrop-blur-2xl"
                />
                
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0, y: 40 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 40 }}
                    transition={{ type: "spring", damping: 30, stiffness: 300 }}
                    className="relative w-full max-w-6xl h-fit max-h-[90vh] bg-[#0A0A0A] border border-gold/20 shadow-[0_0_100px_rgba(0,0,0,1)] overflow-hidden flex flex-col md:flex-row"
                >
                    {/* Artistic Side Panel */}
                    <div className="hidden md:block md:w-2/5 relative overflow-hidden group">
                        <img 
                          src="https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=1000&q=80" 
                          alt="Luxury Detail" 
                          className="absolute inset-0 w-full h-full object-cover grayscale opacity-40 group-hover:scale-110 group-hover:grayscale-0 transition-all duration-1000"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
                        <div className="absolute bottom-12 left-10 space-y-4">
                           <Sparkles className="text-gold h-10 w-10 animate-pulse" />
                           <h4 className="text-white font-serif text-3xl italic">The Art of <br/>Personal Perfection</h4>
                        </div>
                    </div>

                    {/* Content Panel */}
                    <div className="flex-1 p-8 md:p-16 flex flex-col justify-between overflow-y-auto custom-scrollbar">
                        <button 
                            onClick={() => setSelectedService(null)}
                            className="absolute top-6 right-6 md:top-10 md:right-10 p-2 hover:rotate-90 transition-transform duration-500 text-gold/50 hover:text-gold"
                        >
                            <X className="h-8 w-8" />
                        </button>

                        <div className="space-y-12">
                            <header className="space-y-4 pt-4 md:pt-0">
                                <motion.span 
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  className="text-[10px] md:text-xs uppercase tracking-[0.6em] text-gold font-black block"
                                >
                                  Exclusive Ritual
                                </motion.span>
                                <motion.h2 
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.1 }}
                                  className="text-4xl md:text-7xl font-serif font-bold text-white uppercase tracking-tighter leading-none"
                                >
                                  {selectedService.name}
                                </motion.h2>
                            </header>

                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.2 }}
                              className="grid grid-cols-2 gap-8 py-8 border-y border-gold/10"
                            >
                                <div className="space-y-1">
                                    <p className="text-[9px] uppercase text-gray-500 tracking-[0.3em] font-black">Investment</p>
                                    <p className="text-3xl md:text-4xl font-serif font-black text-gold">{selectedService.price}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] uppercase text-gray-500 tracking-[0.3em] font-black">Experience</p>
                                    <p className="text-xl md:text-2xl font-black text-white uppercase tracking-widest flex items-center gap-2">
                                      <Clock className="h-4 w-4 text-gold" />
                                      60 MINS
                                    </p>
                                </div>
                            </motion.div>

                            <motion.div 
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3 }}
                              className="space-y-6"
                            >
                                <p className="text-gray-300 font-light text-lg md:text-xl leading-relaxed italic border-l-2 border-gold/20 pl-6">
                                    "{selectedService.description || `A handcrafted beauty ritual designed by our master technicians to enhance your natural radiance using only the most exclusive products in our collection.`}"
                                </p>
                                
                                <div className="flex flex-wrap gap-4 pt-4">
                                   {['Certified Master Techs', 'Organic Pure Rituals', 'Luxury Environment'].map((tag) => (
                                     <span key={tag} className="px-4 py-2 border border-white/5 bg-white/[0.02] text-[8px] md:text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">
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
                          className="pt-16 md:pt-20 space-y-6"
                        >
                            <Link 
                                to="/booking" 
                                className="group relative overflow-hidden bg-gold px-12 py-6 flex items-center justify-center gap-4 transition-all duration-500"
                                onClick={() => setSelectedService(null)}
                            >
                                <span className="relative z-10 text-black text-xs md:text-sm font-black uppercase tracking-[0.5em]">Confirm Reservation</span>
                                <ChevronRight className="relative z-10 h-4 w-4 text-black group-hover:translate-x-2 transition-transform" />
                                <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                            </Link>
                            
                            <p className="text-center text-[8px] text-gray-600 uppercase tracking-[0.4em] font-black">
                              Requires 24-hour advance booking for material preparation
                            </p>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* 4. REAL-TIME REVIEWS SECTION */}
      <section id="reviews" className="py-32 bg-[#0A0A0A] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <span className="text-gold font-black uppercase tracking-[0.5em] text-[10px] md:text-xs">Live Guest Experience</span>
              <h2 className="text-5xl md:text-7xl font-serif font-bold uppercase tracking-widest text-white leading-tight">
                Guest <span className="text-gold italic">Reviews</span>
              </h2>
              <div className="h-0.5 w-24 bg-gold mx-auto mt-6" />
            </motion.div>
          </div>

          {/* Trustindex Widget Container */}
          <div 
            ref={reviewContainerRef}
            className="relative glass-panel p-2 md:p-4 border-gold/20 bg-[#121212] min-h-[300px] overflow-hidden"
          >
            {/* Standard Trustindex Widget with your ID */}
            <div className="ti-widget" data-widget-id="3cdb1b167b14014af636f4eb4f6"></div>
          </div>

          <div className="mt-20 text-center">
            <p className="text-gray-500 text-[10px] uppercase tracking-[0.3em] font-black mb-4">Verified by Google</p>
            <a 
              href="https://www.google.com/maps/place/CC+Beauty+Clinic/@-1.228597,36.8677963,17z/data=!4m8!3m7!1s0x182f3f0032d473b1:0xd4353544f547715e!8m2!3d-1.2286024!4d36.8703712!9m1!1b1" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-4 text-gold hover:text-white transition-colors uppercase tracking-[0.4em] text-xs font-black"
            >
              <Star className="h-4 w-4 fill-gold" />
              Write A Review
              <ChevronRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      </section>

      {/* FOOTER STATS */}
      <section className="py-32 border-t-2 border-gold/10 bg-black">
        <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-16 md:gap-32 opacity-60">
            <div className="flex flex-col items-center gap-4">
                <Star className="h-10 w-10 text-gold" />
                <span className="text-xs uppercase tracking-[0.4em] font-black text-white">5-Star Luxury</span>
            </div>
            <div className="flex flex-col items-center gap-4">
                <Scissors className="h-10 w-10 text-gold" />
                <span className="text-xs uppercase tracking-[0.4em] font-black text-white">Master Craft</span>
            </div>
            <div className="flex flex-col items-center gap-4">
                <Sparkles className="h-10 w-10 text-gold" />
                <span className="text-xs uppercase tracking-[0.4em] font-black text-white">Pure Luxury</span>
            </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
