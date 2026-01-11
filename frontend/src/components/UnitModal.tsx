import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Ruler } from 'lucide-react';
import { Unit } from '@/types';

interface UnitModalProps {
  open: boolean;
  unit: Unit | null;
  onClose: () => void;
  onSave: (unitData: {
    name: string;
    symbol?: string;
    description?: string;
    is_active?: boolean;
  }) => void;
}

export function UnitModal({ open, unit, onClose, onSave }: UnitModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    description: '',
    is_active: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form when unit changes
  useEffect(() => {
    if (unit) {
      setFormData({
        name: unit.name || '',
        symbol: unit.symbol || '',
        description: unit.description || '',
        is_active: unit.is_active !== false,
      });
    } else {
      setFormData({
        name: '',
        symbol: '',
        description: '',
        is_active: true,
      });
    }
  }, [unit, open]);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSave({
        name: formData.name.trim(),
        symbol: formData.symbol.trim() || undefined,
        description: formData.description.trim() || undefined,
        is_active: formData.is_active,
      });
    } catch (error) {
      console.error('Error saving unit:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-primary" />
            {unit ? 'Edit Satuan' : 'Tambah Satuan Baru'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nama Satuan */}
          <div className="space-y-2">
            <Label htmlFor="name">Nama Satuan *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Contoh: kilogram, meter, buah"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Simbol Satuan */}
          <div className="space-y-2">
            <Label htmlFor="symbol">Simbol Satuan</Label>
            <Input
              id="symbol"
              value={formData.symbol}
              onChange={(e) => handleChange('symbol', e.target.value)}
              placeholder="Contoh: kg, m, pcs"
              disabled={isSubmitting}
            />
          </div>

          {/* Deskripsi */}
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Deskripsi penggunaan satuan (opsional)"
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          {/* Status Aktif */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="is_active">Status Aktif</Label>
              <div className="text-sm text-muted-foreground">
                Satuan aktif akan muncul dalam pilihan saat menambah barang
              </div>
            </div>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleChange('is_active', checked)}
              disabled={isSubmitting}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.name.trim()}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Menyimpan...
                </>
              ) : (
                'Simpan'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}