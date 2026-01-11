import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageZoomModalProps {
  open: boolean;
  onClose: () => void;
  imageUrl: string;
  imageName?: string;
  imageAlt?: string;
}

export function ImageZoomModal({ 
  open, 
  onClose, 
  imageUrl, 
  imageName = 'Image',
  imageAlt = 'Zoomed image'
}: ImageZoomModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (open) {
      setIsLoading(true);
    }
  }, [open]);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!open) return;
    
    if (e.key === 'Escape') {
      onClose();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[100vw] max-h-[100vh] w-full h-full p-0 bg-black/95 border-none overflow-hidden">
        {/* Close Button */}
        <div className="absolute top-4 right-4 z-10">
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="bg-black/50 hover:bg-black/70 text-white border-white/20 h-9 w-9"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Image Container */}
        <div 
          ref={containerRef}
          className="w-full h-full flex items-center justify-center overflow-hidden"
          onClick={(e) => {
            // Close modal when clicking outside the image
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          )}
          
          <img
            ref={imageRef}
            src={imageUrl}
            alt={imageAlt}
            onLoad={handleImageLoad}
            className="max-w-full max-h-full object-contain select-none"
            draggable={false}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}