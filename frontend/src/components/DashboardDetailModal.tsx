import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { itemsApi, dashboardApi } from '@/services/api';
import { Item, StockMovement } from '@/types';
import { AlertTriangle, ArrowDownCircle, ArrowUpCircle, Package } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface DashboardDetailModalProps {
  open: boolean;
  onClose: () => void;
  type: 'low-stock' | 'stock-in' | 'stock-out';
  title: string;
}

interface StockMovementWithItem extends StockMovement {
  item_name: string;
  user_name?: string;
}

export function DashboardDetailModal({ open, onClose, type, title }: DashboardDetailModalProps) {
  const [data, setData] = useState<Item[] | StockMovementWithItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open, type]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      if (type === 'low-stock') {
        const response = await itemsApi.getAll({ 
          low_stock: true,
          per_page: 50 
        });
        if (response.data) {
          setData(response.data);
        }
      } else {
        const response = await dashboardApi.getActivities({ 
          limit: 50 
        });
        if (response.data) {
          const filteredData = response.data.filter((activity: StockMovementWithItem) => 
            type === 'stock-in' ? activity.type === 'in' : activity.type === 'out'
          );
          setData(filteredData);
        }
      }
    } catch (error) {
      console.error('Error loading detail data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderLowStockItems = () => {
    const items = data as Item[];
    
    if (items.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Tidak ada barang dengan stok rendah</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex-1">
              <div className="font-medium">{item.name}</div>
              <div className="text-sm text-muted-foreground">
                SKU: {item.sku} • Kategori: {item.category}
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2">
                <Badge variant="destructive" className="text-xs">
                  {item.stock} {item.unit}
                </Badge>
                <AlertTriangle className="w-4 h-4 text-destructive" />
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Min: {item.min_stock} {item.unit}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderStockMovements = () => {
    const movements = data as StockMovementWithItem[];
    
    if (movements.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Tidak ada transaksi hari ini</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {movements.map((movement) => (
          <div key={movement.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                movement.type === 'in' 
                  ? 'bg-success/10 text-success' 
                  : 'bg-warning/10 text-warning'
              }`}>
                {movement.type === 'in' ? (
                  <ArrowDownCircle className="w-5 h-5" />
                ) : (
                  <ArrowUpCircle className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium">{movement.item_name}</div>
                <div className="text-sm text-muted-foreground">
                  {movement.note}
                </div>
                {movement.user_name && (
                  <div className="text-xs text-muted-foreground">
                    oleh {movement.user_name}
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className={`font-semibold ${
                movement.type === 'in' ? 'text-success' : 'text-warning'
              }`}>
                {movement.type === 'in' ? '+' : '-'}{movement.quantity}
              </div>
              <div className="text-xs text-muted-foreground">
                {format(new Date(movement.created_at || movement.timestamp), 'HH:mm', { locale: id })}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {type === 'low-stock' && <AlertTriangle className="w-5 h-5 text-destructive" />}
            {type === 'stock-in' && <ArrowDownCircle className="w-5 h-5 text-success" />}
            {type === 'stock-out' && <ArrowUpCircle className="w-5 h-5 text-warning" />}
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {type === 'low-stock' ? renderLowStockItems() : renderStockMovements()}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}