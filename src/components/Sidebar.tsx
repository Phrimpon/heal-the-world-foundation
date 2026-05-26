import { NavItem } from '../types';
import {
  Home,
  LayoutDashboard,
  User,
  CreditCard,
  Target,
  Megaphone,
  Bell,
  Cloud,
  Rocket,
  Settings,
  LogIn,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import ProfileUpload from './ProfileUpload';
import { getActiveUser, isCurrentUserAdmin } from '../database/db';

interface SidebarProps {
  activeItem: NavItem;
  onItemClick: (item: NavItem) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const allNavItems: { id: NavItem; label: string; icon: React.ReactNode; adminOnly?: boolean }[] = [
  { id: 'home', label: 'Home', icon: <Home className="w-5 h-5" /> },
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: 'personal-info', label: 'Personal Information', icon: <User className="w-5 h-5" /> },
  { id: 'member-balance', label: 'Member Balance & Dues', icon: <CreditCard className="w-5 h-5" /> },
  { id: 'aim-of-foundation', label: 'Aim of the Foundation', icon: <Target className="w-5 h-5" /> },
  { id: 'announcement', label: 'News & Announcements', icon: <Megaphone className="w-5 h-5" /> },
  { id: 'notifications', label: 'Email & Notifications', icon: <Bell className="w-5 h-5" /> },
  { id: 'cloud-storage', label: 'Cloud Storage', icon: <Cloud className="w-5 h-5" /> },
  { id: 'deploy', label: 'Deploy & Security', icon: <Rocket className="w-5 h-5" /> },
  { id: 'login-records', label: 'Login Sessions', icon: <ShieldCheck className="w-5 h-5" />, adminOnly: true },
  { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  { id: 'login', label: 'Log In / Out', icon: null },
];

export default function Sidebar({ activeItem, onItemClick, isOpen, onToggle }: SidebarProps) {
  const user = getActiveUser();
  const isLoggedIn = user?.isLoggedIn ?? false;
  const adminUser = isCurrentUserAdmin();

  // Only show admin-only items when user is an administrator
  const navItems = allNavItems.filter(item => !item.adminOnly || adminUser);

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={onToggle}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-green-700 dark:bg-green-800 text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-green-800 dark:hover:bg-green-900 active:scale-95 transition-all duration-200"
      >
        {isOpen ? (
          <X className="w-5 h-5 animate-fade-in-down" />
        ) : (
          <Menu className="w-5 h-5 animate-scale-in" />
        )}
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 dark:bg-black/60 z-30 backdrop-blur-sm"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-72 lg:w-72
          bg-gradient-to-b from-green-800 via-green-700 to-emerald-800 
          dark:from-gray-950 dark:via-gray-900 dark:to-green-950
          flex flex-col
          shadow-2xl shadow-green-900/40 dark:shadow-black/60
          sidebar-transition
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header with profile */}
        <div className="pt-8 pb-4 px-6 flex flex-col items-center border-b border-white/10 dark:border-white/5 transition-colors duration-300">
          <div className="animate-fade-in-down">
            <ProfileUpload />
          </div>
          <h2 className="text-white font-bold text-lg tracking-wide text-center leading-tight mt-1 animate-fade-in-up delay-1">
            Heal The World
            <br />
            <span className="text-green-200 dark:text-green-300 font-medium text-base">Foundation</span>
          </h2>
          <p className="text-green-300/50 dark:text-gray-500 text-xs mt-1 transition-colors">Management Portal v2.0</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item, index) => {
            const isActive = activeItem === item.id;
            const isLoginItem = item.id === 'login';
            const isPublic = item.id === 'home' || item.id === 'login';
            const isLocked = !isLoggedIn && !isPublic;

            const loginIcon = isLoggedIn ? (
              <LogOut className="w-5 h-5" />
            ) : (
              <LogIn className="w-5 h-5" />
            );

            return (
              <button
                key={item.id}
                onClick={() => {
                  onItemClick(item.id);
                  if (window.innerWidth < 1024) onToggle();
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-200 ease-out
                  animate-fade-in-left
                  ${isActive
                    ? 'bg-white/20 dark:bg-white/10 text-white shadow-lg shadow-black/10 backdrop-blur-sm'
                    : isLocked
                    ? 'text-green-100/40 dark:text-gray-600 hover:bg-white/5 hover:text-white/60'
                    : 'text-green-100/80 dark:text-gray-400 hover:bg-white/10 dark:hover:bg-white/5 hover:text-white dark:hover:text-gray-200'
                  }
                `}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <span className="flex-shrink-0">
                  {isLoginItem ? loginIcon : item.icon}
                </span>
                <span className="truncate flex-1 text-left">{item.label}</span>
                {isActive && !isLocked && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-white shadow-lg shadow-white/50 animate-pulse" />
                )}
                {isLocked && (
                  <Lock className="ml-auto w-3 h-3 text-white/30 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 dark:border-white/5 transition-colors duration-300">
          <div className="text-center">
            <p className="text-green-200/40 dark:text-gray-600 text-xs transition-colors">© 2026 Heal The World Foundation</p>
            <p className="text-green-200/30 dark:text-gray-700 text-[10px] mt-0.5 transition-colors">Powered by React + Vite</p>
          </div>
        </div>
      </aside>
    </>
  );
}
