import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Mail, Lock, ArrowRight, Loader2, User, Phone, KeyRound, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './AuthScreen.css';
import { API_BASE_URL } from '../config';

type AuthMode = 'login' | 'register' | 'verify' | 'forgot' | 'reset';

const AuthScreen: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const getPasswordStrength = () => {
    let score = 0;
    if (password.length > 7) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  };
  const strength = getPasswordStrength();

  const handleMainSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setError(''); 
    setMessage(''); 
    setLoading(true);

    // CLEAN INPUTS BEFORE SENDING
    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    try {
      if (mode === 'login') {
        const res = await fetch(`${API_BASE_URL}///api/auth/login`, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ email: cleanEmail, password }) 
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        
        login(data.user, data.token); 
        navigate('/selection');
        
      } else if (mode === 'register') {
        if (password !== confirmPassword) throw new Error("Passwords do not match");
        if (strength < 3) throw new Error("Please choose a stronger password");
        const res = await fetch(`${API_BASE_URL}/api/auth/register`, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ name, email: cleanEmail, mobileNumber, password }) 
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setMessage(data.message); 
        setMode('verify');
        
      } else if (mode === 'verify') {
        const res = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ email: cleanEmail, otp: cleanOtp }) 
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        
        login(data.user, data.token); 
        navigate('/selection');
        
      } else if (mode === 'forgot') {
        const res = await fetch(`${API_BASE_URL}///api/auth/forgot-password`, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ email: cleanEmail }) 
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setMessage(data.message); 
        setMode('reset');
        
      } else if (mode === 'reset') {
        if (password !== confirmPassword) throw new Error("Passwords do not match");
        const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ email: cleanEmail, otp: cleanOtp, newPassword: password }) 
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setMessage(data.message); 
        setMode('login');
      }
    } catch (err: any) { 
        setError(err.message); 
    } finally { 
        setLoading(false); 
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-ambient-glow"></div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="auth-box">
        <div className="auth-header">
          <ShieldCheck className="auth-icon" />
          <h2>
            {mode === 'login' && 'Access Core'}
            {mode === 'register' && 'Initialize Profile'}
            {mode === 'verify' && 'Verify Email'}
            {mode === 'forgot' && 'Reset Protocol'}
            {mode === 'reset' && 'Create New Password'}
          </h2>
        </div>
        {error && <div className="auth-error">{error}</div>}
        {message && <div className="auth-success">{message}</div>}

        <form onSubmit={handleMainSubmit} className="auth-form">
          {mode === 'register' && (
            <>
              <div className="input-group"><User className="input-icon" /><input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required /></div>
              <div className="input-group"><Phone className="input-icon" /><input type="tel" placeholder="Mobile Number" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} required /></div>
            </>
          )}
          {(mode === 'login' || mode === 'register' || mode === 'forgot') && (
            <div className="input-group"><Mail className="input-icon" /><input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          )}
          {(mode === 'login' || mode === 'register' || mode === 'reset') && (
            <div className="input-group">
              <Lock className="input-icon" />
              <input type={showPassword ? "text" : "password"} placeholder={mode === 'reset' ? "New Password" : "Password"} value={password} onChange={(e) => setPassword(e.target.value)} required />
              <div className="eye-icon" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</div>
            </div>
          )}
          {(mode === 'register' || mode === 'reset') && (
            <>
              <div className="strength-bar-container">
                <div className="strength-bar" style={{ width: `${(strength / 4) * 100}%`, backgroundColor: strength < 2 ? '#ef4444' : strength < 3 ? '#eab308' : '#22c55e' }}></div>
              </div>
              <div className="input-group"><Lock className="input-icon" /><input type={showPassword ? "text" : "password"} placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required /></div>
            </>
          )}
          {(mode === 'verify' || mode === 'reset') && (
            <div className="input-group"><KeyRound className="input-icon" /><input type="text" placeholder="Enter 6-digit Email OTP" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} required /></div>
          )}
          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? <Loader2 className="spinner" /> : 'Proceed'} {!loading && <ArrowRight className="btn-arrow" />}
          </button>
        </form>
        <div className="auth-footer">
          {mode === 'login' && (<><p className="auth-toggle" onClick={() => { setMode('forgot'); setError(''); setMessage(''); }}>Forgot Password?</p><p>New here? <span onClick={() => setMode('register')} className="auth-toggle">Register</span></p></>)}
          {mode === 'register' && <p>Already registered? <span onClick={() => setMode('login')} className="auth-toggle">Login</span></p>}
          {(mode === 'forgot' || mode === 'reset' || mode === 'verify') && (<p><span onClick={() => setMode('login')} className="auth-toggle">Back to Login</span></p>)}
        </div>
      </motion.div>
    </div>
  );
};
export default AuthScreen;