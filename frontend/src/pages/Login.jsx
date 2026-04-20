import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Sparkles, Mail, Lock, ArrowRight, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="bg-black min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
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
        <div className="text-center mb-6 md:mb-10">
          <div className="inline-block p-2 md:p-3 border-2 border-gold/30 bg-gold/5 mb-4 md:mb-6">
            <Sparkles className="text-gold h-8 w-8 md:h-10 md:w-10 animate-pulse" />
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-bold uppercase tracking-tighter text-white mb-3 leading-tight">
            Private <span className="text-gold italic">Login</span>
          </h1>
          <p className="text-[9px] md:text-[10px] uppercase tracking-[0.4em] text-gold/60 font-black">
            CC Beauty Portal
          </p>
        </div>

        {/* Form Section */}
        <div className="glass-panel p-6 md:p-10 shadow-[0_0_100px_rgba(0,0,0,0.8)] border-gold/30 bg-[#050505]">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div className="group">
                <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-gold mb-3 group-focus-within:text-white transition-colors">
                  Registered Email
                </label>
                <div className="flex items-center border-b-2 border-gold/10 group-focus-within:border-gold transition-all pb-2">
                  <Mail className="h-4 w-4 text-gold/40 mr-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent outline-none text-white text-lg font-light placeholder:text-white/10"
                    placeholder="name@exclusive.com"
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-gold mb-3 group-focus-within:text-white transition-colors">
                  Password
                </label>
                <div className="flex items-center border-b-2 border-gold/10 group-focus-within:border-gold transition-all pb-2">
                  <Lock className="h-4 w-4 text-gold/40 mr-3" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent outline-none text-white text-lg font-light placeholder:text-white/10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gold/40 hover:text-gold transition-colors focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-[10px] text-gold/60 hover:text-gold transition-colors font-black uppercase tracking-widest border-b border-transparent hover:border-gold pb-1"
              >
                Forgot Credentials?
              </Link>
            </div>

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="py-5 w-full btn-gold text-base uppercase tracking-[0.5em] font-black flex items-center justify-center gap-3 disabled:opacity-50 shadow-[0_20px_50px_rgba(212,175,55,0.2)]"
            >
              {loading ? (
                "Verifying..."
              ) : (
                <>
                  Confirm Access <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Form Footer */}
          <div className="mt-10 pt-8 border-t border-gold/10 text-center space-y-4">
            <div className="flex items-center justify-center gap-3 text-gold/40">
              <ShieldCheck className="h-3 w-3" />
              <span className="text-[9px] uppercase font-black tracking-widest">
                Secure Luxury Server
              </span>
            </div>
            <p className="text-gold/40 text-[10px] uppercase font-bold tracking-widest">
              Not a member of our salon?
            </p>
            <Link
              to="/register"
              className="inline-block text-white font-black hover:text-gold transition-all uppercase tracking-[0.2em] text-xs border-b-2 border-gold pb-1"
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
