import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (password.length < 8) {
      return toast.error('Password must be at least 8 characters');
    }

    setLoading(true);
    try {
      await authAPI.resetPassword(token, password);
      toast.success('Password successfully reset! You can now log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] p-6 font-sans">
      <div className="w-full max-w-md p-10 bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] shadow-[0_0_100px_rgba(34,197,94,0.05)] text-center relative overflow-hidden">
        
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-[#22c55e]/10 blur-[80px] rounded-full pointer-events-none" />

        <div className="mb-10 relative">
          <h1 className="text-3xl font-black text-white tracking-tight">New Password</h1>
          <p className="text-zinc-500 text-sm mt-3 font-medium">Create a strong new password for your account.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative">
          <div className="text-left">
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">New Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
              className="w-full h-14 bg-[#0a0a0a] border border-white/10 rounded-xl px-5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#22c55e] focus:bg-[#22c55e]/5 transition-all outline-none"
            />
          </div>

          <div className="text-left">
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
              className="w-full h-14 bg-[#0a0a0a] border border-white/10 rounded-xl px-5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#22c55e] focus:bg-[#22c55e]/5 transition-all outline-none"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full h-14 bg-white text-black font-bold tracking-wide rounded-xl hover:bg-[#22c55e] hover:text-white hover:scale-[1.02] flex items-center justify-center transition-all shadow-lg mt-4 ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            ) : (
              'Reset Password'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
