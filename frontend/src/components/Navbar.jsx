import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { LogOut, LogIn, Layout, Shield, Menu, X, Sparkles, ChevronRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: "Studio", path: "/" },
    { name: "Reservations", path: "/booking" },
    { name: "Reviews", path: "/#reviews" },
    { name: "Contact", path: "/contact" },
  ];

  const closeMenu = () => setIsMenuOpen(false);

  /* Lock body scroll when mobile menu opens */
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMenuOpen]);

  /* Close mobile menu on route change */
  useEffect(() => {
    closeMenu();
  }, [location.pathname]);

  /* Scroll to section for anchor links */
  const handleAnchor = (path) => {
    if (path.includes("#")) {
      const id = path.split("#")[1];

      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] h-20 md:h-24 glass-nav flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between items-center h-full">
          {/* LOGO */}
          <Link
            to="/"
            onClick={closeMenu}
            className="flex items-center gap-3 md:gap-4 group"
          >
            <img
              src="/cc.logo.png"
              alt="CC Beauty"
              className="h-10 md:h-16 object-contain transition-transform duration-500 group-hover:scale-110"
            />

            <div className="flex flex-col">
              <span className="text-lg md:text-2xl font-serif font-black uppercase tracking-[0.2em] text-white group-hover:text-gold transition-colors leading-none">
                CC Beauty
              </span>

              <span className="text-[6px] md:text-[8px] uppercase tracking-[0.5em] text-gold font-bold">
                Luxury Studio
              </span>
            </div>
          </Link>

          {/* DESKTOP NAV */}
          <div className="hidden lg:flex items-center space-x-10">
            <div className="flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => handleAnchor(link.path)}
                  className={`text-xs font-black uppercase tracking-[0.2em] transition-all ${
                    location.pathname === link.path
                      ? "text-gold"
                      : "text-white hover:text-gold"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="h-6 w-px bg-white/20" />

            {/* USER SECTION */}
            {user ? (
              <div className="flex items-center gap-6">
                <Link
                  to={user.isAdmin ? "/admin" : "/dashboard"}
                  className={`flex items-center gap-3 px-6 py-2.5 border-2 transition-all ${
                    user.isAdmin
                      ? "bg-gold text-white border-gold"
                      : "text-gold border-gold hover:bg-gold hover:text-white"
                  }`}
                >
                  {user.isAdmin ? (
                    <Shield className="h-4 w-4" />
                  ) : (
                    <Layout className="h-4 w-4" />
                  )}

                  <span className="text-[10px] uppercase tracking-[0.2em]">
                    {user.isAdmin ? "Admin Panel" : "My Portal"}
                  </span>
                </Link>

                <button
                  onClick={logout}
                  className="text-white hover:text-red-500 transition-colors p-2"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-6">
                <Link
                  to="/login"
                  className="text-white hover:text-gold text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2"
                >
                  <LogIn className="h-4 w-4" />
                  Login
                </Link>

                <Link
                  to="/register"
                  className="btn-gold !py-2.5 !px-6 text-[10px] font-black uppercase tracking-widest"
                >
                  Join Now
                </Link>
              </div>
            )}
          </div>

          {/* MOBILE BUTTON */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gold p-3 border border-gold/30 rounded-sm"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE SIDE MENU */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[105] lg:hidden"
            />
            
            {/* Sidebar */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-0 right-0 h-screen w-[300px] bg-[#000000] z-[110] lg:hidden flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.8)] border-l border-gold/10"
            >
              {/* Sidebar Header */}
              <div className="h-24 shrink-0 flex items-center justify-between px-8 border-b border-gold/5 bg-black">
                 <div className="flex flex-col">
                    <span className="text-white font-serif font-bold text-xl uppercase tracking-widest leading-none mb-1">CC Beauty</span>
                    <span className="text-[8px] text-gold font-black uppercase tracking-[0.4em]">Private Collection</span>
                 </div>
                <button 
                  onClick={closeMenu} 
                  className="text-gold p-2 hover:bg-gold/5 rounded-full transition-colors"
                >
                   <X className="h-6 w-6" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-8 py-10 no-scrollbar">
                <nav className="flex flex-col space-y-8">
                  {navLinks.map((link, idx) => (
                    <motion.div
                      key={link.name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + idx * 0.1 }}
                    >
                      <Link
                        to={link.path}
                        onClick={() => {
                          handleAnchor(link.path);
                          closeMenu();
                        }}
                        className="group flex flex-col"
                      >
                        <span className="text-gold/40 text-[9px] font-black uppercase tracking-[0.5em] mb-1 group-hover:text-gold transition-colors font-sans">0{idx + 1}</span>
                        <span className={`text-white text-4xl font-serif font-bold uppercase tracking-tighter transition-all duration-500 ${
                          location.pathname === link.path ? 'text-gold italic translate-x-2' : 'group-hover:text-gold group-hover:italic group-hover:translate-x-2'
                        }`}>
                          {link.name}
                        </span>
                      </Link>
                    </motion.div>
                  ))}
                </nav>

                <div className="mt-16 space-y-12">
                  <div className="h-px w-full bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

                  {/* Account Options */}
                  <div className="flex flex-col gap-4">
                    {user ? (
                      <div className="space-y-4">
                        <Link
                          to={user.isAdmin ? "/admin" : "/dashboard"}
                          onClick={closeMenu}
                          className="flex items-center justify-between p-5 bg-gold/5 border border-gold/10 rounded-sm group hover:border-gold/30 transition-all"
                        >
                          <div className="flex items-center gap-4">
                             {user.isAdmin ? <Shield className="h-5 w-5 text-gold" /> : <Layout className="h-5 w-5 text-gold" />}
                             <span className="text-white text-[10px] font-black uppercase tracking-widest">{user.isAdmin ? "Management" : "My Sanctuary"}</span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gold group-hover:translate-x-1 transition-transform" />
                        </Link>

                        <button
                          onClick={() => { logout(); closeMenu(); }}
                          className="text-red-500/50 hover:text-red-500 text-[9px] font-black uppercase tracking-[0.3em] py-2 flex items-center gap-2 transition-colors"
                        >
                          <LogOut className="h-3 w-3" />
                          Terminate Session
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4">
                        <Link
                          to="/register"
                          onClick={closeMenu}
                          className="bg-gold text-black py-5 text-center text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white transition-colors"
                        >
                          Begin Journey
                        </Link>
                        
                        <Link
                          to="/login"
                          onClick={closeMenu}
                          className="text-center text-gray-500 hover:text-gold text-[9px] font-black uppercase tracking-[0.4em] transition-colors"
                        >
                          Member Access
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Social Footer */}
                  <div className="flex justify-between items-center pt-8 border-t border-gold/5">
                      <div className="flex gap-6 text-[8px] font-black uppercase tracking-widest">
                         <a href="https://instagram.com/cc_beauty_clinic" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gold transition-colors">IG</a>
                         <a href="https://www.tiktok.com/@cc_beauty_clinic" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gold transition-colors">TK</a>
                      </div>
                      <Sparkles className="text-gold h-4 w-4 animate-pulse" />
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
