import React from "react";
import { Link } from "react-router-dom";
import { User, LogOut, LogIn, Layout, Shield } from "lucide-react";
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="glass-nav sticky top-0 z-[100] h-24 flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between items-center h-full">
          {/* Custom Logo Area */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-4 group">
              <div className="relative">
                <img
                  src="/cc.logo.png"
                  alt="CC Beauty Logo"
                  className="h-16 w-auto object-contain transition-transform duration-500 group-hover:scale-110 drop-shadow-[0_0_15px_rgba(255,215,0,0.4)]"
                />
                <div className="absolute inset-0 bg-gold/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-serif font-black uppercase tracking-[0.2em] text-white group-hover:text-gold transition-colors leading-none">
                  CC Beauty
                </span>
                <span className="text-[8px] uppercase tracking-[0.5em] text-gold font-bold">
                  Luxury Studio
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-10">
            <div className="hidden lg:flex items-center space-x-8">
              <Link
                to="/"
                className="text-white hover:text-gold text-xs font-black uppercase tracking-[0.2em] transition-all"
              >
                Studio
              </Link>
              <Link
                to="/booking"
                className="text-white hover:text-gold text-xs font-black uppercase tracking-[0.2em] transition-all"
              >
                Reservations
              </Link>
              <Link
                to="/contact"
                className="text-white hover:text-gold text-xs font-black uppercase tracking-[0.2em] transition-all"
              >
                Contact
              </Link>
            </div>

            <div className="h-6 w-[1px] bg-white/20 hidden lg:block"></div>

            {user ? (
              <div className="flex items-center gap-6">
                {/* HIGH VISIBILITY ADMIN/PORTAL BUTTON */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to={user.isAdmin ? "/admin" : "/dashboard"}
                    className={`flex items-center gap-3 px-8 py-3 border-2 transition-all rounded-none shadow-[0_0_20px_rgba(255,215,0,0.1)] ${
                      user.isAdmin
                        ? "bg-gold text-white border-gold font-black shadow-[0_0_30px_rgba(255,215,0,0.3)] animate-pulse-slow"
                        : "bg-transparent text-gold border-gold/50 hover:bg-gold hover:text-white font-bold"
                    }`}
                  >
                    {user.isAdmin ? (
                      <Shield className="h-4 w-4" />
                    ) : (
                      <Layout className="h-4 w-4" />
                    )}
                    <span className="text-xs uppercase tracking-[0.2em]">
                      {user.isAdmin ? "Admin Panel" : "My Portal"}
                    </span>
                  </Link>
                </motion.div>

                <div className="hidden md:flex flex-col items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gold">
                    {user.name.split(" ")[0]}
                  </span>
                  <span className="text-[8px] text-gray-500 uppercase tracking-tighter">
                    Verified Member
                  </span>
                </div>

                <button
                  onClick={logout}
                  className="text-white hover:text-red-500 transition-colors p-2 bg-white/5 border border-white/10 hover:border-red-500/50"
                  title="Sign Out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-6">
                <Link
                  to="/login"
                  className="text-white hover:text-gold text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2"
                >
                  <LogIn className="h-4 w-4" />
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-white hover:text-gold text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
