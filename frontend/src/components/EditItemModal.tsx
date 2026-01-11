import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, X, Upload, Image as ImageIcon, Loader2, ZoomIn, ScanLine } from 'lucide-react';
import { Item, Unit, Category } from '@/types';
import { compressImage, isImageFile, formatFileSize } from '@/utils/imageCompression';
import { ImageZoomModal } from './ImageZoomModal';
import { BarcodeScanner } from './BarcodeScanner';
import { unitsApi, categoriesApi } from '@/services/api';

interface EditItemModalProps {
  open: boolean;
  item: Item | null;
  onClose: () => void;
  onConfirm: (itemId: string, itemData: FormData) => void;
}

export function EditItemModal({ open, item, onClose, onConfirm }: EditItemModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    stock: 0,
    unit: '',
    category: '',
    min_stock: 0,
    description: '',
    price: '',
    supplier: '',
    is_active: true,
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [showImageZoom, setShowImageZoom] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [units, setUnits] = useState<Unit[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingUnits, setIsLoadingUnits] = useState(false);

  // Load units and categories when modal opens
  useEffect(() => {
    if (open) {
      loadUnits();
      loadCategories();
    }
  }, [open]);

  const loadUnits = async () => {
    try {
      setIsLoadingUnits(true);
      const response = await unitsApi.getOptions();
      if (response.success && response.data) {
        setUnits(response.data);
      }
    } catch (error) {
      console.error('Error loading units:', error);
    } finally {
      setIsLoadingUnits(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoriesApi.getOptions();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  // Populate form when item changes
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        sku: item.sku || '',
        stock: item.stock || 0,
        unit: item.unit || '',
        category: item.category || '',
        min_stock: item.min_stock || 0,
        description: item.description || '',
        price: item.price ? item.price.toString() : '',
        supplier: item.supplier || '',
        is_active: item.is_active !== false,
      });
      setCurrentImageUrl(item.image_url || null);
      setSelectedImage(null);
      setOriginalImage(null);
      setImagePreview(null);
      setShowImageZoom(false);
    }
  }, [item]);

  const handleChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && isImageFile(file)) {
      setOriginalImage(file);
      setIsCompressing(true);
      
      try {
        // Compress image to 95% (quality 0.05)
        const compressedFile = await compressImage(file, 0.05);
        setSelectedImage(compressedFile);
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(compressedFile);
        
        console.log(`Image compression: ${formatFileSize(file.size)} → ${formatFileSize(compressedFile.size)}`);
      } catch (error) {
        console.error('Error compressing image:', error);
        // Fallback to original file if compression fails
        setSelectedImage(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setOriginalImage(null);
    setImagePreview(null);
    setShowImageZoom(false);
  };

  const handleBarcodeScanned = (scannedCode: string) => {
    setFormData(prev => ({
      ...prev,
      sku: scannedCode.toUpperCase()
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!item || !formData.name || !formData.sku || !formData.unit || !formData.category) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('sku', formData.sku.toUpperCase());
      submitData.append('stock', formData.stock.toString());
      submitData.append('unit', formData.unit);
      submitData.append('category', formData.category);
      submitData.append('min_stock', formData.min_stock.toString());
      submitData.append('is_active', formData.is_active.toString());
      
      if (formData.description) {
        submitData.append('description', formData.description);
      }
      if (formData.price) {
        submitData.append('price', formData.price);
      }
      if (formData.supplier) {
        submitData.append('supplier', formData.supplier);
      }
      if (selectedImage) {
        submitData.append('image', selectedImage);
      }

      await onConfirm(item.id, submitData);
    } catch (error) {
      console.error('Error updating item:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Edit Barang
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nama Barang */}
          <div className="space-y-2">
            <Label htmlFor="name">Nama Barang *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Contoh: Semen Portland"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* SKU */}
          <div className="space-y-2">
            <Label htmlFor="sku">SKU *</Label>
            <div className="relative">
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => handleChange('sku', e.target.value.toUpperCase())}
                placeholder="Contoh: SEM-001"
                required
                disabled={isSubmitting}
                className="pr-12"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-primary/10"
                onClick={() => setShowBarcodeScanner(true)}
                disabled={isSubmitting}
              >
                <ScanLine className="w-4 h-4 text-primary" />
              </Button>
            </div>
          </div>

          {/* Stock & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="stock">Stok Saat Ini</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => handleChange('stock', e.target.value)}
                placeholder="0"
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Satuan *</Label>
              <Select 
                value={formData.unit} 
                onValueChange={(value) => handleChange('unit', value)}
                disabled={isSubmitting || isLoadingUnits}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingUnits ? "Memuat..." : "Pilih satuan"} />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit.id} value={unit.name}>
                      {unit.name} {unit.symbol && `(${unit.symbol})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category & Min Stock */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="category">Kategori *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => handleChange('category', value)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="min_stock">Min. Stok</Label>
              <Input
                id="min_stock"
                type="number"
                min="0"
                value={formData.min_stock}
                onChange={(e) => handleChange('min_stock', e.target.value)}
                placeholder="0"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Price & Supplier */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="price">Harga (Rp)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                value={formData.price}
                onChange={(e) => handleChange('price', e.target.value)}
                placeholder="0"
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => handleChange('supplier', e.target.value)}
                placeholder="Nama supplier"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Deskripsi barang (opsional)"
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="is_active">Status</Label>
            <Select 
              value={formData.is_active ? 'active' : 'inactive'} 
              onValueChange={(value) => handleChange('is_active', value === 'active')}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Tidak Aktif</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="image">Gambar Barang</Label>
            {isCompressing ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <div className="text-center">
                  <Loader2 className="mx-auto h-8 w-8 text-primary animate-spin" />
                  <div className="mt-2">
                    <span className="text-sm text-primary">
                      Mengkompresi gambar...
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Mohon tunggu sebentar
                  </p>
                </div>
              </div>
            ) : imagePreview ? (
              <div className="relative group">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full h-32 object-cover rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setShowImageZoom(true)}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center rounded-lg">
                  <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={removeImage}
                  disabled={isSubmitting}
                >
                  <X className="w-4 h-4" />
                </Button>
                {originalImage && selectedImage && (
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {formatFileSize(originalImage.size)} → {formatFileSize(selectedImage.size)}
                  </div>
                )}
              </div>
            ) : currentImageUrl ? (
              <div className="relative group">
                <img 
                  src={currentImageUrl} 
                  alt="Current" 
                  className="w-full h-32 object-cover rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setShowImageZoom(true)}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center rounded-lg">
                  <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="absolute top-2 right-2">
                  <label htmlFor="image" className="cursor-pointer">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={isSubmitting || isCompressing}
                      asChild
                    >
                      <span>
                        <Upload className="w-4 h-4" />
                      </span>
                    </Button>
                    <input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      disabled={isSubmitting || isCompressing}
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <div className="text-center">
                  <ImageIcon className="mx-auto h-8 w-8 text-gray-400" />
                  <div className="mt-2">
                    <label htmlFor="image" className="cursor-pointer">
                      <span className="text-sm text-primary hover:text-primary/80">
                        Pilih gambar
                      </span>
                      <input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        disabled={isSubmitting || isCompressing}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, GIF (otomatis dikompres 95%)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isCompressing || !formData.name || !formData.sku || !formData.unit || !formData.category}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Menyimpan...
                </>
              ) : (
                'Simpan'
              )}
            </Button>
          </div>
        </form>

        {/* Image Zoom Modal */}
        {(imagePreview || currentImageUrl) && (
          <ImageZoomModal
            open={showImageZoom}
            onClose={() => setShowImageZoom(false)}
            imageUrl={imagePreview || currentImageUrl || ''}
            imageName={item ? `${item.name} - ${item.sku}` : 'Preview Gambar'}
            imageAlt={item ? `Gambar ${item.name}` : 'Preview gambar'}
          />
        )}

        {/* Barcode Scanner Modal */}
        <BarcodeScanner
          open={showBarcodeScanner}
          onClose={() => setShowBarcodeScanner(false)}
          onScan={handleBarcodeScanned}
        />
      </DialogContent>
    </Dialog>
  );
}