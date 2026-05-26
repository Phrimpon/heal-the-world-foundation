import { useState } from 'react';
import { Heart, Globe, Users, ShieldCheck, Award, Sparkles, Gift, ChevronRight, MessageSquare, CheckCircle2, Smartphone, Info, Lock, LogIn, UserPlus } from 'lucide-react'; // eslint-disable-line
import { getActiveUser } from '../../database/db';

interface HomePageProps {
  onNavigate: (item: 'dashboard' | 'personal-info' | 'login') => void;
}

type PaymentOption = 'mtn_momo' | 'telecel_cash' | 'airteltigo_money' | 'ghanapay' | 'paypal' | 'stripe';

export default function HomePage({ onNavigate }: HomePageProps) {
  const currentUser = getActiveUser();
  const isLoggedIn = !!currentUser;
  const [donationAmount, setDonationAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [frequency, setFrequency] = useState<'one_time' | 'monthly'>('one_time');
  const [paymentMethod, setPaymentMethod] = useState<PaymentOption>('mtn_momo');
  const [mobileNumber, setMobileNumber] = useState<string>('');
  
  const [donated, setDonated] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleDonateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (['mtn_momo', 'telecel_cash', 'airteltigo_money', 'ghanapay'].includes(paymentMethod)) {
      setShowPrompt(true);
    } else {
      triggerSuccess();
    }
  };

  const triggerSuccess = () => {
    setShowPrompt(false);
    setDonated(true);
    setTimeout(() => {
      setDonated(false);
      setCustomAmount('');
      setMobileNumber('');
    }, 4000);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setContactForm({ name: '', email: '', message: '' });
    }, 4000);
  };

  const activeAmount = customAmount ? parseFloat(customAmount) : donationAmount;

  const paymentMethodLabels: Record<PaymentOption, string> = {
    mtn_momo: 'MTN Mobile Money',
    telecel_cash: 'Telecel Cash',
    airteltigo_money: 'AirtelTigo Money',
    ghanapay: 'GhanaPay Wallet',
    paypal: 'PayPal',
    stripe: 'Stripe (Credit Card)',
  };

  return (
    <div className="space-y-10 fade-in relative">
      {/* Mobile Money Push Prompt Modal */}
      {showPrompt && (
        <div className="fixed inset-0 z-50 bg-black/65 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 dark:bg-gray-850 text-white rounded-3xl max-w-sm w-full p-6 border border-gray-800 shadow-2xl text-left animate-scale-in">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-800">
              <Smartphone className="w-6 h-6 text-yellow-400 animate-bounce-subtle" />
              <h3 className="font-bold text-sm">Ghana MoMo Push Payment</h3>
            </div>
            
            <p className="text-xs text-gray-300 leading-relaxed mb-4">
              A prompt will be sent to <span className="underline font-bold">{mobileNumber || '0554403248'}</span> requesting:
            </p>
            
            <div className="p-4 bg-gray-950 dark:bg-gray-900 rounded-2xl border border-gray-800 mb-5">
              <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                <span>Merchant:</span>
                <span className="font-bold text-white">Heal The World</span>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                <span>Gateway:</span>
                <span className="font-bold text-white">{paymentMethodLabels[paymentMethod]}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-450">
                <span>Total Charge:</span>
                <span className="font-extrabold text-green-400">GH₵ {activeAmount} ({frequency === 'monthly' ? 'Monthly' : 'One-time'})</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={triggerSuccess}
                className="w-full py-3 bg-green-600 hover:bg-green-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
              >
                Simulate Authorization (Enter PIN)
              </button>
              <button
                onClick={() => setShowPrompt(false)}
                className="w-full py-3 bg-gray-800 hover:bg-gray-750 font-bold text-xs rounded-xl transition-all text-gray-300"
              >
                Cancel Transaction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section with animation */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-700 via-green-600 to-emerald-800 dark:from-green-900 dark:via-green-800 dark:to-emerald-950 p-8 sm:p-12 text-white shadow-xl shadow-green-900/20 dark:shadow-green-950/40 animate-scale-in">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
        <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-white/5 rounded-full animate-float" />
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold tracking-wide uppercase mb-6 animate-fade-in-up">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
            Empowering Humanity
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-4 animate-fade-in-up delay-1">
            Heal the World, Make it a Better Place
          </h1>
          <p className="text-green-100 text-lg sm:text-xl mb-8 leading-relaxed animate-fade-in-up delay-2">
            Support clean water pipelines, modern schools, and sustainable agro-development across Ghana and beyond.
          </p>
          <div className="flex flex-wrap gap-4 animate-fade-in-up delay-3">
            {isLoggedIn ? (
              <button
                onClick={() => onNavigate('dashboard')}
                className="px-6 py-3.5 bg-white text-green-800 font-bold rounded-xl hover:bg-green-50 transition-all shadow-lg shadow-black/10 flex items-center gap-2 active:scale-[0.98] hover:scale-[1.02]"
              >
                Go to Management Portal
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => onNavigate('login')}
                  className="px-6 py-3.5 bg-white text-green-800 font-bold rounded-xl hover:bg-green-50 transition-all shadow-lg shadow-black/10 flex items-center gap-2 active:scale-[0.98] hover:scale-[1.02]"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In to Portal
                </button>
                <button
                  onClick={() => onNavigate('login')}
                  className="px-6 py-3.5 bg-green-500/30 border border-white/30 text-white font-bold rounded-xl hover:bg-white/10 transition-all flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Register Free
                </button>
              </>
            )}
            <a
              href="#donate"
              className="px-6 py-3.5 bg-green-500/30 border border-white/30 text-white font-bold rounded-xl hover:bg-white/10 transition-all"
            >
              Support Our Cause
            </a>
          </div>
        </div>
      </div>

      {/* Auth Gate Banner — only shown to guests */}
      {!isLoggedIn && (
        <div className="bg-white dark:bg-gray-900 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4 shadow-sm animate-fade-in-up transition-colors">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center flex-shrink-0">
            <Lock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="font-bold text-gray-900 dark:text-white text-sm">Portal access requires an account</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              You are viewing the public homepage. Sign in or register a free account to access the dashboard, announcements, member balance, and all other portal features.
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => onNavigate('login')}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 active:scale-95"
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In
            </button>
            <button
              onClick={() => onNavigate('login')}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 active:scale-95"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Register
            </button>
          </div>
        </div>
      )}

      {/* Impact Statistics with staggered card animations */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { label: 'Total Funds Raised', value: 'GH₵ 48.5M+', icon: <Gift className="text-green-600 dark:text-green-400" /> },
          { label: 'Countries Reached', value: '42+', icon: <Globe className="text-blue-600 dark:text-blue-400" /> },
          { label: 'Volunteers & Staff', value: '5,200+', icon: <Users className="text-purple-600 dark:text-purple-400" /> },
          { label: 'Lives Impacted', value: '1.2M+', icon: <Heart className="text-rose-600 dark:text-rose-400" /> },
        ].map((stat, idx) => (
          <div key={idx} className={`bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200/60 dark:border-gray-800 shadow-sm card-hover-lift animate-stagger-card delay-${idx + 1} transition-colors duration-300`}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 transition-colors">
                {stat.icon}
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-gray-950 dark:text-white transition-colors">{stat.value}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5 transition-colors">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dynamic Donation Box */}
      <div id="donate" className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/60 dark:border-gray-800 shadow-sm p-6 sm:p-8 flex flex-col justify-between text-left transition-colors duration-300 animate-fade-in-right">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-1.5 font-sans transition-colors">Secure Giving Gateway</h2>
            <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed mb-6 transition-colors">
              Choose your frequency and payment method. Local Ghana mobile numbers auto-route via push authorization.
            </p>

            {/* Frequency Selector */}
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-5 transition-colors">
              <button
                type="button"
                onClick={() => setFrequency('one_time')}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                  frequency === 'one_time' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-750 dark:hover:text-gray-300'
                }`}
              >
                One-Time Donation
              </button>
              <button
                type="button"
                onClick={() => setFrequency('monthly')}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                  frequency === 'monthly' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-750 dark:hover:text-gray-300'
                }`}
              >
                Monthly Support (Recurring)
              </button>
            </div>
            
            {/* Amount Buttons */}
            <div className="grid grid-cols-4 gap-3 mb-5">
              {[50, 100, 250, 500].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => {
                    setDonationAmount(amount);
                    setCustomAmount('');
                  }}
                  className={`py-3.5 rounded-xl border font-bold text-sm transition-all duration-200 active:scale-[0.96] ${
                    activeAmount === amount
                      ? 'bg-green-600 border-green-600 text-white shadow-lg shadow-green-200/30 dark:shadow-green-900/40'
                      : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 bg-gray-50/50 dark:bg-gray-800/50'
                  }`}
                >
                  GH₵ {amount}
                </button>
              ))}
            </div>

            {/* Custom Amount Input */}
            <div className="relative mb-5">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-450 font-bold text-xs">GH₵</span>
              <input
                type="number"
                placeholder="Enter custom Ghana Cedi amount"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-800/30 text-xs outline-none focus:bg-white dark:focus:bg-gray-800 focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900/30 transition-all text-gray-800 dark:text-white"
              />
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3 mb-5">
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase transition-colors">Payment Gateway</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'mtn_momo', name: 'MTN MoMo', local: true },
                  { id: 'telecel_cash', name: 'Telecel Cash', local: true },
                  { id: 'airteltigo_money', name: 'AirtelTigo', local: true },
                  { id: 'ghanapay', name: 'GhanaPay', local: true },
                  { id: 'paypal', name: 'PayPal', local: false },
                  { id: 'stripe', name: 'Credit Card', local: false },
                ].map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id as PaymentOption)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex flex-col justify-center items-center transition-all duration-200 active:scale-[0.96] ${
                      paymentMethod === method.id
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-800 dark:text-green-300 ring-1 ring-green-500/30'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <span>{method.name}</span>
                    <span className="text-[8px] text-gray-400 dark:text-gray-500 font-medium mt-0.5">{method.local ? 'Ghana Local' : 'International'}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile wallet input */}
            {['mtn_momo', 'telecel_cash', 'airteltigo_money', 'ghanapay'].includes(paymentMethod) && (
              <div className="mb-6 animate-fade-in-up">
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase mb-1.5 transition-colors">Ghana Mobile Wallet Number</label>
                <input
                  type="tel"
                  placeholder="e.g. 0554403248"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-800/30 text-xs outline-none focus:bg-white dark:focus:bg-gray-800 focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900/30 transition-all text-gray-800 dark:text-white font-mono tracking-widest"
                  required
                />
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 font-sans transition-colors">Preset payments to default: <span className="font-semibold underline">0554403248</span></p>
              </div>
            )}
          </div>

          <form onSubmit={handleDonateSubmit}>
            <button
              type="submit"
              disabled={donated}
              className="w-full py-4 bg-green-600 hover:bg-green-700 disabled:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-200 dark:shadow-green-900/40 flex items-center justify-center gap-2 text-sm sm:text-base active:scale-[0.98]"
            >
              {donated ? (
                <>
                  <CheckCircle2 className="w-5.5 h-5.5 animate-bounce-subtle" />
                  Thank you! Pledged GH₵ {activeAmount} via {paymentMethodLabels[paymentMethod]}!
                </>
              ) : (
                `Complete Payout: GH₵ ${activeAmount} (${frequency === 'monthly' ? 'Monthly Recurring' : 'One-time'})`
              )}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-4 text-left">
          <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-2xl border border-green-100 dark:border-green-800/30 flex gap-4 items-start transition-colors duration-300 animate-fade-in-right delay-1">
            <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-green-900 dark:text-green-200 text-sm mb-0.5 transition-colors">Ghana Mobile Services</h4>
              <p className="text-xs text-green-700 dark:text-green-300/70 leading-relaxed mb-2 transition-colors">
                Support active wallet options: MTN MoMo, Telecel, AirtelTigo, GhanaPay at:
              </p>
              <span className="inline-block px-3 py-1.5 bg-white dark:bg-gray-800 border border-green-200 dark:border-green-700 text-green-800 dark:text-green-200 font-mono text-sm font-extrabold rounded-lg tracking-wider transition-colors">
                0554403248
              </span>
            </div>
          </div>

          {[
            { title: '100% Automated Receipts', desc: 'Instantly download, save, or view official foundation receipts immediately upon processing any secure checkout!', icon: <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" /> },
            { title: '100% Local Transparency', desc: 'Every single Ghana Cedi goes directly to localized ground operations and community programs.', icon: <ShieldCheck className="w-5 h-5 text-green-600 dark:text-green-400" /> },
            { title: 'Verified Non-Profit status', desc: 'Fully recognized status guarantees your donation is fully tax-deductible.', icon: <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> }
          ].map((feature, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200/60 dark:border-gray-800 shadow-sm flex gap-4 card-hover-lift transition-colors duration-300 animate-stagger-card delay-2">
              <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors">
                {feature.icon}
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-0.5 transition-colors">{feature.title}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed transition-colors">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Core Pillars */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/60 dark:border-gray-800 shadow-sm p-6 sm:p-8 transition-colors duration-300 animate-fade-in-up">
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2 transition-colors">Our Pillars of Hope</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xl mb-8 transition-colors">Our strategy centers on long-term development that lifts communities out of poverty forever.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'Clean Water & Sanitation', desc: 'Building clean water systems, safe toilets, and teaching essential hygiene habits to save lives.', bg: 'from-blue-500 to-cyan-500' },
            { title: 'Quality Education', desc: 'Constructing safe schools, providing learning materials, and training local teachers.', bg: 'from-purple-500 to-indigo-500' },
            { title: 'Sustainable Livelihoods', desc: 'Providing seeds, tools, and training to help smallholder farmers secure their families\' futures.', bg: 'from-emerald-500 to-teal-500' }
          ].map((pillar, idx) => (
            <div key={idx} className="relative rounded-2xl overflow-hidden p-6 text-white group cursor-pointer">
              <div className={`absolute inset-0 bg-gradient-to-br ${pillar.bg} transition-transform duration-500 group-hover:scale-110`} />
              <div className="relative z-10 flex flex-col justify-between h-full">
                <div>
                  <h3 className="text-lg font-extrabold mb-2">{pillar.title}</h3>
                  <p className="text-xs text-white/80 leading-relaxed">{pillar.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Message Form */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/60 dark:border-gray-800 shadow-sm p-6 sm:p-8 transition-colors duration-300 animate-fade-in-up delay-1">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2 transition-colors">Get in Touch with Us</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6 transition-colors">
              Have questions, ideas, or want to partner with Heal The World? Message our global leadership team directly.
            </p>
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 transition-colors">
              <MessageSquare className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span>Typically responds within 24 hours</span>
            </div>
          </div>

          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Your Name"
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-800/30 text-sm outline-none focus:bg-white dark:focus:bg-gray-800 focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900/30 transition-all text-gray-800 dark:text-white"
                required
              />
            </div>
            <div>
              <input
                type="email"
                placeholder="Email Address"
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-800/30 text-sm outline-none focus:bg-white dark:focus:bg-gray-800 focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900/30 transition-all text-gray-800 dark:text-white"
                required
              />
            </div>
            <div>
              <textarea
                placeholder="Message"
                rows={4}
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-800/30 text-sm outline-none focus:bg-white dark:focus:bg-gray-800 focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900/30 transition-all text-gray-800 dark:text-white resize-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitted}
              className="w-full py-3.5 bg-green-600 hover:bg-green-700 disabled:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-200 dark:shadow-green-900/40 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {submitted ? (
                <>
                  <CheckCircle2 className="w-5 h-5 animate-bounce-subtle" />
                  Message Sent Successfully!
                </>
              ) : (
                'Send Message'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
