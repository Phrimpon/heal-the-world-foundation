import { useState } from 'react';
import { LogIn, LogOut, UserPlus, Eye, EyeOff, CheckCircle, AlertTriangle, LayoutDashboard, ChevronRight, ShieldCheck } from 'lucide-react';
import { getActiveUser, registerNewUser, loginUserSession, logoutUserSession, isOwnerDevice } from '../../database/db';
import { UserRole } from '../../types';

export default function LoginPage() {
  const user = getActiveUser();
  const isLoggedIn = !!user;
  const isOwner = isOwnerDevice();

  // Administrator Sandbox Verification Gate
  const [adminCode, setAdminCode] = useState('');
  const [adminVerified, setAdminVerified] = useState(false);
  const [adminError, setAdminError] = useState(false);

  const checkAdminCode = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (adminCode === '1999') {
      setAdminVerified(true);
      setAdminError(false);
    } else {
      setAdminError(true);
      setAdminCode('');
    }
  };

  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'Member' as UserRole, invite_code: '' });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegister) {
      if (!form.username || !form.email || !form.password) {
        setMessage({ type: 'error', text: 'Please fill in all fields.' });
        return;
      }
      if (form.password.length < 6) {
        setMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
        return;
      }
      
      // Call register including invite code
      const res = registerNewUser(form.username, form.email, form.password, form.role, form.invite_code);
      setMessage({ type: res.success ? 'success' : 'error', text: res.message });
    } else {
      if (!form.email || !form.password) {
        setMessage({ type: 'error', text: 'Please enter email and password.' });
        return;
      }
      const res = loginUserSession(form.email, form.password);
      setMessage({ type: res.success ? 'success' : 'error', text: res.message });
    }
  };

  const handleQuickLogin = (email: string) => {
    const res = loginUserSession(email, 'password123');
    if (res.success) setMessage({ type: 'success', text: res.message });
  };

  const handleLogout = () => {
    logoutUserSession();
    setForm({ username: '', email: '', password: '', role: 'Member', invite_code: '' });
    setMessage({ type: 'success', text: 'Logged out successfully (Flask-Login session destroyed).' });
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900/30 outline-none transition-all duration-200 text-gray-800 dark:text-white";
  const labelClass = "block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 transition-colors";

  // Logged in state
  if (isLoggedIn && user) {
    return (
      <div className="max-w-3xl fade-in animate-fade-in-up">
        <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500 mb-6 transition-colors">
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-700 dark:text-gray-300 font-medium transition-colors">Account Session</span>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 mb-6 transition-colors duration-300 animate-scale-in">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-650 flex items-center justify-center shadow-lg shadow-rose-200 dark:shadow-rose-900/30">
              <LogOut className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">Account Session</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5 transition-colors">Securely managed with Flask-Login</p>
            </div>
          </div>
        </div>

        {message && (
          <div className={`flex items-center gap-3 p-4 rounded-xl mb-6 animate-fade-in-up ${message.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'}`}>
            {message.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertTriangle className="w-5 h-5 flex-shrink-0" />}
            <p className="text-sm">{message.text}</p>
          </div>
        )}

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-8 transition-colors duration-300 animate-scale-in delay-1">
          <div className="flex items-center gap-5 mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 flex items-center justify-center border border-green-200 dark:border-green-800 transition-colors">
              <span className="text-3xl font-bold text-green-700 dark:text-green-400 transition-colors">
                {user.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white transition-colors">{user.username}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors">{user.email}</p>
              <span className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-bold transition-colors">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Logged In: {user.role}
              </span>
            </div>
          </div>

          <div className="text-xs text-gray-400 dark:text-gray-500 mb-6 px-1 space-y-1 transition-colors">
            <p>Account created: {new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p>Flask-Login User ID: {user.email}</p>
          </div>

          <button onClick={handleLogout} className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-red-200 dark:shadow-red-900/30">
            <LogOut className="w-4 h-4" />
            Log Out Securely
          </button>
        </div>
      </div>
    );
  }

  // Login/Register form
  return (
    <div className="max-w-4xl grid grid-cols-1 lg:grid-cols-5 gap-6 fade-in animate-fade-in-up">
      {/* Left Form Area */}
      <div className="lg:col-span-3 space-y-6">
        <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500 transition-colors">
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-700 dark:text-gray-300 font-medium transition-colors">{isRegister ? 'Register' : 'Log In'}</span>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 transition-colors duration-300 animate-scale-in">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-200 dark:shadow-green-900/30">
              <LogIn className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">{isRegister ? 'Secure Registration' : 'Secure Portal Access'}</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5 transition-colors">
                {isRegister ? 'Create your hashed credentials' : 'Hashed authentication via Werkzeug security'}
              </p>
            </div>
          </div>
        </div>

        {message && (
          <div className={`flex items-center gap-3 p-4 rounded-xl animate-fade-in-up ${message.type === 'success' ? 'bg-green-55 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200' : 'bg-red-55 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'}`}>
            {message.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertTriangle className="w-5 h-5 flex-shrink-0" />}
            <p className="text-sm">{message.text}</p>
          </div>
        )}

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 sm:p-8 transition-colors duration-300 animate-scale-in delay-1">
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-6 transition-colors">
            <button onClick={() => { setIsRegister(false); setMessage(null); }} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${!isRegister ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
              Log In
            </button>
            <button onClick={() => { setIsRegister(true); setMessage(null); }} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${isRegister ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <>
                <div>
                  <label className={labelClass}>Username</label>
                  <input name="username" value={form.username} onChange={handleChange} placeholder="Choose a username" className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>Account Role</label>
                  <select name="role" value={form.role} onChange={handleChange} className={inputClass} required>
                    <option value="Member">Member (Community Access)</option>
                    <option value="Donor">Donor (Financial Dashboard)</option>
                    <option value="Volunteer">Volunteer (Campaign Scheduling)</option>
                    <option value="Executive">Executive (Invite Code Required 🔑)</option>
                  </select>
                </div>
                
                {form.role === 'Executive' && (
                  <div className="animate-fade-in-up">
                    <label className={labelClass}>Secret Executive Invite Code</label>
                    <input name="invite_code" value={form.invite_code} onChange={handleChange} placeholder="Enter invite code (e.g., 9f3ab12c)" className={inputClass} required />
                    <span className="text-[10px] text-amber-600 mt-1 block">Seeded codes for sandbox: <span className="font-mono font-bold">9f3ab12c</span>, <span className="font-mono font-bold">c7a82d11</span>, <span className="font-mono font-bold">ab44ee90</span></span>
                  </div>
                )}
              </>
            )}

            <div>
              <label className={labelClass}>Email Address</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="email@example.com" className={inputClass} required />
            </div>

            <div>
              <label className={labelClass}>Password</label>
              <div className="relative">
                <input name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange} placeholder="Enter password" className={`${inputClass} pr-12`} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-green-200 dark:shadow-green-900/30">
              {isRegister ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
              {isRegister ? 'Create Secure Account' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>

      {/* Right Side: Administrator-only sandbox access (device & code restricted) */}
      <div className="lg:col-span-2 space-y-6 animate-fade-in-right delay-2">
        {adminVerified && isOwner ? (
          <div className="bg-gradient-to-br from-green-800 to-emerald-950 dark:from-green-950 dark:to-emerald-950 text-white rounded-2xl p-6 shadow-lg shadow-green-900/20 dark:shadow-green-950/40">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-5 h-5 text-yellow-300 animate-pulse" />
              <h3 className="font-bold text-base">Administrator Sandbox Access</h3>
            </div>
            <p className="text-xs text-green-100 leading-relaxed mb-6">
              Restricted to the foundation administrator only. Donor and volunteer sandbox logins have been removed.
            </p>

            <div className="space-y-3">
              {[
                { role: 'Administrator', email: 'admin@healtheworld.org', color: 'bg-red-500/20 hover:bg-red-500/30 border-red-500/30' },
              ].map((r, idx) => (
                <button
                  key={r.role}
                  onClick={() => handleQuickLogin(r.email)}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-xs font-medium transition-all duration-200 flex items-center justify-between animate-fade-in-left delay-${idx + 1} ${r.color}`}
                >
                  <div>
                    <span className="block font-bold text-white">{r.role}</span>
                    <span className="block text-[10px] text-green-200/70 mt-0.5">{r.email}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-white/15 font-mono text-[9px] tracking-wider uppercase text-yellow-300">Login</span>
                </button>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 text-[10px] text-green-200/50 text-center">
              Admin sandbox password: password123. All passwords are hashed before storage.
            </div>
          </div>
        ) : isOwner ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 text-center shadow-sm">
            <ShieldCheck className="w-10 h-10 text-amber-500 mx-auto mb-3" />
            <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">
              Administrator Verification Required
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Enter the secret administrator code to unlock the sandbox.
            </p>
            <form onSubmit={checkAdminCode} className="max-w-xs mx-auto space-y-3">
              <input
                type="password"
                value={adminCode}
                onChange={(e) => { setAdminCode(e.target.value); setAdminError(false); }}
                placeholder="Enter code..."
                className="w-full px-4 py-2 text-center rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-200"
                autoFocus
              />
              {adminError && <p className="text-xs text-red-500">Incorrect code. Try again.</p>}
              <button type="submit" className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs transition-all">Verify Identity</button>
            </form>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 text-center shadow-sm">
            <ShieldCheck className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-sm font-bold text-gray-600 dark:text-gray-400">
              Administrator Sandbox Unavailable
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 leading-relaxed">
              The administrator sandbox is restricted to the registered owner device. If you are the administrator, access this page from your primary laptop.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
