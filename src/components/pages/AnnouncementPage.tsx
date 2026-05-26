import { useState, useEffect } from 'react';
import { Megaphone, Plus, Trash2, AlertCircle, Clock, Send, LayoutDashboard, ChevronRight, Sparkles, Newspaper, Bell, Flame, ShieldCheck, Lock } from 'lucide-react';
import { Announcement } from '../../types';
import { getAnnouncements, addAnnouncement, deleteAnnouncement, getActiveUser } from '../../database/db';

// Extend local interface to support custom type
interface BlogAnnouncement extends Announcement {
  category?: 'news' | 'campaign' | 'emergency';
}

export default function AnnouncementPage() {
  const [announcements, setAnnouncements] = useState<BlogAnnouncement[]>([]);
  const [filteredCategory, setFilteredCategory] = useState<'all' | 'news' | 'campaign' | 'emergency'>('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    content: '',
    author: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    category: 'news' as 'news' | 'campaign' | 'emergency',
  });

  const user = getActiveUser();
  const isAdmin = user?.role === 'Administrator';

  useEffect(() => {
    // Seed some categories into default announcements if missing
    const fetched = getAnnouncements() as BlogAnnouncement[];
    const formatted = fetched.map((a, idx) => ({
      ...a,
      category: a.category || (idx === 0 ? 'news' : 'campaign')
    }));
    setAnnouncements(formatted);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;

    const newPost = addAnnouncement({
      title: form.title,
      content: form.content,
      author: form.author || user?.username || 'Administrator',
      priority: form.priority,
    }) as BlogAnnouncement;

    // Append the selected category
    newPost.category = form.category;

    setAnnouncements(prev => [newPost, ...prev]);
    setForm({ title: '', content: '', author: '', priority: 'medium', category: 'news' });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    deleteAnnouncement(id);
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  const priorityColors = {
    low: 'bg-blue-50 text-blue-700 border-blue-100',
    medium: 'bg-amber-50 text-amber-700 border-amber-100',
    high: 'bg-red-50 text-red-700 border-red-100',
  };

  const categoryStyles = {
    news: { badge: '📰 Foundation News', bg: 'bg-emerald-50 border-emerald-100 text-emerald-800', cardBorder: 'hover:border-emerald-300' },
    campaign: { badge: '🎯 Campaign Update', bg: 'bg-blue-50 border-blue-100 text-blue-800', cardBorder: 'hover:border-blue-300' },
    emergency: { badge: '🚨 Emergency Notice', bg: 'bg-rose-100 border-rose-200 text-rose-800', cardBorder: 'border-rose-200 hover:border-rose-400' }
  };

  const filteredAnnouncements = filteredCategory === 'all'
    ? announcements
    : announcements.filter(a => a.category === filteredCategory);

  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition-all duration-200 text-gray-800 text-sm";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

  return (
    <div className="max-w-4xl fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <LayoutDashboard className="w-4 h-4" />
        <span>Dashboard</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-700 font-medium">News & Announcements</span>
      </div>

      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-200">
              <Megaphone className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Foundation News Hub</h1>
              <p className="text-gray-500 text-sm mt-0.5">Explore foundation news, campaign milestones, and emergency notices</p>
            </div>
          </div>

          {isAdmin ? (
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 active:scale-[0.98] transition-all shadow-lg shadow-green-200 self-start sm:self-center"
            >
              <Plus className="w-4 h-4" />
              Create Post
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-[11px] font-bold bg-gray-100 text-gray-500 px-3 py-2 rounded-xl">
              <Lock className="w-3.5 h-3.5" />
              <span>Admin Only Publishing</span>
            </div>
          )}
        </div>
      </div>

      {/* Category Filter Bar */}
      <div className="flex flex-wrap bg-white border border-gray-100 rounded-2xl p-1.5 mb-6 shadow-sm">
        {[
          { id: 'all', label: 'All Announcements', icon: <Newspaper className="w-4 h-4" /> },
          { id: 'news', label: 'Foundation News', icon: <Sparkles className="w-4 h-4 text-emerald-500" /> },
          { id: 'campaign', label: 'Campaign Updates', icon: <Bell className="w-4 h-4 text-blue-500" /> },
          { id: 'emergency', label: 'Emergency Notices', icon: <Flame className="w-4 h-4 text-rose-500" /> },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilteredCategory(cat.id as never)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filteredCategory === cat.id
                ? 'bg-green-600 text-white shadow-md shadow-green-200'
                : 'text-gray-500 hover:text-gray-750 hover:bg-gray-50'
            }`}
          >
            {cat.icon}
            {cat.label}
          </button>
        ))}
      </div>

      {/* Create Post Form (Admin Only) */}
      {showForm && isAdmin && (
        <div className="mb-6 bg-white rounded-2xl border-2 border-green-200 shadow-sm p-6 sm:p-8 text-left">
          <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
            <Send className="w-5 h-5 text-green-600" />
            Publish New Blog Post
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Post Title</label>
                <input value={form.title} onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))} placeholder="Enter title" className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>Author Signature</label>
                <input value={form.author} onChange={(e) => setForm(prev => ({ ...prev, author: e.target.value }))} placeholder="e.g. Director of Communications" className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Category</label>
                <select value={form.category} onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value as never }))} className={inputClass}>
                  <option value="news">📰 Foundation News</option>
                  <option value="campaign">🎯 Campaign Milestone</option>
                  <option value="emergency">🚨 Emergency Notice</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Alert Level</label>
                <select value={form.priority} onChange={(e) => setForm(prev => ({ ...prev, priority: e.target.value as never }))} className={inputClass}>
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority (Urgent)</option>
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass}>Content</label>
              <textarea value={form.content} onChange={(e) => setForm(prev => ({ ...prev, content: e.target.value }))} placeholder="Describe the update details..." rows={5} className={`${inputClass} resize-none`} required />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="px-5 py-2.5 bg-green-600 text-white rounded-xl text-xs font-bold transition-all hover:bg-green-700">Publish to SQLite Table</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-200">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Non-Admin Permission Warning */}
      {showForm && !isAdmin && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-6 flex gap-4 text-left">
          <Lock className="w-8 h-8 text-red-600 flex-shrink-0 mt-1 animate-bounce" />
          <div>
            <h3 className="font-bold text-red-950 text-base">Administrative Session Required</h3>
            <p className="text-xs text-red-700 mt-1 leading-relaxed">
              Your current role permissions lack `Administrator` security rights to write to the announcements table. 
              Please navigate to the <span className="underline font-bold">Account</span> tab and log in as `admin@healtheworld.org` (password: `password123`) to enable news publishing.
            </p>
          </div>
        </div>
      )}

      {/* Announcements list */}
      {filteredAnnouncements.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex flex-col items-center justify-center py-16 text-gray-450">
            <AlertCircle className="w-12 h-12 mb-3 text-gray-300" />
            <p className="text-lg font-bold">No articles matched this category</p>
            <p className="text-xs">Try choosing "All Announcements" to check available updates.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAnnouncements.map((a) => {
            const style = categoryStyles[a.category || 'news'];
            const isEmergency = a.category === 'emergency';
            
            return (
              <div
                key={a.id}
                className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-6 transition-all duration-350 text-left relative overflow-hidden ${style.cardBorder}`}
              >
                {isEmergency && (
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 to-orange-500 animate-pulse" />
                )}
                
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                  <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
                    <h3 className="font-extrabold text-gray-900 text-lg tracking-tight leading-snug truncate">{a.title}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border tracking-wide uppercase ${style.bg}`}>
                      {style.badge}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border tracking-wide uppercase ${priorityColors[a.priority]}`}>
                      {a.priority} priority
                    </span>
                  </div>
                  
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1 ml-2 flex-shrink-0 self-start"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <p className="text-gray-600 text-sm leading-relaxed mb-4 font-medium">{a.content}</p>
                
                <div className="flex items-center gap-4 text-xs text-gray-450 border-t border-gray-50 pt-3 mt-3">
                  <div className="flex items-center gap-1.5 font-semibold text-gray-700">
                    <ShieldCheck className="w-4 h-4 text-green-600" />
                    <span>By {a.author}</span>
                  </div>
                  <span className="flex items-center gap-1 text-gray-400">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(a.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
