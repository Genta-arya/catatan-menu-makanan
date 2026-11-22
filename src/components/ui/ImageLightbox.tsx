import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

interface ImageLightboxProps {
  isOpen: boolean;
  images: string[];
  initialIndex?: number;
  title?: string;
  onClose: () => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  isOpen,
  images,
  initialIndex = 0,
  title,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Sync index when modal opens with a specific image
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex >= 0 && initialIndex < images.length ? initialIndex : 0);
    }
  }, [isOpen, initialIndex, images]);

  // Keyboard navigation (Arrow keys + Escape)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
      }
    };

    // Lock body scrolling when modal is active
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, images.length, onClose]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex] || images[0];
  const hasMultiple = images.length > 1;

  const goToPrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const goToNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6 animate-fadeIn select-none"
    >
      {/* Top Header Bar */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex items-center justify-between w-full max-w-6xl mx-auto z-10 py-1"
      >
        <div className="flex items-center gap-3">
          <div className="bg-white/10 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-md border border-white/20">
            {currentIndex + 1} / {images.length}
          </div>
          {title && (
            <h3 className="text-white text-sm sm:text-base font-semibold truncate max-w-[200px] sm:max-w-md drop-shadow">
              {title}
            </h3>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-95 border border-white/20 cursor-pointer shadow-lg"
          title="Tutup (Esc)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Image Stage */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex-1 flex items-center justify-center w-full max-w-6xl mx-auto my-2 overflow-hidden"
      >
        {/* Previous Button */}
        {hasMultiple && (
          <button
            type="button"
            onClick={goToPrev}
            className="absolute left-2 sm:left-4 z-20 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-95 border border-white/20 shadow-2xl cursor-pointer"
            title="Foto Sebelumnya (Panah Kiri)"
          >
            <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>
        )}

        {/* Center Image */}
        <div className="relative max-h-[75vh] max-w-[92vw] flex items-center justify-center">
          <img
            src={currentImage}
            alt={title || `Foto ${currentIndex + 1}`}
            className="max-h-[75vh] max-w-[92vw] object-contain rounded-2xl shadow-2xl transition-all duration-300"
          />
        </div>

        {/* Next Button */}
        {hasMultiple && (
          <button
            type="button"
            onClick={goToNext}
            className="absolute right-2 sm:right-4 z-20 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-95 border border-white/20 shadow-2xl cursor-pointer"
            title="Foto Selanjutnya (Panah Kanan)"
          >
            <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>
        )}
      </div>

      {/* Bottom Thumbnail Gallery Strip */}
      {hasMultiple && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-xl mx-auto z-10 py-1"
        >
          <div className="flex items-center justify-center gap-2 overflow-x-auto p-2 bg-black/40 rounded-2xl backdrop-blur-md border border-white/10 max-w-full">
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                  idx === currentIndex
                    ? 'border-white scale-105 shadow-md shadow-white/20'
                    : 'border-transparent opacity-50 hover:opacity-100 hover:scale-100'
                }`}
              >
                <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
