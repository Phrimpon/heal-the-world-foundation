import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Globe, Calendar, Save, CheckCircle, LayoutDashboard, ChevronRight } from 'lucide-react';
import { PersonalInfo } from '../../types';
import { getPersonalInfo, savePersonalInfo } from '../../database/db';

export default function PersonalInfoPage() {
  const [form, setForm] = useState<PersonalInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    bio: '',
    dateOfBirth: '',
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const data = getPersonalInfo();
    setForm(data);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setSaved(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    savePersonalInfo(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition-all duration-200 text-gray-800 text-sm";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

  return (
    <div className="max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <LayoutDashboard className="w-4 h-4" />
        <span>Dashboard</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-700 font-medium">Personal Information</span>
      </div>

      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
            <User className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Personal Information</h1>
            <p className="text-gray-500 text-sm mt-0.5">Manage your personal details and contact information</p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>First Name</label>
              <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="Enter first name" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Last Name</label>
              <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Enter last name" className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}><span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />Email Address</span></label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="email@example.com" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}><span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />Phone Number</span></label>
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="+1 (555) 000-0000" className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}><span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />Address</span></label>
            <input name="address" value={form.address} onChange={handleChange} placeholder="Street address" className={inputClass} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className={labelClass}>City</label>
              <input name="city" value={form.city} onChange={handleChange} placeholder="City" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}><span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" />Country</span></label>
              <input name="country" value={form.country} onChange={handleChange} placeholder="Country" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}><span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />Date of Birth</span></label>
              <input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Bio</label>
            <textarea name="bio" value={form.bio} onChange={handleChange} placeholder="Tell us about yourself..." rows={4} className={`${inputClass} resize-none`} />
          </div>

          <div className="flex items-center gap-4 pt-2 border-t border-gray-100 pt-6">
            <button type="submit" className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-green-200">
              {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saved ? 'Saved Successfully!' : 'Save Information'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
