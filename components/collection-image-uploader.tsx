import React, { useState, useCallback } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface CollectionImageUploaderProps {
  imageUrl: string;
  onImageChange: (url: string) => void;
}

export default function CollectionImageUploader({
  imageUrl,
  onImageChange,
}: CollectionImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const uploadImage = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');

      const data = await res.json();
      return data.url;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    }
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert(`${file.name} is not an image`);
      return;
    }

    setUploading(true);
    const url = await uploadImage(file);
    if (url) {
      onImageChange(url);
    }
    setUploading(false);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const removeImage = () => {
    onImageChange('');
  };

  return (
    <div className="space-y-4">
      {!imageUrl ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive ? 'border-[#C47456] bg-[#C47456]/5' : 'border-gray-300'
          }`}
        >
          <input
            type="file"
            id="collection-image-upload"
            accept="image/*"
            onChange={(e) => e.target.files && handleFile(e.target.files[0])}
            className="hidden"
            disabled={uploading}
          />
          <label htmlFor="collection-image-upload" className="cursor-pointer">
            <div className="flex flex-col items-center gap-2">
              {uploading ? (
                <Loader2 className="w-12 h-12 text-gray-400 animate-spin" />
              ) : (
                <Upload className="w-12 h-12 text-gray-400" />
              )}
              <p className="text-sm text-gray-600">
                {uploading ? 'Uploading...' : 'Drag & drop image or click to browse'}
              </p>
              <p className="text-xs text-gray-400">
                PNG, JPG, WEBP up to 10MB
              </p>
            </div>
          </label>
        </div>
      ) : (
        <div className="relative aspect-video w-full rounded-lg overflow-hidden border-2 border-gray-200">
          <Image
            src={imageUrl}
            alt="Collection preview"
            fill
            className="object-cover"
          />
          <button
            onClick={removeImage}
            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}