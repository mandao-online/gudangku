import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { categoriesApi } from '@/services/api';
import { Category } from '@/types';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { CategoryModal } from '@/components/CategoryModal';

export default function CategoriesManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      loadCategories(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const loadCategories = async (searchQuery?: string) => {
    try {
      setIsLoading(true);
      const response = await categoriesApi.getAll({
        search: searchQuery,
        per_page: 100, // Load all categories for management
      });
      
      if (response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Gagal memuat data kategori');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setShowCategoryModal(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setShowCategoryModal(true);
  };

  const handleSaveCategory = async (categoryData: {
    name: string;
    description?: string;
    is_active?: boolean;
  }) => {
    try {
      let response;
      if (editingCategory) {
        response = await categoriesApi.update(editingCategory.id, categoryData);
      } else {
        response = await categoriesApi.create(categoryData);
      }
      
      if (response.success) {
        toast.success(response.message || `Kategori berhasil ${editingCategory ? 'diperbarui' : 'ditambahkan'}`);
        setShowCategoryModal(false);
        setEditingCategory(null);
        loadCategories(search);
      }
    } catch (error: any) {
      console.error('Error saving category:', error);
      const errorMessage = error.response?.data?.message || `Gagal ${editingCategory ? 'memperbarui' : 'menambahkan'} kategori`;
      toast.error(errorMessage);
      throw error;
    }
  };

  const handleDeleteCategory = (category: Category) => {
    setDeletingCategory(category);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingCategory) return;

    try {
      setIsDeleting(true);
      const response = await categoriesApi.delete(deletingCategory.id);
      
      if (response.success) {
        toast.success(response.message || 'Kategori berhasil dihapus');
        setShowDeleteDialog(false);
        setDeletingCategory(null);
        loadCategories(search);
      }
    } catch (error: any) {
      console.error('Error deleting category:', error);
      const errorMessage = error.response?.data?.message || 'Gagal menghapus kategori';
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="pb-20">
      <PageHeader 
        title="Kelola Kategori" 
        subtitle={`${categories.length} kategori tersedia`}
        action={
          <div className="flex gap-2">
            <Link to="/profile">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4" />
                Kembali
              </Button>
            </Link>
            <Button
              size="sm"
              onClick={handleAddCategory}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Tambah
            </Button>
          </div>
        }
      />

      {/* Search */}
      <div className="px-4 py-3 sticky top-[73px] bg-background z-30">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Cari kategori..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-12 bg-card"
          />
        </div>
      </div>

      {/* Categories Table */}
      <div className="px-4 pb-4">
        <div className="bg-card rounded-xl shadow-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="h-4 bg-muted rounded animate-pulse"></div>
                    </TableCell>
                    <TableCell>
                      <div className="h-6 bg-muted rounded animate-pulse w-16"></div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 justify-end">
                        <div className="h-8 w-8 bg-muted rounded animate-pulse"></div>
                        <div className="h-8 w-8 bg-muted rounded animate-pulse"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : categories.length > 0 ? (
                categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{category.name}</div>
                        {category.description && (
                          <div className="text-sm text-muted-foreground">
                            {category.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={category.is_active ? "default" : "secondary"}>
                        {category.is_active ? 'Aktif' : 'Tidak Aktif'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditCategory(category)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCategory(category)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    {search ? 'Tidak ada kategori ditemukan' : 'Belum ada data kategori'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Category Modal */}
      <CategoryModal
        open={showCategoryModal}
        category={editingCategory}
        onClose={() => {
          setShowCategoryModal(false);
          setEditingCategory(null);
        }}
        onSave={handleSaveCategory}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-destructive" />
              Hapus Kategori
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left">
              Apakah Anda yakin ingin menghapus kategori <strong>"{deletingCategory?.name}"</strong>?
              <br /><br />
              <span className="text-destructive font-medium">
                Kategori yang sedang digunakan oleh barang tidak dapat dihapus.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
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
    </div>
  );
}