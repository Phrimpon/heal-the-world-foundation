import { useEffect, useState } from 'react';
import { NavItem, UserRole, FoundationGoal, UploadedImage } from '../../types';
import {
  User,
  CreditCard,
  Target,
  Megaphone,
  Settings as SettingsIcon,
  LogIn,
  ArrowRight,
  Users,
  Clock,
  Shield,
  Database as DbIcon,
  Terminal,
  Trash2,
  Gift,
  CheckCircle,
  ShieldAlert,
  UserCheck,
  Sparkles,
  Upload,
  FileImage,
  Plus,
  Printer,
  X,
  FileCheck,
  CalendarRange,
  Building2,
  Activity,
  AlertCircle,
  Zap,
} from 'lucide-react';
import {
  getActiveUser,
  getApiLogs,
  clearApiLogs,
  getAllUsers,
  updateUserRole,
  getFoundationGoals,
  addFoundationGoal,
  getUploadedImages,
  addUploadedImage,
  toggleUserStatus,
  deleteUserAccount,
  getInviteCodes,
  generateInviteCode,
  chargeUserDues,
} from '../../database/db';

interface DashboardProps {
  onNavigate: (item: NavItem) => void;
}

interface SimulatedDonation {
  id: string;
  date: string;
  amount: number;
  cause: string;
  gateway: string;
  frequency: 'One-time' | 'Monthly';
}

interface ActivityLog {
  id: string;
  time: string;
  type: 'auth' | 'donation' | 'security' | 'database';
  message: string;
  details: string;
  status: 'success' | 'alert' | 'info';
}

const portalCards: {
  id: NavItem;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  hoverBg: string;
}[] = [
  {
    id: 'personal-info',
    title: 'Personal Information',
    description: 'Manage your profile and contact details',
    icon: <User className="w-6 h-6" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-100',
    hoverBg: 'hover:border-blue-300 hover:bg-blue-50/50',
  },
  {
    id: 'member-balance',
    title: 'Member Balance & Dues',
    description: 'Settle and manage outstanding membership balances',
    icon: <CreditCard className="w-6 h-6" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-100',
    hoverBg: 'hover:border-purple-300 hover:bg-purple-50/50',
  },
  {
    id: 'aim-of-foundation',
    title: 'Aim of Foundation',
    description: 'Define mission, vision and goals',
    icon: <Target className="w-6 h-6" />,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-100',
    hoverBg: 'hover:border-emerald-300 hover:bg-emerald-50/50',
  },
  {
    id: 'announcement',
    title: 'Announcements',
    description: 'Create and manage announcements',
    icon: <Megaphone className="w-6 h-6" />,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-100',
    hoverBg: 'hover:border-amber-300 hover:bg-amber-50/50',
  },
  {
    id: 'settings',
    title: 'Settings',
    description: 'Configure portal preferences',
    icon: <SettingsIcon className="w-6 h-6" />,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    hoverBg: 'hover:border-gray-400 hover:bg-gray-50/50',
  },
  {
    id: 'login',
    title: 'Account',
    description: 'Sign in or create an account',
    icon: <LogIn className="w-6 h-6" />,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-100',
    hoverBg: 'hover:border-rose-300 hover:bg-rose-50/50',
  },
];

export default function DashboardPage({ onNavigate }: DashboardProps) {
  const [logs, setLogs] = useState(getApiLogs());
  const [activeDevTab, setActiveDevTab] = useState<'logs' | 'sqlite' | 'syntax'>('logs');
  const [activeSchemaSyntax, setActiveSchemaSyntax] = useState<'sqlite' | 'mysql' | 'postgres'>('mysql');
  
  // State for Extended Database Fields
  const [goals, setGoals] = useState<FoundationGoal[]>(getFoundationGoals());
  const [images, setImages] = useState<UploadedImage[]>(getUploadedImages());
  const [dbUsers, setDbUsers] = useState(getAllUsers());
  const [inviteCodesList, setInviteCodesList] = useState(getInviteCodes());

  // Admin Invite Code Generator States
  const [adminKeyInput, setAdminKeyInput] = useState('');
  const [generatedCodeResult, setGeneratedCodeResult] = useState('');
  const [inviteError, setInviteError] = useState('');

  // Submissions
  const [newGoal, setNewGoal] = useState({ title: '', targetValue: 10000, category: 'General', deadline: '' });
  const [imageNameInput, setImageNameInput] = useState('');
  const [imageSizeInput, setImageSizeInput] = useState(512);
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Dues Management States (Admin tools)
  const [duesEmailInput, setDuesEmailInput] = useState('');
  const [duesAmountInput, setDuesAmountInput] = useState(120);
  const [duesFeedback, setDuesFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Donor dashboard state & features
  const [donationAmount, setDonationAmount] = useState<number>(100);
  const [selectedGateway, setSelectedGateway] = useState<string>('mtn_momo');
  const [donationFrequency, setDonationFrequency] = useState<'One-time' | 'Monthly'>('One-time');
  const [activePledges, setActivePledges] = useState([
    { id: 'PLG-90', amount: 250, gateway: 'MTN Mobile Money', active: true, started: '2026-01-10' },
    { id: 'PLG-81', amount: 100, gateway: 'Stripe Credit Card', active: true, started: '2026-02-01' },
  ]);
  const [selectedReceipt, setSelectedReceipt] = useState<SimulatedDonation | null>(null);

  const [donorHistory, setDonorHistory] = useState<SimulatedDonation[]>([
    { id: 'TXN-881', date: '2026-02-10', amount: 250, cause: 'Clean Water Pipeline', gateway: 'MTN Mobile Money', frequency: 'Monthly' },
    { id: 'TXN-762', date: '2026-01-15', amount: 100, cause: 'School Supplies Fund', gateway: 'Stripe Credit Card', frequency: 'One-time' },
  ]);

  // Members state
  const [membersChat, setMembersChat] = useState([
    { user: 'Generous Donor', text: 'Excited to see the water pipeline progress!', time: '2h ago' },
    { user: 'Active Volunteer', text: 'Who is attending the orientation this Saturday?', time: '4h ago' },
  ]);
  const [chatInput, setChatInput] = useState('');

  // Admin Monitoring Board States
  const [serverLatency, setServerLatency] = useState(42);
  const [activeAdminFilter, setActiveAdminFilter] = useState<'all' | 'security' | 'donations' | 'auth'>('all');
  const [activityFeed, setActivityFeed] = useState<ActivityLog[]>([
    { id: 'ACT-101', time: '10:14 AM', type: 'security', message: 'Flask-Talisman HTTPS redirect active', details: 'Double-cookie verification check passed', status: 'success' },
    { id: 'ACT-102', time: '10:12 AM', type: 'auth', message: 'Flask-Login session established for Admin', details: 'admin@healtheworld.org authenticated securely', status: 'success' },
    { id: 'ACT-103', time: '10:10 AM', type: 'donation', message: 'GH₵ 250 transaction seeded into table', details: 'Processed via MTN Mobile Money', status: 'info' },
    { id: 'ACT-104', time: '10:08 AM', type: 'security', message: 'Malicious query blocked by SQL shield', details: 'Blocked drop table query in registration name field', status: 'alert' },
  ]);

  const user = getActiveUser();

  useEffect(() => {
    const interval = setInterval(() => {
      setLogs(getApiLogs());
      setDbUsers(getAllUsers());
      setGoals(getFoundationGoals());
      setImages(getUploadedImages());
      setInviteCodesList(getInviteCodes());
      setServerLatency(Math.floor(30 + Math.random() * 20));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.title) return;
    addFoundationGoal({
      title: newGoal.title,
      targetValue: newGoal.targetValue,
      currentValue: 0,
      category: newGoal.category,
      deadline: newGoal.deadline || new Date().toISOString().split('T')[0],
    });
    setNewGoal({ title: '', targetValue: 10000, category: 'General', deadline: '' });
  };

  const handleChargeDues = (e: React.FormEvent) => {
    e.preventDefault();
    if (!duesEmailInput) return;
    const res = chargeUserDues(duesEmailInput, duesAmountInput);
    if (res) {
      setDuesFeedback({ type: 'success', text: `Charged GH₵ ${duesAmountInput} successfully to ${duesEmailInput}!` });
      setDuesEmailInput('');
    } else {
      setDuesFeedback({ type: 'error', text: `User ${duesEmailInput} not found.` });
    }
    setTimeout(() => setDuesFeedback(null), 4000);
  };

  const handleImageUploadSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageNameInput) return;
    
    const res = addUploadedImage(imageNameInput, imageSizeInput);
    if (res.success) {
      setUploadMessage({ type: 'success', text: res.message });
      setImageNameInput('');
    } else {
      setUploadMessage({ type: 'error', text: res.message });
    }
    setTimeout(() => setUploadMessage(null), 5000);
  };

  const handleGenerateCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = generateInviteCode(adminKeyInput);
    if (res.success && res.code) {
      setGeneratedCodeResult(res.code);
      setInviteError('');
      setAdminKeyInput('');
      console.log('Current active invite codes registry count:', inviteCodesList.length);
    } else {
      setInviteError(res.error || 'Failed to generate');
      setGeneratedCodeResult('');
    }
  };

  // Role Dashboard Builders
  const renderAdminDashboard = () => {
    const filteredActivities = activeAdminFilter === 'all' 
      ? activityFeed 
      : activityFeed.filter(act => {
          if (activeAdminFilter === 'security') return act.type === 'security';
          if (activeAdminFilter === 'donations') return act.type === 'donation';
          if (activeAdminFilter === 'auth') return act.type === 'auth';
          return true;
        });

    return (
      <div className="space-y-6 animate-fade-in-up">
        {/* System Overview & Server Latency HUD */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-gradient-to-br from-red-500 to-rose-650 dark:from-red-700 dark:to-rose-800 text-white p-5 rounded-2xl shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full" />
            <h4 className="text-xs font-bold tracking-wider uppercase text-red-100 mb-1">System Security</h4>
            <p className="text-2xl font-extrabold">Active Mode</p>
            <p className="text-[10px] text-red-100 mt-2 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
              Werkzeug secure password hashes active
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-indigo-650 dark:from-blue-700 dark:to-indigo-800 text-white p-5 rounded-2xl shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full" />
            <h4 className="text-xs font-bold tracking-wider uppercase text-blue-100 mb-1">Directory Database</h4>
            <p className="text-2xl font-extrabold">{dbUsers.length} SQLite Accounts</p>
            <p className="text-[10px] text-blue-100 mt-2">Double-cookie CSRF active</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-emerald-700 dark:to-teal-800 text-white p-5 rounded-2xl shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full" />
            <h4 className="text-xs font-bold tracking-wider uppercase text-emerald-100 mb-1 font-sans">Server Ping</h4>
            <p className="text-2xl font-extrabold">{serverLatency} ms</p>
            <p className="text-[10px] text-emerald-100 mt-2 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
              Gunicorn dynamic latency metrics
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-indigo-650 dark:from-purple-700 dark:to-indigo-850 text-white p-5 rounded-2xl shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full" />
            <h4 className="text-xs font-bold tracking-wider uppercase text-purple-100 mb-1">Platform Node</h4>
            <p className="text-2xl font-extrabold">Render Cloud</p>
            <p className="text-[10px] text-purple-100 mt-2">Auto SSL cert loaded</p>
          </div>
        </div>

        {/* Interactive Activity Monitor Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Live Site Activity Monitor */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 flex flex-col justify-between transition-colors duration-300 text-left">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-50 dark:border-gray-800">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
                    <Activity className="w-5 h-5 text-green-600 animate-pulse" />
                    Heal The World Live Activity Feed
                  </h3>
                  <p className="text-[10px] text-gray-400">Updates logged by Flask HTTP middleware</p>
                </div>
                
                <div className="flex bg-gray-100 dark:bg-gray-850 p-1 rounded-xl text-[9px] font-bold gap-1">
                  {['all', 'security', 'donations', 'auth'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveAdminFilter(tab as never)}
                      className={`px-2 py-1 rounded-lg uppercase transition-all ${
                        activeAdminFilter === tab 
                          ? 'bg-green-600 text-white shadow-sm' 
                          : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {filteredActivities.map((act) => (
                  <div 
                    key={act.id} 
                    className={`p-3 rounded-xl border transition-all flex items-start gap-3 ${
                      act.status === 'alert' 
                        ? 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-800/50 text-red-800 dark:text-red-250' 
                        : act.status === 'success'
                        ? 'bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-800/50 text-green-800 dark:text-green-250'
                        : 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800/50 text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {act.status === 'alert' ? (
                        <ShieldAlert className="w-4 h-4 text-red-600" />
                      ) : act.status === 'success' ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold">{act.message}</span>
                        <span className="text-[9px] text-gray-400 font-medium">{act.time}</span>
                      </div>
                      <p className="text-[10px] opacity-85 mt-0.5 leading-relaxed">{act.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-50 dark:border-gray-800 mt-4 flex justify-between items-center text-[10px] text-gray-400">
              <span>Auto-refreshing every 1.5 seconds</span>
              <button 
                onClick={() => {
                  const newLog: ActivityLog = {
                    id: `ACT-${Math.floor(100 + Math.random() * 900)}`,
                    time: new Date().toLocaleTimeString(),
                    type: 'database',
                    message: 'SQL prepared statement compile completed',
                    details: 'Prepared placeholder parameter checks passed',
                    status: 'success'
                  };
                  setActivityFeed([newLog, ...activityFeed]);
                }}
                className="text-green-600 dark:text-green-400 font-bold hover:underline"
              >
                Trigger Mock Network Call
              </button>
            </div>
          </div>

          {/* User Accounts Database list */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 flex flex-col justify-between text-left">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-indigo-600" />
                Active server sessions
              </h3>
              <p className="text-[10px] text-gray-400 mb-4 font-medium">Accounts currently active on this server node</p>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {dbUsers.map((u) => (
                  <div key={u.email} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200/30 dark:border-gray-750 text-xs flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-855 dark:text-white">{u.username}</p>
                      <span className="text-[9px] text-gray-450 block mt-0.5 truncate max-w-[140px]">{u.email}</span>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                        u.role === 'Administrator' 
                          ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400' 
                          : 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                      }`}>
                        {u.role}
                      </span>
                      <p className="text-[9px] text-gray-400 mt-0.5 font-medium">Active</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Executive Invite Code Management System & Charge Dues Column */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Invite Code Generator Form */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 text-left space-y-4">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-green-600" />
                Generate Executive Invite Code
              </h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Administrators can generate secure codes using the admin secret key.</p>
            </div>

            <form onSubmit={handleGenerateCodeSubmit} className="space-y-3">
              <div>
                <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Admin Secret Key</label>
                <input
                  type="password"
                  placeholder="Enter admin key (MY_SUPER_ADMIN_KEY)"
                  value={adminKeyInput}
                  onChange={(e) => setAdminKeyInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white outline-none focus:bg-white focus:border-green-500"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition-colors active:scale-95 flex items-center justify-center gap-1.5"
              >
                Generate Hex Invite Code
              </button>
            </form>

            {generatedCodeResult && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex flex-col gap-1">
                <span className="text-[9px] text-green-600 dark:text-green-400 font-bold uppercase">Invite Code Generated Successfully:</span>
                <code className="text-sm font-extrabold text-green-800 dark:text-green-300 select-all font-mono">{generatedCodeResult}</code>
              </div>
            )}

            {inviteError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-800 dark:text-red-200 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>{inviteError} (Incorrect Key)</span>
              </div>
            )}
          </div>

          {/* Admin Settle / Charge Member Dues Widget */}
          <div className="lg:col-span-3 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 text-left space-y-4 transition-colors">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-600" />
                Charge Member Dues & Balance
              </h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Charge outstanding balance / levies to any registered member profile.</p>
            </div>

            {duesFeedback && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-1.5 ${duesFeedback.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800 dark:bg-green-950/20 dark:border-green-900/30 dark:text-green-400' : 'bg-red-55 border border-red-200 text-red-800 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-450'}`}>
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>{duesFeedback.text}</span>
              </div>
            )}

            <form onSubmit={handleChargeDues} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Recipient Email Address</label>
                  <input
                    type="email"
                    placeholder="member@healtheworld.org"
                    value={duesEmailInput}
                    onChange={(e) => setDuesEmailInput(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white outline-none focus:bg-white focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Charge Amount (GH₵)</label>
                  <input
                    type="number"
                    value={duesAmountInput}
                    onChange={(e) => setDuesAmountInput(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white outline-none focus:bg-white focus:border-indigo-500"
                    required
                  />
                </div>
              </div>
              <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 active:scale-95">
                Settle / Settle Member Dues Row
              </button>
            </form>
          </div>
        </div>

        {/* User Directory Role Assignment control */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 transition-colors duration-300">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 text-left">
            <UserCheck className="w-5 h-5 text-green-600" />
            User Directory & Role Control (SQLite/MySQL users table)
          </h3>
          <div className="overflow-x-auto text-left">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-xs font-bold text-gray-400 uppercase">
                  <th className="pb-3">Username</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Hashed Password (Werkzeug)</th>
                  <th className="pb-3">Role Authorization</th>
                  <th className="pb-3">Dues Owed</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800 text-sm">
                {dbUsers.map((u) => (
                  <tr key={u.email}>
                    <td className="py-3.5 font-semibold text-gray-800 dark:text-white transition-colors">{u.username}</td>
                    <td className="py-3.5 text-gray-500 dark:text-gray-455 transition-colors">{u.email}</td>
                    <td className="py-3.5 font-mono text-[10px] text-gray-400 max-w-xs truncate">
                      {u.passwordHash}
                    </td>
                    <td className="py-3.5">
                      <select
                        value={u.role}
                        onChange={(e) => updateUserRole(u.email, e.target.value as UserRole)}
                        className="px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-855 text-xs font-bold text-gray-700 dark:text-gray-300 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-100 dark:focus:ring-green-900/30"
                      >
                        <option value="Administrator">Administrator</option>
                        <option value="Donor">Donor</option>
                        <option value="Volunteer">Volunteer</option>
                        <option value="Member">Member</option>
                        <option value="Executive">Executive</option>
                      </select>
                    </td>
                    <td className="py-3.5 font-extrabold text-purple-600 dark:text-purple-400">
                      GH₵ {u.amountOwed.toLocaleString()}
                    </td>
                    <td className="py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        (u.status || 'Active') === 'Active'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {u.status || 'Active'}
                      </span>
                    </td>
                    <td className="py-3.5 text-right space-x-2">
                      <button
                        onClick={() => toggleUserStatus(u.email)}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all active:scale-95 ${
                          (u.status || 'Active') === 'Active'
                            ? 'bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-400'
                            : 'bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 dark:bg-green-950/20 dark:border-green-900/30 dark:text-green-400'
                        }`}
                      >
                        {(u.status || 'Active') === 'Active' ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        onClick={() => deleteUserAccount(u.email)}
                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 dark:bg-red-950/20 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-xl text-[10px] font-bold transition-all active:scale-95"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderDonorDashboard = () => {
    return (
      <div className="space-y-6">
        {/* Giving Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-5 rounded-2xl shadow-sm">
            <h4 className="text-xs font-bold uppercase text-emerald-100 mb-1 font-sans">Total Donations Given</h4>
            <p className="text-2xl font-extrabold">GH₵ {(donorHistory.reduce((a, b) => a + b.amount, 0)).toLocaleString()}</p>
            <p className="text-[10px] text-emerald-100 mt-2">Lifetime financial impact tracker</p>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-indigo-650 text-white p-5 rounded-2xl shadow-sm">
            <h4 className="text-xs font-bold uppercase text-blue-100 mb-1">Active Monthly Pledges</h4>
            <p className="text-2xl font-extrabold">GH₵ {activePledges.filter(p => p.active).reduce((a, b) => a + b.amount, 0)}/mo</p>
            <p className="text-[10px] text-blue-100 mt-2">Supporting sustainable development monthly</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-indigo-650 text-white p-5 rounded-2xl shadow-sm">
            <h4 className="text-xs font-bold uppercase text-purple-100 mb-1 font-sans">Tax Deductibility</h4>
            <p className="text-2xl font-extrabold">100% Secured</p>
            <p className="text-[10px] text-purple-100 mt-2">Secure digital receipts verified</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Simulation Tool */}
          <div className="lg:col-span-3 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-850 shadow-sm p-6 text-left space-y-4">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2 text-sm">
                <Gift className="w-5 h-5 text-green-600" />
                Donor Simulation Panel
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Directly simulate a transaction inside the donations table with local mobile wallets or international systems.
              </p>
            </div>

            {/* Select Amount */}
            <div className="grid grid-cols-4 gap-2">
              {[50, 100, 250, 500].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setDonationAmount(amt)}
                  className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                    donationAmount === amt
                      ? 'bg-green-600 border-green-600 text-white shadow-md shadow-green-200/30'
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  GH₵ {amt}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Select Gateway */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Gateway</label>
                <select
                  value={selectedGateway}
                  onChange={(e) => setSelectedGateway(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50 outline-none focus:bg-white focus:border-green-500"
                >
                  <optgroup label="Ghana Local Wallets">
                    <option value="mtn_momo">MTN Mobile Money</option>
                    <option value="telecel_cash">Telecel Cash</option>
                    <option value="airteltigo_money">AirtelTigo Money</option>
                    <option value="ghanapay">GhanaPay Wallet</option>
                  </optgroup>
                  <optgroup label="International Express">
                    <option value="paypal">PayPal Express</option>
                    <option value="stripe">Stripe Payments</option>
                  </optgroup>
                </select>
              </div>

              {/* Select Frequency */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Type</label>
                <select
                  value={donationFrequency}
                  onChange={(e) => setDonationFrequency(e.target.value as 'One-time' | 'Monthly')}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50 outline-none focus:bg-white focus:border-green-500"
                >
                  <option value="One-time">One-time Donation</option>
                  <option value="Monthly">Monthly Recurring Pledge</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => {
                const gatewayLabels: Record<string, string> = {
                  mtn_momo: 'MTN Mobile Money',
                  telecel_cash: 'Telecel Cash',
                  airteltigo_money: 'AirtelTigo Money',
                  ghanapay: 'GhanaPay Wallet',
                  paypal: 'PayPal Checkout',
                  stripe: 'Stripe Credit Card',
                };

                const newTxn: SimulatedDonation = {
                  id: `TXN-${Math.floor(100 + Math.random() * 900)}`,
                  date: new Date().toISOString().split('T')[0],
                  amount: donationAmount,
                  cause: 'Strategic Livelihood Program',
                  gateway: gatewayLabels[selectedGateway] || 'MTN Mobile Money',
                  frequency: donationFrequency,
                };

                setDonorHistory([newTxn, ...donorHistory]);

                if (donationFrequency === 'Monthly') {
                  setActivePledges([
                    ...activePledges,
                    {
                      id: `PLG-${Math.floor(10 + Math.random() * 89)}`,
                      amount: donationAmount,
                      gateway: gatewayLabels[selectedGateway],
                      active: true,
                      started: new Date().toISOString().split('T')[0],
                    }
                  ]);
                }
              }}
              className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-green-200"
            >
              Process Simulated Payout: GH₵ {donationAmount} ({donationFrequency})
            </button>
          </div>

          {/* Donation History & Receipts */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-855 shadow-sm p-6 text-left flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1.5 flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-gray-400" />
                Donations History & Receipts
              </h3>
              <p className="text-[10px] text-gray-400 mb-4">Click "Get Receipt" to download/print standard invoices.</p>
              
              <div className="space-y-2.5 max-h-64 overflow-y-auto">
                {donorHistory.map((h) => (
                  <div key={h.id} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-855 truncate max-w-[120px]">{h.cause}</p>
                      <span className="text-[9px] text-gray-450 block mt-0.5">{h.date} · {h.gateway}</span>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="text-xs font-extrabold text-green-600">+GH₵ {h.amount}</span>
                      <button
                        onClick={() => setSelectedReceipt(h)}
                        className="px-2.5 py-1 bg-white hover:bg-gray-100 border border-gray-200 rounded text-[9px] font-bold text-gray-600 flex items-center gap-1 transition-colors"
                      >
                        <FileCheck className="w-3 h-3 text-green-600" />
                        Get Receipt
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Recurring Pledges Panel */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-855 shadow-sm p-6 text-left">
          <h3 className="font-bold text-gray-900 dark:text-white mb-1.5 flex items-center gap-2 text-sm">
            <CalendarRange className="w-5 h-5 text-blue-600" />
            Active Monthly Donations & Pledges
          </h3>
          <p className="text-xs text-gray-400 mb-5 font-medium">These donations authorize automatic recurring payouts using registered mobile money / card methods.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activePledges.map((plg) => (
              <div key={plg.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-200/40 flex flex-col justify-between gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">{plg.id}</span>
                    <h4 className="font-extrabold text-base text-gray-855 mt-0.5">GH₵ {plg.amount} / mo</h4>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${plg.active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                    {plg.active ? 'Active' : 'Cancelled'}
                  </span>
                </div>
                <div className="text-[10px] text-gray-455">
                  <p>Authorized Gateway: <span className="font-semibold">{plg.gateway}</span></p>
                  <p>Pledge Initiated: {plg.started}</p>
                </div>
                <button
                  onClick={() => {
                    setActivePledges(activePledges.map(p => p.id === plg.id ? { ...p, active: !p.active } : p));
                  }}
                  className={`w-full py-2 rounded-xl text-[10px] font-bold transition-all ${
                    plg.active
                      ? 'bg-red-100 hover:bg-red-200 text-red-600'
                      : 'bg-green-100 hover:bg-green-200 text-green-700'
                  }`}
                >
                  {plg.active ? 'Cancel Monthly Pledge' : 'Reactivate Pledged Amount'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderMemberDashboard = () => {
    return (
      <div className="space-y-6 animate-fade-in-up">
        {/* Member Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-5 rounded-2xl shadow-sm">
            <h4 className="text-xs font-bold uppercase text-emerald-100 mb-1">Member Status</h4>
            <p className="text-2xl font-extrabold">Verified Active</p>
            <p className="text-[10px] text-emerald-100 mt-2">Global membership ID #9901</p>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-5 rounded-2xl shadow-sm">
            <h4 className="text-xs font-bold uppercase text-blue-100 mb-1">Community Events</h4>
            <p className="text-2xl font-extrabold">3 Registered</p>
            <p className="text-[10px] text-blue-100 mt-2">Next community meeting in 2 days</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white p-5 rounded-2xl shadow-sm">
            <h4 className="text-xs font-bold uppercase text-purple-100 mb-1">Operations Board</h4>
            <p className="text-2xl font-extrabold">1 New Post</p>
            <p className="text-[10px] text-purple-100 mt-2">Check announcements tab</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Live Community Chat */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between text-left">
            <div>
              <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2 text-sm">
                <Users className="w-5 h-5 text-indigo-600" />
                Global Member Room
              </h3>
              <p className="text-xs text-gray-400 mb-4 font-medium">Live community chat board for active members.</p>
              
              <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                {membersChat.map((chat, idx) => (
                  <div key={idx} className="p-2.5 bg-gray-50 rounded-xl text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-gray-855">{chat.user}</span>
                      <span className="text-[10px] text-gray-400">{chat.time}</span>
                    </div>
                    <p className="text-gray-600">{chat.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Say something..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs outline-none focus:bg-white focus:border-green-500"
              />
              <button
                onClick={() => {
                  if (!chatInput.trim()) return;
                  setMembersChat([...membersChat, { user: user?.username || 'Member', text: chatInput, time: 'Just now' }]);
                  setChatInput('');
                }}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Send
              </button>
            </div>
          </div>

          {/* Perks card */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-left">
            <h3 className="font-bold text-gray-900 mb-4">Member Perks</h3>
            <ul className="space-y-3 text-xs text-gray-600">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>Access to exclusive research briefs on clean water.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>Discount codes for local partner sustainability merchandise.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>Monthly interactive Q&A sessions with operations heads.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  const renderActiveDashboard = () => {
    if (!user) return null;
    switch (user.role) {
      case 'Administrator':
        return renderAdminDashboard();
      case 'Donor':
        return renderDonorDashboard();
      case 'Member':
        return renderMemberDashboard();
      default:
        return renderMemberDashboard();
    }
  };

  return (
    <div className="space-y-8 fade-in relative">
      {/* Automated Receipt Generator Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-gray-200 shadow-2xl text-left relative">
            <button
              onClick={() => setSelectedReceipt(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>

            <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-gray-100">
              <Building2 className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="font-bold text-sm text-gray-900">Official Payout Receipt</h3>
                <p className="text-[10px] text-gray-400">Heal The World Foundation Ghana</p>
              </div>
            </div>

            <div className="space-y-3 text-xs mb-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <div className="flex justify-between">
                <span className="text-gray-455">Receipt ID:</span>
                <span className="font-bold text-gray-855 font-mono">{selectedReceipt.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-455">Date Processed:</span>
                <span className="font-bold text-gray-855">{selectedReceipt.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-455">Strategic Cause:</span>
                <span className="font-bold text-gray-855 text-right max-w-[200px] truncate">{selectedReceipt.cause}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-455">Payout Method:</span>
                <span className="font-bold text-gray-855">{selectedReceipt.gateway}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-455">Authorizing Wallet:</span>
                <span className="font-bold text-gray-855">0554403248</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200/80 text-sm">
                <span className="font-bold text-gray-900">Total Given:</span>
                <span className="font-extrabold text-green-600">GH₵ {selectedReceipt.amount.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => { window.print(); }}
                className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                <Printer className="w-4 h-4" /> Print Receipt
              </button>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold rounded-xl transition-all"
              >
                Close Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Banner / Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 p-6 sm:p-8 lg:p-10 text-white shadow-2xl shadow-green-300/30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 text-left">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
              <span className="text-green-100 text-sm font-semibold uppercase tracking-wider">
                {user ? `${user.role} Portal Active` : 'Guest Portal Mode'}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-2">
              {user ? `Hello, ${user.username}!` : 'Heal The World Foundation'}
            </h1>
            <p className="text-green-100 text-base sm:text-lg max-w-xl leading-relaxed">
              {user
                ? `You are securely logged in using password hashing and Flask-Login sessions. Explore your custom ${user.role} tools below.`
                : 'Your centralized portal for managing foundation operations, personal details, and community outreach.'}
            </p>
          </div>

          {/* Quick User Seeder Toggle when not logged in */}
          {!user && (
            <div className="bg-white/15 backdrop-blur-md p-4 rounded-2xl max-w-xs border border-white/10">
              <h4 className="font-bold text-xs text-white mb-2 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                Select Demo Account
              </h4>
              <p className="text-[10px] text-green-100 leading-relaxed mb-3">
                Log in via the Account page or switch to any role to view distinct dashboard functionalities.
              </p>
              <button
                onClick={() => onNavigate('login')}
                className="w-full py-2 bg-white hover:bg-green-50 text-green-800 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1"
              >
                Go to Account Setup
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Role-Specific Dynamic Dashboard Block */}
      {user ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-green-600" />
              Authorized {user.role} Panel
            </h2>
            <span className="text-[10px] font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded uppercase tracking-wider">
              Role Verified
            </span>
          </div>
          {renderActiveDashboard()}
        </div>
      ) : (
        <div className="bg-white border border-gray-200/60 rounded-2xl p-8 text-center max-w-xl mx-auto">
          <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">Authorization Required</h3>
          <p className="text-sm text-gray-500 leading-relaxed mb-6">
            Please register a secure account or choose from one of our pre-seeded demo accounts to activate your role-specific member, donor, volunteer, or admin dashboard portal.
          </p>
          <button
            onClick={() => onNavigate('login')}
            className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-green-200"
          >
            Configure Account Authorization
          </button>
        </div>
      )}

      {/* Dynamic Tables for extended database storage: Goals, Images */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left font-sans">
        {/* Column 1: Foundation Goals */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-600" />
              Foundation Goals Table
            </h3>
            <p className="text-xs text-gray-455 mb-4 font-medium">Goals trackable by all community members.</p>
            
            <div className="space-y-4 mb-6">
              {goals.map((g) => (
                <div key={g.id} className="p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-gray-850">{g.title}</span>
                    <span className="text-[10px] text-emerald-655 font-bold">{g.category}</span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mb-1">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-1000"
                      style={{ width: `${Math.min(100, (g.currentValue / g.targetValue) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>GH₵ {g.currentValue.toLocaleString()} / GH₵ {g.targetValue.toLocaleString()}</span>
                    <span>Deadline: {g.deadline}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleAddGoal} className="space-y-3 pt-3 border-t border-gray-100">
            <span className="text-[10px] font-bold text-gray-400 uppercase block">Add Seed Goal</span>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Goal Title"
                value={newGoal.title}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                className="px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs outline-none focus:bg-white focus:border-green-500"
                required
              />
              <input
                type="number"
                placeholder="Target (GH₵)"
                value={newGoal.targetValue}
                onChange={(e) => setNewGoal({ ...newGoal, targetValue: parseFloat(e.target.value) || 0 })}
                className="px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs outline-none focus:bg-white focus:border-green-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Goal Table Row
            </button>
          </form>
        </div>

        {/* Column 2: Uploaded Images */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
              <FileImage className="w-5 h-5 text-blue-600" />
              Uploaded Images (Admin Only)
            </h3>
            <p className="text-xs text-gray-455 mb-4 font-medium">SQLite uploaded_images table registry.</p>
            
            <div className="space-y-3 mb-6 max-h-48 overflow-y-auto">
              {images.map((img) => (
                <div key={img.id} className="p-3 bg-gray-50 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-gray-850 truncate max-w-[150px]">{img.fileName}</p>
                    <p className="text-[9px] text-gray-400 mt-0.5">{img.filePath}</p>
                  </div>
                  <div className="text-right font-medium">
                    <span className="text-[10px] text-blue-600 font-bold font-mono">{img.fileSizeKb} KB</span>
                    <p className="text-[9px] text-gray-455 mt-0.5 font-sans">By Admin</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            {uploadMessage && (
              <div className={`p-3 rounded-xl text-xs mb-3 flex items-center gap-1.5 ${uploadMessage.type === 'success' ? 'bg-green-55 border border-green-200 text-green-800' : 'bg-red-55 border border-red-200 text-red-800'}`}>
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span className="leading-tight">{uploadMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleImageUploadSimulate} className="space-y-3 pt-3 border-t border-gray-100">
              <span className="text-[10px] font-bold text-gray-400 uppercase block">Simulate Secure Upload</span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="filename.jpg"
                  value={imageNameInput}
                  onChange={(e) => setImageNameInput(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs outline-none focus:bg-white focus:border-green-500"
                  required
                />
                <input
                  type="number"
                  placeholder="Size (KB)"
                  value={imageSizeInput}
                  onChange={(e) => setImageSizeInput(parseInt(e.target.value) || 0)}
                  className="px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs outline-none focus:bg-white focus:border-green-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1"
              >
                <Upload className="w-3.5 h-3.5" /> Upload Image File
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Portal Quick Actions Grid */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900 font-sans">Portal Module Navigation</h2>
          <span className="text-xs text-gray-400 font-medium">Quick access</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {portalCards.map((card) => (
            <button
              key={card.id}
              onClick={() => onNavigate(card.id)}
              className={`group relative bg-white rounded-2xl p-6 border ${card.borderColor} ${card.hoverBg} shadow-sm hover:shadow-lg transition-all duration-300 text-left overflow-hidden`}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-transparent to-black/[0.02] rounded-bl-full" />
              <div className={`w-12 h-12 rounded-xl ${card.bgColor} flex items-center justify-center mb-4 ${card.color} group-hover:scale-110 transition-transform duration-300`}>
                {card.icon}
              </div>
              <h3 className="font-bold text-gray-900 mb-1 group-hover:text-green-700 transition-colors">
                {card.title}
              </h3>
              <p className="text-sm text-gray-500 mb-4 leading-relaxed">{card.description}</p>
              <div className="flex items-center gap-1 text-sm font-medium text-green-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span>Open module</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Live Developer & Flask Console Console DevTools */}
      <div className="bg-gray-900 text-white rounded-3xl border border-gray-800 shadow-2xl overflow-hidden">
        <div className="px-6 py-5 bg-gray-950 border-b border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-950 border border-green-500/30 flex items-center justify-center">
              <Terminal className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-wide">Simulated Python Flask Server Dashboard</h3>
              <p className="text-[10px] text-gray-400 font-medium">Flask-Login, Werkzeug Hashing & SQLite Engine</p>
            </div>
          </div>
          <div className="flex bg-gray-900 border border-gray-800 rounded-xl p-1 text-xs">
            <button
              onClick={() => setActiveDevTab('logs')}
              className={`px-4 py-1.5 rounded-lg font-bold transition-all ${activeDevTab === 'logs' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
            >
              Flask Server Console
            </button>
            <button
              onClick={() => setActiveDevTab('sqlite')}
              className={`px-4 py-1.5 rounded-lg font-bold transition-all ${activeDevTab === 'sqlite' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
            >
              SQLite DB Explorer
            </button>
            <button
              onClick={() => setActiveDevTab('syntax')}
              className={`px-4 py-1.5 rounded-lg font-bold transition-all ${activeDevTab === 'syntax' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
            >
              Schema Syntax (SQLite / MySQL / PostgreSQL)
            </button>
          </div>
        </div>

        {activeDevTab === 'logs' && (
          <div className="p-5 font-mono text-xs space-y-2 max-h-64 overflow-y-auto bg-gray-950 text-left">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-900">
              <span className="text-[10px] text-green-400 tracking-wider font-bold uppercase">Console Server Logs</span>
              <button
                onClick={clearApiLogs}
                className="text-gray-500 hover:text-red-400 transition-colors text-[10px] flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear Logs
              </button>
            </div>
            {logs.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Waiting for network events... Try register/login operations.</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="p-2.5 bg-gray-900/60 rounded-lg border border-gray-900 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        log.status >= 400 ? 'bg-red-950 text-red-400 border border-red-500/20' : 'bg-green-950 text-green-400 border border-green-500/20'
                      }`}>
                        {log.method}
                      </span>
                      <span className="text-gray-300 font-bold text-[10px]">{log.endpoint}</span>
                      <span className="text-gray-500 text-[9px]">{log.timestamp}</span>
                    </div>
                    <span className={`font-bold ${log.status >= 400 ? 'text-red-400' : 'text-green-400'}`}>
                      {log.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">{log.message}</p>
                  {log.payload && (
                    <details className="mt-1">
                      <summary className="text-[9px] text-gray-500 cursor-pointer hover:text-gray-300">View payload JSON</summary>
                      <pre className="mt-1.5 p-2 bg-gray-955 rounded text-[10px] text-green-300/80 overflow-x-auto max-w-full">{JSON.stringify(JSON.parse(log.payload), null, 2)}</pre>
                    </details>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeDevTab === 'sqlite' && (
          <div className="p-5 font-mono text-xs space-y-6 bg-gray-955 text-left">
            {/* Table users */}
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <DbIcon className="w-4 h-4 text-green-400" />
                <span className="font-bold text-gray-300 text-xs">Table: users</span>
              </div>
              <div className="overflow-x-auto border border-gray-850 rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-900 text-gray-455 text-[10px] uppercase">
                      <th className="p-2.5">email (PK)</th>
                      <th className="p-2.5">username</th>
                      <th className="p-2.5">password_hash (Werkzeug)</th>
                      <th className="p-2.5">role</th>
                      <th className="p-2.5">status</th>
                      <th className="p-2.5">expires_at (Session)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-900 text-[11px] text-gray-300">
                    {dbUsers.map((user) => (
                      <tr key={user.email} className="hover:bg-gray-900/40">
                        <td className="p-2.5 text-green-400">{user.email}</td>
                        <td className="p-2.5">{user.username}</td>
                        <td className="p-2.5 text-gray-500 font-mono max-w-[200px] truncate">{user.passwordHash}</td>
                        <td className="p-2.5 font-bold text-yellow-400">{user.role}</td>
                        <td className="p-2.5 font-bold text-yellow-400">{user.status || 'Active'}</td>
                        <td className="p-2.5 text-gray-400 font-mono">{user.expiresAt ? new Date(user.expiresAt).toLocaleTimeString() : 'None'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table foundation_goals */}
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <DbIcon className="w-4 h-4 text-green-400" />
                <span className="font-bold text-gray-300 text-xs">Table: foundation_goals</span>
              </div>
              <div className="overflow-x-auto border border-gray-850 rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-900 text-gray-455 text-[10px] uppercase">
                      <th className="p-2.5">id</th>
                      <th className="p-2.5">goal_title</th>
                      <th className="p-2.5">target_value</th>
                      <th className="p-2.5">current_value</th>
                      <th className="p-2.5">category</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-900 text-[11px] text-gray-300">
                    {goals.map((g) => (
                      <tr key={g.id} className="hover:bg-gray-900/40">
                        <td className="p-2.5 text-green-400">{g.id}</td>
                        <td className="p-2.5">{g.title}</td>
                        <td className="p-2.5">GH₵ {g.targetValue.toLocaleString()}</td>
                        <td className="p-2.5">GH₵ {g.currentValue.toLocaleString()}</td>
                        <td className="p-2.5 text-yellow-400">{g.category}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table uploaded_images */}
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <DbIcon className="w-4 h-4 text-green-400" />
                <span className="font-bold text-gray-300 text-xs">Table: uploaded_images</span>
              </div>
              <div className="overflow-x-auto border border-gray-855 rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-900 text-gray-455 text-[10px] uppercase">
                      <th className="p-2.5">id</th>
                      <th className="p-2.5">file_name</th>
                      <th className="p-2.5">file_path</th>
                      <th className="p-2.5">file_size</th>
                      <th className="p-2.5">uploaded_by</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-900 text-[11px] text-gray-300">
                    {images.map((img) => (
                      <tr key={img.id} className="hover:bg-gray-900/40">
                        <td className="p-2.5 text-green-400">{img.id}</td>
                        <td className="p-2.5">{img.fileName}</td>
                        <td className="p-2.5 text-gray-455 font-sans font-medium">{img.filePath}</td>
                        <td className="p-2.5 font-mono font-bold text-blue-400">{img.fileSizeKb} KB</td>
                        <td className="p-2.5 text-yellow-400">{img.uploadedBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeDevTab === 'syntax' && (
          <div className="p-5 font-mono text-xs bg-gray-955 text-left space-y-4">
            <div className="flex bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit text-[10px] sm:text-xs">
              <button
                onClick={() => setActiveSchemaSyntax('sqlite')}
                className={`px-4 py-1.5 rounded-lg font-bold transition-all ${activeSchemaSyntax === 'sqlite' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
              >
                SQLite (Beginner)
              </button>
              <button
                onClick={() => setActiveSchemaSyntax('mysql')}
                className={`px-4 py-1.5 rounded-lg font-bold transition-all ${activeSchemaSyntax === 'mysql' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
              >
                MySQL (Recommended)
              </button>
              <button
                onClick={() => setActiveSchemaSyntax('postgres')}
                className={`px-4 py-1.5 rounded-lg font-bold transition-all ${activeSchemaSyntax === 'postgres' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
              >
                PostgreSQL (Advanced)
              </button>
            </div>

            {activeSchemaSyntax === 'sqlite' && (
              <div className="space-y-4">
                <p className="text-xs text-gray-400 font-sans leading-relaxed font-medium">
                  SQLite is extremely easy to configure locally since it compiles as a lightweight, serverless, zero-configuration single file on your local workspace. Highly recommended for prototyping.
                </p>
                <pre className="p-4 bg-gray-900 rounded-xl text-green-300/80 overflow-x-auto max-h-80 text-[10px]">
{`-- SQLite Schema for Heal The World Foundation

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'Member',
    amount_owed REAL DEFAULT 0.0
);

CREATE TABLE IF NOT EXISTS donations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'GHS',
    donated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS announcements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author TEXT
);

CREATE TABLE IF NOT EXISTS foundation_goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    goal_title TEXT NOT NULL,
    target_value REAL,
    current_value REAL DEFAULT 0.0
);

CREATE TABLE IF NOT EXISTS uploaded_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    uploaded_by_email TEXT NOT NULL
);`}
                </pre>
              </div>
            )}

            {activeSchemaSyntax === 'mysql' && (
              <div className="space-y-4">
                <p className="text-xs text-gray-400 font-sans leading-relaxed font-medium">
                  MySQL is our **recommended database option** for deployment. Highly compatible with AWS RDS, fully multi-threaded, and features stable transactional capabilities using the InnoDb database engine.
                </p>
                <pre className="p-4 bg-gray-900 rounded-xl text-green-300/80 overflow-x-auto max-h-80 text-[10px]">
{`-- MySQL Schema (Recommended Option)
CREATE DATABASE IF NOT EXISTS heal_the_world_db;
USE heal_the_world_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('Administrator', 'Donor', 'Volunteer', 'Member', 'Executive') DEFAULT 'Member',
    amount_owed DECIMAL(10, 2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS donations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'GHS',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS uploaded_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    uploaded_by_email VARCHAR(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`}
                </pre>
              </div>
            )}

            {activeSchemaSyntax === 'postgres' && (
              <div className="space-y-4">
                <p className="text-xs text-gray-400 font-sans leading-relaxed font-medium">
                  PostgreSQL is our **advanced database option**, suitable for rich relational designs, specialized indices, native JSON data type querying, and complex triggers.
                </p>
                <pre className="p-4 bg-gray-900 rounded-xl text-green-300/80 overflow-x-auto max-h-80 text-[10px]">
{`-- PostgreSQL Schema (Advanced Option)
CREATE TYPE user_role AS ENUM ('Administrator', 'Donor', 'Volunteer', 'Member', 'Executive');

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'Member',
    amount_owed NUMERIC(12, 2) DEFAULT 0.00
);

CREATE TABLE IF NOT EXISTS donations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'GHS'
);

CREATE TABLE IF NOT EXISTS uploaded_images (
    id SERIAL PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    uploaded_by_email VARCHAR(150) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
