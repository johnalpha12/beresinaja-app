import { 
  ArrowLeft, 
  Image as ImageIcon, 
  Plus,
  X,
  Package,
  DollarSign,
  FileText,
  Tag,
  Box,
  Shield,
  Info
} from "lucide-react";
import { useState } from "react";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { OutlineButton } from "@/components/ui/OutlineButton";

interface AddProductScreenProps {
  onBack: () => void;
  onSuccess: (formData: any) => void;
}

export default function AddProductScreen({ onBack, onSuccess }: AddProductScreenProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    brand: "",
    price: "",
    stock: "",
    condition: "new" as "new" | "used",
    warranty: "",
    description: "",
    specifications: [{ key: "", value: "" }]
  });

  const categories = [
    "Smartphone",
    "Laptop & Komputer",
    "Tablet",
    "Aksesoris HP",
    "Aksesoris Laptop",
    "Audio & Headphone",
    "Smartwatch",
    "Gaming",
    "Kamera",
    "Power Bank & Charger",
    "Lainnya"
  ];

  const handleAddImage = () => {
    // Simulate image upload
    if (images.length < 5) {
      setImages([...images, `📱`]); // Placeholder emoji
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleAddSpecification = () => {
    setFormData({
      ...formData,
      specifications: [...formData.specifications, { key: "", value: "" }]
    });
  };

  const handleRemoveSpecification = (index: number) => {
    setFormData({
      ...formData,
      specifications: formData.specifications.filter((_, i) => i !== index)
    });
  };

  const handleSpecificationChange = (index: number, field: "key" | "value", value: string) => {
    const newSpecs = [...formData.specifications];
    newSpecs[index][field] = value;
    setFormData({ ...formData, specifications: newSpecs });
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    // Let the parent handle the API call
    try {
      await onSuccess(formData);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = formData.name && formData.category && formData.price && formData.stock && images.length > 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-[#E5E7EB] px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="text-[#0288D1] hover:bg-[#0288D1]/5 p-2 rounded-full -ml-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-[#4A4A4A]">Tambah Produk</h1>
            <p className="text-xs text-[#6B6B6B]">Lengkapi data produk Anda</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-32">
        <div className="p-6 space-y-6 max-w-2xl mx-auto">
          {/* Image Upload Section */}
          <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB]">
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon className="w-5 h-5 text-[#0288D1]" />
              <h3 className="text-[#4A4A4A]">Foto Produk</h3>
              <span className="text-xs text-red-500">*</span>
            </div>
            <p className="text-sm text-[#6B6B6B] mb-4">
              Upload minimal 1 foto, maksimal 5 foto. Format: JPG, PNG (Max 5MB)
            </p>
            
            <div className="grid grid-cols-3 gap-3">
              {images.map((img, index) => (
                <div 
                  key={index}
                  className="relative aspect-square bg-gradient-to-br from-[#0288D1]/10 to-[#4FC3F7]/10 rounded-xl border-2 border-dashed border-[#0288D1]/30 flex items-center justify-center"
                >
                  <div className="text-5xl">{img}</div>
                  <button
                    onClick={() => handleRemoveImage(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {index === 0 && (
                    <div className="absolute bottom-2 left-2 right-2 bg-[#0288D1] text-white text-xs py-1 px-2 rounded-md text-center">
                      Foto Utama
                    </div>
                  )}
                </div>
              ))}
              
              {images.length < 5 && (
                <button
                  onClick={handleAddImage}
                  className="aspect-square bg-white rounded-xl border-2 border-dashed border-[#E5E7EB] hover:border-[#0288D1] hover:bg-[#0288D1]/5 flex flex-col items-center justify-center gap-2 transition-all"
                >
                  <Plus className="w-6 h-6 text-[#0288D1]" />
                  <span className="text-xs text-[#6B6B6B]">Tambah Foto</span>
                </button>
              )}
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-5 h-5 text-[#0288D1]" />
              <h3 className="text-[#4A4A4A]">Informasi Produk</h3>
            </div>

            {/* Product Name */}
            <div>
              <label className="block text-sm text-[#4A4A4A] mb-2">
                Nama Produk <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: iPhone 13 Pro 256GB"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full h-12 px-4 rounded-xl border border-[#E5E7EB] focus:border-[#0288D1] focus:outline-none transition-colors text-[#4A4A4A] placeholder:text-[#9CA3AF]"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm text-[#4A4A4A] mb-2">
                Kategori <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full h-12 px-4 rounded-xl border border-[#E5E7EB] focus:border-[#0288D1] focus:outline-none transition-colors text-[#4A4A4A] bg-white"
              >
                <option value="">Pilih Kategori</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Brand */}
            <div>
              <label className="block text-sm text-[#4A4A4A] mb-2">
                Merek/Brand
              </label>
              <input
                type="text"
                placeholder="Contoh: Apple, Samsung, Xiaomi"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full h-12 px-4 rounded-xl border border-[#E5E7EB] focus:border-[#0288D1] focus:outline-none transition-colors text-[#4A4A4A] placeholder:text-[#9CA3AF]"
              />
            </div>

            {/* Condition */}
            <div>
              <label className="block text-sm text-[#4A4A4A] mb-2">
                Kondisi <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, condition: "new" })}
                  className={`
                    h-12 rounded-xl border-2 transition-all
                    ${formData.condition === "new"
                      ? 'border-[#0288D1] bg-[#0288D1]/5 text-[#0288D1]'
                      : 'border-[#E5E7EB] bg-white text-[#6B6B6B] hover:border-[#0288D1]/30'
                    }
                  `}
                >
                  Baru
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, condition: "used" })}
                  className={`
                    h-12 rounded-xl border-2 transition-all
                    ${formData.condition === "used"
                      ? 'border-[#0288D1] bg-[#0288D1]/5 text-[#0288D1]'
                      : 'border-[#E5E7EB] bg-white text-[#6B6B6B] hover:border-[#0288D1]/30'
                    }
                  `}
                >
                  Bekas
                </button>
              </div>
            </div>
          </div>

          {/* Price & Stock */}
          <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-[#0288D1]" />
              <h3 className="text-[#4A4A4A]">Harga & Stok</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Price */}
              <div>
                <label className="block text-sm text-[#4A4A4A] mb-2">
                  Harga <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6B6B]">
                    Rp
                  </span>
                  <input
                    type="text"
                    placeholder="0"
                    value={formData.price}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setFormData({ ...formData, price: value });
                    }}
                    className="w-full h-12 pl-12 pr-4 rounded-xl border border-[#E5E7EB] focus:border-[#0288D1] focus:outline-none transition-colors text-[#4A4A4A] placeholder:text-[#9CA3AF]"
                  />
                </div>
                {formData.price && (
                  <p className="text-xs text-[#6B6B6B] mt-1">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(formData.price))}
                  </p>
                )}
              </div>

              {/* Stock */}
              <div>
                <label className="block text-sm text-[#4A4A4A] mb-2">
                  Stok <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl border border-[#E5E7EB] focus:border-[#0288D1] focus:outline-none transition-colors text-[#4A4A4A] placeholder:text-[#9CA3AF]"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Warranty */}
          <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-[#0288D1]" />
              <h3 className="text-[#4A4A4A]">Garansi</h3>
            </div>

            <div>
              <label className="block text-sm text-[#4A4A4A] mb-2">
                Masa Garansi
              </label>
              <input
                type="text"
                placeholder="Contoh: Garansi Resmi 1 Tahun"
                value={formData.warranty}
                onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                className="w-full h-12 px-4 rounded-xl border border-[#E5E7EB] focus:border-[#0288D1] focus:outline-none transition-colors text-[#4A4A4A] placeholder:text-[#9CA3AF]"
              />
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-[#0288D1]" />
              <h3 className="text-[#4A4A4A]">Deskripsi</h3>
            </div>

            <div>
              <label className="block text-sm text-[#4A4A4A] mb-2">
                Deskripsi Produk
              </label>
              <textarea
                placeholder="Jelaskan detail produk, kelebihan, kelengkapan, dll..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={6}
                className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] focus:border-[#0288D1] focus:outline-none transition-colors text-[#4A4A4A] placeholder:text-[#9CA3AF] resize-none"
              />
              <p className="text-xs text-[#6B6B6B] mt-1">
                {formData.description.length}/1000 karakter
              </p>
            </div>
          </div>

          {/* Specifications */}
          <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#0288D1]" />
                <h3 className="text-[#4A4A4A]">Spesifikasi</h3>
              </div>
              <button
                onClick={handleAddSpecification}
                className="text-sm text-[#0288D1] hover:text-[#0277BD] flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Tambah
              </button>
            </div>

            <div className="space-y-3">
              {formData.specifications.map((spec, index) => (
                <div key={index} className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Nama spesifikasi"
                    value={spec.key}
                    onChange={(e) => handleSpecificationChange(index, "key", e.target.value)}
                    className="flex-1 h-10 px-3 rounded-lg border border-[#E5E7EB] focus:border-[#0288D1] focus:outline-none transition-colors text-sm text-[#4A4A4A] placeholder:text-[#9CA3AF]"
                  />
                  <input
                    type="text"
                    placeholder="Nilai"
                    value={spec.value}
                    onChange={(e) => handleSpecificationChange(index, "value", e.target.value)}
                    className="flex-1 h-10 px-3 rounded-lg border border-[#E5E7EB] focus:border-[#0288D1] focus:outline-none transition-colors text-sm text-[#4A4A4A] placeholder:text-[#9CA3AF]"
                  />
                  {formData.specifications.length > 1 && (
                    <button
                      onClick={() => handleRemoveSpecification(index)}
                      className="w-10 h-10 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-gradient-to-r from-[#0288D1]/5 to-[#4FC3F7]/5 border border-[#0288D1]/20 rounded-xl p-4">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-[#0288D1] flex-shrink-0 mt-0.5" />
              <div className="text-sm text-[#6B6B6B]">
                <p className="mb-1">
                  Pastikan semua informasi produk sudah benar sebelum dipublikasikan.
                </p>
                <p>
                  Produk akan ditinjau oleh tim BeresinAja dalam 1x24 jam.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E7EB] p-6 safe-area-bottom">
        <div className="flex gap-3 max-w-2xl mx-auto">
          <OutlineButton 
            label="Simpan Draft"
            onClick={onBack}
            className="flex-1"
          />
          <div className="flex-[2]">
            <PrimaryButton 
              label={isLoading ? "Memproses..." : "Publikasikan Produk"}
              onClick={handleSubmit}
              disabled={!isFormValid || isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
