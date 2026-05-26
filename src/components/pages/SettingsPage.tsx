import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Bell, Globe, Moon, Sun, Mail, Shield, Save, CheckCircle, LayoutDashboard, ChevronRight, ShieldAlert } from 'lucide-react';
import { Settings } from '../../types';
import { getSettings, saveSettings, getActiveUser, isCurrentUserAdmin } from '../../database/db';

export default function SettingsPage() {
  const currentUser = getActiveUser();
  const isAdmin = isCurrentUserAdmin();
  const [form, setForm] = useState<Settings>({
    theme: 'light',
    notifications: true,
    language: 'en',
    emailUpdates: true,
    twoFactor: false,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const data = getSettings();
    setForm(data);
  }, []);

  const handleToggle = (key: keyof Settings) => {
    setForm(prev => ({ ...prev, [key]: !prev[key] as never }));
    setSaved(false);
  };

  const handleSelect = (key: keyof Settings, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    if (!isAdmin) return;
    const ok = saveSettings(form);
    if (ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className="max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <LayoutDashboard className="w-4 h-4" />
        <span>Dashboard</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-700 font-medium">Settings</span>
      </div>

      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center shadow-lg shadow-gray-200">
            <SettingsIcon className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-500 text-sm mt-0.5">Configure your portal preferences and security</p>
          </div>
        </div>
      </div>

      {!isAdmin && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-left">
          <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-800">Read-only mode</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Only you as the Administrator can update platform settings. Current session: {currentUser?.role || 'Guest'}.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Theme */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center">
                {form.theme === 'dark' ? <Moon className="w-5 h-5 text-gray-600" /> : <Sun className="w-5 h-5 text-amber-500" />}
              </div>
              <div>
                <p className="font-semibold text-gray-900">Theme</p>
                <p className="text-sm text-gray-500">Choose your preferred appearance</p>
              </div>
            </div>
            <div className="flex bg-gray-100 rounded-xl p-1">
              <button disabled={!isAdmin} onClick={() => handleSelect('theme', 'light')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-60 disabled:cursor-not-allowed ${form.theme === 'light' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>Light</button>
              <button disabled={!isAdmin} onClick={() => handleSelect('theme', 'dark')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-60 disabled:cursor-not-allowed ${form.theme === 'dark' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>Dark</button>
            </div>
          </div>
        </div>

        {/* Language */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
                <Globe className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Language</p>
                <p className="text-sm text-gray-500">Select your preferred language</p>
              </div>
            </div>
            <select disabled={!isAdmin} value={form.language} onChange={(e) => handleSelect('language', e.target.value)} className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:opacity-60 disabled:cursor-not-allowed">
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="ar">العربية</option>
              <option value="hi">हिन्दी</option>
            </select>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center">
                <Bell className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Push Notifications</p>
                <p className="text-sm text-gray-500">Receive notifications for updates</p>
              </div>
            </div>
            <button disabled={!isAdmin} onClick={() => handleToggle('notifications')} className={`relative w-12 h-7 rounded-full transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${form.notifications ? 'bg-green-500' : 'bg-gray-300'}`}>
              <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${form.notifications ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
        </div>

        {/* Email Updates */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center">
                <Mail className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Email Updates</p>
                <p className="text-sm text-gray-500">Receive email notifications</p>
              </div>
            </div>
            <button disabled={!isAdmin} onClick={() => handleToggle('emailUpdates')} className={`relative w-12 h-7 rounded-full transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${form.emailUpdates ? 'bg-green-500' : 'bg-gray-300'}`}>
              <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${form.emailUpdates ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
        </div>

        {/* Two Factor */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center">
                <Shield className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Two-Factor Authentication</p>
                <p className="text-sm text-gray-500">Extra layer of security</p>
              </div>
            </div>
            <button disabled={!isAdmin} onClick={() => handleToggle('twoFactor')} className={`relative w-12 h-7 rounded-full transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${form.twoFactor ? 'bg-green-500' : 'bg-gray-300'}`}>
              <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${form.twoFactor ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6">
        {isAdmin && (
          <button onClick={handleSave} className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-green-200">
            {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? 'Saved Successfully!' : 'Save Settings'}
          </button>
        )}
      </div>
    </div>
  );
}
