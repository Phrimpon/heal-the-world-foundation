import { useEffect, useState } from 'react';
import {
  LayoutDashboard, ChevronRight, Users, ShieldAlert,
  Monitor, Globe, Clock, LogIn, LogOut, Trash2,
  Smartphone, Search, Download, Activity, Shield,
} from 'lucide-react';
import { getLoginRecords, clearLoginRecords, getActiveUser, isCurrentUserAdmin } from '../../database/db';
import { LoginRecord } from '../../types';

export default function LoginRecordsPage() {
  const user = getActiveUser();
  const isAdmin = isCurrentUserAdmin();

  const [records, setRecords] = useState<LoginRecord[]>(getLoginRecords());
  const [filter, setFilter] = useState<'all' | 'Active' | 'Logged Out'>('all');
  const [search, setSearch] = useState('');
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setRecords(getLoginRecords());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleClear = () => {
    clearLoginRecords();
    setRecords([]);
    setCleared(true);
    setTimeout(() => setCleared(false), 3000);
  };

  const filtered = records.filter(r => {
    const matchStatus = filter === 'all' || r.status === filter;
    const matchSearch = search.trim() === '' || (
      r.email.toLowerCase().includes(search.toLowerCase()) ||
      r.username.toLowerCase().includes(search.toLowerCase()) ||
      r.role.toLowerCase().includes(search.toLowerCase()) ||
      r.device.toLowerCase().includes(search.toLowerCase()) ||
      r.browser.toLowerCase().includes(search.toLowerCase()) ||
      r.os.toLowerCase().includes(search.toLowerCase())
    );
    return matchStatus && matchSearch;
  });

  const downloadCSV = () => {
    const headers = ['Session ID', 'Username', 'Email', 'Role', 'Login Time', 'Logout Time', 'Duration', 'Device', 'OS', 'Browser', 'IP Address', 'Status'];
    const rows = records.map(r => [
      r.id, r.username, r.email, r.role,
      new Date(r.loginTime).toLocaleString(),
      r.logoutTime ? new Date(r.logoutTime).toLocaleString() : 'Active',
      r.sessionDuration || 'Active',
      r.device, r.os, r.browser, r.ipAddress, r.status,
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `htw_login_sessions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const roleBadge: Record<string, string> = {
    Administrator: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
    Donor:         'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
    Volunteer:     'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
    Member:        'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    Executive:     'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
  };

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto mt-20 text-center">
        <ShieldAlert className="w-14 h-14 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Only the Administrator can view the login sessions database. Current session: {user?.role || 'Guest'}.
        </p>
      </div>
    );
  }

  const activeSessions = records.filter(r => r.status === 'Active').length;
  const totalLogins = records.length;
  const uniqueUsers = new Set(records.map(r => r.email)).size;

  return (
    <div className="max-w-7xl fade-in animate-fade-in-up">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500 mb-6 transition-colors">
        <LayoutDashboard className="w-4 h-4" />
        <span>Dashboard</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-700 dark:text-gray-300 font-medium">Login Sessions Database</span>
      </div>

      {/* Page Header */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 mb-6 transition-colors duration-300 animate-scale-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">Login Sessions Database</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5 transition-colors">
                Real-time record of every login event — device, browser, OS, IP, and session duration.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={downloadCSV}
              disabled={records.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
            <button
              onClick={handleClear}
              disabled={records.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/50 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {cleared ? 'Cleared!' : 'Clear All'}
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 flex items-center gap-4 transition-colors">
          <div className="w-11 h-11 rounded-xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
            <Activity className="w-5 h-5 text-green-600 dark:text-green-400 animate-pulse" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{activeSessions}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Active Right Now</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 flex items-center gap-4 transition-colors">
          <div className="w-11 h-11 rounded-xl bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center">
            <LogIn className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{totalLogins}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Login Events</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 flex items-center gap-4 transition-colors">
          <div className="w-11 h-11 rounded-xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{uniqueUsers}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Unique Users</p>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 mb-6 flex flex-col sm:flex-row items-center gap-3 transition-colors">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, role, device, browser..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all"
          />
        </div>
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 text-xs font-bold gap-1 flex-shrink-0">
          {(['all', 'Active', 'Logged Out'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg transition-all capitalize ${filter === f ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              {f === 'all' ? 'All Sessions' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden transition-colors">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500">
            <Shield className="w-12 h-12 mb-3 text-gray-300 dark:text-gray-600" />
            <p className="font-bold text-sm">
              {records.length === 0
                ? 'No login sessions recorded yet.'
                : 'No sessions match your current filter.'}
            </p>
            <p className="text-xs mt-1">Sessions are recorded automatically on every login.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-850 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  <th className="px-5 py-3.5">Session ID</th>
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Device & Environment</th>
                  <th className="px-5 py-3.5">Login Time</th>
                  <th className="px-5 py-3.5">Duration</th>
                  <th className="px-5 py-3.5">IP Address</th>
                  <th className="px-5 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {filtered.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="px-5 py-4 font-mono text-[10px] text-indigo-600 dark:text-indigo-400">
                      {r.id}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">{r.username}</p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500">{r.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${roleBadge[r.role] || 'bg-gray-100 text-gray-600'}`}>
                        {r.role}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-0.5 text-[11px] text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          {r.device === 'Mobile / Tablet'
                            ? <Smartphone className="w-3 h-3" />
                            : <Monitor className="w-3 h-3" />}
                          {r.device}
                        </span>
                        <span className="flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          {r.browser} · {r.os}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      <span className="flex items-center gap-1">
                        <LogIn className="w-3 h-3 text-green-500" />
                        {new Date(r.loginTime).toLocaleString()}
                      </span>
                      {r.logoutTime && (
                        <span className="flex items-center gap-1 mt-0.5">
                          <LogOut className="w-3 h-3 text-red-400" />
                          {new Date(r.logoutTime).toLocaleString()}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs font-mono text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        {r.sessionDuration || (
                          <span className="text-green-500 dark:text-green-400 font-bold animate-pulse">Live</span>
                        )}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs font-mono text-gray-500 dark:text-gray-400">
                      {r.ipAddress}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        r.status === 'Active'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                        {r.status === 'Active' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        )}
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between text-[11px] text-gray-400 dark:text-gray-500 bg-gray-50/50 dark:bg-gray-900/50">
            <span>Showing {filtered.length} of {records.length} session records</span>
            <span>Auto-refreshes every 2 seconds</span>
          </div>
        )}
      </div>
    </div>
  );
}
