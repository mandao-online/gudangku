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
import { unitsApi } from '@/services/api';
import { Unit } from '@/types';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { UnitModal } from '@/components/UnitModal';

export default function UnitsManagement() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingUnit, setDeletingUnit] = useState<Unit | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadUnits();
  }, []);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      loadUnits(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const loadUnits = async (searchQuery?: string) => {
    try {
      setIsLoading(true);
      const response = await unitsApi.getAll({
        search: searchQuery,
        per_page: 100, // Load all units for management
      });
      
      if (response.data) {
        setUnits(response.data);
      }
    } catch (error) {
      console.error('Error loading units:', error);
      toast.error('Gagal memuat data satuan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUnit = () => {
    setEditingUnit(null);
    setShowUnitModal(true);
  };

  const handleEditUnit = (unit: Unit) => {
    setEditingUnit(unit);
    setShowUnitModal(true);
  };

  const handleSaveUnit = async (unitData: {
    name: string;
    symbol?: string;
    description?: string;
    is_active?: boolean;
  }) => {
    try {
      let response;
      if (editingUnit) {
        response = await unitsApi.update(editingUnit.id, unitData);
      } else {
        response = await unitsApi.create(unitData);
      }
      
      if (response.success) {
        toast.success(response.message || `Satuan berhasil ${editingUnit ? 'diperbarui' : 'ditambahkan'}`);
        setShowUnitModal(false);
        setEditingUnit(null);
        loadUnits(search);
      }
    } catch (error: any) {
      console.error('Error saving unit:', error);
      const errorMessage = error.response?.data?.message || `Gagal ${editingUnit ? 'memperbarui' : 'menambahkan'} satuan`;
      toast.error(errorMessage);
      throw error;
    }
  };

  const handleDeleteUnit = (unit: Unit) => {
    setDeletingUnit(unit);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingUnit) return;

    try {
      setIsDeleting(true);
      const response = await unitsApi.delete(deletingUnit.id);
      
      if (response.success) {
        toast.success(response.message || 'Satuan berhasil dihapus');
        setShowDeleteDialog(false);
        setDeletingUnit(null);
        loadUnits(search);
      }
    } catch (error: any) {
      console.error('Error deleting unit:', error);
      const errorMessage = error.response?.data?.message || 'Gagal menghapus satuan';
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="pb-20">
      <PageHeader 
        title="Kelola Satuan" 
        subtitle={`${units.length} satuan tersedia`}
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
              onClick={handleAddUnit}
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
            placeholder="Cari satuan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-12 bg-card"
          />
        </div>
      </div>

      {/* Units Table */}
      <div className="px-4 pb-4">
        <div className="bg-card rounded-xl shadow-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Simbol</TableHead>
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
                      <div className="h-4 bg-muted rounded animate-pulse w-16"></div>
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
              ) : units.length > 0 ? (
                units.map((unit) => (
                  <TableRow key={unit.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{unit.name}</div>
                        {unit.description && (
                          <div className="text-sm text-muted-foreground">
                            {unit.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {unit.symbol && (
                        <Badge variant="outline">{unit.symbol}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={unit.is_active ? "default" : "secondary"}>
                        {unit.is_active ? 'Aktif' : 'Tidak Aktif'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditUnit(unit)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUnit(unit)}
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
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    {search ? 'Tidak ada satuan ditemukan' : 'Belum ada data satuan'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Unit Modal */}
      <UnitModal
        open={showUnitModal}
        unit={editingUnit}
        onClose={() => {
          setShowUnitModal(false);
          setEditingUnit(null);
        }}
        onSave={handleSaveUnit}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-destructive" />
              Hapus Satuan
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left">
              Apakah Anda yakin ingin menghapus satuan <strong>"{deletingUnit?.name}"</strong>?
              <br /><br />
              <span className="text-destructive font-medium">
                Satuan yang sedang digunakan oleh barang tidak dapat dihapus.
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