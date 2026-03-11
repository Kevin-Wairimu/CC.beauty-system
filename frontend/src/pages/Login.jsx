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
      if (user.isAdmin) navigate("/admin");
      else navigate("/dashboard");
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
    <div className="bg-[#0F0F0F] min-h-screen flex items-center justify-center px-4 py-20 relative overflow-hidden">
      {/* Background Section Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-gold/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-gold/10 blur-[150px] rounded-full" />
      </div>

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full relative z-10"
      >
        {/* Page Header Section */}
        <div className="text-center mb-12">
          <div className="inline-block p-4 border-2 border-gold/30 bg-gold/5 mb-8">
            <Sparkles className="text-gold h-12 w-12 animate-pulse" />
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold uppercase tracking-tighter text-white mb-4">
            Elite <span className="text-gold italic">Access</span>
          </h1>
          <p className="text-gray-400 uppercase tracking-[0.4em] text-xs font-black">
            CC Beauty Private Portal
          </p>
        </div>

        {/* Form Section */}
        <div className="glass-panel p-8 md:p-16 shadow-[0_0_100px_rgba(0,0,0,0.8)] border-gold/30 bg-[#18181B]">
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-8">
              <div className="group">
                <label className="block text-xs font-black uppercase tracking-[0.3em] text-gold mb-4 group-focus-within:text-white transition-colors">
                  Registered Email
                </label>
                <div className="flex items-center border-b-2 border-white/10 group-focus-within:border-gold transition-all pb-3">
                  <Mail className="h-5 w-5 text-gray-500 mr-4" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent outline-none text-white text-xl font-light placeholder:text-gray-700"
                    placeholder="name@exclusive.com"
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-xs font-black uppercase tracking-[0.3em] text-gold mb-4 group-focus-within:text-white transition-colors">
                  Password
                </label>
                <div className="flex items-center border-b-2 border-white/10 group-focus-within:border-gold transition-all pb-3">
                  <Lock className="h-5 w-5 text-gray-500 mr-4" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent outline-none text-white text-xl font-light placeholder:text-gray-700"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                size="sm"
                className="text-xs text-gray-400 hover:text-gold transition-colors font-black uppercase tracking-widest border-b border-transparent hover:border-gold pb-1"
              >
                Forgot Credentials?
              </Link>
            </div>

            {/* ULTRA VISIBLE LOGIN BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-gold !py-6 text-lg uppercase tracking-[0.5em] font-black flex items-center justify-center gap-4 disabled:opacity-50 shadow-[0_20px_50px_rgba(255,215,0,0.2)]"
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
          <div className="mt-12 pt-10 border-t border-white/5 text-center space-y-6">
            <div className="flex items-center justify-center gap-3 text-gold/40">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-[10px] uppercase font-black tracking-widest">
                Secure Luxury Server
              </span>
            </div>
            <p className="text-gray-500 text-xs uppercase font-bold tracking-widest">
              Not a member of our studio?
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
