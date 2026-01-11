import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { AttendanceCard } from '@/components/AttendanceCard';
import { ImageZoomModal } from '@/components/ImageZoomModal';
import { attendanceApi } from '@/services/api';
import { AttendanceRecord } from '@/types';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDateOnly, formatTime } from '@/utils/timezone';

export default function Attendance() {
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showImageZoom, setShowImageZoom] = useState(false);
  const [zoomImageUrl, setZoomImageUrl] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [pagination, setPagination] = useState({
    from: 0,
    to: 0,
  });
  const recordsPerPage = 7;

  useEffect(() => {
    loadAttendanceData();
  }, [currentPage]);

  const loadAttendanceData = async () => {
    try {
      setIsLoading(true);
      
      // Load today's attendance and history in parallel
      const [todayResponse, historyResponse] = await Promise.all([
        attendanceApi.getToday(),
        attendanceApi.getHistory({
          days: 30,
          per_page: recordsPerPage,
          page: currentPage
        })
      ]);

      if (todayResponse.success) {
        setTodayAttendance(todayResponse.data);
      }

      if (historyResponse.success) {
        setAttendanceHistory(historyResponse.data);
        
        // Update pagination info
        if (historyResponse.pagination) {
          setTotalPages(historyResponse.pagination.last_page);
          setTotalRecords(historyResponse.pagination.total);
          setPagination({
            from: historyResponse.pagination.from || 0,
            to: historyResponse.pagination.to || 0,
          });
        }
      }
    } catch (error) {
      console.error('Error loading attendance data:', error);
      toast.error('Gagal memuat data absensi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckIn = async (photo: File | null, notes: string): Promise<void> => {
    try {
      console.log('Starting check-in process...', { hasPhoto: !!photo, notes });
      
      // Get user location if available
      let latitude: number | undefined, longitude: number | undefined;
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 5000,
              enableHighAccuracy: true
            });
          });
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
          console.log('Location obtained:', { latitude, longitude });
        } catch (error) {
          console.log('Location not available:', error);
        }
      }

      // Create FormData for photo upload
      const formData = new FormData();
      if (latitude) formData.append('latitude', latitude.toString());
      if (longitude) formData.append('longitude', longitude.toString());
      if (notes) formData.append('notes', notes);
      if (photo) {
        formData.append('photo', photo);
        console.log('Photo added to FormData:', { 
          name: photo.name, 
          size: photo.size, 
          type: photo.type 
        });
      }

      console.log('Sending check-in request...');
      const response = await attendanceApi.checkIn(formData);
      console.log('Check-in response:', response);

      if (response.success) {
        setTodayAttendance(response.data);
        toast.success(response.message || 'Absensi masuk berhasil dicatat!');
        
        // Reload attendance data to get updated history
        loadAttendanceData();
      } else {
        throw new Error(response.message || 'Check-in failed');
      }
    } catch (error: any) {
      console.error('Check-in error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Gagal melakukan check-in';
      toast.error(errorMessage);
      throw error; // Re-throw to handle in modal
    }
  };

  const handleCheckOut = async (photo: File | null, notes: string): Promise<void> => {
    try {
      console.log('Starting check-out process...', { hasPhoto: !!photo, notes });
      
      // Get user location if available
      let latitude: number | undefined, longitude: number | undefined;
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 5000,
              enableHighAccuracy: true
            });
          });
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
          console.log('Location obtained:', { latitude, longitude });
        } catch (error) {
          console.log('Location not available:', error);
        }
      }

      // Create FormData for photo upload
      const formData = new FormData();
      if (latitude) formData.append('latitude', latitude.toString());
      if (longitude) formData.append('longitude', longitude.toString());
      if (notes) formData.append('notes', notes);
      if (photo) {
        formData.append('photo', photo);
        console.log('Photo added to FormData:', { 
          name: photo.name, 
          size: photo.size, 
          type: photo.type 
        });
      }

      console.log('Sending check-out request...');
      const response = await attendanceApi.checkOut(formData);
      console.log('Check-out response:', response);

      if (response.success) {
        setTodayAttendance(response.data);
        toast.success(response.message || 'Absensi pulang berhasil dicatat!');
        
        // Reload attendance data to get updated history
        loadAttendanceData();
      } else {
        throw new Error(response.message || 'Check-out failed');
      }
    } catch (error: any) {
      console.error('Check-out error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Gagal melakukan check-out';
      toast.error(errorMessage);
      throw error; // Re-throw to handle in modal
    }
  };

  const handlePhotoZoom = (photoUrl: string) => {
    setZoomImageUrl(photoUrl);
    setShowImageZoom(true);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const statusIcons = {
    present: <CheckCircle2 className="w-4 h-4 text-success" />,
    absent: <XCircle className="w-4 h-4 text-destructive" />,
  };

  const statusLabels = {
    present: 'Hadir',
    absent: 'Tidak Hadir',
  };

  if (isLoading) {
    return (
      <div className="pb-20">
        <PageHeader 
          title="Absensi" 
          subtitle="Tap untuk mencatat kehadiran"
        />
        <div className="px-4 py-4 space-y-4">
          {/* Loading skeleton */}
          <div className="bg-card rounded-xl p-4 shadow-card animate-pulse">
            <div className="h-32 bg-muted rounded"></div>
          </div>
          <div className="bg-card rounded-xl shadow-card overflow-hidden animate-pulse">
            <div className="px-4 py-3 border-b border-border">
              <div className="h-4 bg-muted rounded w-32"></div>
            </div>
            <div className="divide-y divide-border min-h-[400px]">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="px-4 py-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-muted rounded-xl"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-muted rounded w-32"></div>
                      <div className="h-4 bg-muted rounded w-48"></div>
                      <div className="flex gap-3 mt-3">
                        <div className="w-20 h-20 bg-muted rounded-lg"></div>
                        <div className="w-20 h-20 bg-muted rounded-lg"></div>
                      </div>
                    </div>
                  </div>
                </div>
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
        title="Absensi" 
        subtitle="Tap untuk mencatat kehadiran"
      />

      <div className="px-4 py-4 space-y-4">
        <AttendanceCard
          attendance={todayAttendance}
          onCheckIn={handleCheckIn}
          onCheckOut={handleCheckOut}
        />

        {/* History */}
        <div className="bg-card rounded-xl shadow-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground">Riwayat Absensi</h2>
              {totalRecords > 0 && (
                <span className="text-sm text-muted-foreground">
                  {pagination.from}-{pagination.to} dari {totalRecords} data
                </span>
              )}
            </div>
          </div>
          
          <div className="divide-y divide-border min-h-[400px]">
            {attendanceHistory.length > 0 ? (
              attendanceHistory.map((record) => (
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
                        <p className="font-semibold text-foreground text-lg">
                          {formatDateOnly(record.date)}
                        </p>
                        <span className={cn(
                          "text-sm font-medium px-3 py-1 rounded-full",
                          record.status === 'present' && "bg-success/10 text-success",
                          record.status === 'absent' && "bg-destructive/10 text-destructive"
                        )}>
                          {statusLabels[record.status as keyof typeof statusLabels]}
                        </span>
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
                                onClick={() => handlePhotoZoom(record.check_in_photo_url)}
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
                                onClick={() => handlePhotoZoom(record.check_out_photo_url)}
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
                <p className="text-lg">Belum ada riwayat absensi</p>
                <p className="text-sm mt-1">Mulai absensi untuk melihat riwayat</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-border">
              <div className="flex items-center justify-between">
                <button
                  onClick={handlePrevPage}
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
                  onClick={handleNextPage}
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
