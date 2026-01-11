import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, ArrowLeft, User as UserIcon } from 'lucide-react';
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
import { usersApi } from '@/services/api';
import { User } from '@/types';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import UserModal from '@/components/UserModal';

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      loadUsers(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const loadUsers = async (searchQuery?: string) => {
    try {
      setIsLoading(true);
      const response = await usersApi.getAll({
        search: searchQuery,
        per_page: 100, // Load all users for management
      });
      
      if (response.data) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Gagal memuat data pengguna');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setShowUserModal(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowUserModal(true);
  };

  const handleDeleteUser = (user: User) => {
    setDeletingUser(user);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingUser) return;

    try {
      setIsDeleting(true);
      const response = await usersApi.delete(deletingUser.id);
      
      if (response.success) {
        toast.success(response.message || 'Pengguna berhasil dihapus');
        setShowDeleteDialog(false);
        setDeletingUser(null);
        loadUsers(search);
      }
    } catch (error: any) {
      console.error('Error deleting user:', error);
      const errorMessage = error.response?.data?.message || 'Gagal menghapus pengguna';
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUserModalSuccess = () => {
    loadUsers(search);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'manager':
        return 'default';
      case 'staff':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'manager':
        return 'Manager';
      case 'staff':
        return 'Staff';
      default:
        return role;
    }
  };

  return (
    <div className="pb-20">
      <PageHeader 
        title="Kelola Pengguna" 
        subtitle={`${users.length} pengguna terdaftar`}
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
              onClick={handleAddUser}
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
            placeholder="Cari pengguna..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-12 bg-card"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="px-4 pb-4">
        <div className="bg-card rounded-xl shadow-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pengguna</TableHead>
                <TableHead>Kontak</TableHead>
                <TableHead>Role</TableHead>
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
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-muted rounded-full animate-pulse"></div>
                        <div className="space-y-1">
                          <div className="h-4 bg-muted rounded animate-pulse w-32"></div>
                          <div className="h-3 bg-muted rounded animate-pulse w-24"></div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="h-4 bg-muted rounded animate-pulse w-40"></div>
                        <div className="h-3 bg-muted rounded animate-pulse w-32"></div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="h-6 bg-muted rounded animate-pulse w-16"></div>
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
              ) : users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <UserIcon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          {(user.position || user.department) && (
                            <div className="text-sm text-muted-foreground">
                              {[user.position, user.department].filter(Boolean).join(' - ')}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">{user.email}</div>
                        {user.phone && (
                          <div className="text-sm text-muted-foreground">{user.phone}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {getRoleLabel(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.is_active ? "default" : "secondary"}>
                        {user.is_active ? 'Aktif' : 'Tidak Aktif'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(user)}
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
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    {search ? 'Tidak ada pengguna ditemukan' : 'Belum ada data pengguna'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* User Modal */}
      <UserModal
        isOpen={showUserModal}
        user={editingUser}
        onClose={() => {
          setShowUserModal(false);
          setEditingUser(null);
        }}
        onSuccess={handleUserModalSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-destructive" />
              Hapus Pengguna
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left">
              Apakah Anda yakin ingin menghapus pengguna <strong>"{deletingUser?.name}"</strong>?
              <br /><br />
              <span className="text-destructive font-medium">
                Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data terkait pengguna.
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