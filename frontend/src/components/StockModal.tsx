import { useState } from 'react';
import { ArrowDownCircle, ArrowUpCircle, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Item } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface StockModalProps {
  item: Item | null;
  type: 'in' | 'out' | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (quantity: number, note: string) => void;
}

export function StockModal({ item, type, open, onClose, onConfirm }: StockModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');

  const handleConfirm = () => {
    if (quantity > 0) {
      onConfirm(quantity, note);
      setQuantity(1);
      setNote('');
    }
  };

  const handleClose = () => {
    setQuantity(1);
    setNote('');
    onClose();
  };

  if (!item || !type) return null;

  const isOut = type === 'out';
  const maxOut = isOut ? item.stock : Infinity;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[340px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isOut ? (
              <ArrowUpCircle className="w-5 h-5 text-warning" />
            ) : (
              <ArrowDownCircle className="w-5 h-5 text-success" />
            )}
            Barang {isOut ? 'Keluar' : 'Masuk'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="bg-secondary rounded-xl p-3">
            <p className="font-semibold text-foreground">{item.name}</p>
            <p className="text-sm text-muted-foreground">
              Stok saat ini: {item.stock} {item.unit}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Jumlah</label>
            <div className="flex items-center gap-3 mt-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.min(maxOut, Math.max(1, parseInt(e.target.value) || 1)))}
                className="text-center text-lg font-bold h-12"
                min={1}
                max={isOut ? item.stock : undefined}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.min(maxOut, quantity + 1))}
                disabled={isOut && quantity >= item.stock}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {isOut && quantity > item.stock && (
              <p className="text-xs text-destructive mt-1">Melebihi stok tersedia</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Catatan (opsional)</label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: Pengiriman ke cabang A"
              className="mt-2 h-12"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={handleClose}>
              Batal
            </Button>
            <Button 
              variant={isOut ? 'warning' : 'success'}
              className="flex-1"
              onClick={handleConfirm}
              disabled={quantity < 1 || (isOut && quantity > item.stock)}
            >
              Konfirmasi
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
