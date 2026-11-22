import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

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
  const [mounted, setMounted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync index when modal opens with a specific image
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex >= 0 && initialIndex < images.length ? initialIndex : 0);
      setIsZoomed(false);
    }
  }, [isOpen, initialIndex, images]);

  // Reset zoom when navigating
  const goToPrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsZoomed(false);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const goToNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsZoomed(false);
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  // Keyboard navigation (Arrow keys + Escape)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        goToPrev();
      } else if (e.key === 'ArrowRight') {
        goToNext();
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

  if (!mounted || !isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex] || images[0];
  const hasMultiple = images.length > 1;

  const modalContent = (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[99999] w-screen h-screen h-[100dvh] bg-black/95 backdrop-blur-xl flex flex-col justify-between select-none overflow-hidden animate-fadeIn"
      style={{
        paddingTop: 'max(env(safe-area-inset-top, 14px), 14px)',
        paddingBottom: 'max(env(safe-area-inset-bottom, 14px), 14px)',
        paddingLeft: 'max(env(safe-area-inset-left, 12px), 12px)',
        paddingRight: 'max(env(safe-area-inset-right, 12px), 12px)',
      }}
    >
      {/* Top Header Bar */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex items-center justify-between w-full max-w-6xl mx-auto z-20 px-2 py-1"
      >
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-md border border-white/20 shrink-0">
            {currentIndex + 1} / {images.length}
          </div>
          {title && (
            <h3 className="text-white text-xs sm:text-base font-semibold truncate drop-shadow max-w-[200px] sm:max-w-md">
              {title}
            </h3>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom toggle button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsZoomed(!isZoomed);
            }}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-95 border border-white/20 cursor-pointer shadow-lg"
            title={isZoomed ? 'Perkecil' : 'Perbesar'}
          >
            {isZoomed ? <ZoomOut className="w-4 h-4 sm:w-5 sm:h-5" /> : <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-95 border border-white/20 cursor-pointer shadow-lg"
            title="Tutup (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex-1 w-full max-w-6xl mx-auto flex items-center justify-center my-1 overflow-hidden min-h-0 min-w-0"
      >
        {/* Previous Button */}
        {hasMultiple && (
          <button
            type="button"
            onClick={goToPrev}
            className="absolute left-2 sm:left-4 z-30 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-95 border border-white/20 shadow-2xl cursor-pointer"
            title="Foto Sebelumnya (Panah Kiri)"
          >
            <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>
        )}

        {/* Center Image Container - rock-solid for iOS Safari aspect ratios */}
        <div
          className={`relative w-full h-full flex items-center justify-center overflow-auto p-2 transition-transform duration-300 ${
            isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
          }`}
          onClick={() => setIsZoomed(!isZoomed)}
        >
          <img
            src={currentImage}
            alt={title || `Foto ${currentIndex + 1}`}
            className={`w-auto h-auto object-contain rounded-2xl shadow-2xl transition-all duration-300 select-none ${
              isZoomed ? 'scale-125 sm:scale-150 max-h-none max-w-none' : 'max-h-full max-w-full'
            }`}
            style={
              !isZoomed
                ? {
                    maxHeight: 'calc(100dvh - 160px)',
                    maxWidth: 'min(94vw, 1100px)',
                  }
                : undefined
            }
          />
        </div>

        {/* Next Button */}
        {hasMultiple && (
          <button
            type="button"
            onClick={goToNext}
            className="absolute right-2 sm:right-4 z-30 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-95 border border-white/20 shadow-2xl cursor-pointer"
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
          className="w-full max-w-xl mx-auto z-20 py-1"
        >
          <div className="flex items-center justify-center gap-2 overflow-x-auto p-1.5 sm:p-2 bg-black/50 rounded-2xl backdrop-blur-md border border-white/10 max-w-full">
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setIsZoomed(false);
                  setCurrentIndex(idx);
                }}
                className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                  idx === currentIndex
                    ? 'border-white scale-105 shadow-md shadow-white/30'
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

  return createPortal(modalContent, document.body);
};
