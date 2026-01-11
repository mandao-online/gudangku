import { Package, RotateCcw, Trash2, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Item } from '@/types';
import { cn } from '@/lib/utils';
import { ImageZoomModal } from './ImageZoomModal';
import { useState } from 'react';

interface TrashedItemCardProps {
  item: Item;
  onRestore: (item: Item) => void;
  onForceDelete: (item: Item) => void;
}

export function TrashedItemCard({ item, onRestore, onForceDelete }: TrashedItemCardProps) {
  const [showImageZoom, setShowImageZoom] = useState(false);

  const handleImageClick = () => {
    if (item.image_url) {
      setShowImageZoom(true);
    }
  };

  const formatDeletedDate = (deletedAt: string) => {
    const date = new Date(deletedAt);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-card rounded-xl p-4 shadow-card animate-fade-in border-l-4 border-l-destructive/50">
      <div className="flex items-start gap-3">
        <div 
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden relative group bg-muted",
            item.image_url ? "cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all" : ""
          )}
          onClick={handleImageClick}
        >
          {item.image_url ? (
            <>
              <img 
                src={item.image_url} 
                alt={item.name}
                className="w-full h-full object-cover transition-transform group-hover:scale-110 opacity-60"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <ZoomIn className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </>
          ) : (
            <Package className="w-6 h-6 text-muted-foreground" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-muted-foreground truncate">{item.name}</h3>
              <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-lg font-bold text-muted-foreground">
                  {item.stock}
                </span>
                <span className="text-sm text-muted-foreground">{item.unit}</span>
              </div>
              {item.deleted_at && (
                <p className="text-xs text-destructive mt-1">
                  Dihapus: {formatDeletedDate(item.deleted_at)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 border-green-200 text-green-700 hover:bg-green-50"
          onClick={() => onRestore(item)}
        >
          <RotateCcw className="w-4 h-4" />
          Pulihkan
        </Button>
        <Button 
          variant="destructive" 
          size="sm" 
          className="flex-1"
          onClick={() => onForceDelete(item)}
        >
          <Trash2 className="w-4 h-4" />
          Hapus Permanen
        </Button>
      </div>

      {/* Image Zoom Modal */}
      {item.image_url && (
        <ImageZoomModal
          open={showImageZoom}
          onClose={() => setShowImageZoom(false)}
          imageUrl={item.image_url}
          imageName={`${item.name} - ${item.sku} (Dihapus)`}
          imageAlt={`Gambar ${item.name} (Dihapus)`}
        />
      )}
    </div>
  );
}