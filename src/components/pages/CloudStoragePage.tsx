import { useState, useEffect } from 'react';
import { LayoutDashboard, ChevronRight, Cloud, CloudUpload, Trash2, Download, Eye, CheckCircle, ShieldCheck, FolderOpen, Image, ExternalLink } from 'lucide-react';
import { getActiveUser, getUploadedImages, addUploadedImage } from '../../database/db';

export default function CloudStoragePage() {
  const user = getActiveUser();
  const isAdmin = user?.role === 'Administrator';
  
  const [images, setImages] = useState(getUploadedImages());
  const [provider, setProvider] = useState<'cloudinary' | 's3' | 'firebase'>('cloudinary');
  const [showUpload, setShowUpload] = useState(false);
  const [uploadForm, setUploadForm] = useState({ name: '', size: 1024, tags: '' });
  const [uploaded, setUploaded] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setImages(getUploadedImages());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    
    setUploading(true);
    setTimeout(() => {
      const res = addUploadedImage(uploadForm.name, uploadForm.size);
      if (res.success) {
        setUploaded(true);
        setUploadForm({ name: '', size: 1024, tags: '' });
      }
      setUploading(false);
      setTimeout(() => {
        setUploaded(false);
        setShowUpload(false);
      }, 2000);
    }, 1200);
  };

  const providerDetails = {
    cloudinary: { name: 'Cloudinary', desc: 'Managed CDN with transformations & AI tagging', logo: '☁️', color: 'from-blue-500 to-cyan-500', status: 'Active' },
    s3: { name: 'AWS S3', desc: 'Amazon S3 for durable, scalable object storage', logo: '🪣', color: 'from-amber-500 to-orange-500', status: 'Configured' },
    firebase: { name: 'Firebase Storage', desc: 'Google Firebase with GCP-backed CDN', logo: '🔥', color: 'from-yellow-500 to-amber-500', status: 'Ready' },
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900/30 outline-none transition-all text-gray-800 dark:text-white text-sm";
  const labelClass = "block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 transition-colors";

  const totalStorage = images.reduce((a, b) => a + b.fileSizeKb, 0);

  return (
    <div className="max-w-4xl fade-in animate-fade-in-up">
      <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500 mb-6 transition-colors">
        <LayoutDashboard className="w-4 h-4" />
        <span>Dashboard</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-700 dark:text-gray-300 font-medium transition-colors">Cloud Image Storage</span>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 mb-6 transition-colors duration-300 animate-scale-in">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-blue-900/30">
            <Cloud className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">Cloud Image Storage</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5 transition-colors">Cloudinary, AWS S3, and Firebase Storage management interface</p>
          </div>
        </div>
      </div>

      {/* Provider Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {Object.entries(providerDetails).map(([key, p]) => (
          <button
            key={key}
            onClick={() => setProvider(key as never)}
            className={`bg-white dark:bg-gray-900 rounded-2xl border shadow-sm p-5 text-left transition-all duration-300 card-hover-lift ${
              provider === key ? 'border-green-400 dark:border-green-500 ring-1 ring-green-400/20 dark:ring-green-500/20' : 'border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{p.logo}</span>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm transition-colors">{p.name}</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${provider === key ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                  {p.status}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors">{p.desc}</p>
          </button>
        ))}
      </div>

      {/* Storage Overview */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 mb-6 transition-colors duration-300 animate-scale-in">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Files', value: images.length, icon: <Image className="w-5 h-5 text-blue-600 dark:text-blue-400" /> },
            { label: 'Total Storage', value: `${(totalStorage / 1024).toFixed(2)} MB`, icon: <FolderOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> },
            { label: 'Active Provider', value: providerDetails[provider].name, icon: <CloudUpload className="w-5 h-5 text-cyan-600 dark:text-cyan-400" /> },
            { label: 'Security', value: 'Encrypted', icon: <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" /> },
          ].map((stat, idx) => (
            <div key={idx} className="text-center">
              <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center mx-auto mb-2 transition-colors">
                {stat.icon}
              </div>
              <p className="text-lg font-extrabold text-gray-900 dark:text-white transition-colors">{stat.value}</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-medium transition-colors">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Upload Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500 dark:text-gray-400 transition-colors">Storage Used</span>
            <span className="font-bold text-gray-700 dark:text-gray-300 transition-colors">{(totalStorage / 1024 / 1024 * 100).toFixed(4)}% of 10 GB</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 h-3 rounded-full overflow-hidden transition-colors">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-1000" style={{ width: `${(totalStorage / 1024 / 10240) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Upload Form */}
      <div className="mb-6">
        {isAdmin ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 transition-colors">
                <CloudUpload className="w-5 h-5 text-green-600 dark:text-green-400" />
                Upload Images
              </h3>
              <button onClick={() => setShowUpload(!showUpload)} className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-700 transition-colors active:scale-[0.98]">
                {showUpload ? 'Close' : <><CloudUpload className="w-3.5 h-3.5" /> New Upload</>}
              </button>
            </div>

            {showUpload && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-green-200 dark:border-green-800 shadow-sm p-6 transition-colors duration-300 animate-scale-in">
                {uploaded && (
                  <div className="flex items-center gap-2 p-3 mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-800 dark:text-green-200 text-xs">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    Image uploaded to {providerDetails[provider].name} CDN successfully!
                  </div>
                )}

                <form onSubmit={handleUpload} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Image Filename</label>
                      <input value={uploadForm.name} onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })} placeholder="campaign_photo.jpg" className={inputClass} required />
                    </div>
                    <div>
                      <label className={labelClass}>File Size (KB)</label>
                      <input type="number" value={uploadForm.size} onChange={(e) => setUploadForm({ ...uploadForm, size: parseInt(e.target.value) || 0 })} className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Cloudinary Tags</label>
                    <input value={uploadForm.tags} onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })} placeholder="foundation, campaign, 2026" className={inputClass} />
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-[10px] text-gray-500 dark:text-gray-400 space-y-1.5 transition-colors">
                    <p className="font-bold text-xs text-gray-700 dark:text-gray-300 mb-2">Upload Target Configuration</p>
                    {provider === 'cloudinary' && <p>☁️  Cloudinary: Uploading to cloud `healtheworld` → `/uploads/images/` with auto-format & auto-quality optimization.</p>}
                    {provider === 's3' && <p>🪣 AWS S3: Uploading to bucket `s3://healtheworld-public/images/` with `public-read` ACL and SSE-S3 encryption.</p>}
                    {provider === 'firebase' && <p>🔥 Firebase: Uploading to `gs://healtheworld.appspot.com/uploads/images/` with download token generation.</p>}
                  </div>

                  <div className="flex gap-3">
                    <button type="submit" disabled={uploading} className={`flex-1 py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${uploading ? 'bg-green-400 dark:bg-green-500 cursor-wait' : 'bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200 dark:shadow-green-900/30'}`}>
                      {uploading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Uploading to Cloud...
                        </>
                      ) : (
                        <>
                          <CloudUpload className="w-4 h-4" />
                          Upload to {providerDetails[provider].name}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </>
        ) : (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 flex gap-4 transition-colors">
            <ShieldCheck className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-red-900 dark:text-red-200 text-base">Administrative Access Required</h3>
              <p className="text-xs text-red-700 dark:text-red-300 mt-1 leading-relaxed">
                Cloud storage operations are restricted to Administrators. Only admins can upload, manage, or delete images from Cloudinary, AWS S3, or Firebase Storage.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Image Registry */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 transition-colors duration-300 animate-scale-in delay-2">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 transition-colors">
          <Image className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          {providerDetails[provider].name} Image Registry
        </h3>
        {images.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500 transition-colors">
            <FolderOpen className="w-12 h-12 mb-3 text-gray-300 dark:text-gray-600" />
            <p className="font-medium">No images uploaded yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-xs font-bold text-gray-400 uppercase">
                  <th className="pb-3">Filename</th>
                  <th className="pb-3">Cloud Path</th>
                  <th className="pb-3">Size</th>
                  <th className="pb-3">Uploaded By</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800 text-sm">
                {images.map((img) => (
                  <tr key={img.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="py-3 font-semibold text-gray-800 dark:text-white flex items-center gap-2 transition-colors">
                      <Image className="w-4 h-4 text-gray-400" />
                      {img.fileName}
                    </td>
                    <td className="py-3 text-gray-500 dark:text-gray-400 font-mono text-xs transition-colors">
                      {provider === 'cloudinary' && `cdn.cloudinary.com/healtheworld/${img.fileName}`}
                      {provider === 's3' && `s3://healtheworld/${img.fileName}`}
                      {provider === 'firebase' && `firebasestorage/.../images/${img.fileName}`}
                    </td>
                    <td className="py-3 text-gray-500 dark:text-gray-400 transition-colors">{img.fileSizeKb} KB</td>
                    <td className="py-3 text-gray-500 dark:text-gray-400 transition-colors">{img.uploadedBy}</td>
                    <td className="py-3 flex items-center gap-2">
                      <button className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-750 transition-colors">
                        <Eye className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </button>
                      <button className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-750 transition-colors">
                        <Download className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </button>
                      <button className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-750 transition-colors">
                        <ExternalLink className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </button>
                      {isAdmin && (
                        <button className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                          <Trash2 className="w-4 h-4 text-red-400 hover:text-red-600" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
