import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface ImageUploaderProps {
  currentUrl?: string;
  onUploadSuccess: (url: string) => void;
  label?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  currentUrl,
  onUploadSuccess,
  label = 'Image upload',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successUrl, setSuccessUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadFile = async (file: File) => {
    setError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.url) {
        setSuccessUrl(data.url);
        onUploadSuccess(data.url);
      } else {
        setError(data.error || 'Failed to upload image.');
      }
    } catch {
      setError('Network error while uploading image.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUploadFile(e.target.files[0]);
    }
  };

  const displayUrl = successUrl || currentUrl;

  return (
    <div className="space-y-2 font-mono text-xs">
      <div className="flex items-center justify-between text-[11px]">
        <label className="block text-cockpit-muted font-bold uppercase">{label}</label>
        {displayUrl && (
          <span className="text-emerald-300 font-semibold truncate max-w-xs">{displayUrl}</span>
        )}
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
          isDragging
            ? 'border-emerald-500 bg-emerald-500/10'
            : isUploading
            ? 'border-cockpit-line bg-cockpit opacity-70'
            : 'border-cockpit-line hover:border-cockpit-line-strong bg-cockpit hover:bg-cockpit-hover'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          onChange={handleFileChange}
          className="hidden"
        />

        {displayUrl ? (
          <div className="flex items-center gap-4 w-full">
            <div className="w-16 h-16 rounded-lg overflow-hidden border border-cockpit-line bg-cockpit shrink-0">
              <img
                src={displayUrl}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div className="text-left flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                <span>Image set</span>
              </div>
              <p className="text-[11px] text-cockpit-muted truncate mt-0.5">{displayUrl}</p>
              <p className="text-[10px] text-cockpit-faint mt-1">Click or drop new file to replace</p>
            </div>
          </div>
        ) : (
          <>
            <div className="w-10 h-10 rounded-full bg-cockpit-raised border border-cockpit-line flex items-center justify-center text-cockpit-muted">
              {isUploading ? (
                <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
              ) : (
                <UploadCloud className="w-5 h-5 text-cockpit-muted" />
              )}
            </div>
            <div>
              <span className="font-semibold text-cockpit-text">
                {isUploading ? 'Uploading…' : 'Drop image here, or browse file'}
              </span>
              <p className="text-[10px] text-cockpit-faint mt-0.5">Supports PNG, JPG, WebP, SVG up to 5MB</p>
            </div>
          </>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-rose-400 text-[11px] font-semibold">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
