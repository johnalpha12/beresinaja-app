const path = require("path");
const fs = require("fs");
const admin = require("firebase-admin");

const serviceAccountPath =
  process.env.FIREBASE_ADMINSDK_PATH ||
  path.join(__dirname, "..", "firebase-adminsdk.json");

if (!fs.existsSync(serviceAccountPath)) {
  console.error("Service account file not found:", serviceAccountPath);
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const seed = {
  content: {
    home: {
      promo: {
        tag: "Promo Spesial",
        title: "Gratis Jemput-Antar!",
        description: "Untuk servis pertama kamu. Berlaku hingga akhir bulan.",
        cta: "Pakai Sekarang",
      },
      services: [
        { key: "servis-perangkat", label: "Servis Perangkat", iconKey: "Wrench" },
        { key: "marketplace", label: "Beli Barang", iconKey: "ShoppingBag" },
        { key: "jual-barang", label: "Jual Barang", iconKey: "DollarSign" },
        { key: "tracking", label: "Track Status", iconKey: "MapPin" },
      ],
      recommendedTechnicians: [
        { id: 1, name: "Ahmad Teknisi", rating: 4.8, specialty: "iPhone Specialist" },
        { id: 2, name: "Budi Servis", rating: 4.9, specialty: "Samsung Expert" },
        { id: 3, name: "Citra Electronics", rating: 4.7, specialty: "Laptop & PC" },
        { id: 4, name: "Deni Repair", rating: 4.8, specialty: "All Brands" },
      ],
    },
    marketplace: {
      categories: ["Semua", "HP", "Laptop", "Printer", "CCTV", "Aksesoris"],
      conditions: ["Semua", "Baru", "Bekas"],
    },
    "product-detail": {
      productId: "p1",
    },
    checkout: {
      product: {
        name: "iPhone 14 Pro Max",
        variant: "256 GB - Deep Purple",
        price: 18500000,
        quantity: 1,
        image: "📱",
      },
      deliveryAddress: {
        recipient: "John Doe",
        phone: "0812-3456-7890",
        address: "Jl. Sudirman No. 123, RT 001/RW 002",
        area: "Kebayoran Baru, Jakarta Selatan",
        postalCode: "12190",
      },
      shippingOptions: [
        {
          id: "regular",
          name: "Pengiriman Reguler",
          duration: "2-3 hari kerja",
          price: 0,
          description: "Gratis ongkir untuk area Jakarta & Tangerang",
        },
        {
          id: "express",
          name: "Pengiriman Express",
          duration: "1 hari kerja",
          price: 25000,
          description: "Estimasi tiba besok",
        },
      ],
      paymentOptions: [
        {
          id: "bank",
          name: "Transfer Bank",
          iconKey: "bank",
          description: "BCA, Mandiri, BNI, BRI",
        },
        {
          id: "ewallet",
          name: "E-Wallet",
          iconKey: "ewallet",
          description: "GoPay, OVO, Dana, ShopeePay",
        },
        {
          id: "cod",
          name: "Bayar di Tempat (COD)",
          iconKey: "cod",
          description: "Bayar saat barang diterima",
        },
      ],
      platformFee: 5000,
    },
    "servis-perangkat": {
      promo: {
        title: "Promo Spesial!",
        description: "Dapatkan Diskon 10% untuk servis pertama kamu!",
      },
      categories: [
        { key: "servis-komputer", label: "Komputer", iconKey: "Monitor" },
        { key: "servis-komputer", label: "Laptop", iconKey: "Laptop" },
        { key: "servis-komputer", label: "Printer", iconKey: "Printer" },
        { key: "servis-komputer", label: "HP", iconKey: "Smartphone" },
        { key: "servis-komputer", label: "CCTV", iconKey: "Video" },
      ],
      generalServices: [
        "Ganti LCD / Layar Rusak",
        "Servis Baterai / Tidak Mau Ngecas",
        "Perbaikan Motherboard",
        "Upgrade RAM / Storage",
        "Install Ulang OS",
        "Pembersihan Hardware",
      ],
    },
    "servis-komputer": {
      services: [
        {
          iconKey: "Monitor",
          title: "Ganti Power Supply",
          desc: "Perbaiki unit PSU rusak atau drop.",
        },
        {
          iconKey: "RefreshCw",
          title: "Install Ulang Sistem Operasi",
          desc: "Windows / Linux / MacOS.",
        },
        {
          iconKey: "MemoryStick",
          title: "Upgrade RAM / Storage",
          desc: "Tingkatkan performa komputer kamu.",
        },
        {
          iconKey: "Wind",
          title: "Pembersihan Hardware",
          desc: "Hilangkan debu dan periksa kipas.",
        },
        {
          iconKey: "Cpu",
          title: "Perbaikan Motherboard / CPU",
          desc: "Diagnosa dan perbaikan komponen utama.",
        },
      ],
    },
    "jual-barang": {
      categories: ["HP", "Laptop", "Komputer", "Printer", "CCTV", "Aksesoris", "Lainnya"],
    },
    chat: {
      quickReplies: ["Harga servis?", "Teknisi terdekat?", "Cara tracking?"],
      botReplies: {
        "Harga servis?":
          "Harga servis bervariasi tergantung perangkat dan jenis kerusakan. Mulai dari Rp 50.000 untuk servis ringan hingga Rp 1.500.000 untuk ganti LCD iPhone terbaru. Mau cek estimasi untuk perangkat tertentu?",
        "Teknisi terdekat?":
          "Ada 12 teknisi aktif di area Medan dalam radius 5 km. Teknisi terdekat adalah Ahmad (rating 4.9, 2.1 km) dan Budi (rating 4.8, 2.8 km). Mau langsung pesan?",
        "Cara tracking?":
          "Kamu bisa tracking status servis di menu Tracking. Klik tab 'Tracking' di bawah, lalu pilih order aktifmu. Kamu akan melihat status real-time dari pengambilan hingga pengiriman barang.",
      },
    },
  },
  products: {
    p1: {
      name: "iPhone 14 Pro Max",
      price: 18500000,
      rating: 4.9,
      reviews: 1234,
      sold: 234,
      conditionBadge: "Baru",
      description:
        "iPhone 14 Pro Max baru, belum pernah dipakai. Lengkap dengan dus, charger, dan aksesoris original. Garansi resmi Apple 1 tahun. Bisa COD area Medan.",
      specs: [
        { label: "Merek", value: "Apple" },
        { label: "Model", value: "iPhone 14 Pro Max" },
        { label: "Warna", value: "Deep Purple" },
        { label: "Penyimpanan", value: "256 GB" },
        { label: "RAM", value: "6 GB" },
        { label: "Kondisi", value: "Baru" },
      ],
      store: {
        name: "iBox Official Store",
        rating: 4.9,
        distance: "1.2 km",
        responseTime: "1 jam",
        successRate: "99%",
        verified: true,
      },
      seller: "iBox Official",
      distance: "1.2 km",
      badge: "Baru",
      category: "HP",
      condition: "Baru",
      imageEmoji: "📱",
    },
    p2: {
      name: "MacBook Air M2",
      price: 16999000,
      rating: 5,
      reviews: 189,
      sold: 120,
      conditionBadge: "Baru",
      description: "MacBook Air M2 baru dengan garansi resmi.",
      specs: [
        { label: "Merek", value: "Apple" },
        { label: "Model", value: "MacBook Air M2" },
        { label: "Penyimpanan", value: "256 GB" },
        { label: "RAM", value: "8 GB" },
        { label: "Kondisi", value: "Baru" },
      ],
      store: {
        name: "Apple Authorized Reseller",
        rating: 5.0,
        distance: "0.8 km",
        responseTime: "1 jam",
        successRate: "98%",
        verified: true,
      },
      seller: "Apple Authorized Reseller",
      distance: "0.8 km",
      badge: "Baru",
      category: "Laptop",
      condition: "Baru",
      imageEmoji: "💻",
    },
    p3: {
      name: "Samsung Galaxy S23 Ultra",
      price: 14500000,
      rating: 4.8,
      reviews: 312,
      sold: 98,
      conditionBadge: null,
      description: "Samsung Galaxy S23 Ultra bekas, kondisi mulus.",
      specs: [
        { label: "Merek", value: "Samsung" },
        { label: "Model", value: "Galaxy S23 Ultra" },
        { label: "Penyimpanan", value: "256 GB" },
        { label: "RAM", value: "12 GB" },
        { label: "Kondisi", value: "Bekas" },
      ],
      store: {
        name: "Samsung Store",
        rating: 4.8,
        distance: "2.1 km",
        responseTime: "2 jam",
        successRate: "96%",
        verified: true,
      },
      seller: "Samsung Store",
      distance: "2.1 km",
      badge: null,
      category: "HP",
      condition: "Bekas",
      imageEmoji: "📱",
    },
    p4: {
      name: "HP LaserJet Pro",
      price: 3200000,
      rating: 4.6,
      reviews: 87,
      sold: 54,
      conditionBadge: "Baru",
      description: "Printer HP LaserJet Pro baru dengan garansi resmi.",
      specs: [
        { label: "Merek", value: "HP" },
        { label: "Model", value: "LaserJet Pro" },
        { label: "Kondisi", value: "Baru" },
      ],
      store: {
        name: "Print Center",
        rating: 4.6,
        distance: "1.5 km",
        responseTime: "2 jam",
        successRate: "95%",
        verified: true,
      },
      seller: "Print Center",
      distance: "1.5 km",
      badge: "Baru",
      category: "Printer",
      condition: "Baru",
      imageEmoji: "🖨️",
    },
  },
  orders: {
    sample: {
      summary: {
        orderId: "BRSA-8H2K7Q3X",
        productName: "iPhone 14 Pro Max",
        variant: "256 GB - Deep Purple",
        totalAmount: 18505000,
        estimatedDelivery: "28-29 Februari 2026",
        paymentMethod: "Transfer Bank BCA",
      },
      tracking: {
        orderId: "BA-2510-8374",
        statusBadge: "Dikerjakan",
        statusLabel: "Dikerjakan",
        deviceName: "iPhone 13 Pro",
        deviceIssue: "Ganti LCD - Layar pecah",
        eta: "2 jam lagi",
        pickupType: "Jemput-Antar",
        technicianRating: "Rating 4.9",
        technicianCompleted: "567 servis berhasil",
        steps: [
          {
            step: 1,
            label: "Perangkat Dijemput",
            date: "27 Okt, 09:15",
            desc: "Kurir dalam perjalanan ke lokasi kamu",
            status: "done",
          },
          {
            step: 2,
            label: "Sedang Diperiksa",
            date: "27 Okt, 10:30",
            desc: "Teknisi memeriksa kondisi perangkat",
            status: "done",
          },
          {
            step: 3,
            label: "Menunggu Konfirmasi Biaya",
            date: null,
            desc: "Estimasi: Rp 850.000 - LCD Original",
            status: "active",
          },
          {
            step: 4,
            label: "Sedang Diperbaiki",
            date: null,
            desc: null,
            status: "pending",
          },
          {
            step: 5,
            label: "Selesai & Siap Diantar",
            date: null,
            desc: null,
            status: "pending",
          },
        ],
      },
    },
  },
};

async function seedCollection(collectionName, docs) {
  const batch = db.batch();
  const colRef = db.collection(collectionName);
  Object.entries(docs).forEach(([id, data]) => {
    batch.set(colRef.doc(id), data);
  });
  await batch.commit();
}

async function run() {
  try {
    await seedCollection("content", seed.content);
    await seedCollection("products", seed.products);
    await seedCollection("orders", seed.orders);
    console.log("Firestore seed complete.");
  } catch (error) {
    console.error("Firestore seed failed:", error);
    process.exit(1);
  }
}

run();
