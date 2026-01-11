import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { User, Building2, Phone, Mail, LogOut, ChevronRight, Ruler, Edit, Tag, Calendar, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { EditProfileModal } from '@/components/EditProfileModal';
import { InstallPWA } from '@/components/InstallPWA';

const menuItems = [
  { 
    icon: Edit, 
    label: 'Edit Profil', 
    description: 'Ubah informasi profil dan password',
    href: null,
    action: 'edit-profile',
    roles: ['admin', 'manager', 'staff'] // Available for all roles
  },
  { 
    icon: Calendar, 
    label: 'Kelola Absensi', 
    description: 'Lihat dan export data absensi',
    href: '/attendance-management',
    roles: ['admin', 'manager', 'staff'] // Available for all roles
  },
  { 
    icon: Users, 
    label: 'Kelola User', 
    description: 'Tambah, edit, hapus akun karyawan',
    href: '/users-management',
    roles: ['admin'] // Only for admin
  },
  { 
    icon: Ruler, 
    label: 'Kelola Satuan', 
    description: 'Tambah, edit, hapus satuan barang',
    href: '/units-management',
    roles: ['admin'] // Only for admin
  },
  { 
    icon: Tag, 
    label: 'Kelola Kategori', 
    description: 'Tambah, edit, hapus kategori barang',
    href: '/categories-management',
    roles: ['admin'] // Only for admin
  },
  // Hidden menu items - available for future implementation
  // { 
  //   icon: Settings, 
  //   label: 'Pengaturan', 
  //   description: 'Notifikasi, tema, bahasa',
  //   href: null
  // },
  // { 
  //   icon: HelpCircle, 
  //   label: 'Bantuan', 
  //   description: 'FAQ dan dukungan',
  //   href: null
  // },
];

export default function Profile() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    navigate('/login');
  };

  const handleMenuClick = (action?: string) => {
    if (action === 'edit-profile') {
      setShowEditProfileModal(true);
    }
  };

  const handleProfileUpdate = (updatedUser: any) => {
    updateUser(updatedUser);
  };

  // Filter menu items based on user role
  const getVisibleMenuItems = () => {
    if (!user) return [];
    return menuItems.filter(item => 
      !item.roles || item.roles.includes(user.role)
    );
  };

  if (!user) {
    return (
      <div className="pb-20">
        <PageHeader title="Profil" />
        <div className="px-4 py-4">
          <div className="text-center text-muted-foreground">
            <p>Data pengguna tidak tersedia</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <PageHeader 
        title="Profil" 
        action={<InstallPWA />}
      />

      <div className="px-4 py-4 space-y-4">
        {/* Profile Card */}
        <div className="bg-card rounded-2xl p-5 shadow-card">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
              {user.avatar_url ? (
                <img 
                  src={user.avatar_url} 
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-primary" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-foreground">{user.name}</h2>
              <p className="text-sm text-muted-foreground">
                {user.position || 'Staff'}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-2 h-2 rounded-full ${
                  user.is_active ? 'bg-success' : 'bg-destructive'
                }`}></div>
                <span className="text-xs text-muted-foreground">
                  {user.is_active ? 'Aktif' : 'Tidak Aktif'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {user.department && (
              <div className="flex items-center gap-3 text-sm">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">{user.department}</span>
              </div>
            )}
            {user.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">{user.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground">{user.email}</span>
            </div>
          </div>

          {/* Role Badge */}
          <div className="mt-4">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              user.role === 'admin' 
                ? 'bg-purple-100 text-purple-800' 
                : user.role === 'manager'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-green-100 text-green-800'
            }`}>
              {user.role === 'admin' ? 'Administrator' : 
               user.role === 'manager' ? 'Manager' : 'Staff'}
            </span>
          </div>
        </div>

        {/* Menu Items */}
        <div className="bg-card rounded-xl shadow-card overflow-hidden">
          {getVisibleMenuItems().map((item) => (
            item.href ? (
              <Link
                key={item.label}
                to={item.href}
                className="w-full flex items-center gap-4 px-4 py-4 hover:bg-accent/50 transition-colors border-b border-border last:border-0 text-left touch-action-manipulation"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </Link>
            ) : (
              <button
                key={item.label}
                className="w-full flex items-center gap-4 px-4 py-4 hover:bg-accent/50 transition-colors border-b border-border last:border-0 text-left touch-action-manipulation"
                onClick={() => {
                  if (item.action) {
                    handleMenuClick(item.action);
                  } else {
                    // TODO: Implement menu item actions
                    console.log(`Clicked ${item.label}`);
                  }
                }}
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            )
          ))}
        </div>

        {/* Logout */}
        <Button 
          variant="destructive" 
          className="w-full" 
          size="lg"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Keluar...
            </>
          ) : (
            <>
              <LogOut className="w-5 h-5" />
              Keluar
            </>
          )}
        </Button>

        {/* Version */}
        <p className="text-center text-xs text-muted-foreground">
          Field Flow v1.0.0
        </p>
      </div>

      {/* Edit Profile Modal */}
      {user && (
        <EditProfileModal
          open={showEditProfileModal}
          user={user}
          onClose={() => setShowEditProfileModal(false)}
          onSave={handleProfileUpdate}
        />
      )}
    </div>
  );
}
