import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Camera, CameraOff, Flashlight, FlashlightOff } from 'lucide-react';
import { Html5QrcodeScanner, Html5Qrcode, Html5QrcodeScanType } from 'html5-qrcode';
import '@/styles/barcode-scanner.css';

interface BarcodeScannerProps {
  open: boolean;
  onClose: () => void;
  onScan: (result: string) => void;
}

export function BarcodeScanner({ open, onClose, onScan }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFlashlight, setHasFlashlight] = useState(false);
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const elementId = 'qr-reader';

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
      const devices = await Html5Qrcode.getCameras();
      setCameraDevices(devices);
      
      // Prefer back camera for barcode scanning
      const backCamera = devices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear') ||
        device.label.toLowerCase().includes('environment')
      );
      
      const cameraId = backCamera?.id || devices[0]?.id;
      setSelectedCamera(cameraId);
      
      if (cameraId) {
        await startScanning(cameraId);
      } else {
        setError('Tidak ada kamera yang tersedia');
      }
    } catch (err) {
      console.error('Error initializing scanner:', err);
      setError('Gagal mengakses kamera. Pastikan izin kamera telah diberikan.');
    }
  };

  const startScanning = async (cameraId: string) => {
    try {
      setIsScanning(true);
      setError(null);

      // Stop previous scanning
      if (scannerRef.current) {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      }

      // Initialize scanner
      const scanner = new Html5Qrcode(elementId);
      scannerRef.current = scanner;

      // Configuration for scanning
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 150 },
        aspectRatio: 1.777778,
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
      };

      // Start scanning
      await scanner.start(
        cameraId,
        config,
        (decodedText, decodedResult) => {
          console.log('Barcode scanned:', decodedText);
          onScan(decodedText);
          onClose();
        },
        (errorMessage) => {
          // Handle scan errors silently (common during scanning)
          // console.log('Scan error:', errorMessage);
        }
      );

      // Check for flashlight capability
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { deviceId: cameraId } 
        });
        const track = stream.getVideoTracks()[0];
        const capabilities = track.getCapabilities();
        setHasFlashlight('torch' in capabilities);
        stream.getTracks().forEach(track => track.stop());
      } catch (err) {
        console.log('Could not check flashlight capability:', err);
      }

    } catch (err) {
      console.error('Error starting scanner:', err);
      setError('Gagal memulai scanner. Periksa izin kamera.');
      setIsScanning(false);
    }
  };

  const stopScanning = async () => {
    setIsScanning(false);
    setFlashlightOn(false);

    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        scannerRef.current = null;
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
  };

  const toggleFlashlight = async () => {
    if (!scannerRef.current) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { deviceId: selectedCamera } 
      });
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities();
      
      if ('torch' in capabilities) {
        await track.applyConstraints({
          advanced: [{ torch: !flashlightOn } as any]
        });
        setFlashlightOn(!flashlightOn);
      }
      
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      console.error('Error toggling flashlight:', err);
    }
  };

  const switchCamera = async (cameraId: string) => {
    setSelectedCamera(cameraId);
    await startScanning(cameraId);
  };

  const handleClose = async () => {
    await stopScanning();
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
          {/* Scanner Element */}
          <div id={elementId} className="w-full h-64"></div>

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
                  <option key={device.id} value={device.id} className="text-black">
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