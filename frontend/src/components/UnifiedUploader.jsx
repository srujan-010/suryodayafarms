import React, { useState, useEffect, useRef } from 'react';
import { FiUploadCloud, FiTrash2, FiImage, FiCheckCircle, FiAlertCircle, FiDatabase, FiCrop } from 'react-icons/fi';
import api from '../utils/api';
import ImageCropper from '../admin/components/ImageCropper';

import { useFeedbackStore } from '../store/useFeedbackStore';

export default function UnifiedUploader({
  value,
  onChange,
  label,
  aspectRatio = 1, // default 1:1 square
  folder = 'general',
  maxSizeMB = 10,
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
  className = ''
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [isDragActive, setIsDragActive] = useState(false);
  
  // Crop modal states
  const [cropSrc, setCropSrc] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  
  // Media library states
  const [showLibrary, setShowLibrary] = useState(false);
  const [mediaHistory, setMediaHistory] = useState([]);
  
  const fileInputRef = useRef(null);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('suryodaya_media_history');
      if (savedHistory) {
        setMediaHistory(JSON.parse(savedHistory));
      }
    } catch (err) {
      console.error('Failed to load media history:', err);
    }
  }, []);

  // Save url to local history
  const saveToHistory = (url) => {
    try {
      const history = [...mediaHistory];
      if (!history.includes(url)) {
        const updated = [url, ...history].slice(0, 15); // keep last 15 uploads
        setMediaHistory(updated);
        localStorage.setItem('suryodaya_media_history', JSON.stringify(updated));
      }
    } catch (err) {
      console.error('Failed to save to history:', err);
    }
  };

  // Drag and Drop Handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // File Processing & Validation
  const processFile = (file) => {
    setErrorMessage('');
    
    // Type validation
    if (!allowedTypes.includes(file.type)) {
      setErrorMessage(`Format not supported. Please use JPG, PNG, WEBP, or AVIF.`);
      return;
    }

    // Size validation
    if (file.size > maxSizeMB * 1024 * 1024) {
      setErrorMessage(`File too large. Maximum size is ${maxSizeMB}MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setCropSrc(event.target.result);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  // Upload cropped base64 to server
  const uploadImage = async (base64String) => {
    setIsUploading(true);
    setProgress(20);
    setErrorMessage('');
    useFeedbackStore.getState().showLoader('Uploading image... 20%');
    
    try {
      setProgress(50);
      useFeedbackStore.getState().showLoader('Uploading image... 50%');
      const response = await api.post('/auth/upload-cloudinary', {
        image: base64String,
        folder: folder
      });
      
      setProgress(90);
      useFeedbackStore.getState().showLoader('Uploading image... 90%');
      if (response.success && response.url) {
        onChange(response.url);
        saveToHistory(response.url);
        setProgress(100);
        useFeedbackStore.getState().showLoader('Uploading image... 100%');
        setTimeout(() => setProgress(0), 1500);
        useFeedbackStore.getState().hideLoader();
        useFeedbackStore.getState().showToast('✅ Image uploaded successfully', 'success');
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (err) {
      useFeedbackStore.getState().hideLoader();
      setErrorMessage(err.message || 'Error uploading image. Please try again.');
      setProgress(0);
      useFeedbackStore.getState().showToast(`❌ Upload failed: ${err.message}`, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCropComplete = (cropData) => {
    setShowCropper(false);
    if (cropData.croppedImage) {
      uploadImage(cropData.croppedImage);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className={`w-full flex flex-col gap-2.5 ${className}`}>
      {label && (
        <label className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400 text-left">
          {label}
        </label>
      )}

      {/* Main Upload Area / Drop Zone */}
      <div 
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 min-h-[140px] select-none ${
          isDragActive 
            ? 'border-[#4E641A] bg-[#4E641A]/5' 
            : value 
              ? 'border-[#EDE7D9] bg-[#FDFBF7]' 
              : 'border-stone-200 hover:border-[#4E641A] hover:bg-[#FDFBF7]'
        } ${isUploading ? 'opacity-70 cursor-not-allowed pointer-events-none' : ''}`}
      >
        <input 
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-2 animate-pulse">
            <FiUploadCloud className="text-[#4E641A] text-3xl animate-bounce" />
            <span className="text-[10px] font-bold text-[#4E641A] uppercase tracking-wider">Uploading your harvest...</span>
            <div className="w-40 bg-stone-150 h-1 rounded-full overflow-hidden mt-1">
              <div 
                className="bg-[#4E641A] h-full transition-all duration-200" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : value ? (
          /* Preview state */
          <div className="relative group w-full flex flex-col items-center gap-3">
            <div className="relative rounded-xl overflow-hidden border border-[#EDE7D9] bg-stone-50 max-h-36 max-w-full flex items-center justify-center shadow-xxs">
              <img 
                src={value} 
                alt="Upload preview" 
                className="object-contain max-h-32 rounded-xl"
              />
              <div className="absolute inset-0 bg-[#0E1204]/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition duration-200 rounded-xl">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCropSrc(value);
                    setShowCropper(true);
                  }}
                  className="p-2 bg-white hover:bg-[#F9F6F0] rounded-full text-[#4E641A] shadow-md transition border-none cursor-pointer flex items-center justify-center"
                  title="Recrop Image"
                >
                  <FiCrop size={14} />
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="p-2 bg-white hover:bg-red-50 rounded-full text-red-650 shadow-md transition border-none cursor-pointer flex items-center justify-center"
                  title="Remove Image"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5 text-[9px] font-extrabold text-[#4E641A] uppercase tracking-wide bg-[#4E641A]/5 px-2.5 py-1 rounded-full border border-[#4E641A]/10">
              <FiCheckCircle /> Uploaded & Optimized
            </div>
          </div>
        ) : (
          /* Upload prompt state */
          <div className="flex flex-col items-center gap-2 text-stone-500">
            <FiUploadCloud size={32} className="text-stone-300 group-hover:text-[#4E641A] transition" />
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#37411A]">Drag & drop photo here</p>
              <p className="text-[9px] text-stone-400">or click to browse from device</p>
            </div>
            <p className="text-[8px] text-stone-400 font-medium">JPEG, PNG, WEBP, or AVIF (Max {maxSizeMB}MB)</p>
          </div>
        )}
      </div>

      {/* Error displays */}
      {errorMessage && (
        <div className="flex items-center gap-1.5 text-[9px] font-bold text-red-655 bg-red-50 p-2.5 rounded-xl border border-red-100 text-left">
          <FiAlertCircle className="shrink-0 text-red-400 text-xs" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Media Library History Trigger & panel */}
      {mediaHistory.length > 0 && (
        <div className="mt-0.5 flex flex-col text-left">
          <button
            type="button"
            onClick={() => setShowLibrary(!showLibrary)}
            className="flex items-center gap-1 text-[8px] font-extrabold uppercase tracking-wider text-stone-400 hover:text-[#4E641A] transition border-none bg-transparent cursor-pointer py-1 self-start select-none"
          >
            <FiDatabase size={10} />
            <span>{showLibrary ? 'Hide Library history' : 'Choose from Uploaded library'}</span>
          </button>
          
          {showLibrary && (
            <div className="grid grid-cols-5 gap-2 bg-[#FDFBF7] border border-[#EDE7D9] rounded-xl p-3 mt-1.5 max-h-28 overflow-y-auto custom-scroll animate-fade-in">
              {mediaHistory.map((url, idx) => (
                <div 
                  key={idx}
                  onClick={() => onChange(url)}
                  className={`relative aspect-square rounded-lg border overflow-hidden cursor-pointer bg-white transition hover:scale-105 ${
                    value === url ? 'border-[#4E641A] ring-2 ring-[#4E641A]/10' : 'border-stone-200 hover:border-[#B8833E]'
                  }`}
                >
                  <img src={url} alt="Library history item" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Interactive Crop boundaries modal */}
      {showCropper && cropSrc && (
        <ImageCropper
          imageSrc={cropSrc}
          onCropComplete={handleCropComplete}
          onCancel={() => setShowCropper(false)}
          targetAspect={aspectRatio}
        />
      )}
    </div>
  );
}
