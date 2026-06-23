import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, UserPlus, ArrowRight, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, loginWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      const role = user.role?.toLowerCase();
      if (role === "admin" || role === "manager" || user.isAdmin) {
        navigate("/admin");
      } else if (role === "staff") {
        navigate("/staff");
      } else {
        navigate("/dashboard");
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Password policy: at least 8 characters, at least one letter and one number
    const pwd = password.trim();
    const pwdValid = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(pwd);
    if (!pwdValid) {
      toast.error('Password must be at least 8 characters and contain a letter and a number');
      setLoading(false);
      return;
    }
    try {
      await register(name, email, pwd);
      toast.success('Welcome to CC Beauty.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration Failed');
    }
    setLoading(false);
  };

  return (
    <div className="bg-black min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-200 bg-gold/5 blur-[120px] rounded-full pointer-events-none" />

      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full relative z-10"
      >
        <div className="text-center mb-6 md:mb-10">
          <div className="inline-block p-2 md:p-3 border-2 border-gold/30 bg-gold/5 mb-4 md:mb-6">
            <UserPlus className="text-gold h-8 w-8 md:h-10 md:w-10" />
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-bold uppercase tracking-tighter text-white mb-3 leading-tight">
            Join <span className="text-gold italic">Private</span>
          </h1>
          <p className="text-[9px] md:text-[10px] uppercase tracking-[0.4em] text-gold/60 font-black">Create Your Studio Member Profile</p>
        </div>

        <div className="glass-panel p-6 md:p-10 shadow-[0_0_100px_rgba(0,0,0,0.8)] border-gold/30 bg-[#050505]">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="group">
                <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-gold mb-3">
                  Full Name
                </label>
                <div className="flex items-center border-b-2 border-gold/10 group-focus-within:border-gold transition-all pb-2">
                  <User className="h-4 w-4 text-gold/40 mr-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-transparent outline-none text-white text-lg font-light placeholder:text-white/10"
                    placeholder="Your Name"
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-gold mb-3">
                  Email Address
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
            </div>

            <div className="group">
              <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-gold mb-3">
                Choose Password
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

            <div className="flex items-center gap-3 text-gold/60 bg-gold/5 p-3 border border-gold/10">
                <CheckCircle2 className="h-3 w-3 text-gold" />
                <span className="text-[9px] uppercase font-bold tracking-widest leading-relaxed">
                    By registering, you agree to CC Beauty's private membership terms.
                </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="py-5 w-full btn-gold text-base uppercase tracking-[0.5em] font-black flex items-center justify-center gap-3 shadow-[0_20px_50px_rgba(212,175,55,0.2)]"
            >
              {loading ? 'Processing...' : (
                <>
                  Register Account <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <div className="flex flex-col items-center gap-6 mt-6">
              <div className="flex items-center gap-4 w-full">
                <div className="h-px bg-gold/10 flex-1"></div>
                <span className="text-[10px] text-gold/30 uppercase font-black tracking-widest">Or Fast Access via</span>
                <div className="h-px bg-gold/10 flex-1"></div>
              </div>
              
              <div className="w-full flex justify-center">
                <GoogleLogin
                  onSuccess={credentialResponse => {
                    loginWithGoogle(credentialResponse.credential);
                    toast.success("Welcome to CC Beauty.");
                  }}
                  onError={() => {
                    toast.error('Google Registration Failed');
                  }}
                  theme="dark"
                  shape="square"
                  size="large"
                  width="300"
                />
              </div>
            </div>
          </form>

          <div className="mt-10 text-center">
            <p className="text-gold/40 text-[10px] uppercase font-bold tracking-widest mb-3">
              Already a member?
            </p>
            <Link to="/login" className="inline-block text-white font-black hover:text-gold transition-all uppercase tracking-[0.2em] text-xs border-b-2 border-gold pb-1">
              Access Your Portal
            </Link>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default Register;
