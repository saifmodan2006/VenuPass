import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Lock, User, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { useAppStore } from '../../store/useStore';
import { Navbar } from '../../components/navigation/Navbar';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginAdmin } = useAppStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const from = (location.state as any)?.from?.pathname || '/admin/dashboard';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const success = loginAdmin(username, password);
    if (success) {
      navigate(from, { replace: true });
    } else {
      setError('Invalid username or password. Please use demo credentials.');
    }
  };

  const handleAutofill = () => {
    setUsername('admin');
    setPassword('venupass2026');
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#F5F4F0] text-[#161616] flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm rounded-card border border-[#DDDCD6] bg-[#FFFFFF] p-6 sm:p-8 shadow-card text-left">
          <div className="text-center mb-6">
            <div className="w-10 h-10 rounded-btn bg-[#161616] flex items-center justify-center text-white mx-auto mb-3">
              <Shield className="w-5 h-5 text-[#E86A00]" />
            </div>
            <h1 className="font-heading text-xl font-bold text-[#161616]">
              Control Room Login
            </h1>
            <p className="text-xs text-[#6F6F6A] mt-1">
              Event operations and gate management console.
            </p>
          </div>

          {/* Demo Credentials Box */}
          <div className="mb-5 p-3 rounded-btn bg-[#F5F4F0] border border-[#DDDCD6] text-xs flex items-center justify-between">
            <div>
              <span className="font-semibold text-[#161616] block">Demo Credentials:</span>
              <span className="font-mono text-[11px] text-[#6F6F6A]">admin / venupass2026</span>
            </div>
            <button
              type="button"
              onClick={handleAutofill}
              className="px-2.5 py-1 rounded-btn bg-[#FFFFFF] border border-[#DDDCD6] hover:bg-[#EAE8E1] text-[#161616] text-[11px] font-semibold transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-[#E86A00]" />
              Fill
            </button>
          </div>

          {error && (
            <div className="mb-4 p-2.5 rounded-btn bg-[#FDF0F0] border border-[#C43D3D]/30 text-xs text-[#C43D3D] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-[#161616] uppercase tracking-wider mb-1">
                Operator ID
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-[#6F6F6A] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full rounded-input border border-[#DDDCD6] bg-[#FFFFFF] pl-9 pr-3 py-2 text-xs text-[#161616] placeholder-[#9E9D97] focus:outline-none focus:border-[#E86A00]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#161616] uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-[#6F6F6A] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-input border border-[#DDDCD6] bg-[#FFFFFF] pl-9 pr-3 py-2 text-xs text-[#161616] placeholder-[#9E9D97] focus:outline-none focus:border-[#E86A00]"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-2.5 rounded-btn bg-[#E86A00] hover:bg-[#B94D00] text-[#FFFFFF] font-semibold text-xs shadow-subtle transition-all flex items-center justify-center gap-1.5"
            >
              Sign In to Console
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};
