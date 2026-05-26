import { useState } from 'react';
import { LayoutDashboard, ChevronRight, Mail, Bell, Send, CheckCircle, Clock, Calendar, AlertCircle, MessageSquare, Zap, FileText, Smartphone, ShieldAlert } from 'lucide-react';
import { getActiveUser, isCurrentUserAdmin } from '../../database/db';

export default function NotificationsPage() {
  const currentUser = getActiveUser();
  const isAdmin = isCurrentUserAdmin();
  const [activeTab, setActiveTab] = useState<'send' | 'history' | 'templates'>('send');
  const [emailForm, setEmailForm] = useState({ to: '', subject: '', template: 'welcome', message: '', type: 'email' as 'email' | 'sms' | 'push' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const emailHistory = [
    { id: 'E-001', to: 'volunteer@healtheworld.org', subject: 'Winter Drive Orientation', type: 'Event Reminder', status: 'Delivered', date: '2026-02-24' },
    { id: 'E-002', to: 'donor@healtheworld.org', subject: 'Tax Receipt GH₵ 250.00', type: 'Donation Receipt', status: 'Delivered', date: '2026-02-22' },
    { id: 'E-003', to: 'admin@healtheworld.org', subject: 'Emergency: Ghana Flood Response', type: 'Emergency Notice', status: 'Opened', date: '2026-02-20' },
    { id: 'E-004', to: 'newmember@healtheworld.org', subject: 'Welcome to Heal The World!', type: 'Welcome Email', status: 'Delivered', date: '2026-02-18' },
    { id: 'E-005', to: 'volunteer@healtheworld.org', subject: 'Shift Confirmed: Feb 28', type: 'Volunteer Notice', status: 'Delivered', date: '2026-02-17' },
  ];

  const templates = [
    { id: 'welcome', name: 'Welcome Email', desc: 'Sent when a new user registers. Includes portal setup instructions.', icon: <Mail className="w-5 h-5" />, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
    { id: 'receipt', name: 'Donation Receipt', desc: 'Automated receipt generated after every successful donation.', icon: <FileText className="w-5 h-5" />, color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
    { id: 'volunteer', name: 'Volunteer Notice', desc: 'Shift reminders, confirmation updates, and campaign changes.', icon: <Smartphone className="w-5 h-5" />, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
    { id: 'event', name: 'Event Reminder', desc: 'Sends 48h and 24h before scheduled events.', icon: <Calendar className="w-5 h-5" />, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
    { id: 'emergency', name: 'Emergency Alert', desc: 'High-priority broadcast to all registered contacts.', icon: <AlertCircle className="w-5 h-5" />, color: 'text-red-600 bg-red-50 dark:bg-red-900/20' },
  ];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      setTimeout(() => setSent(false), 3000);
      setEmailForm({ to: '', subject: '', template: 'welcome', message: '', type: 'email' });
    }, 1500);
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900/30 outline-none transition-all text-gray-800 dark:text-white text-sm";
  const labelClass = "block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 transition-colors";

  return (
    <div className="max-w-4xl fade-in animate-fade-in-up">
      <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500 mb-6 transition-colors">
        <LayoutDashboard className="w-4 h-4" />
        <span>Dashboard</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-700 dark:text-gray-300 font-medium transition-colors">Email & Notifications</span>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 mb-6 transition-colors duration-300 animate-scale-in">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-blue-900/30">
            <Bell className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">Email & Notification System</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5 transition-colors">Manage welcome emails, donation receipts, volunteer notices & event reminders (Flask-Mail / SendGrid)</p>
          </div>
        </div>
      </div>

      {!isAdmin && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-left">
          <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-800">Read-only mode</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Only you as the Administrator can send or manage platform-wide emails and notices. Current session: {currentUser?.role || 'Guest'}.
            </p>
          </div>
        </div>
      )}

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Emails Sent Today', value: '47', icon: <Send className="w-5 h-5 text-green-600" />, sub: '+12 from yesterday' },
          { label: 'Delivery Rate', value: '98.2%', icon: <CheckCircle className="w-5 h-5 text-blue-600" />, sub: 'Excellent status' },
          { label: 'Queue Pending', value: '3', icon: <Clock className="w-5 h-5 text-amber-600" />, sub: 'Processing...' },
        ].map((stat, idx) => (
          <div key={idx} className={`bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 transition-all duration-300 animate-stagger-card delay-${idx + 1}`}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center transition-colors">
                {stat.icon}
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-gray-900 dark:text-white transition-colors">{stat.value}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors">{stat.label}</p>
              </div>
            </div>
            <p className="text-[10px] text-green-600 dark:text-green-400 font-medium">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-1.5 mb-6 shadow-sm transition-colors">
        {[
          { id: 'send', label: 'Compose & Send', icon: <Send className="w-4 h-4" /> },
          { id: 'history', label: 'Email History', icon: <Clock className="w-4 h-4" /> },
          { id: 'templates', label: 'Templates', icon: <MessageSquare className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as never)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id ? 'bg-green-600 text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'send' && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 sm:p-8 transition-colors duration-300 animate-scale-in">
          <h3 className="font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2 transition-colors">
            <Zap className="w-5 h-5 text-yellow-500" />
            Compose Notification
          </h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-6 transition-colors">Send emails via Flask-Mail (local dev) or SendGrid (production).</p>

          {sent && (
            <div className="flex items-center gap-2 p-4 mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-800 dark:text-green-200 text-sm animate-fade-in-up">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              Email queued successfully! Delivery status: Pending via SendGrid API.
            </div>
          )}

          <form onSubmit={handleSend} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Recipient Email</label>
                <input type="email" value={emailForm.to} onChange={(e) => setEmailForm({ ...emailForm, to: e.target.value })} placeholder="user@example.com" className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>Delivery Channel</label>
                <select value={emailForm.type} onChange={(e) => setEmailForm({ ...emailForm, type: e.target.value as never })} className={inputClass}>
                  <option value="email">📧 Email (Flask-Mail / SendGrid)</option>
                  <option value="sms">📱 SMS (Twilio)</option>
                  <option value="push">🔔 Push Notification</option>
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass}>Template</label>
              <select value={emailForm.template} onChange={(e) => setEmailForm({ ...emailForm, template: e.target.value })} className={inputClass}>
                <option value="welcome">Welcome Email</option>
                <option value="receipt">Donation Receipt</option>
                <option value="volunteer">Volunteer Notice</option>
                <option value="event">Event Reminder</option>
                <option value="emergency">Emergency Alert</option>
                <option value="custom">Custom Message</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Subject Line</label>
              <input value={emailForm.subject} onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })} placeholder="Email subject..." className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Message Body</label>
              <textarea value={emailForm.message} onChange={(e) => setEmailForm({ ...emailForm, message: e.target.value })} placeholder="Write your notification..." rows={6} className={`${inputClass} resize-none`} required />
            </div>
            <button type="submit" disabled={sending || !isAdmin} className={`w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${(sending || !isAdmin) ? 'bg-green-400 dark:bg-green-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200 dark:shadow-green-900/30'}`}>
              {sending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending via SendGrid...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Queue for Delivery
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 transition-colors duration-300 animate-scale-in">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4 transition-colors">Recent Email Queue</h3>
          <div className="space-y-3">
            {emailHistory.map((email) => (
              <div key={email.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-800 dark:text-white truncate transition-colors">{email.subject}</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 transition-colors">{email.to} · {email.date}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">{email.type}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${email.status === 'Delivered' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' : email.status === 'Opened' ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                    {email.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-scale-in">
          {templates.map((t, idx) => (
            <div key={idx} className={`bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 transition-all duration-300 card-hover-lift`}>
              <div className={`w-12 h-12 rounded-xl ${t.color} flex items-center justify-center mb-4 transition-colors`}>
                {t.icon}
              </div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-1 transition-colors">{t.name}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed transition-colors">{t.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
