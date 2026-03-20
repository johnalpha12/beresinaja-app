const path = require("path");
const fs = require("fs");
const admin = require("firebase-admin");
const { loadEnvConfig } = require("@next/env");

const projectDir = path.join(__dirname, "..");

loadEnvConfig(projectDir);

function parseServiceAccount(rawValue, source) {
  try {
    return JSON.parse(rawValue);
  } catch (error) {
    console.error(`Service account from ${source} is not valid JSON.`, error);
    process.exit(1);
  }
}

function loadServiceAccountFromEnv() {
  const encodedJson = process.env.FIREBASE_ADMINSDK_JSON_BASE64?.trim();

  if (encodedJson) {
    return parseServiceAccount(
      Buffer.from(encodedJson, "base64").toString("utf8"),
      "FIREBASE_ADMINSDK_JSON_BASE64"
    );
  }

  const inlineJson = process.env.FIREBASE_ADMINSDK_JSON?.trim();

  if (inlineJson) {
    return parseServiceAccount(inlineJson, "FIREBASE_ADMINSDK_JSON");
  }

  const projectId =
    process.env.FIREBASE_PROJECT_ID?.trim() ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (projectId && clientEmail && privateKey?.trim()) {
    return {
      projectId,
      clientEmail,
      privateKey,
    };
  }

  return null;
}

function loadServiceAccountFromFile() {
  const serviceAccountPath =
    process.env.FIREBASE_ADMINSDK_PATH ||
    path.join(projectDir, "firebase-adminsdk.json");

  if (!fs.existsSync(serviceAccountPath)) {
    console.error("Service account file not found:", serviceAccountPath);
    process.exit(1);
  }

  return parseServiceAccount(
    fs.readFileSync(serviceAccountPath, "utf8"),
    serviceAccountPath
  );
}

const serviceAccount =
  loadServiceAccountFromEnv() || loadServiceAccountFromFile();

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
        "tech-ahmad-hidayat",
        "tech-budi-pratama",
        "tech-citra-amelia",
        "tech-deni-kurniawan",
      ],
    },
    marketplace: {
      categories: ["Semua", "HP", "Laptop", "Printer", "CCTV", "Aksesoris"],
      conditions: ["Semua", "Baru", "Bekas"],
    },
    "detail-teknisi": {
      technicianId: "tech-ahmad-hidayat",
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
    "service-history": {
      records: [
        {
          id: "SRV-20240315-001",
          serviceType: "Ganti LCD",
          deviceName: "iPhone 13 Pro",
          technician: "Ahmad Hidayat",
          date: "15 Mar 2024",
          status: "completed",
          price: "Rp 1.250.000",
          rating: 5,
          location: "Jakarta Selatan",
          duration: "2 jam",
          issues: ["LCD pecah", "Touchscreen tidak responsif"],
        },
        {
          id: "SRV-20240310-002",
          serviceType: "Ganti Baterai",
          deviceName: "Samsung Galaxy S22",
          technician: "Siti Rahmawati",
          date: "10 Mar 2024",
          status: "completed",
          price: "Rp 450.000",
          rating: 5,
          location: "Jakarta Pusat",
          duration: "1 jam",
          issues: ["Baterai kembung", "Cepat panas"],
        },
        {
          id: "SRV-20240308-003",
          serviceType: "Service Laptop",
          deviceName: "MacBook Pro 2020",
          technician: "Eko Prasetyo",
          date: "8 Mar 2024",
          status: "ongoing",
          price: "Rp 850.000",
          location: "Jakarta Selatan",
          duration: "3-4 jam",
          issues: ["Laptop lemot", "Sering restart sendiri"],
        },
        {
          id: "SRV-20240301-004",
          serviceType: "Perbaikan Charging Port",
          deviceName: "iPad Air 2022",
          technician: "Dewi Lestari",
          date: "1 Mar 2024",
          status: "completed",
          price: "Rp 350.000",
          rating: 4,
          location: "Jakarta Barat",
          duration: "1.5 jam",
          issues: ["Tidak bisa charging", "Port kendor"],
        },
        {
          id: "SRV-20240225-005",
          serviceType: "Install Ulang Windows",
          deviceName: "ASUS ROG Laptop",
          technician: "Budi Santoso",
          date: "25 Feb 2024",
          status: "completed",
          price: "Rp 250.000",
          rating: 5,
          location: "Tangerang Selatan",
          duration: "2 jam",
          issues: ["Windows error", "Blue screen"],
        },
        {
          id: "SRV-20240220-006",
          serviceType: "Ganti LCD",
          deviceName: "iPhone 12",
          technician: "Ahmad Hidayat",
          date: "20 Feb 2024",
          status: "cancelled",
          price: "Rp 950.000",
          location: "Jakarta Selatan",
          duration: "-",
          issues: ["LCD pecah"],
        },
        {
          id: "SRV-20240215-007",
          serviceType: "Pembersihan Internal",
          deviceName: "HP Pavilion Gaming",
          technician: "Eko Prasetyo",
          date: "15 Feb 2024",
          status: "completed",
          price: "Rp 150.000",
          rating: 5,
          location: "Jakarta Selatan",
          duration: "1 jam",
          issues: ["Laptop panas", "Kipas berisik"],
        },
        {
          id: "SRV-20240210-008",
          serviceType: "Ganti Speaker",
          deviceName: "iPhone 11 Pro Max",
          technician: "Siti Rahmawati",
          date: "10 Feb 2024",
          status: "completed",
          price: "Rp 400.000",
          rating: 4,
          location: "Jakarta Pusat",
          duration: "1.5 jam",
          issues: ["Speaker tidak bunyi", "Suara pecah"],
        },
      ],
    },
    "transaction-history": {
      records: [
        {
          id: "TRX-20240315-001",
          type: "service",
          title: "Ganti LCD iPhone 13 Pro",
          subtitle: "Pembayaran Servis",
          date: "15 Mar 2024",
          amount: "Rp 1.250.000",
          status: "success",
          paymentMethod: "GoPay",
        },
        {
          id: "TRX-20240314-002",
          type: "purchase",
          title: "Charger iPhone Original 20W",
          subtitle: "Toko Apple Store Official",
          date: "14 Mar 2024",
          amount: "Rp 399.000",
          status: "shipped",
          paymentMethod: "OVO",
          quantity: 1,
        },
        {
          id: "TRX-20240312-003",
          type: "sale",
          title: "iPhone 11 64GB",
          subtitle: "Penjualan Perangkat Bekas",
          date: "12 Mar 2024",
          amount: "Rp 3.500.000",
          status: "success",
          paymentMethod: "Transfer Bank",
          quantity: 1,
        },
        {
          id: "TRX-20240310-004",
          type: "service",
          title: "Ganti Baterai Samsung S22",
          subtitle: "Pembayaran Servis",
          date: "10 Mar 2024",
          amount: "Rp 450.000",
          status: "success",
          paymentMethod: "ShopeePay",
        },
        {
          id: "TRX-20240308-005",
          type: "purchase",
          title: "Casing Spigen iPhone 13 Pro",
          subtitle: "Toko Aksesori Premium",
          date: "8 Mar 2024",
          amount: "Rp 250.000",
          status: "success",
          paymentMethod: "GoPay",
          quantity: 1,
        },
        {
          id: "TRX-20240305-006",
          type: "service",
          title: "Service Laptop MacBook Pro",
          subtitle: "Pembayaran Servis",
          date: "5 Mar 2024",
          amount: "Rp 850.000",
          status: "processing",
          paymentMethod: "Transfer Bank",
        },
        {
          id: "TRX-20240301-007",
          type: "purchase",
          title: "AirPods Pro 2nd Gen",
          subtitle: "Toko Apple Premium Reseller",
          date: "1 Mar 2024",
          amount: "Rp 3.999.000",
          status: "success",
          paymentMethod: "Credit Card",
          quantity: 1,
        },
        {
          id: "TRX-20240228-008",
          type: "service",
          title: "Perbaikan Charging Port iPad",
          subtitle: "Pembayaran Servis",
          date: "28 Feb 2024",
          amount: "Rp 350.000",
          status: "success",
          paymentMethod: "OVO",
        },
        {
          id: "TRX-20240225-009",
          type: "sale",
          title: "Samsung Galaxy S21 128GB",
          subtitle: "Penjualan Perangkat Bekas",
          date: "25 Feb 2024",
          amount: "Rp 4.200.000",
          status: "success",
          paymentMethod: "Transfer Bank",
          quantity: 1,
        },
        {
          id: "TRX-20240220-010",
          type: "purchase",
          title: "Power Bank Anker 20.000mAh",
          subtitle: "Toko Elektronik Maju",
          date: "20 Feb 2024",
          amount: "Rp 450.000",
          status: "cancelled",
          paymentMethod: "GoPay",
          quantity: 1,
        },
        {
          id: "TRX-20240215-011",
          type: "service",
          title: "Install Ulang Windows + Office",
          subtitle: "Pembayaran Servis",
          date: "15 Feb 2024",
          amount: "Rp 250.000",
          status: "success",
          paymentMethod: "Cash",
        },
        {
          id: "TRX-20240210-012",
          type: "purchase",
          title: "Logitech MX Master 3S",
          subtitle: "Toko Komputer Sentral",
          date: "10 Feb 2024",
          amount: "Rp 1.499.000",
          status: "success",
          paymentMethod: "ShopeePay",
          quantity: 1,
        },
      ],
    },
  },
  technicians: {
    "tech-ahmad-hidayat": {
      name: "Ahmad Hidayat",
      photo: "AH",
      specialization: "Smartphone & Laptop Expert",
      rating: 4.9,
      totalReviews: 248,
      totalJobs: 532,
      responseTime: "< 15 menit",
      completionRate: "99%",
      experience: "7 tahun",
      location: "Jakarta Selatan",
      distance: "2.3 km dari lokasi Anda",
      verified: true,
      availability: "Tersedia Hari Ini",
      availabilityNote: "Bisa langsung booking untuk servis hari ini",
      joinDate: "Bergabung sejak 2019",
      skills: [
        { name: "Perbaikan iPhone", level: "Expert", jobs: 189 },
        { name: "Perbaikan Android", level: "Expert", jobs: 156 },
        { name: "Service Laptop", level: "Advanced", jobs: 124 },
        { name: "Ganti LCD/Layar", level: "Expert", jobs: 203 },
        { name: "Perbaikan Baterai", level: "Expert", jobs: 145 },
        { name: "Software Troubleshooting", level: "Advanced", jobs: 98 },
      ],
      services: [
        {
          name: "Ganti LCD iPhone",
          price: "Dari Rp 850.000",
          duration: "1-2 jam",
        },
        {
          name: "Service Laptop/PC",
          price: "Dari Rp 150.000",
          duration: "2-4 jam",
        },
        {
          name: "Ganti Baterai",
          price: "Dari Rp 250.000",
          duration: "30-60 menit",
        },
        {
          name: "Software Installation",
          price: "Dari Rp 100.000",
          duration: "1-2 jam",
        },
      ],
      workingHours: [
        { day: "Senin - Jumat", hours: "09:00 - 20:00" },
        { day: "Sabtu", hours: "10:00 - 18:00" },
        { day: "Minggu", hours: "Tutup" },
      ],
      reviews: [
        {
          id: "review-1",
          name: "Siti Nurhaliza",
          rating: 5,
          date: "2 hari lalu",
          comment:
            "Sangat profesional dan cepat! iPhone saya yang mati total bisa hidup lagi. Harga juga transparan, dijelaskan detail sebelum perbaikan. Recommended!",
          service: "Perbaikan iPhone 13 Pro",
          avatar: "SN",
        },
        {
          id: "review-2",
          name: "Budi Santoso",
          rating: 5,
          date: "1 minggu lalu",
          comment:
            "Teknisi yang ramah dan ahli. Laptop saya yang lemot sekarang kencang lagi. Dikerjakan di tempat dengan rapih dan bersih.",
          service: "Service Laptop ASUS",
          avatar: "BS",
        },
        {
          id: "review-3",
          name: "Diana Putri",
          rating: 4,
          date: "2 minggu lalu",
          comment:
            "Bagus dan cepat. Cuma agak lama di antrian karena banyak yang booking. Tapi hasil memuaskan!",
          service: "Ganti Baterai Samsung",
          avatar: "DP",
        },
      ],
      achievements: [
        {
          iconKey: "Award",
          label: "Top Rated",
          description: "Rating 4.8+ konsisten",
        },
        {
          iconKey: "ThumbsUp",
          label: "Most Booked",
          description: "500+ pekerjaan selesai",
        },
        {
          iconKey: "CheckCircle2",
          label: "Verified Pro",
          description: "Sertifikat Terverifikasi",
        },
        {
          iconKey: "TrendingUp",
          label: "Fast Response",
          description: "Respon < 15 menit",
        },
      ],
    },
    "tech-budi-pratama": {
      name: "Budi Pratama",
      photo: "BP",
      specialization: "Android & Tablet Specialist",
      rating: 4.8,
      totalReviews: 196,
      totalJobs: 417,
      responseTime: "< 20 menit",
      completionRate: "98%",
      experience: "6 tahun",
      location: "Jakarta Barat",
      distance: "3.1 km dari lokasi Anda",
      verified: true,
      availability: "Slot Tersedia Besok",
      availabilityNote: "Masih tersedia 4 slot kunjungan untuk besok pagi",
      joinDate: "Bergabung sejak 2020",
      skills: [
        { name: "Perbaikan Samsung", level: "Expert", jobs: 172 },
        { name: "Perbaikan Xiaomi", level: "Expert", jobs: 141 },
        { name: "Ganti Baterai", level: "Expert", jobs: 126 },
        { name: "Recovery Data", level: "Advanced", jobs: 88 },
        { name: "Perbaikan Tablet", level: "Advanced", jobs: 93 },
      ],
      services: [
        {
          name: "Perbaikan Android Bootloop",
          price: "Dari Rp 180.000",
          duration: "1-3 jam",
        },
        {
          name: "Ganti Port Charger",
          price: "Dari Rp 200.000",
          duration: "45-90 menit",
        },
        {
          name: "Ganti Baterai Tablet",
          price: "Dari Rp 300.000",
          duration: "1-2 jam",
        },
        {
          name: "Backup & Recovery Data",
          price: "Dari Rp 250.000",
          duration: "2-4 jam",
        },
      ],
      workingHours: [
        { day: "Senin - Jumat", hours: "10:00 - 21:00" },
        { day: "Sabtu", hours: "09:00 - 17:00" },
        { day: "Minggu", hours: "12:00 - 17:00" },
      ],
      reviews: [
        {
          id: "review-1",
          name: "Rina Sari",
          rating: 5,
          date: "3 hari lalu",
          comment:
            "Tablet anak saya sempat mati total dan berhasil normal lagi. Teknisi sangat komunikatif dan kasih update terus selama proses.",
          service: "Perbaikan Tablet Lenovo",
          avatar: "RS",
        },
        {
          id: "review-2",
          name: "Hendra Wijaya",
          rating: 4,
          date: "6 hari lalu",
          comment:
            "Pengerjaan rapi dan hasilnya bagus. Sedikit molor dari estimasi, tapi masih oke karena teknisinya jelas menjelaskan penyebabnya.",
          service: "Ganti Port Charger Samsung",
          avatar: "HW",
        },
        {
          id: "review-3",
          name: "Tari Ayu",
          rating: 5,
          date: "2 minggu lalu",
          comment:
            "Respons cepat dan langsung datang ke rumah. Sangat membantu untuk recovery data kantor saya.",
          service: "Recovery Data Xiaomi Pad",
          avatar: "TA",
        },
      ],
      achievements: [
        {
          iconKey: "Award",
          label: "High Satisfaction",
          description: "Ulasan positif stabil tiap bulan",
        },
        {
          iconKey: "ThumbsUp",
          label: "Frequent Repeat Order",
          description: "Banyak pelanggan booking ulang",
        },
        {
          iconKey: "CheckCircle2",
          label: "Verified Pro",
          description: "Data identitas dan sertifikat lengkap",
        },
        {
          iconKey: "TrendingUp",
          label: "Fast Response",
          description: "Respon rata-rata < 20 menit",
        },
      ],
    },
    "tech-citra-amelia": {
      name: "Citra Amelia",
      photo: "CA",
      specialization: "Laptop, PC & Software Troubleshooting",
      rating: 4.9,
      totalReviews: 221,
      totalJobs: 389,
      responseTime: "< 10 menit",
      completionRate: "99%",
      experience: "8 tahun",
      location: "Jakarta Pusat",
      distance: "4.2 km dari lokasi Anda",
      verified: true,
      availability: "Tersedia Hari Ini",
      availabilityNote: "Bisa ambil order remote support atau kunjungan siang ini",
      joinDate: "Bergabung sejak 2018",
      skills: [
        { name: "Install Ulang Windows", level: "Expert", jobs: 214 },
        { name: "Perbaikan Laptop", level: "Expert", jobs: 171 },
        { name: "Upgrade SSD/RAM", level: "Expert", jobs: 162 },
        { name: "Software Troubleshooting", level: "Expert", jobs: 187 },
        { name: "Setup Printer", level: "Advanced", jobs: 77 },
      ],
      services: [
        {
          name: "Install Ulang Laptop",
          price: "Dari Rp 120.000",
          duration: "1-2 jam",
        },
        {
          name: "Upgrade SSD / RAM",
          price: "Dari Rp 150.000",
          duration: "45-90 menit",
        },
        {
          name: "Perbaikan Laptop Tidak Nyala",
          price: "Dari Rp 350.000",
          duration: "2-6 jam",
        },
        {
          name: "Remote Troubleshooting",
          price: "Dari Rp 80.000",
          duration: "30-60 menit",
        },
      ],
      workingHours: [
        { day: "Senin - Jumat", hours: "08:00 - 19:00" },
        { day: "Sabtu", hours: "09:00 - 16:00" },
        { day: "Minggu", hours: "Tutup" },
      ],
      reviews: [
        {
          id: "review-1",
          name: "Kevin Saputra",
          rating: 5,
          date: "1 hari lalu",
          comment:
            "Laptop kantor saya kembali normal dan prosesnya cepat. Citra juga bantu backup data sebelum install ulang.",
          service: "Install Ulang Laptop Dell",
          avatar: "KS",
        },
        {
          id: "review-2",
          name: "Maya Lestari",
          rating: 5,
          date: "5 hari lalu",
          comment:
            "Sangat teliti saat diagnosa. Printer yang tadinya sering error sekarang lancar dipakai lagi.",
          service: "Setup Printer Epson",
          avatar: "ML",
        },
        {
          id: "review-3",
          name: "Yoga Prabowo",
          rating: 4,
          date: "9 hari lalu",
          comment:
            "Hasil perbaikan bagus dan teknisinya enak diajak diskusi. Waktu pengerjaan sesuai estimasi.",
          service: "Upgrade SSD Lenovo ThinkPad",
          avatar: "YP",
        },
      ],
      achievements: [
        {
          iconKey: "Award",
          label: "Top Rated",
          description: "Rating tinggi untuk servis laptop",
        },
        {
          iconKey: "ThumbsUp",
          label: "Remote Expert",
          description: "Sering menangani kendala software remote",
        },
        {
          iconKey: "CheckCircle2",
          label: "Verified Pro",
          description: "Lulus verifikasi teknis BeresinAja",
        },
        {
          iconKey: "TrendingUp",
          label: "Fast Response",
          description: "Respon rata-rata < 10 menit",
        },
      ],
    },
    "tech-deni-kurniawan": {
      name: "Deni Kurniawan",
      photo: "DK",
      specialization: "General Device Repair & Home Service",
      rating: 4.7,
      totalReviews: 154,
      totalJobs: 301,
      responseTime: "< 25 menit",
      completionRate: "97%",
      experience: "5 tahun",
      location: "Tangerang Selatan",
      distance: "5.8 km dari lokasi Anda",
      verified: true,
      availability: "Tersedia Sore Ini",
      availabilityNote: "Cocok untuk booking kunjungan rumah setelah jam kerja",
      joinDate: "Bergabung sejak 2021",
      skills: [
        { name: "Servis HP Umum", level: "Advanced", jobs: 136 },
        { name: "Servis Laptop Ringan", level: "Advanced", jobs: 102 },
        { name: "Pembersihan Hardware", level: "Expert", jobs: 144 },
        { name: "Ganti Keyboard Laptop", level: "Advanced", jobs: 79 },
        { name: "Setup CCTV Dasar", level: "Beginner", jobs: 31 },
      ],
      services: [
        {
          name: "Servis Ringan HP & Laptop",
          price: "Dari Rp 100.000",
          duration: "30-90 menit",
        },
        {
          name: "Pembersihan Hardware",
          price: "Dari Rp 90.000",
          duration: "30-60 menit",
        },
        {
          name: "Ganti Keyboard Laptop",
          price: "Dari Rp 220.000",
          duration: "1-2 jam",
        },
        {
          name: "Kunjungan Home Service",
          price: "Dari Rp 75.000",
          duration: "Sesuai pekerjaan",
        },
      ],
      workingHours: [
        { day: "Senin - Jumat", hours: "13:00 - 21:00" },
        { day: "Sabtu", hours: "10:00 - 20:00" },
        { day: "Minggu", hours: "10:00 - 15:00" },
      ],
      reviews: [
        {
          id: "review-1",
          name: "Nadya Putri",
          rating: 5,
          date: "4 hari lalu",
          comment:
            "Enak banget bisa home service malam hari. Laptop dibersihkan total dan sekarang adem lagi.",
          service: "Pembersihan Hardware Laptop",
          avatar: "NP",
        },
        {
          id: "review-2",
          name: "Arif Ramadhan",
          rating: 4,
          date: "1 minggu lalu",
          comment:
            "Teknisi datang tepat waktu dan pengerjaannya rapi. Untuk harga masih masuk akal.",
          service: "Servis Ringan Smartphone",
          avatar: "AR",
        },
        {
          id: "review-3",
          name: "Fina Maharani",
          rating: 5,
          date: "2 minggu lalu",
          comment:
            "Keyboard laptop saya sudah normal lagi. Cocok buat yang cari teknisi panggilan.",
          service: "Ganti Keyboard Laptop Acer",
          avatar: "FM",
        },
      ],
      achievements: [
        {
          iconKey: "Award",
          label: "Home Service Favorite",
          description: "Sering dipilih untuk servis panggilan",
        },
        {
          iconKey: "ThumbsUp",
          label: "Reliable Booking",
          description: "Tingkat kehadiran teknisi sangat tinggi",
        },
        {
          iconKey: "CheckCircle2",
          label: "Verified Pro",
          description: "Mitra aktif terverifikasi",
        },
        {
          iconKey: "TrendingUp",
          label: "Steady Growth",
          description: "Order meningkat stabil tiap bulan",
        },
      ],
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
        statusBadge: "Menunggu Konfirmasi",
        statusLabel: "Menunggu Konfirmasi Biaya",
        deviceName: "iPhone 13 Pro",
        deviceIssue: "Ganti LCD - Layar pecah",
        eta: "2 jam lagi",
        pickupType: "Jemput-Antar",
        technicianRating: "Rating 4.9",
        technicianCompleted: "567 servis berhasil",
        serviceCostConfirmation: {
          status: "pending",
          title: "Konfirmasi estimasi biaya",
          note: "Teknisi sudah selesai diagnosa awal. Mohon setujui estimasi biaya berikut agar pengerjaan bisa dilanjutkan.",
          lineItems: [
            {
              label: "LCD Original",
              amount: 750000,
            },
            {
              label: "Jasa pemasangan",
              amount: 100000,
            },
            {
              label: "Biaya jemput-antar",
              amount: 25000,
            },
          ],
          subtotal: 875000,
          discount: 25000,
          total: 850000,
          approvedAt: null,
          rejectedAt: null,
          rejectionReason: null,
        },
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
            desc: "Total estimasi Rp 850.000 menunggu persetujuan pelanggan",
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

function getInitials(name, fallback) {
  const initials = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return initials || fallback;
}

function createStoreDashboardSeed(displayName) {
  const name = String(displayName || "").trim() || "Toko Mitra";

  return {
    role: "toko",
    summary: {
      name,
      logo: getInitials(name, "TM"),
      rating: 4.8,
      totalProducts: 4,
      todaySales: "Rp 15.750.000",
      monthlySales: "Rp 248.500.000",
      storeStatus: "open",
    },
    stats: [
      { label: "Hari Ini", value: "24", subvalue: "pesanan" },
      { label: "Penjualan", value: "15.7jt", subvalue: "hari ini" },
      { label: "Produk", value: "4", subvalue: "aktif" },
      { label: "Rating", value: "4.8", subvalue: "120 ulasan" },
    ],
    pendingOrders: [
      {
        id: "ORD-20240318-101",
        customerName: "Siti Nurhaliza",
        customerAvatar: "SN",
        productName: "iPhone 13 Pro 256GB",
        quantity: 1,
        totalPrice: "Rp 13.500.000",
        status: "pending",
        orderDate: "18 Mar 2024, 10:30",
      },
      {
        id: "ORD-20240318-102",
        customerName: "Budi Santoso",
        customerAvatar: "BS",
        productName: "AirPods Pro 2nd Gen",
        quantity: 2,
        totalPrice: "Rp 7.998.000",
        status: "pending",
        orderDate: "18 Mar 2024, 11:15",
      },
      {
        id: "ORD-20240318-103",
        customerName: "Diana Putri",
        customerAvatar: "DP",
        productName: "Samsung Galaxy S24 Ultra",
        quantity: 1,
        totalPrice: "Rp 18.999.000",
        status: "processing",
        orderDate: "18 Mar 2024, 09:45",
      },
    ],
    topProducts: [
      {
        id: "PROD-001",
        name: "iPhone 13 Pro 256GB",
        image: "HP",
        price: "Rp 13.500.000",
        stock: 12,
        sold: 45,
        views: 1250,
        rating: 4.9,
        status: "active",
      },
      {
        id: "PROD-002",
        name: "Samsung Galaxy S24 Ultra",
        image: "HP",
        price: "Rp 18.999.000",
        stock: 3,
        sold: 28,
        views: 980,
        rating: 4.8,
        status: "low-stock",
      },
      {
        id: "PROD-003",
        name: "MacBook Pro M3 14 inch",
        image: "LT",
        price: "Rp 29.999.000",
        stock: 0,
        sold: 15,
        views: 756,
        rating: 5,
        status: "out-of-stock",
      },
      {
        id: "PROD-004",
        name: "AirPods Pro 2nd Gen",
        image: "AK",
        price: "Rp 3.999.000",
        stock: 24,
        sold: 89,
        views: 2340,
        rating: 4.9,
        status: "active",
      },
    ],
  };
}

function createTechnicianDashboardSeed(displayName) {
  const name = String(displayName || "").trim() || "Teknisi Mitra";

  return {
    role: "teknisi",
    summary: {
      name,
      photo: getInitials(name, "TM"),
      rating: 4.9,
      completedJobs: 532,
      todayEarnings: "Rp 850.000",
      monthlyEarnings: "Rp 12.500.000",
      availabilityStatus: "online",
    },
    stats: [
      { label: "Hari Ini", value: "3", subvalue: "order" },
      { label: "Minggu Ini", value: "18", subvalue: "order" },
      { label: "Rating", value: "4.9", subvalue: "248 ulasan" },
      { label: "Response", value: "99%", subvalue: "< 15 menit" },
    ],
    orders: {
      pending: [
        {
          id: "ORD-20240318-001",
          customerName: "Siti Nurhaliza",
          customerAvatar: "SN",
          serviceType: "Ganti LCD",
          deviceName: "iPhone 13 Pro",
          issues: ["LCD pecah", "Touchscreen tidak responsif"],
          location: "Kebayoran Baru, Jakarta Selatan",
          distance: "2.3 km",
          scheduledTime: "Hari ini, 14:00",
          estimatedPrice: "Rp 1.250.000",
          status: "pending",
          priority: "urgent",
        },
        {
          id: "ORD-20240318-002",
          customerName: "Budi Santoso",
          customerAvatar: "BS",
          serviceType: "Service Laptop",
          deviceName: "ASUS ROG",
          issues: ["Laptop lemot", "Sering restart"],
          location: "Senopati, Jakarta Selatan",
          distance: "3.8 km",
          scheduledTime: "Hari ini, 16:00",
          estimatedPrice: "Rp 350.000",
          status: "pending",
          priority: "normal",
        },
      ],
      active: [
        {
          id: "ORD-20240318-004",
          customerName: "Eko Prasetyo",
          customerAvatar: "EP",
          serviceType: "Install Ulang Windows",
          deviceName: "Lenovo ThinkPad",
          issues: ["Windows error", "Blue screen"],
          location: "Blok M, Jakarta Selatan",
          distance: "1.2 km",
          scheduledTime: "Sedang berlangsung",
          estimatedPrice: "Rp 250.000",
          status: "in-progress",
          priority: "normal",
        },
      ],
      history: [],
    },
  };
}

async function seedCollection(collectionName, docs) {
  const batch = db.batch();
  const colRef = db.collection(collectionName);
  Object.entries(docs).forEach(([id, data]) => {
    batch.set(colRef.doc(id), data);
  });
  await batch.commit();
}

async function seedBusinessDashboards() {
  const userSnapshots = await Promise.all([
    db.collection("users").where("role", "==", "toko").get(),
    db.collection("users").where("role", "==", "teknisi").get(),
  ]);

  for (const snapshot of userSnapshots) {
    for (const userDoc of snapshot.docs) {
      const profile = userDoc.data() || {};
      const displayName =
        String(profile.fullName || "").trim() ||
        String(profile.email || "").split("@")[0].trim() ||
        "Mitra BeresinAja";

      if (profile.role === "toko") {
        const dashboardRef = db.collection("storeDashboards").doc(userDoc.id);
        const dashboardSnap = await dashboardRef.get();

        if (!dashboardSnap.exists) {
          await dashboardRef.set(createStoreDashboardSeed(displayName));
        }
      }

      if (profile.role === "teknisi") {
        const dashboardRef = db.collection("technicianDashboards").doc(userDoc.id);
        const dashboardSnap = await dashboardRef.get();

        if (!dashboardSnap.exists) {
          await dashboardRef.set(createTechnicianDashboardSeed(displayName));
        }
      }
    }
  }
}

async function run() {
  try {
    await seedCollection("content", seed.content);
    await seedCollection("technicians", seed.technicians);
    await seedCollection("products", seed.products);
    await seedCollection("orders", seed.orders);
    await seedBusinessDashboards();
    console.log("Firestore seed complete.");
  } catch (error) {
    console.error("Firestore seed failed:", error);
    process.exit(1);
  }
}

run();
