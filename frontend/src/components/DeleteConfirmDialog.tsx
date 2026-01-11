import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';
import { Item } from '@/types';

interface DeleteConfirmDialogProps {
  open: boolean;
  item: Item | null;
  onClose: () => void;
  onConfirm: (itemId: string) => void;
  isDeleting?: boolean;
}

export function DeleteConfirmDialog({ 
  open, 
  item, 
  onClose, 
  onConfirm, 
  isDeleting = false 
}: DeleteConfirmDialogProps) {
  const handleConfirm = () => {
    if (item) {
      onConfirm(item.id);
    }
  };

  if (!item) return null;

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-destructive" />
            Hapus Barang
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            Apakah Anda yakin ingin menghapus barang <strong>"{item.name}"</strong> dengan SKU <strong>{item.sku}</strong>?
            <br /><br />
            <span className="text-destructive font-medium">
              Tindakan ini akan menghapus barang dari sistem.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Menghapus...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Hapus
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}