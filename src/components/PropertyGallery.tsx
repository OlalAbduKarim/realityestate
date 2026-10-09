import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Maximize2, ImageOff, Sparkles } from 'lucide-react';

interface PropertyGalleryProps {
  images: string[];
  title: string;
}

export const PropertyGallery: React.FC<PropertyGalleryProps> = ({ images, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const safeImages = Array.isArray(images) ? images.filter(Boolean).slice(0, 4) : [];

  if (safeImages.length === 0) {
    return (
      <div className="h-[320px] sm:h-[400px] rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex flex-col items-center justify-center text-stone-400 dark:text-stone-500 gap-2">
        <ImageOff className="w-10 h-10" />
        <p className="text-sm font-medium">No property photos uploaded yet</p>
      </div>
    );
  }

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % safeImages.length);
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + safeImages.length) % safeImages.length);
  };

  const secondaryImages = safeImages.slice(1, 4);

  return (
    <div className="space-y-3">
      {/* Main Gallery Grid (Desktop) & Carousel (Mobile) */}
      <div className="relative rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800">
        {/* Desktop Layout: Dynamically tailored for 1, 2, 3, or 4 uploaded images */}
        {safeImages.length === 1 && (
          <div
            className="hidden md:block relative h-[460px] group cursor-pointer overflow-hidden"
            onClick={() => {
              setCurrentIndex(0);
              setIsLightboxOpen(true);
            }}
          >
            <img
              src={safeImages[0]}
              alt={`${title} - Main Photo`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-stone-900/80 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Main Listing Photo</span>
            </span>
          </div>
        )}

        {safeImages.length === 2 && (
          <div className="hidden md:grid grid-cols-2 gap-2 h-[460px]">
            {safeImages.map((img, idx) => (
              <div
                key={idx}
                className="relative group cursor-pointer overflow-hidden"
                onClick={() => {
                  setCurrentIndex(idx);
                  setIsLightboxOpen(true);
                }}
              >
                <img
                  src={img}
                  alt={`${title} - Photo ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-stone-900/75 backdrop-blur-md text-white text-xs font-medium">
                  {idx === 0 ? 'Main Photo' : `Photo ${idx + 1}`}
                </span>
              </div>
            ))}
          </div>
        )}

        {safeImages.length === 3 && (
          <div className="hidden md:grid grid-cols-3 grid-rows-2 gap-2 h-[460px]">
            <div
              className="col-span-2 row-span-2 relative group cursor-pointer overflow-hidden"
              onClick={() => {
                setCurrentIndex(0);
                setIsLightboxOpen(true);
              }}
            >
              <img
                src={safeImages[0]}
                alt={`${title} - Main Photo`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-stone-900/80 backdrop-blur-md text-white text-xs font-semibold">
                Main Photo (1 of 3)
              </span>
            </div>
            {secondaryImages.map((img, idx) => (
              <div
                key={idx}
                className="relative group cursor-pointer overflow-hidden"
                onClick={() => {
                  setCurrentIndex(idx + 1);
                  setIsLightboxOpen(true);
                }}
              >
                <img
                  src={img}
                  alt={`${title} - Photo ${idx + 2}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded bg-black/65 text-white text-[11px] font-medium">
                  Photo {idx + 2}
                </span>
              </div>
            ))}
          </div>
        )}

        {safeImages.length >= 4 && (
          <div className="hidden md:grid grid-cols-12 gap-2 h-[480px]">
            {/* Main Cover Photo (Left 7 Columns) */}
            <div
              className="col-span-7 relative group cursor-pointer overflow-hidden"
              onClick={() => {
                setCurrentIndex(0);
                setIsLightboxOpen(true);
              }}
            >
              <img
                src={safeImages[0]}
                alt={`${title} - Main Photo`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-stone-900/80 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Main Photo (1 of 4)</span>
              </span>
            </div>

            {/* Additional 3 Detail Photos (Right 5 Columns: 1 Top + 2 Bottom) */}
            <div className="col-span-5 grid grid-rows-2 gap-2 h-full">
              <div
                className="relative group cursor-pointer overflow-hidden"
                onClick={() => {
                  setCurrentIndex(1);
                  setIsLightboxOpen(true);
                }}
              >
                <img
                  src={safeImages[1]}
                  alt={`${title} - Photo 2`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded bg-black/65 text-white text-[11px] font-medium">
                  Photo 2 of 4
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 h-full">
                {[safeImages[2], safeImages[3]].map((img, idx) => (
                  <div
                    key={idx}
                    className="relative group cursor-pointer overflow-hidden"
                    onClick={() => {
                      setCurrentIndex(idx + 2);
                      setIsLightboxOpen(true);
                    }}
                  >
                    <img
                      src={img}
                      alt={`${title} - Photo ${idx + 3}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded bg-black/65 text-white text-[11px] font-medium">
                      Photo {idx + 3} of 4
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Carousel */}
        <div
          className="md:hidden relative aspect-[4/3] w-full"
          onClick={() => setIsLightboxOpen(true)}
        >
          <img
            src={safeImages[currentIndex]}
            alt={`${title} - ${currentIndex + 1}`}
            className="w-full h-full object-cover"
          />

          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-stone-900/80 backdrop-blur-md text-white text-xs font-medium">
            {currentIndex === 0 ? 'Main Photo' : `Photo ${currentIndex + 1}`}
          </span>

          {safeImages.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 dark:bg-stone-900/80 backdrop-blur-md flex items-center justify-center text-stone-900 dark:text-white shadow-sm"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 dark:bg-stone-900/80 backdrop-blur-md flex items-center justify-center text-stone-900 dark:text-white shadow-sm"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-medium">
            {currentIndex + 1} / {safeImages.length}
          </div>
        </div>

        {/* View All Photos Button (Desktop) */}
        <button
          onClick={() => setIsLightboxOpen(true)}
          className="hidden md:flex absolute bottom-4 right-4 px-4 py-2 bg-white/95 dark:bg-stone-900/95 hover:bg-white dark:hover:bg-stone-900 text-stone-900 dark:text-white rounded-xl font-medium text-xs shadow-md backdrop-blur-md items-center gap-2 transition-all cursor-pointer"
        >
          <Maximize2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>
            View {safeImages.length === 1 ? 'Full Photo' : `All ${safeImages.length} Photos`}
          </span>
        </button>
      </div>

      {/* Quick Thumbnail Bar when multiple images exist */}
      {safeImages.length > 1 && (
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
          {safeImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setCurrentIndex(idx);
                setIsLightboxOpen(true);
              }}
              className={`relative h-16 w-24 sm:h-20 sm:w-32 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                currentIndex === idx
                  ? 'border-emerald-600 dark:border-emerald-400 shadow-sm'
                  : 'border-stone-200 dark:border-stone-800 opacity-85 hover:opacity-100'
              }`}
            >
              <img
                src={img}
                alt={`${title} thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-white text-[10px] font-semibold">
                {idx === 0 ? 'Main' : `#${idx + 1}`}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 md:p-8">
          <div className="flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">
                {currentIndex === 0 ? 'Main Photo' : `Photo ${currentIndex + 1}`} ({currentIndex + 1} of {safeImages.length})
              </span>
            </div>
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
            <img
              src={safeImages[currentIndex]}
              alt={`${title} - Fullscreen`}
              className="max-h-full max-w-full object-contain rounded-lg"
            />

            {safeImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 md:left-8 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 md:right-8 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          <div className="flex justify-center gap-2.5 overflow-x-auto py-2">
            {safeImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`relative w-20 h-14 rounded-lg overflow-hidden shrink-0 transition-all cursor-pointer ${
                  currentIndex === idx
                    ? 'ring-2 ring-emerald-400 opacity-100'
                    : 'opacity-50 hover:opacity-80'
                }`}
              >
                <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                <span className="absolute bottom-0.5 left-1 px-1 rounded bg-black/70 text-white text-[9px] font-medium">
                  {idx === 0 ? 'Main' : `#${idx + 1}`}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
