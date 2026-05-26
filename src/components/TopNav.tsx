import { useState, useEffect } from 'react';
import { NavItem } from '../types';
import { Heart, Bell, Search, User, Menu, ChevronDown, Sun, Moon, X, LogIn, UserPlus, CheckCheck } from 'lucide-react';
import { getActiveUser, isCurrentUserAdmin, getAdminNotifications, getUnreadNotificationCount, markNotificationRead, markAllNotificationsRead } from '../database/db';

interface TopNavProps {
  activeItem: NavItem;
  onMenuToggle: () => void;
  isLoggedIn: boolean;
  isDark: boolean;
  onToggleTheme: () => void;
}

const pageTitles: Record<NavItem, string> = {
  home: 'Home',
  dashboard: 'Dashboard',
  'personal-info': 'Personal Information',
  'member-balance': 'Member Balance & Dues',
  'aim-of-foundation': 'Aim of the Foundation',
  announcement: 'News & Announcements',
  notifications: 'Email & Notifications',
  'cloud-storage': 'Cloud Storage',
  deploy: 'Deployment Status',
  'login-records': 'Login Sessions',
  settings: 'Settings',
  login: 'Account',
};

export default function TopNav({ activeItem, onMenuToggle, isLoggedIn, isDark, onToggleTheme }: TopNavProps) {
  const user = getActiveUser();
  const isAdmin = isCurrentUserAdmin();
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState(getAdminNotifications());

  useEffect(() => {
    const interval = setInterval(() => {
      setUnreadCount(getUnreadNotificationCount());
      setNotifications(getAdminNotifications());
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/60 dark:border-gray-800/60 sticky top-0 z-20 transition-colors duration-300">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="lg:hidden w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-750 flex items-center justify-center transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-200/50 dark:shadow-green-900/30">
              <Heart className="w-5 h-5 text-white" fill="white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold text-gray-900 dark:text-white leading-none transition-colors">
                Heal The World Foundation
              </h1>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 font-medium transition-colors">
                {pageTitles[activeItem]}
              </p>
            </div>
          </div>
        </div>

        {/* Center search */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search portal..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100/80 dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-700/60 rounded-xl text-sm text-gray-700 dark:text-gray-300 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:bg-white dark:focus:bg-gray-800 focus:border-green-400 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900/30 outline-none transition-all duration-200"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="relative w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-750 flex items-center justify-center transition-all duration-300 hover:scale-105"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-yellow-400 animate-spin-loader" style={{ animationDuration: '3s' }} />
            ) : (
              <Moon className="w-5 h-5 text-gray-600" />
            )}
          </button>

          {/* Notifications Bell with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifPanel(!showNotifPanel)}
              className="relative w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-750 flex items-center justify-center transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              {isAdmin && unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-900 flex items-center justify-center text-[9px] font-extrabold text-white animate-bounce-subtle">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifPanel && isAdmin && (
              <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl z-50 overflow-hidden animate-scale-in">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-indigo-600" />
                    Admin Notifications
                  </h4>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={() => markAllNotificationsRead()}
                        className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-0.5"
                      >
                        <CheckCheck className="w-3 h-3" />
                        Read all
                      </button>
                    )}
                    <button onClick={() => setShowNotifPanel(false)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-gray-400 dark:text-gray-500">No notifications yet.</div>
                  ) : (
                    notifications.slice(0, 20).map(n => (
                      <button
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${!n.read ? 'bg-indigo-50/50 dark:bg-indigo-950/10' : ''}`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            n.type === 'login' ? 'bg-green-100 dark:bg-green-900/20' 
                            : n.type === 'register' ? 'bg-blue-100 dark:bg-blue-900/20' 
                            : 'bg-gray-100 dark:bg-gray-800'
                          }`}>
                            {n.type === 'login' ? <LogIn className="w-3.5 h-3.5 text-green-600" /> : <UserPlus className="w-3.5 h-3.5 text-blue-600" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{n.title}</p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed mt-0.5 line-clamp-2">{n.message}</p>
                            <p className="text-[9px] text-gray-400 dark:text-gray-500 mt-1">{new Date(n.timestamp).toLocaleString()}</p>
                          </div>
                          {!n.read && <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 mt-1.5" />}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Avatar */}
          <div className="hidden sm:flex items-center gap-2 ml-2 pl-4 border-l border-gray-200 dark:border-gray-800 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 flex items-center justify-center border border-green-200/50 dark:border-green-800/50 transition-colors">
              {isLoggedIn && user ? (
                <span className="text-sm font-bold text-green-700 dark:text-green-400">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              ) : (
                <User className="w-4 h-4 text-green-600 dark:text-green-400" />
              )}
            </div>
            <div className="hidden lg:block">
              <p className="text-sm font-semibold text-gray-800 dark:text-white leading-none transition-colors">
                {isLoggedIn && user ? user.username : 'Guest'}
              </p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 transition-colors">
                {isLoggedIn ? 'Administrator' : 'Not logged in'}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500 ml-1 transition-colors" />
          </div>
        </div>
      </div>
    </header>
  );
}
