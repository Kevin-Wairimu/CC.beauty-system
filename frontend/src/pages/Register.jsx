import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, UserPlus, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(name, email, password);
      toast.success('Welcome to CC Beauty Elite.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration Failed');
    }
    setLoading(false);
  };

  return (
    <div className="bg-[#0F0F0F] min-h-screen flex items-center justify-center px-4 py-20 relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-200 bg-gold/5 blur-[120px] rounded-full pointer-events-none" />

      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full relative z-10"
      >
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-block p-3 md:p-4 border-2 border-gold/30 bg-gold/5 mb-6 md:mb-8">
            <UserPlus className="text-gold h-10 w-10 md:h-12 md:w-12" />
          </div>
          <h1 className="text-4xl md:text-7xl font-serif font-bold uppercase tracking-tighter text-white mb-4 leading-tight">
            Join <span className="text-gold italic">Elite</span>
          </h1>
          <p className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-gray-400 font-black">Create Your Studio Member Profile</p>
        </div>

        <div className="glass-panel p-6 md:p-16 shadow-[0_0_100px_rgba(0,0,0,0.8)] border-gold/30 bg-[#18181B]">
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="group">
                <label className="block text-xs font-black uppercase tracking-[0.3em] text-gold mb-4">
                  Full Name
                </label>
                <div className="flex items-center border-b-2 border-white/10 group-focus-within:border-gold transition-all pb-3">
                  <User className="h-5 w-5 text-gray-500 mr-4" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-transparent outline-none text-white text-xl font-light placeholder:text-gray-700"
                    placeholder="Your Name"
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-xs font-black uppercase tracking-[0.3em] text-gold mb-4">
                  Email Address
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
            </div>

            <div className="group">
              <label className="block text-xs font-black uppercase tracking-[0.3em] text-gold mb-4">
                Choose Password
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

            <div className="flex items-center gap-3 text-gray-500 bg-white/5 p-4 border border-white/5">
                <CheckCircle2 className="h-4 w-4 text-gold" />
                <span className="text-[10px] uppercase font-bold tracking-widest leading-relaxed">
                    By registering, you agree to CC Beauty's private membership terms.
                </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="py-6! w-full btn-gold text-lg uppercase tracking-[0.5em] font-black flex items-center justify-center gap-4 shadow-[0_20px_50px_rgba(255,215,0,0.2)]"
            >
              {loading ? 'Processing...' : (
                <>
                  Register Account <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-gray-600 text-xs uppercase font-bold tracking-widest mb-4">
              Already a member?
            </p>
            <Link to="/login" className="inline-block text-white font-black hover:text-gold transition-all uppercase tracking-[0.2em] text-sm border-b-2 border-gold pb-1">
              Access Your Portal
            </Link>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default Register;
