import { Download, Smartphone, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWA } from '@/hooks/usePWA';
import { toast } from 'sonner';

export function InstallPWA() {
  const { canInstall, isInstalled, isStandalone, installApp } = usePWA();

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      toast.success('Aplikasi berhasil diinstall! Cek home screen Anda.');
    } else {
      // Show manual instructions for different platforms
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);
      
      if (isIOS) {
        toast.info('Untuk install di iOS: Tap Share → Add to Home Screen');
      } else if (isAndroid) {
        toast.info('Untuk install di Android: Tap menu browser → Add to Home Screen');
      } else {
        toast.info('Untuk install: Cari opsi "Install App" atau "Add to Home Screen" di browser Anda');
      }
    }
  };

  // Don't show if already installed or running in standalone mode
  if (isInstalled || isStandalone) {
    return null;
  }

  // Show different UI based on platform
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={handleInstall}
        variant="outline"
        size="sm"
        className="flex items-center gap-2 text-xs"
      >
        {isIOS ? (
          <Smartphone className="w-3 h-3" />
        ) : isAndroid ? (
          <Download className="w-3 h-3" />
        ) : (
          <Monitor className="w-3 h-3" />
        )}
        <span className="hidden sm:inline">
          {isIOS ? 'Add to Home' : 'Install App'}
        </span>
        <span className="sm:hidden">Install</span>
      </Button>
    </div>
  );
}