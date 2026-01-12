"use client";

import { useState, useRef } from "react";
import { Upload, Image as ImageIcon, X, Loader2 } from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";
import { toastManager } from "@/lib/toast-manager";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function ImageUploader({
  value,
  onChange,
  label = "Image",
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadMode, setUploadMode] = useState<"url" | "upload">("url");
  const urlInputRef = useRef<HTMLInputElement>(null);


  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "zaid agency";
  
  const isCloudinaryConfigured = !!cloudName;

  const handleUploadSuccess = (result: any) => {
    if (result?.info?.secure_url) {
      onChange(result.info.secure_url);
      setUploading(false);
      toastManager.success("Image uploaded successfully! ✨");
    }
  };

  const handleUploadError = () => {
    setUploading(false);
    toastManager.error("Image upload failed 😢");
  };

  const handleUrlPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData("text");
    if (pastedText.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)/i)) {
      onChange(pastedText);
      toastManager.success("Image URL pasted! ✨");
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-xs font-bold text-slate-400 uppercase ml-2 mb-1">
        {label}
      </label>

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-3">
        <button
          type="button"
          onClick={() => setUploadMode("url")}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-colors ${
            uploadMode === "url"
              ? "bg-emerald-600 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <ImageIcon size={14} className="inline mr-1" />
          Paste URL
        </button>
        <button
          type="button"
          onClick={() => setUploadMode("upload")}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-colors ${
            uploadMode === "upload"
              ? "bg-emerald-600 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Upload size={14} className="inline mr-1" />
          Upload
        </button>
      </div>

      {/* URL Input Mode */}
      {uploadMode === "url" && (
        <div className="relative">
          <input
            ref={urlInputRef}
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onPaste={handleUrlPaste}
            placeholder="https://example.com/image.jpg or paste image URL"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 pr-10"
          />
          {value && (
            <button
              type="button"
              onClick={() => {
                onChange("");
                urlInputRef.current?.focus();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-red-500 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      )}

      {/* Cloudinary Upload Mode */}
      {uploadMode === "upload" && (
        <div>
          {!isCloudinaryConfigured ? (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl px-4 py-6 text-center">
              <p className="text-sm font-bold text-yellow-800 mb-2">
                Cloudinary not configured
              </p>
              <p className="text-xs text-yellow-600">
                Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME in your .env file
              </p>
              <p className="text-xs text-slate-500 mt-2">
                You can still use "Paste URL" mode to add images
              </p>
            </div>
          ) : (
            <CldUploadWidget
              {...(uploadPreset ? { uploadPreset } : {})}
              onSuccess={handleUploadSuccess}
              onError={handleUploadError}
              onOpen={() => setUploading(true)}
              options={{
                maxFiles: 1,
                maxFileSize: 10000000, // 10MB
                resourceType: "image",
              }}
            >
              {({ open }) => (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => open()}
                    disabled={uploading}
                    className="w-full bg-emerald-50 border-2 border-dashed border-emerald-300 rounded-xl px-4 py-6 text-emerald-700 font-bold hover:bg-emerald-100 transition-colors flex flex-col items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {uploading ? (
                      <>
                        <Loader2 size={24} className="animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={24} />
                        <span>Click to Upload Image</span>
                        <span className="text-xs font-normal text-slate-500">
                          JPG, PNG, GIF, WEBP (Max 10MB)
                        </span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </CldUploadWidget>
          )}
        </div>
      )}

      {/* Image Preview */}
      {value && (
        <div className="relative mt-3">
          <div className="relative w-full h-48 bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-contain"
              onError={() => {
                toastManager.error("Failed to load image. Please check the URL.");
              }}
            />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-2 text-center">
            {uploadMode === "url" ? "Image URL" : "Uploaded Image"}
          </p>
        </div>
      )}
    </div>
  );
}
