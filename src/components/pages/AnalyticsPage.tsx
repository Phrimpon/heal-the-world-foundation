import { useState, useEffect } from 'react';
import { LayoutDashboard, ChevronRight, TrendingUp, DollarSign, Users, Eye, BarChart3, PieChart, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart as RPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export default function AnalyticsPage() {
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));
  
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Donation Trends Over Time (Area Chart)
  const donationTrends = [
    { month: 'Jan', donations: 4200, pledges: 2800 },
    { month: 'Feb', donations: 5800, pledges: 3400 },
    { month: 'Mar', donations: 4600, pledges: 3100 },
    { month: 'Apr', donations: 7200, pledges: 4500 },
    { month: 'May', donations: 6800, pledges: 4200 },
    { month: 'Jun', donations: 8500, pledges: 5800 },
    { month: 'Jul', donations: 9200, pledges: 6200 },
  ];

  // Traffic Sources (Bar Chart)
  const trafficSources = [
    { source: 'Direct', visits: 3200 },
    { source: 'Social', visits: 2800 },
    { source: 'Email', visits: 1900 },
    { source: 'Search', visits: 4500 },
    { source: 'Referral', visits: 1200 },
  ];

  // Campaign Performance (Line Chart)
  const campaignPerf = [
    { week: 'W1', water: 2200, education: 1800, farming: 900 },
    { week: 'W2', water: 2800, education: 2100, farming: 1100 },
    { week: 'W3', water: 3200, education: 2600, farming: 1400 },
    { week: 'W4', water: 3800, education: 3000, farming: 1800 },
    { week: 'W5', water: 4200, education: 3400, farming: 2200 },
    { week: 'W6', water: 4800, education: 3800, farming: 2600 },
  ];

  // Donation Distribution (Pie Chart)
  const donationDistribution = [
    { name: 'MTN MoMo', value: 35 },
    { name: 'Telecel', value: 20 },
    { name: 'AirtelTigo', value: 15 },
    { name: 'GhanaPay', value: 12 },
    { name: 'PayPal', value: 10 },
    { name: 'Stripe', value: 8 },
  ];

  const COLORS = ['#fbbf24', '#f87171', '#3b82f6', '#10b981', '#8b5cf6', '#6366f1'];
  const darkText = isDark ? '#d1d5db' : '#374151';
  const darkGrid = isDark ? '#374151' : '#e5e7eb';

  const tooltipStyle = {
    backgroundColor: isDark ? '#1f2937' : '#ffffff',
    border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
    borderRadius: '12px',
    color: darkText,
    fontSize: '12px',
  };

  return (
    <div className="max-w-7xl fade-in animate-fade-in-up">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500 mb-6 transition-colors">
        <LayoutDashboard className="w-4 h-4" />
        <span>Dashboard</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-700 dark:text-gray-300 font-medium transition-colors">Analytics & Reports</span>
      </div>

      {/* Page Header */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 mb-6 transition-colors duration-300 animate-scale-in">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-blue-900/30">
            <BarChart3 className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">Analytics & Performance Hub</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5 transition-colors">Real-time donation tracking, user metrics, traffic analytics, and campaign insights</p>
          </div>
        </div>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Donations', value: 'GH₵ 48,500', change: '+12.5%', up: true, icon: <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />, bg: 'from-emerald-500 to-green-600' },
          { label: 'Active Users', value: '2,847', change: '+8.3%', up: true, icon: <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />, bg: 'from-blue-500 to-indigo-600' },
          { label: 'Page Views', value: '125.4K', change: '+23.1%', up: true, icon: <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400" />, bg: 'from-purple-500 to-violet-600' },
          { label: 'Conversion Rate', value: '4.8%', change: '-0.3%', up: false, icon: <Activity className="w-5 h-5 text-amber-600 dark:text-amber-400" />, bg: 'from-amber-500 to-orange-600' },
        ].map((kpi, idx) => (
          <div key={idx} className={`bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 transition-all duration-300 hover:shadow-md animate-stagger-card delay-${idx + 1}`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.bg} flex items-center justify-center shadow-lg`}>
                {kpi.icon}
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${kpi.up ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'}`}>
                {kpi.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {kpi.change}
              </span>
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white transition-colors">{kpi.value}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 transition-colors">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Donation Trends - Area Chart */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 transition-colors duration-300 animate-scale-in delay-1">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 transition-colors">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Donation Trends
            </h3>
            <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-lg transition-colors">Last 7 Months</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={donationTrends}>
              <defs>
                <linearGradient id="colorDon" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorPledge" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={darkGrid} />
              <XAxis dataKey="month" stroke={darkText} fontSize={11} />
              <YAxis stroke={darkText} fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="donations" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorDon)" name="One-time Donations" />
              <Area type="monotone" dataKey="pledges" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPledge)" name="Monthly Pledges" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Campaign Performance - Line Chart */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 transition-colors duration-300 animate-scale-in delay-2">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 transition-colors">
              <PieChart className="w-5 h-5 text-purple-600" />
              Campaign Performance
            </h3>
            <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-lg transition-colors">6-Week Sprint</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={campaignPerf}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkGrid} />
              <XAxis dataKey="week" stroke={darkText} fontSize={11} />
              <YAxis stroke={darkText} fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Line type="monotone" dataKey="water" stroke="#06b6d4" strokeWidth={2.5} dot={{ r: 4 }} name="Clean Water" />
              <Line type="monotone" dataKey="education" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 4 }} name="Education" />
              <Line type="monotone" dataKey="farming" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} name="Sustainable Farming" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Traffic Sources - Bar Chart */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 transition-colors duration-300 animate-scale-in delay-3">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 transition-colors">
              <Eye className="w-5 h-5 text-blue-600" />
              Traffic Sources
            </h3>
            <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-lg transition-colors">Monthly</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={trafficSources}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkGrid} />
              <XAxis dataKey="source" stroke={darkText} fontSize={11} />
              <YAxis stroke={darkText} fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="visits" fill="#6366f1" radius={[6, 6, 0, 0]} name="Visits" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Donation Distribution - Pie Chart */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 transition-colors duration-300 animate-scale-in delay-4">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 transition-colors">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              Payment Gateway Distribution
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <RPieChart>
              <Pie data={donationDistribution} cx="50%" cy="50%" labelLine={false} label={({ name, percent }: { name?: string; percent?: number }) => `${name || ''} ${((percent || 0) * 100).toFixed(0)}%`} outerRadius={90} innerRadius={45} fill="#8884d8" dataKey="value">
                {donationDistribution.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </RPieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Stats Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 transition-colors duration-300 animate-scale-in delay-5">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 transition-colors">
          <BarChart3 className="w-5 h-5 text-indigo-600" />
          Top Performing Campaigns
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-xs font-bold text-gray-400 uppercase">
                <th className="pb-3">Campaign</th>
                <th className="pb-3">Target (GH₵)</th>
                <th className="pb-3">Raised (GH₵)</th>
                <th className="pb-3">Donors</th>
                <th className="pb-3">Progress</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800 text-sm">
              {[
                { name: 'Ghana Water Pipeline', target: 50000, raised: 38500, donors: 420, progress: 77, status: 'Active' },
                { name: 'School Construction', target: 75000, raised: 48200, donors: 680, progress: 64, status: 'Active' },
                { name: 'Agro Training', target: 25000, raised: 18700, donors: 210, progress: 75, status: 'Active' },
                { name: 'Emergency Relief', target: 15000, raised: 15000, donors: 350, progress: 100, status: 'Completed' },
                { name: 'Sanitation Initiative', target: 30000, raised: 12400, donors: 180, progress: 41, status: 'Active' },
              ].map((c, idx) => (
                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="py-3.5 font-semibold text-gray-800 dark:text-white transition-colors">{c.name}</td>
                  <td className="py-3.5 text-gray-500 dark:text-gray-400 transition-colors">GH₵ {c.target.toLocaleString()}</td>
                  <td className="py-3.5 font-bold text-green-600 dark:text-green-400">GH₵ {c.raised.toLocaleString()}</td>
                  <td className="py-3.5 text-gray-500 dark:text-gray-400 transition-colors">{c.donors}</td>
                  <td className="py-3.5">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${c.progress === 100 ? 'bg-green-500' : 'bg-indigo-500'}`} style={{ width: `${c.progress}%` }} />
                    </div>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 block transition-colors">{c.progress}%</span>
                  </td>
                  <td className="py-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${c.status === 'Completed' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'}`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
