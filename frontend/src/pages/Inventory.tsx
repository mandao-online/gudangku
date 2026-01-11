import { useState, useEffect } from 'react';
import { Plus, Search, ChevronLeft, ChevronRight, ScanLine } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { ItemCard } from '@/components/ItemCard';
import { StockModal } from '@/components/StockModal';
import { AddItemModal } from '@/components/AddItemModal';
import { EditItemModal } from '@/components/EditItemModal';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { BarcodeScanner } from '@/components/BarcodeScanner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { itemsApi } from '@/services/api';
import { Item } from '@/types';
import { toast } from 'sonner';

interface PaginationInfo {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export default function Inventory() {
  const [items, setItems] = useState<Item[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0
  });
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [modalType, setModalType] = useState<'in' | 'out' | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [deletingItem, setDeletingItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);

  useEffect(() => {
    loadItems();
  }, [currentPage]);

  useEffect(() => {
    // Debounce search and reset to page 1
    const timer = setTimeout(() => {
      setCurrentPage(1);
      loadItems(search, 1);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const loadItems = async (searchQuery?: string, page: number = currentPage) => {
    try {
      setIsLoading(true);
      const response = await itemsApi.getAll({
        search: searchQuery,
        per_page: 15,
        page: page,
      });
      
      console.log('API Response:', response); // Debug log
      
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
      console.error('Error loading items:', error);
      toast.error('Gagal memuat data barang');
      // Set default pagination on error
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

  const handleStockIn = (item: Item) => {
    setSelectedItem(item);
    setModalType('in');
  };

  const handleStockOut = (item: Item) => {
    setSelectedItem(item);
    setModalType('out');
  };

  const handleConfirm = async (quantity: number, note: string) => {
    if (!selectedItem || !modalType) return;

    try {
      const apiCall = modalType === 'in' 
        ? itemsApi.stockIn(selectedItem.id, { quantity, note })
        : itemsApi.stockOut(selectedItem.id, { quantity, note });

      const response = await apiCall;

      if (response.success) {
        toast.success(response.message || 
          `${modalType === 'in' ? '+' : '-'}${quantity} ${selectedItem.name} ${modalType === 'in' ? 'ditambahkan' : 'dikurangi'}`
        );
        
        // Update the item in the list
        setItems(prev => prev.map(item => 
          item.id === selectedItem.id 
            ? { ...item, stock: response.data.stock }
            : item
        ));
      }
    } catch (error: any) {
      console.error('Stock operation error:', error);
      const errorMessage = error.response?.data?.message || 'Operasi stok gagal';
      toast.error(errorMessage);
    } finally {
      setSelectedItem(null);
      setModalType(null);
    }
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
    setModalType(null);
  };

  const handleAddItem = async (itemData: FormData) => {
    try {
      const response = await itemsApi.create(itemData);
      
      if (response.success) {
        toast.success(response.message || 'Barang berhasil ditambahkan');
        setShowAddModal(false);
        
        // Reload items to show the new item
        loadItems(search, 1);
        setCurrentPage(1);
      }
    } catch (error: any) {
      console.error('Error adding item:', error);
      const errorMessage = error.response?.data?.message || 'Gagal menambahkan barang';
      toast.error(errorMessage);
      throw error; // Re-throw to let modal handle the error state
    }
  };

  const handleEditItem = (item: Item) => {
    setEditingItem(item);
    setShowEditModal(true);
  };

  const handleUpdateItem = async (itemId: string, itemData: FormData) => {
    try {
      const response = await itemsApi.update(itemId, itemData);
      
      if (response.success) {
        toast.success(response.message || 'Barang berhasil diperbarui');
        setShowEditModal(false);
        setEditingItem(null);
        
        // Update the item in the list
        setItems(prev => prev.map(item => 
          item.id === itemId 
            ? { ...item, ...response.data }
            : item
        ));
      }
    } catch (error: any) {
      console.error('Error updating item:', error);
      const errorMessage = error.response?.data?.message || 'Gagal memperbarui barang';
      toast.error(errorMessage);
      throw error; // Re-throw to let modal handle the error state
    }
  };

  const handleDeleteItem = (item: Item) => {
    setDeletingItem(item);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async (itemId: string) => {
    try {
      setIsDeleting(true);
      const response = await itemsApi.delete(itemId);
      
      if (response.success) {
        toast.success(response.message || 'Barang berhasil dihapus');
        setShowDeleteDialog(false);
        setDeletingItem(null);
        
        // Reload items to reflect the deletion
        loadItems(search, currentPage);
      }
    } catch (error: any) {
      console.error('Error deleting item:', error);
      const errorMessage = error.response?.data?.message || 'Gagal menghapus barang';
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBarcodeScanned = (scannedCode: string) => {
    setSearch(scannedCode);
    toast.success(`Barcode dipindai: ${scannedCode}`);
  };

  const renderPagination = () => {
    if (pagination.last_page <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, pagination.current_page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(pagination.last_page, startPage + maxVisiblePages - 1);

    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-between px-4 py-3 bg-card rounded-xl shadow-card">
        <div className="text-sm text-muted-foreground">
          Menampilkan {Math.max(1, ((pagination.current_page - 1) * pagination.per_page) + 1)} - {Math.min(pagination.current_page * pagination.per_page, pagination.total)} dari {pagination.total} barang
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
        title="Manajemen Barang" 
        subtitle={`${pagination.total || 0} jenis barang`}
        action={
          <Button
            size="sm"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Tambah
          </Button>
        }
      />

      {/* Search */}
      <div className="px-4 py-3 sticky top-[73px] bg-background z-30">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Cari barang atau SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-12 h-12 bg-card"
          />
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 p-0 hover:bg-primary/10"
            onClick={() => setShowBarcodeScanner(true)}
          >
            <ScanLine className="w-5 h-5 text-primary" />
          </Button>
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
                  <div className="text-right">
                    <div className="h-6 bg-muted rounded w-16 mb-1"></div>
                    <div className="h-3 bg-muted rounded w-12"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : items.length > 0 ? (
          <>
            {items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onStockIn={handleStockIn}
                onStockOut={handleStockOut}
                onEdit={handleEditItem}
                onDelete={handleDeleteItem}
              />
            ))}
            
            {/* Pagination */}
            {renderPagination()}
          </>
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            <p>
              {search ? 'Tidak ada barang ditemukan' : 'Belum ada data barang'}
            </p>
            {search && (
              <p className="text-sm mt-1">
                Coba kata kunci lain atau periksa ejaan
              </p>
            )}
          </div>
        )}
      </div>

      <StockModal
        item={selectedItem}
        type={modalType}
        open={!!selectedItem && !!modalType}
        onClose={handleCloseModal}
        onConfirm={handleConfirm}
      />

      <AddItemModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onConfirm={handleAddItem}
      />

      <EditItemModal
        open={showEditModal}
        item={editingItem}
        onClose={() => {
          setShowEditModal(false);
          setEditingItem(null);
        }}
        onConfirm={handleUpdateItem}
      />

      <DeleteConfirmDialog
        open={showDeleteDialog}
        item={deletingItem}
        onClose={() => {
          setShowDeleteDialog(false);
          setDeletingItem(null);
        }}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />

      <BarcodeScanner
        open={showBarcodeScanner}
        onClose={() => setShowBarcodeScanner(false)}
        onScan={handleBarcodeScanned}
      />
    </div>
  );
}
