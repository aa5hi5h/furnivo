'use client';

// components/banner-image-uploader.tsx

import { useState, useRef, useCallback } from 'react';
import { Upload, Link, X, ImageIcon, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface BannerImageUploaderProps {
  label: string;
  currentImage: string;
  onImageChange: (url: string) => void;
  aspectHint?: string;
}

export function BannerImageUploader({
  label,
  currentImage,
  onImageChange,
  aspectHint = 'Recommended: 1920×600px (wide banner)',
}: BannerImageUploaderProps) {
  const [mode, setMode] = useState<'preview' | 'url' | 'upload'>('preview');
  const [urlInput, setUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 15, 85));
      }, 200);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Upload failed');
      }

      const data = await res.json();
      setUploadProgress(100);

      setTimeout(() => {
        onImageChange(data.url);
        setMode('preview');
        setUploadProgress(0);
        toast.success('Image uploaded successfully');
      }, 400);
    } catch (error: any) {
      toast.error(error.message || 'Upload failed');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        uploadFile(file);
      } else {
        toast.error('Please drop an image file');
      }
    },
    []
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = '';
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) return;
    try {
      new URL(urlInput);
      onImageChange(urlInput.trim());
      setUrlInput('');
      setMode('preview');
      toast.success('Banner image updated');
    } catch {
      toast.error('Please enter a valid URL');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-sm text-gray-900">{label}</p>
          <p className="text-xs text-gray-500 mt-0.5">{aspectHint}</p>
        </div>
        {mode === 'preview' && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode('url')}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-gray-300 hover:border-[#C47456] hover:text-[#C47456] transition-colors"
            >
              <Link className="w-3.5 h-3.5" />
              URL
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-gray-300 hover:border-[#C47456] hover:text-[#C47456] transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload
            </button>
          </div>
        )}
      </div>

      {/* Preview */}
      {mode === 'preview' && (
        <div className="relative w-full h-32 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 group">
          {currentImage ? (
            <>
              <img
                src={currentImage}
                alt={label}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '';
                  e.currentTarget.parentElement!.classList.add('bg-gray-100');
                }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <span className="text-white text-xs font-medium">Click URL or Upload to change</span>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
              <ImageIcon className="w-8 h-8" />
              <span className="text-xs">No image set</span>
            </div>
          )}
        </div>
      )}

      {/* URL Input */}
      {mode === 'url' && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/banner.jpg"
              onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
              autoFocus
              className="flex-1 text-sm"
            />
            <Button size="sm" onClick={handleUrlSubmit} className="bg-[#C47456] hover:bg-[#B36646] shrink-0">
              <Check className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => { setMode('preview'); setUrlInput(''); }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500">Paste a direct image URL (Cloudinary, Pexels, etc.)</p>
        </div>
      )}

      {/* Drop Zone / Upload */}
      {mode !== 'url' && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-lg p-4 transition-all cursor-pointer
            ${isDragging ? 'border-[#C47456] bg-[#C47456]/5 scale-[1.01]' : 'border-gray-200 hover:border-gray-300'}
            ${isUploading ? 'pointer-events-none' : ''}
            ${mode === 'preview' ? 'mt-2' : 'hidden'}
          `}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2 py-2">
              <Loader2 className="w-5 h-5 text-[#C47456] animate-spin" />
              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-[#C47456] transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">Uploading to Cloudinary…</span>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-gray-500">
              <Upload className="w-4 h-4 shrink-0" />
              <span className="text-xs">
                {isDragging ? 'Drop image here' : 'Drag & drop an image, or click to browse'}
              </span>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
}