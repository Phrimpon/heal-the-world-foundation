import { useState, useEffect, useCallback } from 'react';
import { NavItem } from './types';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import Chatbot from './components/Chatbot';
import HomePage from './components/pages/HomePage';
import DashboardPage from './components/pages/DashboardPage';
import PersonalInfoPage from './components/pages/PersonalInfoPage';
import MemberBalancePage from './components/pages/MemberBalancePage';
import AimOfFoundationPage from './components/pages/AimOfFoundationPage';
import AnnouncementPage from './components/pages/AnnouncementPage';
import NotificationsPage from './components/pages/NotificationsPage';
import CloudStoragePage from './components/pages/CloudStoragePage';
import DeployPage from './components/pages/DeployPage';
import LoginRecordsPage from './components/pages/LoginRecordsPage';
import SettingsPage from './components/pages/SettingsPage';
import LoginPage from './components/pages/LoginPage';
import { getAnnouncements, getActiveUser, getPersonalInfo, registerOwnerDevice } from './database/db';
import { Heart, Loader2 } from 'lucide-react';

// Auto-register this device as the owner on first visit
registerOwnerDevice();

function applyDarkMode(isDark: boolean) {
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export default function App() {
  const [activeItem, setActiveItem] = useState<NavItem>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({ announcements: 0, hasProfile: false, hasPersonalInfo: false, isLoggedIn: false });
  const [isRouterLoading, setIsRouterLoading] = useState(false);
  const [routerProgress, setRouterProgress] = useState(0);
  const [showInitialLoader, setShowInitialLoader] = useState(true);

  // Theme state
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('htwf_theme');
    if (stored === 'dark') return true;
    if (stored === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    applyDarkMode(isDark);
    localStorage.setItem('htwf_theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = useCallback(() => {
    setIsDark(prev => !prev);
  }, []);

  // Initial loading screen
  useEffect(() => {
    const timer = setTimeout(() => setShowInitialLoader(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const refreshStats = useCallback(() => {
    const announcements = getAnnouncements();
    const user = getActiveUser();
    const personal = getPersonalInfo();
    setStats({
      announcements: announcements.length,
      hasProfile: !!user,
      hasPersonalInfo: !!(personal.firstName || personal.email),
      isLoggedIn: !!user,
    });
  }, []);

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  const handleNavigate = (item: NavItem) => {
    if (item === activeItem) return;

    // Auth gate: redirect to login for any page except 'home' and 'login'
    const publicPages: NavItem[] = ['home', 'login'];
    const user = getActiveUser();
    if (!publicPages.includes(item) && !user) {
      setActiveItem('login');
      return;
    }

    setIsRouterLoading(true);
    setRouterProgress(15);

    const progressInterval = setInterval(() => {
      setRouterProgress(prev => {
        const next = prev + Math.random() * 25;
        return next >= 90 ? 90 : next;
      });
    }, 50);

    setTimeout(() => {
      clearInterval(progressInterval);
      setRouterProgress(100);
      setActiveItem(item);
      refreshStats();
      setSidebarOpen(false);
      setTimeout(() => {
        setIsRouterLoading(false);
        setRouterProgress(0);
      }, 200);
    }, 400 + Math.random() * 200);
  };

  const renderContent = () => {
    // Secondary auth guard — catches direct state restoration
    const publicPages: NavItem[] = ['home', 'login'];
    const loggedInUser = getActiveUser();
    if (!publicPages.includes(activeItem) && !loggedInUser) {
      return <LoginPage />;
    }

    switch (activeItem) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'dashboard':
        return <DashboardPage onNavigate={handleNavigate} />;
      case 'personal-info':
        return <PersonalInfoPage />;
      case 'member-balance':
        return <MemberBalancePage />;
      case 'aim-of-foundation':
        return <AimOfFoundationPage />;
      case 'announcement':
        return <AnnouncementPage />;
      case 'notifications':
        return <NotificationsPage />;
      case 'cloud-storage':
        return <CloudStoragePage />;
      case 'deploy':
        return <DeployPage />;
      case 'login-records':
        return <LoginRecordsPage />;
      case 'settings':
        return <SettingsPage />;
      case 'login':
        return <LoginPage />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  // Loading Screen
  if (showInitialLoader) {
    return (
      <div className="fixed inset-0 loading-screen z-[100] flex flex-col items-center justify-center text-white">
        <div className="animate-spring-in mb-8">
          <div className="w-24 h-24 rounded-3xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center animate-pulse-glow">
            <Heart className="w-12 h-12 text-white animate-float" fill="white" />
          </div>
        </div>
        <div className="animate-fade-in-up delay-1 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">Heal The World</h1>
          <p className="text-green-200 text-sm font-medium tracking-wide uppercase">Foundation Portal</p>
        </div>
        <div className="mt-10 w-64 h-1.5 bg-white/10 rounded-full overflow-hidden animate-scale-in delay-2">
          <div className="h-full bg-white rounded-full" style={{ animation: 'progressWidth 1.8s ease-out forwards' }} />
        </div>
        <div className="mt-6 flex items-center gap-2 animate-fade-in-up delay-3">
          <Loader2 className="w-4 h-4 animate-spin-loader" />
          <span className="text-xs text-green-200 font-medium tracking-wide">Initializing secure session...</span>
        </div>
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/40 rounded-full animate-float" />
        <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce-subtle" />
        <div className="absolute bottom-1/3 left-1/5 w-1 h-1 bg-white/50 rounded-full animate-float" style={{ animationDelay: '1s' }} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex transition-colors duration-300 ${isDark ? 'dark bg-gray-950' : 'bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50'}`}>
      {/* Router Loading Bar */}
      {isRouterLoading && (
        <div
          className="fixed top-0 left-0 h-1 z-[60] bg-gradient-to-r from-green-500 via-emerald-400 to-teal-500 shadow-lg shadow-green-400/30 transition-all duration-150 ease-out"
          style={{ width: `${routerProgress}%` }}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        activeItem={activeItem}
        onItemClick={handleNavigate}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <TopNav
          activeItem={activeItem}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          isLoggedIn={stats.isLoggedIn}
          isDark={isDark}
          onToggleTheme={toggleTheme}
        />
        <div className="flex-1 overflow-y-auto pb-20">
          <div key={activeItem} className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {renderContent()}
          </div>
        </div>
      </main>

      {/* AI Chatbot */}
      <Chatbot />
      
      {/* Theme Toggle Button */}
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={toggleTheme}
          className={`rounded-full p-3 shadow-2xl border flex items-center gap-2 text-xs font-bold transition-all duration-300 hover:scale-110 active:scale-95 ${
            isDark
              ? 'bg-gray-800 border-gray-700 text-yellow-300 hover:bg-gray-750'
              : 'bg-white border-gray-200 text-amber-500 hover:bg-gray-50'
          }`}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? (
            <span className="w-4 h-4 flex items-center justify-center">🌙</span>
          ) : (
            <span className="w-4 h-4 flex items-center justify-center">☀️</span>
          )}
          <span className="font-mono hidden sm:inline">{isDark ? 'Dark' : 'Light'}</span>
        </button>
      </div>
    </div>
  );
}
