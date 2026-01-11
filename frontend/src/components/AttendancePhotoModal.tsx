import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Camera, RotateCcw, Check, X } from 'lucide-react';
import { compressImage, formatFileSize } from '@/utils/imageCompression';

interface AttendancePhotoModalProps {
  open: boolean;
  type: 'check-in' | 'check-out';
  onClose: () => void;
  onConfirm: (photo: File | null, notes: string) => Promise<void>;
  isProcessing?: boolean;
}

export function AttendancePhotoModal({ open, type, onClose, onConfirm, isProcessing = false }: AttendancePhotoModalProps) {
  const [capturedPhoto, setCapturedPhoto] = useState<File | null>(null);
  const [originalPhoto, setOriginalPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return;
    }

    try {
      setIsCompressing(true);
      setOriginalPhoto(file);
      
      // Compress image to 50% compression (quality 0.5) for attendance photos
      const compressedFile = await compressImage(file, 0.5, 800, 600);
      setCapturedPhoto(compressedFile);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error('Error compressing image:', error);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleRetakePhoto = () => {
    setCapturedPhoto(null);
    setOriginalPhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirm = async () => {
    try {
      await onConfirm(capturedPhoto, notes.trim());
      handleClose();
    } catch (error) {
      console.error('Error submitting attendance:', error);
    }
  };

  const handleClose = () => {
    if (isProcessing) return; // Prevent closing while processing
    setCapturedPhoto(null);
    setOriginalPhoto(null);
    setPhotoPreview(null);
    setNotes('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const title = type === 'check-in' ? 'Absensi Masuk' : 'Absensi Pulang';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] w-full mx-auto max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Camera className="w-5 h-5 text-primary" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 px-1">
          {/* Photo Capture Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Foto Absensi (Opsional)</Label>
            
            {!photoPreview ? (
              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
                <Camera className="w-10 h-10 text-muted-foreground mx-auto mb-3 sm:w-12 sm:h-12" />
                <p className="text-sm text-muted-foreground mb-4">
                  Ambil foto untuk verifikasi absensi (opsional)
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCameraClick}
                  disabled={isCompressing}
                  className="w-full h-12"
                >
                  {isCompressing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                      Memproses...
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4 mr-2" />
                      Ambil Foto (Opsional)
                    </>
                  )}
                </Button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoCapture}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden">
                  <img
                    src={photoPreview}
                    alt="Captured photo"
                    className="w-full h-40 object-cover sm:h-48"
                  />
                </div>
                
                {/* Compression Info */}
                {originalPhoto && capturedPhoto && (
                  <div className="bg-success/10 rounded-lg p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-success font-medium">Foto dikompres 95%</span>
                      <span className="text-muted-foreground text-xs sm:text-sm">
                        {formatFileSize(originalPhoto.size)} → {formatFileSize(capturedPhoto.size)}
                      </span>
                    </div>
                  </div>
                )}
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRetakePhoto}
                  className="w-full h-12"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Ambil Ulang
                </Button>
              </div>
            )}
          </div>

          {/* Notes Section */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">Catatan (Opsional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={`Tambahkan catatan untuk ${type === 'check-in' ? 'absensi masuk' : 'absensi pulang'}...`}
              rows={3}
              maxLength={500}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {notes.length}/500 karakter
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 h-12"
              disabled={isProcessing}
            >
              <X className="w-4 h-4 mr-2" />
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={isProcessing}
              className="flex-1 h-12"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Menyimpan...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  {type === 'check-in' ? 'Hadir' : 'Pulang'}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}