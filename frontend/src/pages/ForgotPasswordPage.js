import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');

    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error occurred. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] p-6 font-sans">
      <div className="w-full max-w-md p-10 bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] shadow-[0_0_100px_rgba(34,197,94,0.05)] text-center relative overflow-hidden">
        
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#22c55e]/10 blur-[80px] rounded-full pointer-events-none" />

        <div className="mb-10 relative">
          <h1 className="text-3xl font-black text-white tracking-tight">Recover Access</h1>
          <p className="text-zinc-500 text-sm mt-3 font-medium">Enter your email address to receive password reset instructions.</p>
        </div>

        {submitted ? (
          <div className="space-y-6">
            <div className="w-20 h-20 mx-auto bg-[#22c55e]/10 border border-[#22c55e]/30 rounded-full flex items-center justify-center">
              <span className="text-3xl">✉️</span>
            </div>
            <h2 className="text-xl font-bold text-white">Check Your Inbox</h2>
            <p className="text-zinc-500 text-sm font-medium">We've sent a link to <strong className="text-white">{email}</strong> to reset your password. It might take a few minutes to arrive.</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full h-14 bg-white text-black font-bold tracking-wide rounded-xl hover:bg-[#22c55e] hover:text-white transition-all shadow-lg mt-6"
            >
              Return to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 relative">
            <div className="text-left">
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="operator@digivault.com"
                required
                className="w-full h-14 bg-[#0a0a0a] border border-white/10 rounded-xl px-5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#22c55e] focus:bg-[#22c55e]/5 transition-all outline-none"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className={`w-full h-14 bg-[#22c55e] text-black font-bold tracking-wide rounded-xl hover:bg-[#16a34a] hover:scale-[1.02] flex items-center justify-center transition-all shadow-[0_0_30px_rgba(34,197,94,0.2)] ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>
        )}

        <div className="mt-8 pt-8 border-t border-white/5">
          <p className="text-zinc-500 text-sm font-medium">
            Remember your credentials?{' '}
            <Link to="/login" className="text-white font-bold hover:text-[#22c55e] transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
