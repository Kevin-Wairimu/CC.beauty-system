import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Sparkles, Mail, Send, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ loading: false, success: false, error: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: '' });
    try {
      await api.post('/auth/forgot-password', { email });
      setStatus({ loading: false, success: true, error: '' });
      toast.success('Reset link dispatched to your inbox.');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send reset link';
      setStatus({ loading: false, success: false, error: msg });
      toast.error(msg);
    }
  };

  return (
    <div className="bg-[#0F0F0F] min-h-screen flex items-center justify-center px-4 py-20 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold/5 blur-[120px] rounded-full pointer-events-none" />

      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full relative z-10"
      >
        <div className="text-center mb-12">
          <div className="inline-block p-4 border-2 border-gold/30 bg-gold/5 mb-8">
            <Sparkles className="text-gold h-12 w-12 animate-pulse" />
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold uppercase tracking-tighter text-white mb-4">
            Reset <span className="text-gold italic">Access</span>
          </h1>
          <p className="text-gray-400 uppercase tracking-[0.4em] text-xs font-black">Request A New Secret Password</p>
        </div>

        <div className="glass-panel p-8 md:p-16 shadow-[0_0_100px_rgba(0,0,0,0.8)] border-gold/30 bg-[#18181B]">
          {status.success ? (
            <div className="text-center space-y-10 py-4">
              <div className="bg-gold/10 border-2 border-gold/20 p-8">
                <p className="text-gold text-lg font-bold uppercase tracking-[0.2em] leading-relaxed">
                  A unique reset link has been successfully dispatched to your email address.
                </p>
              </div>
              <Link to="/login" className="btn-gold !py-6 w-full flex items-center justify-center gap-4 font-black text-lg">
                <ArrowLeft className="h-5 w-5" /> Return to Portal
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="group">
                <label className="block text-xs font-black uppercase tracking-[0.3em] text-gold mb-4 group-focus-within:text-white transition-colors">
                  Registered Account Email
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

              <button
                type="submit"
                disabled={status.loading}
                className="w-full btn-gold !py-6 text-lg uppercase tracking-[0.5em] font-black flex items-center justify-center gap-4 shadow-[0_20px_50px_rgba(255,215,0,0.2)]"
              >
                {status.loading ? 'Dispatching...' : (
                  <>
                    Send Reset Link <Send className="h-5 w-5" />
                  </>
                )}
              </button>

              <div className="text-center">
                <Link to="/login" className="inline-flex items-center justify-center gap-3 text-xs text-gray-500 hover:text-gold transition-all font-black uppercase tracking-widest border-b border-transparent hover:border-gold pb-1">
                  <ArrowLeft className="h-4 w-4" /> Return to Access Page
                </Link>
              </div>
            </form>
          )}
        </div>
      </motion.section>
    </div>
  );
};

export default ForgotPassword;
