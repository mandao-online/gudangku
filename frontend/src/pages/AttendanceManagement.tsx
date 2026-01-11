import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ImageZoomModal } from '@/components/ImageZoomModal';
import { attendanceApi } from '@/services/api';
import { AttendanceRecord } from '@/types';
import { toast } from 'sonner';
import { 
  Download, 
  Search, 
  Calendar, 
  Filter, 
  ZoomIn, 
  CheckCircle2, 
  XCircle,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDateOnly, formatTime } from '@/utils/timezone';

// API Configuration
const API_BASE_URL = 'http://localhost:8001/api';

export default function AttendanceManagement() {
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [showImageZoom, setShowImageZoom] = useState(false);
  const [zoomImageUrl, setZoomImageUrl] = useState<string | null>(null);
  const recordsPerPage = 15;

  useEffect(() => {
    loadAttendanceData();
  }, [currentPage, searchTerm, dateFrom, dateTo]);

  const loadAttendanceData = async () => {
    try {
      setIsLoading(true);
      
      const params: any = {
        per_page: recordsPerPage,
        page: currentPage,
      };

      if (searchTerm) {
        params.search = searchTerm;
      }
      if (dateFrom) {
        params.date_from = dateFrom;
      }
      if (dateTo) {
        params.date_to = dateTo;
      }

      const response = await attendanceApi.getAll(params);
      
      if (response.data) {
        setAttendanceData(response.data);
        setTotalPages(response.last_page || 1);
        setTotalRecords(response.total || 0);
      }
    } catch (error) {
      console.error('Error loading attendance data:', error);
      toast.error('Gagal memuat data absensi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;

      // Create URL with parameters
      const queryString = new URLSearchParams(params).toString();
      const exportUrl = `${API_BASE_URL}/attendance/export-excel${queryString ? `?${queryString}` : ''}`;
      
      // Get auth token
      const token = localStorage.getItem('auth_token');
      
      // Fetch the file
      const response = await fetch(exportUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'text/csv',
        },
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Get the blob
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `attendance_export_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Data absensi berhasil diexport ke CSV');
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error('Gagal export data absensi');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadAttendanceData();
  };

  const handleReset = () => {
    setSearchTerm('');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
    }
  };

  const handlePhotoZoom = (photoUrl: string) => {
    setZoomImageUrl(photoUrl);
    setShowImageZoom(true);
  };

  const statusIcons = {
    present: <CheckCircle2 className="w-4 h-4 text-success" />,
    absent: <XCircle className="w-4 h-4 text-destructive" />,
  };

  const statusLabels = {
    present: 'Hadir',
    absent: 'Tidak Hadir',
  };

  return (
    <div className="pb-20">
      <PageHeader 
        title="Kelola Absensi" 
        subtitle="Lihat dan export data absensi karyawan"
      />

      <div className="px-4 py-4 space-y-4">
        {/* Filters */}
        <div className="bg-card rounded-xl p-4 shadow-card space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Filter Data</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateFrom">Tanggal Dari</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateTo">Tanggal Sampai</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="search">Cari Karyawan</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Nama karyawan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch} disabled={isLoading}>
                <Search className="w-4 h-4" />
              </Button>
              <Button variant="outline" onClick={handleReset} disabled={isLoading}>
                Reset
              </Button>
            </div>
          </div>
        </div>

        {/* Export Button */}
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {totalRecords > 0 && `Menampilkan ${attendanceData.length} dari ${totalRecords} data`}
          </p>
          <Button 
            onClick={handleExportExcel}
            disabled={isExporting || attendanceData.length === 0}
            className="gap-2"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export CSV
              </>
            )}
          </Button>
        </div>

        {/* Attendance List */}
        <div className="bg-card rounded-xl shadow-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="font-semibold text-foreground">Data Absensi</h2>
          </div>
          
          <div className="divide-y divide-border min-h-[400px]">
            {isLoading ? (
              <div className="px-4 py-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">Memuat data absensi...</p>
              </div>
            ) : attendanceData.length > 0 ? (
              attendanceData.map((record) => (
                <div key={record.id} className="px-4 py-4">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                      record.status === 'present' && "bg-success/10",
                      record.status === 'absent' && "bg-destructive/10"
                    )}>
                      {statusIcons[record.status as keyof typeof statusIcons]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <p className="font-semibold text-foreground">
                            {record.user_name || 'Unknown User'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDateOnly(record.date)}
                          </p>
                        </div>
                        <Badge 
                          variant={record.status === 'present' ? 'default' : 'destructive'}
                          className="ml-2"
                        >
                          {statusLabels[record.status as keyof typeof statusLabels]}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          {record.check_in && record.check_out 
                            ? `Masuk: ${formatTime(record.check_in)} • Pulang: ${formatTime(record.check_out)}`
                            : record.check_in 
                            ? `Masuk: ${formatTime(record.check_in)} • Belum checkout`
                            : 'Tidak ada data waktu'
                          }
                        </p>
                        
                        {record.work_hours_formatted && (
                          <p className="text-sm text-primary font-medium">
                            Jam kerja: {record.work_hours_formatted}
                          </p>
                        )}
                        
                        {record.notes && (
                          <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 mt-2">
                            <span className="font-medium">Catatan:</span> {record.notes}
                          </p>
                        )}
                      </div>
                      
                      {/* Photo Thumbnails */}
                      {(record.check_in_photo_url || record.check_out_photo_url) && (
                        <div className="mt-3 flex gap-3">
                          {record.check_in_photo_url && (
                            <div className="relative">
                              <button
                                onClick={() => handlePhotoZoom(record.check_in_photo_url!)}
                                className="relative block w-20 h-20 rounded-lg overflow-hidden bg-muted hover:opacity-80 transition-opacity group"
                              >
                                <img
                                  src={record.check_in_photo_url}
                                  alt="Check-in photo"
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <ZoomIn className="w-5 h-5 text-white" />
                                </div>
                              </button>
                              <div className="absolute -bottom-1 -left-1 bg-success text-white text-xs px-2 py-1 rounded-full font-medium">
                                Masuk
                              </div>
                            </div>
                          )}
                          {record.check_out_photo_url && (
                            <div className="relative">
                              <button
                                onClick={() => handlePhotoZoom(record.check_out_photo_url!)}
                                className="relative block w-20 h-20 rounded-lg overflow-hidden bg-muted hover:opacity-80 transition-opacity group"
                              >
                                <img
                                  src={record.check_out_photo_url}
                                  alt="Check-out photo"
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <ZoomIn className="w-5 h-5 text-white" />
                                </div>
                              </button>
                              <div className="absolute -bottom-1 -left-1 bg-warning text-white text-xs px-2 py-1 rounded-full font-medium">
                                Pulang
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-12 text-center text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-lg">Tidak ada data absensi</p>
                <p className="text-sm mt-1">Coba ubah filter pencarian</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-border">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    currentPage === 1
                      ? "text-muted-foreground cursor-not-allowed"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Sebelumnya
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={cn(
                          "w-8 h-8 rounded-lg text-sm font-medium transition-colors",
                          currentPage === pageNum
                            ? "bg-primary text-primary-foreground"
                            : "text-foreground hover:bg-muted"
                        )}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    currentPage === totalPages
                      ? "text-muted-foreground cursor-not-allowed"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  Selanjutnya
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Zoom Modal */}
      {zoomImageUrl && (
        <ImageZoomModal
          open={showImageZoom}
          imageUrl={zoomImageUrl}
          onClose={() => {
            setShowImageZoom(false);
            setZoomImageUrl(null);
          }}
        />
      )}
    </div>
  );
}