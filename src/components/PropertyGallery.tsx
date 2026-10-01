import React, { useState, useEffect } from 'react';
import { 
  Maximize2, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  FileText, 
  Image as ImageIcon,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

interface PropertyGalleryProps {
  images: string[];
  title: string;
  floorPlanUrl?: string;
  videoUrl?: string;
}

export const PropertyGallery: React.FC<PropertyGalleryProps> = ({
  images,
  title,
  floorPlanUrl
}) => {
  const [activeTab, setActiveTab] = useState<'photos' | 'floorplan' | 'video'>('photos');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  const displayImages = images.length > 0 ? images : ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'];

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % displayImages.length);
  };

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + displayImages.length) % displayImages.length);
  };

  // Keyboard navigation for fullscreen lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFullscreen) return;
      if (e.key === 'Escape') setIsFullscreen(false);
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, displayImages.length]);

  return (
    <div className="space-y-3">
      
      {/* Media Type Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-lg transition-colors">
          <button
            type="button"
            onClick={() => setActiveTab('photos')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'photos' 
                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs' 
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Photos ({displayImages.length})</span>
          </button>

          {floorPlanUrl && (
            <button
              type="button"
              onClick={() => setActiveTab('floorplan')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'floorplan' 
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs' 
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Floor Plan</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('video')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'video' 
                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs' 
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Virtual Tour</span>
          </button>
        </div>

        {/* Counter and Fullscreen Button */}
        {activeTab === 'photos' && (
          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Fullscreen</span>
          </button>
        )}
      </div>

      {/* Main View Area */}
      {activeTab === 'photos' && (
        <div className="space-y-2">
          {/* Main Hero Viewport */}
          <div className="relative aspect-16/9 sm:aspect-16/10 rounded-xl overflow-hidden bg-stone-900 group">
            <img
              src={displayImages[currentIndex]}
              alt={`${title} - Photo ${currentIndex + 1}`}
              className="w-full h-full object-cover transition-opacity duration-200"
            />

            {/* Left / Right Nav Arrows */}
            {displayImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-stone-900/60 hover:bg-stone-900/90 text-white flex items-center justify-center transition-colors shadow-md backdrop-blur-xs"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-stone-900/60 hover:bg-stone-900/90 text-white flex items-center justify-center transition-colors shadow-md backdrop-blur-xs"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Image Counter Badge */}
            <div className="absolute bottom-3 right-3 bg-stone-900/75 backdrop-blur-xs text-white text-xs font-semibold px-2.5 py-1 rounded-md tabular-nums">
              {currentIndex + 1} / {displayImages.length}
            </div>
          </div>

          {/* Thumbnail Rail */}
          {displayImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {displayImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`relative w-20 h-14 sm:w-24 sm:h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                    currentIndex === idx ? 'border-stone-900 dark:border-stone-100 ring-2 ring-stone-900/20 dark:ring-white/20' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Floor Plan View */}
      {activeTab === 'floorplan' && (
        <div className="relative aspect-16/10 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md space-y-3">
            <div className="w-12 h-12 bg-white dark:bg-stone-700 rounded-xl shadow-xs border border-stone-200 dark:border-stone-600 flex items-center justify-center mx-auto text-stone-700 dark:text-stone-200">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-stone-900 dark:text-white">Architectural Cadastral Layout</h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
              Standardized architectural floor schematic approved for construction. Physical dimensions and room demarcations are on file with the verified listing dossier.
            </p>
            <div className="pt-2">
              <span className="inline-block text-[11px] bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 px-3 py-1.5 rounded-lg text-stone-700 dark:text-stone-200 font-mono">
                CAD-REF: RE-UG-{title.slice(0, 4).toUpperCase()}-2026
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Video / Virtual Tour View */}
      {activeTab === 'video' && (
        <div className="relative aspect-16/9 rounded-xl overflow-hidden bg-stone-900 text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:scale-105 transition-transform cursor-pointer mb-3">
            <Play className="w-7 h-7 text-white fill-white ml-0.5" />
          </div>
          <h4 className="text-base font-serif font-bold">HD Virtual Walkthrough Available</h4>
          <p className="text-xs text-stone-300 max-w-sm mt-1">
            Recorded 4K drone cinematography and interior steady-cam walkthrough. Request viewing to receive complete private uncompressed video reel.
          </p>
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-between p-4 sm:p-6 animate-in fade-in"
          onClick={() => setIsFullscreen(false)}
        >
          {/* Top Bar */}
          <div className="w-full flex items-center justify-between text-white z-10" onClick={e => e.stopPropagation()}>
            <span className="text-xs font-semibold tabular-nums text-stone-300">
              {currentIndex + 1} of {displayImages.length} · {title}
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsZoomed(!isZoomed)}
                className="p-2 text-stone-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                title={isZoomed ? 'Zoom Out' : 'Zoom In'}
              >
                {isZoomed ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
              </button>
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="p-2 text-stone-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                title="Close (Esc)"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Main Zoomable Image */}
          <div 
            className="flex-1 w-full flex items-center justify-center overflow-auto p-2"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={displayImages[currentIndex]}
              alt={title}
              className={`max-h-[82vh] max-w-[95vw] object-contain transition-transform duration-200 select-none ${
                isZoomed ? 'scale-150 cursor-grab' : 'scale-100'
              }`}
            />
          </div>

          {/* Bottom Navigation */}
          <div className="w-full flex items-center justify-center gap-4 text-white z-10" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              onClick={handlePrev}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <span className="text-xs text-stone-300 font-medium tabular-nums">
              Use arrow keys to navigate
            </span>
            <button
              type="button"
              onClick={handleNext}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
