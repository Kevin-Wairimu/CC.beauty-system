import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import { Sparkles, Star, Scissors, ChevronRight, X, ShieldCheck } from 'lucide-react';

const Home = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  
  useEffect(() => {
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
      <section id="menu" className="relative z-10 py-32 max-w-7xl mx-auto px-4">
        <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-serif font-bold uppercase tracking-widest text-gold mb-6 text-shadow-lg">Elite Services</h2>
            <p className="text-gray-300 uppercase tracking-[0.4em] text-xs font-bold italic">Select a category to discover perfection</p>
        </div>

        {/* Categories on top */}
        <div className="flex justify-center overflow-x-auto pb-4 mb-16 no-scrollbar">
            <div className="flex gap-4 min-w-max px-4">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-6 md:px-10 py-3 md:py-4 text-[10px] md:text-xs font-black uppercase tracking-widest border-2 transition-all duration-300 ${
                            activeCategory === cat ? 'bg-gold text-white border-gold shadow-[0_0_20px_rgba(255,215,0,0.3)]' : 'border-gold/20 text-gray-400 hover:border-gold hover:text-gold'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>

        {/* Compact Single Category Container */}
        <div className="glass-panel border-gold/30 bg-[#18181B] min-h-150 relative overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.6)]">
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeCategory}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.5 }}
                    className="p-10 md:p-20"
                >
                    <div className="flex items-center gap-6 mb-16">
                        <div className="h-0.5 w-16 bg-gold" />
                        <h3 className="text-4xl font-serif font-bold uppercase tracking-widest text-white">{activeCategory} Selection</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-24 gap-y-6">
                        {loading ? (
                            <div className="col-span-full py-20 text-center text-gold animate-pulse uppercase text-sm tracking-[0.5em] font-black">Refining Masterpieces...</div>
                        ) : (
                            groupedServices[activeCategory]?.map((service) => (
                                <button
                                    key={service._id}
                                    onClick={() => setSelectedService(service)}
                                    className="group flex justify-between items-center py-6 md:py-8 border-b-2 border-white/5 hover:bg-gold/[0.05] transition-all px-4 md:px-6 -mx-4 md:-mx-6 text-left"
                                >
                                    <div className="space-y-2 pr-4">
                                        <p className="text-xl md:text-2xl font-medium text-white group-hover:text-gold transition-colors tracking-wide leading-tight">{service.name}</p>
                                        <p className="text-[9px] md:text-xs uppercase tracking-widest text-gray-500 font-bold group-hover:text-gray-300 transition-colors italic">Elite Master Technique • View Details</p>
                                    </div>
                                    <div className="flex items-center gap-4 md:gap-6 shrink-0">
                                        <span className="text-xl md:text-2xl font-serif font-extrabold text-gold tracking-tighter">{service.price}</span>
                                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-gold/20 flex items-center justify-center group-hover:bg-gold group-hover:border-gold transition-all duration-300">
                                            <ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-gold group-hover:text-black" />
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
      </section>

      {/* 3. LUXURY QUICK-VIEW MODAL */}
      <AnimatePresence>
        {selectedService && (
            <div className="fixed inset-0 z-100 flex items-center justify-center p-4 md:p-8">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSelectedService(null)}
                    className="absolute inset-0 bg-black/95 backdrop-blur-xl"
                />
                
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 30 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 30 }}
                    className="relative w-full max-w-3xl glass-panel border-gold/50 bg-[#1A1A1A] p-10 md:p-20 shadow-[0_0_120px_rgba(255,215,0,0.15)]"
                >
                    <button 
                        onClick={() => setSelectedService(null)}
                        className="absolute top-8 right-8 p-3 hover:rotate-90 transition-transform text-gold bg-white/5 rounded-full"
                    >
                        <X className="h-8 w-8" />
                    </button>

                    <div className="text-center space-y-10">
                        <div className="flex flex-col items-center gap-3">
                            <Sparkles className="text-gold h-12 w-12 animate-pulse" />
                            <span className="text-xs uppercase tracking-[0.6em] text-gold font-black">Signature Treatment</span>
                        </div>

                        <h2 className="text-5xl md:text-7xl font-serif font-bold text-white uppercase tracking-tighter leading-none">{selectedService.name}</h2>
                        
                        <div className="flex items-center justify-center gap-12 py-10 border-y-2 border-gold/10">
                            <div className="text-center">
                                <p className="text-xs uppercase text-gray-500 tracking-widest mb-2 font-bold">Investment</p>
                                <p className="text-4xl md:text-5xl font-serif font-black text-gold">{selectedService.price}</p>
                            </div>
                            <div className="w-0.5 h-16 bg-gold/20" />
                            <div className="text-center">
                                <p className="text-xs uppercase text-gray-500 tracking-widest mb-2 font-bold">Experience</p>
                                <p className="text-2xl md:text-3xl font-black text-white uppercase tracking-widest">60 MINS</p>
                            </div>
                        </div>

                        <div className="space-y-8 max-w-xl mx-auto text-center">
                            <p className="text-gray-200 font-light text-xl md:text-2xl leading-relaxed italic">
                                "{selectedService.description || `A handcrafted beauty ritual designed by our master technicians to enhance your natural radiance using only the most exclusive products in our collection.`}"
                            </p>
                            
                            <div className="flex items-center justify-center gap-4 text-sm text-gold font-black uppercase tracking-[0.3em]">
                                <ShieldCheck className="h-5 w-5" />
                                <span>Organic Luxury Products Only</span>
                            </div>
                        </div>

                        <Link 
                            to="/booking" 
                            className="py-8! btn-gold w-full text-xl tracking-[0.5em] shadow-[0_20px_50px_rgba(255,215,0,0.2)]"
                            onClick={() => setSelectedService(null)}
                        >
                            Confirm Reservation
                        </Link>
                        
                        <p className="text-xs text-gray-600 uppercase tracking-widest font-bold">Requires 24-hour advance booking for elite prep</p>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* FOOTER STATS */}
      <section className="py-32 border-t-2 border-gold/10 bg-black">
        <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-16 md:gap-32 opacity-60">
            <div className="flex flex-col items-center gap-4">
                <Star className="h-10 w-10 text-gold" />
                <span className="text-xs uppercase tracking-[0.4em] font-black text-white">5-Star Elite</span>
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
