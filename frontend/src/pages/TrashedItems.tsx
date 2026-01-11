import { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, RotateCcw, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { TrashedItemCard } from '@/components/TrashedItemCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { itemsApi } from '@/services/api';
import { Item } from '@/types';
import { toast } from 'sonner';

interface PaginationInfo {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export default function TrashedItems() {
  const [items, setItems] = useState<Item[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0
  });
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showForceDeleteDialog, setShowForceDeleteDialog] = useState(false);
  const [itemToForceDelete, setItemToForceDelete] = useState<Item | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadTrashedItems();
  }, [currentPage]);

  useEffect(() => {
    // Debounce search and reset to page 1
    const timer = setTimeout(() => {
      setCurrentPage(1);
      loadTrashedItems(search, 1);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const loadTrashedItems = async (searchQuery?: string, page: number = currentPage) => {
    try {
      setIsLoading(true);
      const response = await itemsApi.getTrashed({
        search: searchQuery,
        per_page: 15,
        page: page,
      });
      
      if (response.data) {
        setItems(response.data);
        setPagination({
          current_page: response.current_page || 1,
          last_page: response.last_page || 1,
          per_page: response.per_page || 15,
          total: response.total || 0
        });
      }
    } catch (error) {
      console.error('Error loading trashed items:', error);
      toast.error('Gagal memuat data barang yang dihapus');
      setPagination({
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.last_page) {
      setCurrentPage(page);
    }
  };

  const handleRestore = async (item: Item) => {
    try {
      setIsProcessing(true);
      const response = await itemsApi.restore(item.id);
      
      if (response.success) {
        toast.success(response.message || `${item.name} berhasil dipulihkan`);
        loadTrashedItems(search, currentPage);
      }
    } catch (error: any) {
      console.error('Error restoring item:', error);
      const errorMessage = error.response?.data?.message || 'Gagal memulihkan barang';
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleForceDelete = (item: Item) => {
    setItemToForceDelete(item);
    setShowForceDeleteDialog(true);
  };

  const handleConfirmForceDelete = async () => {
    if (!itemToForceDelete) return;

    try {
      setIsProcessing(true);
      const response = await itemsApi.forceDelete(itemToForceDelete.id);
      
      if (response.success) {
        toast.success(response.message || `${itemToForceDelete.name} berhasil dihapus permanen`);
        setShowForceDeleteDialog(false);
        setItemToForceDelete(null);
        loadTrashedItems(search, currentPage);
      }
    } catch (error: any) {
      console.error('Error force deleting item:', error);
      const errorMessage = error.response?.data?.message || 'Gagal menghapus barang permanen';
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderPagination = () => {
    if (pagination.last_page <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, pagination.current_page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(pagination.last_page, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-between px-4 py-3 bg-card rounded-xl shadow-card">
        <div className="text-sm text-muted-foreground">
          Menampilkan {Math.max(1, ((pagination.current_page - 1) * pagination.per_page) + 1)} - {Math.min(pagination.current_page * pagination.per_page, pagination.total)} dari {pagination.total} barang dihapus
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.current_page - 1)}
            disabled={pagination.current_page === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          {pages.map((page) => (
            <Button
              key={page}
              variant={page === pagination.current_page ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(page)}
              className="min-w-[40px]"
            >
              {page}
            </Button>
          ))}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.current_page + 1)}
            disabled={pagination.current_page === pagination.last_page}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="pb-20">
      <PageHeader 
        title="Barang Dihapus" 
        subtitle={`${pagination.total || 0} barang dalam tempat sampah`}
      />

      {/* Search */}
      <div className="px-4 py-3 sticky top-[73px] bg-background z-30">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Cari barang yang dihapus..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-12 bg-card"
          />
        </div>
      </div>

      {/* Items List */}
      <div className="px-4 pb-4 space-y-3">
        {isLoading ? (
          // Loading skeleton
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-card rounded-xl p-4 shadow-card animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-muted rounded-xl"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : items.length > 0 ? (
          <>
            {items.map((item) => (
              <TrashedItemCard
                key={item.id}
                item={item}
                onRestore={handleRestore}
                onForceDelete={handleForceDelete}
              />
            ))}
            
            {/* Pagination */}
            {renderPagination()}
          </>
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            <Trash2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-lg font-medium mb-2">
              {search ? 'Tidak ada barang ditemukan' : 'Tempat sampah kosong'}
            </p>
            <p className="text-sm">
              {search ? 'Coba kata kunci lain atau periksa ejaan' : 'Belum ada barang yang dihapus'}
            </p>
          </div>
        )}
      </div>

      {/* Force Delete Confirmation Dialog */}
      <AlertDialog open={showForceDeleteDialog} onOpenChange={setShowForceDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-destructive" />
              Hapus Permanen
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left">
              Apakah Anda yakin ingin menghapus permanen barang <strong>"{itemToForceDelete?.name}"</strong>?
              <br /><br />
              <span className="text-destructive font-medium">
                Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data terkait barang ini secara permanen.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmForceDelete}
              disabled={isProcessing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Menghapus...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Hapus Permanen
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}