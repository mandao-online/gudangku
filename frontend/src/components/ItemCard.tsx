import { Package, ArrowDownCircle, ArrowUpCircle, MoreVertical, Edit, Trash2, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Item } from '@/types';
import { cn } from '@/lib/utils';
import { ImageZoomModal } from './ImageZoomModal';
import { useState } from 'react';

interface ItemCardProps {
  item: Item;
  onStockIn: (item: Item) => void;
  onStockOut: (item: Item) => void;
  onEdit?: (item: Item) => void;
  onDelete?: (item: Item) => void;
}

export function ItemCard({ item, onStockIn, onStockOut, onEdit, onDelete }: ItemCardProps) {
  const isLowStock = item.stock <= item.min_stock;
  const [showImageZoom, setShowImageZoom] = useState(false);

  const handleImageClick = () => {
    if (item.image_url) {
      setShowImageZoom(true);
    }
  };

  return (
    <div className="bg-card rounded-xl p-4 shadow-card animate-fade-in">
      <div className="flex items-start gap-3">
        <div 
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden relative group",
            isLowStock ? "bg-warning/10" : "bg-primary/10",
            item.image_url ? "cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all" : ""
          )}
          onClick={handleImageClick}
        >
          {item.image_url ? (
            <>
              <img 
                src={item.image_url} 
                alt={item.name}
                className="w-full h-full object-cover transition-transform group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <ZoomIn className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </>
          ) : (
            <Package className={cn(
              "w-6 h-6",
              isLowStock ? "text-warning" : "text-primary"
            )} />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">{item.name}</h3>
              <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn(
                  "text-lg font-bold",
                  isLowStock ? "text-warning" : "text-foreground"
                )}>
                  {item.stock}
                </span>
                <span className="text-sm text-muted-foreground">{item.unit}</span>
                {isLowStock && (
                  <span className="text-xs bg-warning/10 text-warning px-2 py-0.5 rounded-full font-medium">
                    Stok Rendah
                  </span>
                )}
              </div>
            </div>
            
            {/* Menu Dropdown */}
            {(onEdit || onDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(item)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem 
                      onClick={() => onDelete(item)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Hapus
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <Button 
          variant="success" 
          size="sm" 
          className="flex-1"
          onClick={() => onStockIn(item)}
        >
          <ArrowDownCircle className="w-4 h-4" />
          Masuk
        </Button>
        <Button 
          variant="warning" 
          size="sm" 
          className="flex-1"
          onClick={() => onStockOut(item)}
          disabled={item.stock === 0}
        >
          <ArrowUpCircle className="w-4 h-4" />
          Keluar
        </Button>
      </div>

      {/* Image Zoom Modal */}
      {item.image_url && (
        <ImageZoomModal
          open={showImageZoom}
          onClose={() => setShowImageZoom(false)}
          imageUrl={item.image_url}
          imageName={`${item.name} - ${item.sku}`}
          imageAlt={`Gambar ${item.name}`}
        />
      )}
    </div>
  );
}
