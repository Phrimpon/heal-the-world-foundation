import { useRef, useState, useEffect } from 'react';
import { Camera, User as UserIcon } from 'lucide-react';
import { getProfileImage, saveProfileImage, removeProfileImage } from '../database/db';

export default function ProfileUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageData, setImageData] = useState<string | null>(null);

  useEffect(() => {
    const profile = getProfileImage();
    if (profile) {
      setImageData(profile.dataUrl);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setImageData(dataUrl);
      saveProfileImage({
        dataUrl,
        fileName: file.name,
        uploadedAt: new Date().toISOString(),
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setImageData(null);
    removeProfileImage();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col items-center gap-2 mb-6">
      <div
        className="relative group cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="w-20 h-20 rounded-2xl border-2 border-white/20 overflow-hidden bg-white/15 flex items-center justify-center transition-all duration-300 group-hover:border-white/40 group-hover:shadow-lg group-hover:shadow-black/10">
          {imageData ? (
            <img src={imageData} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <UserIcon className="w-8 h-8 text-white/60" />
          )}
        </div>
        <div className="absolute inset-0 rounded-2xl bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Camera className="w-5 h-5 text-white" />
        </div>
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      {imageData && (
        <button
          onClick={(e) => { e.stopPropagation(); handleRemove(); }}
          className="text-[10px] text-white/50 hover:text-white/80 transition-colors underline underline-offset-2"
        >
          Remove
        </button>
      )}
    </div>
  );
}
