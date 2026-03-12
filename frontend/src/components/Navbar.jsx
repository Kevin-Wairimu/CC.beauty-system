import React, { useState } from "react";
import { Link } from "react-router-dom";
import { User, LogOut, LogIn, Layout, Shield, Menu, X, UserPlus } from "lucide-react";
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: "Studio", path: "/" },
    { name: "Reservations", path: "/booking" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <nav className="glass-nav sticky top-0 z-[100] h-20 md:h-24 flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between items-center h-full">
          {/* Logo Area */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3 md:gap-4 group">
              <div className="relative">
                <img 
                  src="/cc.logo.png" 
                  alt="CC Beauty Logo" 
                  className="h-12 md:h-16 w-auto object-contain transition-transform duration-500 group-hover:scale-110 drop-shadow-[0_0_15px_rgba(255,215,0,0.4)]"
                />
                <div className="absolute inset-0 bg-gold/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl md:text-2xl font-serif font-black uppercase tracking-[0.2em] text-white group-hover:text-gold transition-colors leading-none">CC Beauty</span>
                <span className="text-[6px] md:text-[8px] uppercase tracking-[0.5em] text-gold font-bold">Luxury Studio</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-10">
            <div className="flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  to={link.path} 
                  className="text-white hover:text-gold text-xs font-black uppercase tracking-[0.2em] transition-all"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="h-6 w-px bg-white/20"></div>

            {user ? (
              <div className="flex items-center gap-6">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to={user.isAdmin ? "/admin" : "/dashboard"}
                    className={`flex items-center gap-3 px-6 py-2.5 border-2 transition-all rounded-none ${
                      user.isAdmin
                        ? "bg-gold text-white border-gold font-black shadow-[0_0_20px_rgba(255,215,0,0.3)]"
                        : "bg-transparent text-gold border-gold/50 hover:bg-gold hover:text-white font-bold"
                    }`}
                  >
                    {user.isAdmin ? <Shield className="h-4 w-4" /> : <Layout className="h-4 w-4" />}
                    <span className="text-[10px] uppercase tracking-[0.2em]">
                      {user.isAdmin ? "Admin Panel" : "My Portal"}
                    </span>
                  </Link>
                </motion.div>

                <button
                  onClick={logout}
                  className="text-white hover:text-red-500 transition-colors p-2 bg-white/5 border border-white/10 hover:border-red-500/50"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-6">
                <Link to="/login" className="text-white hover:text-gold text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2">
                  <LogIn className="h-4 w-4" /> Login
                </Link>
                <Link to="/register" className="btn-gold !py-2.5 !px-6 text-[10px] font-black uppercase tracking-widest">
                  Join Elite
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="lg:hidden flex items-center">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gold p-2 hover:bg-white/5 transition-colors border border-gold/20"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 top-20 md:top-24 bg-black/95 backdrop-blur-2xl z-[90] lg:hidden flex flex-col p-8 space-y-10 border-t border-gold/10 overflow-y-auto"
          >
            <div className="flex flex-col space-y-6">
              <span className="text-[10px] uppercase tracking-[0.5em] text-gold font-black mb-2">Navigation</span>
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-white text-3xl font-serif font-bold uppercase tracking-widest hover:text-gold transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="h-px w-full bg-white/10"></div>

            <div className="flex flex-col space-y-6">
              <span className="text-[10px] uppercase tracking-[0.5em] text-gold font-black mb-2">Membership</span>
              {user ? (
                <>
                  <Link
                    to={user.isAdmin ? "/admin" : "/dashboard"}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-4 text-white text-xl font-bold uppercase tracking-widest"
                  >
                    <Layout className="h-6 w-6 text-gold" />
                    {user.isAdmin ? "Admin Control" : "Client Portal"}
                  </Link>
                  <button
                    onClick={() => { logout(); setIsMenuOpen(false); }}
                    className="flex items-center gap-4 text-red-500 text-xl font-bold uppercase tracking-widest text-left"
                  >
                    <LogOut className="h-6 w-6" /> Sign Out
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  <Link 
                    to="/login" 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-4 text-white text-xl font-bold uppercase tracking-widest"
                  >
                    <LogIn className="h-6 w-6 text-gold" /> Login
                  </Link>
                  <Link 
                    to="/register" 
                    onClick={() => setIsMenuOpen(false)}
                    className="btn-gold !py-5 text-center text-lg uppercase tracking-[0.3em]"
                  >
                    Join The Private Club
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
