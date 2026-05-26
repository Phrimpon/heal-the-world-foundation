import { useState, useEffect } from 'react';
import { CreditCard, Shield, LayoutDashboard, ChevronRight, CheckCircle, Receipt, AlertCircle } from 'lucide-react';
import { getActiveUser, payUserDues } from '../../database/db';

export default function MemberBalancePage() {
  const user = getActiveUser();
  const [amountOwed, setAmountOwed] = useState(user?.amountOwed || 0);
  const [paymentAmount, setPaymentAmount] = useState<number>(50);
  const [customPayment, setCustomPayment] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'mtn_momo' | 'telecel_cash' | 'airteltigo_money' | 'ghanapay' | 'paypal' | 'stripe'>('mtn_momo');
  const [mobileNumber, setMobileNumber] = useState('0554403248');
  const [paidSuccess, setPaidSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setAmountOwed(user.amountOwed);
    }
  }, [user]);

  const activePayment = customPayment ? parseFloat(customPayment) : paymentAmount;

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const res = payUserDues(user.email, activePayment);
    if (res.success) {
      setAmountOwed(res.newBalance);
      setPaidSuccess(true);
      setCustomPayment('');
      setTimeout(() => setPaidSuccess(false), 4000);
    }
  };

  const invoiceItems = [
    { desc: 'Annual General Membership Fee', amount: 50 },
    { desc: 'Local Chapter Development Dues', amount: 40 },
    { desc: 'Clean Water Project Levy Contribution', amount: 30 },
  ];

  return (
    <div className="max-w-4xl fade-in animate-fade-in-up">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500 mb-6">
        <LayoutDashboard className="w-4 h-4" />
        <span>Dashboard</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-700 dark:text-gray-300 font-medium">Member Balance & Dues</span>
      </div>

      {/* Page Header */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 mb-6 transition-colors duration-300 animate-scale-in">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-650 flex items-center justify-center shadow-lg shadow-purple-200 dark:shadow-purple-900/30">
            <CreditCard className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Member Balance & Dues</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Review and settle outstanding foundation dues and development levies</p>
          </div>
        </div>
      </div>

      {user ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Column: Outstanding Balance & Invoices */}
          <div className="lg:col-span-3 space-y-6">
            {/* Balance Card */}
            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white rounded-3xl p-6 shadow-lg shadow-purple-300/20 dark:shadow-purple-950/40 relative overflow-hidden animate-scale-in">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full" />
              <h3 className="text-xs font-bold tracking-wider uppercase text-purple-100 mb-1">Outstanding Dues Balance</h3>
              <p className="text-4xl font-extrabold">GH₵ {amountOwed.toLocaleString()}</p>
              <p className="text-[10px] text-purple-200 mt-3 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-yellow-300" />
                Outstanding balance calculated from the users table registry
              </p>
            </div>

            {/* Invoice Breakdowns */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 text-left transition-colors">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-4 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-purple-600" />
                Outstanding Invoice Breakdown
              </h3>
              
              <div className="divide-y divide-gray-50 dark:divide-gray-800 space-y-3">
                {invoiceItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between pt-3 text-xs">
                    <span className="text-gray-500 dark:text-gray-455 font-medium">{item.desc}</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200">GH₵ {item.amount.toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-4 text-sm font-extrabold text-gray-900 dark:text-white">
                  <span>Total Standard Dues:</span>
                  <span>GH₵ 120.00</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Pay Balance Gateway */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 text-left transition-colors">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-4">Pay Dues Settle</h3>
            
            {paidSuccess && (
              <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-xs text-green-800 dark:text-green-200 mb-4 animate-fade-in-up">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                Payment processed! GH₵ {activePayment} deducted from users table row.
              </div>
            )}

            {amountOwed === 0 ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto animate-bounce-subtle" />
                <h4 className="font-bold text-gray-950 dark:text-white text-sm">Account Settled!</h4>
                <p className="text-xs text-gray-400">You have an outstanding balance of GH₵ 0.00. Thank you!</p>
              </div>
            ) : (
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                {/* Pay Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  {[20, 50, 100].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setPaymentAmount(amt);
                        setCustomPayment('');
                      }}
                      className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                        activePayment === amt
                          ? 'bg-purple-600 border-purple-600 text-white shadow-md'
                          : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      GH₵ {amt}
                    </button>
                  ))}
                </div>

                {/* Custom payment input */}
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">GH₵</span>
                  <input
                    type="number"
                    placeholder="Custom payout amount"
                    value={customPayment}
                    onChange={(e) => setCustomPayment(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white outline-none focus:bg-white focus:border-purple-500"
                  />
                </div>

                {/* Payment selector */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-450 uppercase mb-1">Select Payment Wallet</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as never)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none focus:bg-white"
                  >
                    <option value="mtn_momo">MTN Mobile Money</option>
                    <option value="telecel_cash">Telecel Cash</option>
                    <option value="airteltigo_money">AirtelTigo Money</option>
                    <option value="ghanapay">GhanaPay Wallet</option>
                    <option value="paypal">PayPal Express</option>
                    <option value="stripe">Stripe Card</option>
                  </select>
                </div>

                {/* Number input for Momo */}
                {['mtn_momo', 'telecel_cash', 'airteltigo_money', 'ghanapay'].includes(paymentMethod) && (
                  <div>
                    <label className="block text-[10px] font-bold text-gray-450 uppercase mb-1">Wallet Number</label>
                    <input
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white outline-none font-mono"
                      required
                    />
                  </div>
                )}

                <button type="submit" className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-200 dark:shadow-purple-950/30 transition-all active:scale-95">
                  Pay GH₵ {activePayment} Dues
                </button>
              </form>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-8 text-center max-w-md mx-auto transition-colors">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h3 className="font-bold text-gray-905 dark:text-white text-sm">Authentication Required</h3>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">Please register or login to view your outstanding dues and membership balance.</p>
        </div>
      )}
    </div>
  );
}
