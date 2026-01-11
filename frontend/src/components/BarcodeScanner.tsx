import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Camera, CameraOff, Flashlight, FlashlightOff } from 'lucide-react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';

interface BarcodeScannerProps {
  open: boolean;
  onClose: () => void;
  onScan: (result: string) => void;
}

export function BarcodeScanner({ open, onClose, onScan }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFlashlight, setHasFlashlight] = useState(false);
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (open) {
      initializeScanner();
    } else {
      stopScanning();
    }

    return () => {
      stopScanning();
    };
  }, [open]);

  const initializeScanner = async () => {
    try {
      setError(null);
      
      // Get camera devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setCameraDevices(videoDevices);
      
      // Prefer back camera for barcode scanning
      const backCamera = videoDevices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear') ||
        device.label.toLowerCase().includes('environment')
      );
      
      const deviceId = backCamera?.deviceId || videoDevices[0]?.deviceId;
      setSelectedCamera(deviceId);
      
      if (deviceId) {
        await startScanning(deviceId);
      } else {
        setError('Tidak ada kamera yang tersedia');
      }
    } catch (err) {
      console.error('Error initializing scanner:', err);
      setError('Gagal mengakses kamera. Pastikan izin kamera telah diberikan.');
    }
  };

  const startScanning = async (deviceId: string) => {
    try {
      setIsScanning(true);
      setError(null);

      // Stop previous scanning
      if (readerRef.current) {
        readerRef.current.reset();
      }

      // Initialize reader
      const reader = new BrowserMultiFormatReader();
      readerRef.current = reader;

      // Get video stream
      const constraints = {
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          facingMode: deviceId ? undefined : { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Check for flashlight capability
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities();
      setHasFlashlight('torch' in capabilities);

      // Start decoding
      reader.decodeFromVideoDevice(deviceId, videoRef.current, (result, error) => {
        if (result) {
          const scannedText = result.getText();
          console.log('Barcode scanned:', scannedText);
          onScan(scannedText);
          onClose();
        }
        
        if (error && !(error instanceof NotFoundException)) {
          console.error('Scan error:', error);
        }
      });

    } catch (err) {
      console.error('Error starting scanner:', err);
      setError('Gagal memulai scanner. Periksa izin kamera.');
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    setIsScanning(false);
    setFlashlightOn(false);

    // Stop reader
    if (readerRef.current) {
      readerRef.current.reset();
      readerRef.current = null;
    }

    // Stop video stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Clear video element
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const toggleFlashlight = async () => {
    if (!streamRef.current) return;

    try {
      const track = streamRef.current.getVideoTracks()[0];
      const capabilities = track.getCapabilities();
      
      if ('torch' in capabilities) {
        await track.applyConstraints({
          advanced: [{ torch: !flashlightOn } as any]
        });
        setFlashlightOn(!flashlightOn);
      }
    } catch (err) {
      console.error('Error toggling flashlight:', err);
    }
  };

  const switchCamera = async (deviceId: string) => {
    setSelectedCamera(deviceId);
    await startScanning(deviceId);
  };

  const handleClose = () => {
    stopScanning();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-auto p-0 bg-black">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Scan Barcode
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-white hover:bg-white/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="relative">
          {/* Video Element */}
          <video
            ref={videoRef}
            className="w-full h-64 object-cover"
            playsInline
            muted
          />

          {/* Scanning Overlay */}
          {isScanning && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="border-2 border-primary w-48 h-32 relative">
                <div className="absolute inset-0 border border-white/50"></div>
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary"></div>
                
                {/* Scanning Line Animation */}
                <div className="absolute inset-x-0 top-0 h-0.5 bg-primary animate-pulse"></div>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
              <div className="text-center text-white p-4">
                <CameraOff className="w-12 h-12 mx-auto mb-2 text-red-400" />
                <p className="text-sm">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={initializeScanner}
                  className="mt-2"
                >
                  Coba Lagi
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-4 space-y-3">
          {/* Camera Selection */}
          {cameraDevices.length > 1 && (
            <div className="space-y-2">
              <label className="text-sm text-white">Pilih Kamera:</label>
              <select
                value={selectedCamera}
                onChange={(e) => switchCamera(e.target.value)}
                className="w-full p-2 rounded bg-white/10 text-white border border-white/20"
              >
                {cameraDevices.map((device, index) => (
                  <option key={device.deviceId} value={device.deviceId} className="text-black">
                    {device.label || `Kamera ${index + 1}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            {hasFlashlight && (
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFlashlight}
                className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                {flashlightOn ? (
                  <>
                    <FlashlightOff className="w-4 h-4 mr-2" />
                    Matikan Flash
                  </>
                ) : (
                  <>
                    <Flashlight className="w-4 h-4 mr-2" />
                    Nyalakan Flash
                  </>
                )}
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Tutup
            </Button>
          </div>

          {/* Instructions */}
          <div className="text-center text-white/70 text-sm">
            <p>Arahkan kamera ke barcode untuk memindai</p>
            <p>Pastikan barcode terlihat jelas dalam kotak</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}