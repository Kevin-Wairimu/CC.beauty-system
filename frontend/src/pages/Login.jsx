import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Sparkles, Mail, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const role = user.role?.toLowerCase();
      // Handle Admin & Manager
      if (role === "admin" || role === "manager" || user.isAdmin) {
        navigate("/admin");
      }
      // Handle Staff
      else if (role === "staff") {
        navigate("/staff");
      }
      // Default to Client
      else {
        navigate("/dashboard");
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Access Granted. Welcome.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Authentication Failed");
    }
    setLoading(false);
  };

  return (
    <div className="bg-black min-h-screen flex items-center justify-center px-4 py-20 relative overflow-hidden">
      {/* Background Section Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-150 h-150 bg-gold/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-150 h-150 bg-gold/5 blur-[150px] rounded-full" />
      </div>

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full relative z-10"
      >
        {/* Page Header Section */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-block p-3 md:p-4 border-2 border-gold/30 bg-gold/5 mb-6 md:mb-8">
            <Sparkles className="text-gold h-10 w-10 md:h-12 md:w-12 animate-pulse" />
          </div>
          <h1 className="text-4xl md:text-7xl font-serif font-bold uppercase tracking-tighter text-white mb-4 leading-tight">
            Private <span className="text-gold italic">Login</span>
          </h1>
          <p className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-gold/60 font-black">
            CC Beauty Portal
          </p>
        </div>

        {/* Form Section */}
        <div className="glass-panel p-6 md:p-16 shadow-[0_0_100px_rgba(0,0,0,0.8)] border-gold/30 bg-[#050505]">
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-8">
              <div className="group">
                <label className="block text-xs font-black uppercase tracking-[0.3em] text-gold mb-4 group-focus-within:text-white transition-colors">
                  Registered Email
                </label>
                <div className="flex items-center border-b-2 border-gold/10 group-focus-within:border-gold transition-all pb-3">
                  <Mail className="h-5 w-5 text-gold/40 mr-4" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent outline-none text-white text-xl font-light placeholder:text-white/10"
                    placeholder="name@exclusive.com"
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-xs font-black uppercase tracking-[0.3em] text-gold mb-4 group-focus-within:text-white transition-colors">
                  Password
                </label>
                <div className="flex items-center border-b-2 border-gold/10 group-focus-within:border-gold transition-all pb-3">
                  <Lock className="h-5 w-5 text-gold/40 mr-4" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent outline-none text-white text-xl font-light placeholder:text-white/10"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                size="sm"
                className="text-xs text-gold/60 hover:text-gold transition-colors font-black uppercase tracking-widest border-b border-transparent hover:border-gold pb-1"
              >
                Forgot Credentials?
              </Link>
            </div>

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="py-6 w-full btn-gold text-lg uppercase tracking-[0.5em] font-black flex items-center justify-center gap-4 disabled:opacity-50 shadow-[0_20px_50px_rgba(212,175,55,0.2)]"
            >
              {loading ? (
                "Verifying..."
              ) : (
                <>
                  Confirm Access <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          {/* Form Footer */}
          <div className="mt-12 pt-10 border-t border-gold/10 text-center space-y-6">
            <div className="flex items-center justify-center gap-3 text-gold/40">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-[10px] uppercase font-black tracking-widest">
                Secure Luxury Server
              </span>
            </div>
            <p className="text-gold/40 text-xs uppercase font-bold tracking-widest">
              Not a member of our salon?
            </p>
            <Link
              to="/register"
              className="inline-block text-white font-black hover:text-gold transition-all uppercase tracking-[0.2em] text-sm border-b-2 border-gold pb-1"
            >
              Create Luxury Profile
            </Link>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default Login;
