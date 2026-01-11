import { useState, useEffect } from 'react';
import { Package, ArrowDownCircle, ArrowUpCircle, UserCheck, AlertTriangle } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import { ActivityItem } from '@/components/ActivityItem';
import { DashboardDetailModal } from '@/components/DashboardDetailModal';
import { dashboardApi, attendanceApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { formatDate, getCurrentTime } from '@/utils/timezone';
import { toast } from 'sonner';

interface DashboardStats {
  total_items: number;
  total_stock: number;
  low_stock_items: number;
  today_stock_in: number;
  today_stock_out: number;
  attendance_status: {
    check_in: string | null;
    check_out: string | null;
    status: string;
  } | null;
}

interface Activity {
  id: string;
  item_name: string;
  type: 'in' | 'out';
  quantity: number;
  note: string;
  created_at: string;
  user_name: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'low-stock' | 'stock-in' | 'stock-out'>('low-stock');
  const [modalTitle, setModalTitle] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load dashboard stats and activities in parallel
      const [statsResponse, activitiesResponse] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getActivities({ limit: 5 })
      ]);

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

      if (activitiesResponse.success) {
        setActivities(activitiesResponse.data);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Gagal memuat data dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const getAttendanceStatus = () => {
    if (!stats?.attendance_status) return 'Belum Absen';
    
    const { check_in, check_out } = stats.attendance_status;
    if (check_in && check_out) return 'Selesai';
    if (check_in) return 'Hadir';
    return 'Belum Absen';
  };

  const handleCardClick = (type: 'low-stock' | 'stock-in' | 'stock-out') => {
    setModalType(type);
    
    switch (type) {
      case 'low-stock':
        setModalTitle('Barang Stok Rendah');
        break;
      case 'stock-in':
        setModalTitle('Transaksi Masuk Hari Ini');
        break;
      case 'stock-out':
        setModalTitle('Transaksi Keluar Hari Ini');
        break;
    }
    
    setModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="pb-20">
        <PageHeader 
          title="Dashboard" 
          subtitle={formatDate(getCurrentTime(), 'EEEE, d MMMM yyyy')}
        />
        <div className="px-4 py-4 space-y-4">
          {/* Loading skeleton */}
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card rounded-xl p-4 shadow-card animate-pulse">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-8 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded"></div>
              </div>
            ))}
          </div>
          <div className="bg-card rounded-xl p-4 shadow-card animate-pulse">
            <div className="h-4 bg-muted rounded mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <PageHeader 
        title="Dashboard" 
        subtitle={formatDate(getCurrentTime(), 'EEEE, d MMMM yyyy')}
      />

      <div className="px-4 py-4 space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            title="Total Barang"
            value={stats?.total_items || 0}
            subtitle={`${stats?.total_stock || 0} unit total`}
            icon={Package}
            variant="default"
          />
          <StatCard
            title="Stok Rendah"
            value={stats?.low_stock_items || 0}
            subtitle="Perlu restock"
            icon={AlertTriangle}
            variant={(stats?.low_stock_items || 0) > 0 ? 'warning' : 'default'}
            clickable={(stats?.low_stock_items || 0) > 0}
            onClick={() => handleCardClick('low-stock')}
          />
          <StatCard
            title="Masuk Hari Ini"
            value={stats?.today_stock_in || 0}
            subtitle="Transaksi"
            icon={ArrowDownCircle}
            variant="success"
            clickable={(stats?.today_stock_in || 0) > 0}
            onClick={() => handleCardClick('stock-in')}
          />
          <StatCard
            title="Keluar Hari Ini"
            value={stats?.today_stock_out || 0}
            subtitle="Transaksi"
            icon={ArrowUpCircle}
            variant="warning"
            clickable={(stats?.today_stock_out || 0) > 0}
            onClick={() => handleCardClick('stock-out')}
          />
        </div>

        {/* Attendance Status */}
        <div className="bg-card rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              stats?.attendance_status?.check_in ? 'bg-success/10' : 'bg-muted'
            }`}>
              <UserCheck className={`w-6 h-6 ${
                stats?.attendance_status?.check_in ? 'text-success' : 'text-muted-foreground'
              }`} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Status Absensi</p>
              <p className="font-semibold text-foreground">{getAttendanceStatus()}</p>
            </div>
            {stats?.attendance_status?.check_in && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Masuk</p>
                <p className="text-sm font-semibold text-foreground">
                  {format(new Date(stats.attendance_status.check_in), 'HH:mm')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card rounded-xl shadow-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="font-semibold text-foreground">Aktivitas Terbaru</h2>
          </div>
          <div className="px-4">
            {activities.length > 0 ? (
              activities.map((activity) => (
                <ActivityItem 
                  key={activity.id} 
                  movement={{
                    id: activity.id,
                    itemId: '',
                    itemName: activity.item_name,
                    type: activity.type,
                    quantity: activity.quantity,
                    note: activity.note,
                    timestamp: new Date(activity.created_at),
                  }} 
                />
              ))
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Belum ada aktivitas hari ini</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <DashboardDetailModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        type={modalType}
        title={modalTitle}
      />
    </div>
  );
}
