import { Clock, LogIn, LogOut, CheckCircle2, Camera, ZoomIn, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AttendanceRecord } from '@/types';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { AttendancePhotoModal } from './AttendancePhotoModal';
import { ImageZoomModal } from './ImageZoomModal';
import { formatDate, formatTime, getCurrentTime } from '@/utils/timezone';

interface AttendanceCardProps {
  attendance: AttendanceRecord | null;
  onCheckIn: (photo: File | null, notes: string) => Promise<void>;
  onCheckOut: (photo: File | null, notes: string) => Promise<void>;
}

export function AttendanceCard({ attendance, onCheckIn, onCheckOut }: AttendanceCardProps) {
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [modalType, setModalType] = useState<'check-in' | 'check-out'>('check-in');
  const [showImageZoom, setShowImageZoom] = useState(false);
  const [zoomImageUrl, setZoomImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const hasCheckedIn = !!attendance?.check_in;
  const hasCheckedOut = !!attendance?.check_out;
  const isComplete = hasCheckedIn && hasCheckedOut;

  const handleCheckInClick = () => {
    setModalType('check-in');
    setShowPhotoModal(true);
  };

  const handleCheckOutClick = () => {
    setModalType('check-out');
    setShowPhotoModal(true);
  };

  const handleQuickCheckIn = async () => {
    try {
      setIsProcessing(true);
      await onCheckIn(null, '');
    } catch (error) {
      console.error('Quick check-in error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuickCheckOut = async () => {
    try {
      setIsProcessing(true);
      await onCheckOut(null, '');
    } catch (error) {
      console.error('Quick check-out error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePhotoConfirm = async (photo: File | null, notes: string) => {
    try {
      setIsProcessing(true);
      if (modalType === 'check-in') {
        await onCheckIn(photo, notes);
      } else {
        await onCheckOut(photo, notes);
      }
      setShowPhotoModal(false);
    } catch (error) {
      // Error handling is done in parent component
      console.error('Attendance error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePhotoZoom = (photoUrl: string) => {
    setZoomImageUrl(photoUrl);
    setShowImageZoom(true);
  };

  return (
    <div className="bg-card rounded-2xl p-5 shadow-card animate-fade-in">
      <div className="text-center mb-6">
        <p className="text-sm text-muted-foreground font-medium">
          {formatDate(getCurrentTime(), 'EEEE, d MMMM yyyy')}
        </p>
        <p className="text-4xl font-bold text-foreground mt-2">
          {formatTime(getCurrentTime())}
        </p>
      </div>

      {isComplete ? (
        <div className="text-center py-6">
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto animate-pulse-success">
            <CheckCircle2 className="w-10 h-10 text-success" />
          </div>
          <p className="text-lg font-semibold text-success mt-4">Absensi Lengkap</p>
          <div className="flex justify-center gap-8 mt-4 text-sm">
            <div>
              <p className="text-muted-foreground">Masuk</p>
              <p className="font-semibold text-foreground">
                {formatTime(attendance.check_in!)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Pulang</p>
              <p className="font-semibold text-foreground">
                {formatTime(attendance.check_out!)}
              </p>
            </div>
          </div>
          
          {/* Photo Thumbnails */}
          {(attendance.check_in_photo_url || attendance.check_out_photo_url) && (
            <div className="flex justify-center gap-3 mt-4">
              {attendance.check_in_photo_url && (
                <div className="relative">
                  <button
                    onClick={() => handlePhotoZoom(attendance.check_in_photo_url!)}
                    className="relative block w-12 h-12 rounded-lg overflow-hidden bg-muted hover:opacity-80 transition-opacity group"
                  >
                    <img
                      src={attendance.check_in_photo_url}
                      alt="Check-in photo"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ZoomIn className="w-3 h-3 text-white" />
                    </div>
                  </button>
                  <div className="absolute -bottom-1 -left-1 bg-success text-white text-xs px-1 py-0.5 rounded-full text-[10px]">
                    Masuk
                  </div>
                </div>
              )}
              {attendance.check_out_photo_url && (
                <div className="relative">
                  <button
                    onClick={() => handlePhotoZoom(attendance.check_out_photo_url!)}
                    className="relative block w-12 h-12 rounded-lg overflow-hidden bg-muted hover:opacity-80 transition-opacity group"
                  >
                    <img
                      src={attendance.check_out_photo_url}
                      alt="Check-out photo"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ZoomIn className="w-3 h-3 text-white" />
                    </div>
                  </button>
                  <div className="absolute -bottom-1 -left-1 bg-warning text-white text-xs px-1 py-0.5 rounded-full text-[10px]">
                    Pulang
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {!hasCheckedIn ? (
            <div className="space-y-3">
              <Button 
                size="lg" 
                className="w-full h-16 text-lg"
                variant="success"
                onClick={handleCheckInClick}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Camera className="w-6 h-6" />
                    Tap untuk Hadir
                  </>
                )}
              </Button>
              
              <Button 
                size="sm" 
                className="w-full h-12 text-sm"
                variant="outline"
                onClick={handleQuickCheckIn}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    Hadir Tanpa Foto
                  </>
                )}
              </Button>
            </div>
          ) : (
            <>
              <div className="bg-success/10 rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Sudah hadir</p>
                  <p className="font-semibold text-foreground">
                    {formatTime(attendance.check_in!)}
                  </p>
                </div>
                {attendance.check_in_photo_url && (
                  <div className="relative">
                    <button
                      onClick={() => handlePhotoZoom(attendance.check_in_photo_url!)}
                      className="relative block w-10 h-10 rounded-lg overflow-hidden bg-muted hover:opacity-80 transition-opacity group"
                    >
                      <img
                        src={attendance.check_in_photo_url}
                        alt="Check-in photo"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ZoomIn className="w-3 h-3 text-white" />
                      </div>
                    </button>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <Button 
                  size="lg" 
                  className="w-full h-16 text-lg"
                  variant="warning"
                  onClick={handleCheckOutClick}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <Camera className="w-6 h-6" />
                      Tap untuk Pulang
                    </>
                  )}
                </Button>
                
                <Button 
                  size="sm" 
                  className="w-full h-12 text-sm"
                  variant="outline"
                  onClick={handleQuickCheckOut}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      Pulang Tanpa Foto
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      )}
      
      {/* Photo Modal */}
      <AttendancePhotoModal
        open={showPhotoModal}
        type={modalType}
        onClose={() => setShowPhotoModal(false)}
        onConfirm={handlePhotoConfirm}
        isProcessing={isProcessing}
      />

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
