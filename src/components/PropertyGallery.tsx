import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Maximize2, ImageOff } from 'lucide-react';

interface PropertyGalleryProps {
  images: string[];
  title: string;
}

export const PropertyGallery: React.FC<PropertyGalleryProps> = ({ images, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const safeImages = Array.isArray(images) ? images.filter(Boolean) : [];

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

  return (
    <>
      {/* Main Gallery Grid (Desktop) & Carousel (Mobile) */}
      <div className="relative rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-900">
        {/* Desktop Grid */}
        <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-2 h-[480px]">
          <div
            className="col-span-2 row-span-2 relative group cursor-pointer overflow-hidden"
            onClick={() => {
              setCurrentIndex(0);
              setIsLightboxOpen(true);
            }}
          >
            <img
              src={safeImages[0]}
              alt={`${title} - Main`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </div>

          {safeImages.slice(1, 5).map((img, idx) => (
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
                alt={`${title} - ${idx + 2}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              {idx === 3 && safeImages.length > 5 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-semibold text-lg backdrop-blur-[2px]">
                  +{safeImages.length - 5} more
                </div>
              )}
            </div>
          ))}

          {/* Fill empty slots if less than 5 images */}
          {safeImages.length < 5 &&
            Array.from({ length: 5 - safeImages.length }).map((_, idx) => (
              <div
                key={`empty-${idx}`}
                className="bg-stone-200/50 dark:bg-stone-800/50 flex items-center justify-center text-stone-400 dark:text-stone-600 text-sm"
              >
                Reality Estates
              </div>
            ))}
        </div>

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
          className="hidden md:flex absolute bottom-4 right-4 px-4 py-2 bg-white/90 dark:bg-stone-900/90 hover:bg-white dark:hover:bg-stone-900 text-stone-900 dark:text-white rounded-xl font-medium text-sm shadow-md backdrop-blur-md items-center gap-2 transition-all"
        >
          <Maximize2 className="w-4 h-4" />
          View all {safeImages.length} photos
        </button>
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 md:p-8">
          <div className="flex justify-between items-center text-white">
            <span className="text-sm font-medium">
              {currentIndex + 1} of {safeImages.length}
            </span>
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
            <img
              src={safeImages[currentIndex]}
              alt={`${title} - Fullscreen`}
              className="max-h-full max-w-full object-contain"
            />

            {safeImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 md:left-8 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 md:right-8 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          <div className="flex justify-center gap-2 overflow-x-auto py-2">
            {safeImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`relative w-16 h-12 rounded-lg overflow-hidden shrink-0 transition-all ${
                  currentIndex === idx
                    ? 'ring-2 ring-white opacity-100'
                    : 'opacity-50 hover:opacity-80'
                }`}
              >
                <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
