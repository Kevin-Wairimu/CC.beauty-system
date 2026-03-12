import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { Lock, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      toast.success('Security credentials updated. Welcome back.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    }
    setLoading(false);
  };

  if (!token) {
    return (
      <div className="bg-[#0F0F0F] min-h-screen flex items-center justify-center text-gold">
        <p className="uppercase tracking-widest text-xs font-black">Invalid Reset Token</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0F0F0F] min-h-screen flex items-center justify-center px-4 py-20 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/5 blur-[120px] rounded-full pointer-events-none" />

      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full relative z-10"
      >
        <div className="text-center mb-12">
          <div className="inline-block p-4 border-2 border-gold/30 bg-gold/5 mb-8">
            <Lock className="text-gold h-12 w-12" />
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold uppercase tracking-tighter text-white mb-4">
            Security <span className="text-gold italic">Update</span>
          </h1>
          <p className="text-gray-400 uppercase tracking-[0.4em] text-xs font-black">Finalize Your New Access Key</p>
        </div>

        <div className="glass-panel p-8 md:p-16 shadow-[0_0_100px_rgba(0,0,0,0.8)] border-gold/30 bg-[#18181B]">
          <form onSubmit={handleSubmit} className="space-y-12">
            <div className="group">
              <label className="block text-xs font-black uppercase tracking-[0.3em] text-gold mb-4 group-focus-within:text-white transition-colors">
                New Signature Password
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

            <div className="group">
              <label className="block text-xs font-black uppercase tracking-[0.3em] text-gold mb-4 group-focus-within:text-white transition-colors">
                Confirm Security Key
              </label>
              <div className="flex items-center border-b-2 border-white/10 group-focus-within:border-gold transition-all pb-3">
                <Lock className="h-5 w-5 text-gray-500 mr-4" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-transparent outline-none text-white text-xl font-light placeholder:text-gray-700"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-gold !py-6 text-lg uppercase tracking-[0.5em] font-black flex items-center justify-center gap-4 shadow-[0_20px_50px_rgba(255,215,0,0.2)]"
            >
              {loading ? 'Updating Credentials...' : (
                <>
                  Secure Account <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </motion.section>
    </div>
  );
};

export default ResetPassword;
