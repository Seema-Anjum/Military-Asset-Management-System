import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { Shield, Lock, User, Building, ShieldCheck } from 'lucide-react';

export const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false);

  // Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('LOGISTICS_OFFICER');
  const [baseId, setBaseId] = useState('1');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isRegistering) {
        // Register API Call
        await API.post('/auth/register', {
          username,
          password,
          role,
          baseId: role === 'ADMIN' ? null : parseInt(baseId, 10),
        });

        setSuccess('Account created successfully! Authenticating...');

        // Auto-login immediately after successful registration
        const loginRes = await API.post('/auth/login', { username, password });
        loginUser(loginRes.data.token, loginRes.data.user);
        navigate('/dashboard');
      } else {
        // Login API Call
        const response = await API.post('/auth/login', { username, password });
        loginUser(response.data.token, response.data.user);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          'An error occurred. Please check your credentials or server connection.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex justify-center items-center p-4">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mb-3">
            <Shield className="w-10 h-10 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">
            {isRegistering ? 'Create Account' : 'MAMS Login'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Military Asset Management System
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-lg">
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg pl-9 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="Enter username"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg pl-9 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="Enter password"
              />
            </div>
          </div>

          {/* Registration Fields */}
          {isRegistering && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
                  Military Role
                </label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg pl-9 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="LOGISTICS_OFFICER">Logistics Officer</option>
                    <option value="BASE_COMMANDER">Base Commander</option>
                    <option value="ADMIN">System Admin</option>
                  </select>
                </div>
              </div>

              {role !== 'ADMIN' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">
                    Assigned Base ID
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                    <input
                      type="number"
                      required
                      min="1"
                      value={baseId}
                      onChange={(e) => setBaseId(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg pl-9 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="e.g. 1"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-lg transition duration-200 mt-2 cursor-pointer disabled:opacity-50"
          >
            {loading
              ? isRegistering
                ? 'Creating Account...'
                : 'Authenticating...'
              : isRegistering
              ? 'Register & Access System'
              : 'Sign In'}
          </button>
        </form>

        {/* Toggle between Sign In and Registration */}
        <div className="mt-6 text-center border-t border-slate-800 pt-4">
          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError('');
              setSuccess('');
            }}
            className="text-xs text-slate-400 hover:text-emerald-400 transition underline cursor-pointer"
          >
            {isRegistering
              ? 'Already registered? Sign In'
              : "Don't have an account? Register here"}
          </button>
        </div>
      </div>
    </div>
  );
};