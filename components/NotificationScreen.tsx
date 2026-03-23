import { 
  ArrowLeft, 
  Bell,
  Package,
  Wrench,
  ShoppingCart,
  DollarSign,
  Star,
  Gift,
  AlertCircle,
  CheckCircle2,
  Clock,
  Megaphone,
  Settings,
  Trash2
} from "lucide-react";
import { useState } from "react";

type NotificationType = 
  | "order" 
  | "service" 
  | "payment" 
  | "review" 
  | "promo" 
  | "system" 
  | "alert";

interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  actionText?: string;
  actionUrl?: string;
}

interface NotificationScreenProps {
  onBack: () => void;
  role: "pengguna" | "toko" | "teknisi";
}

const getDummyNotifications = (role: "pengguna" | "toko" | "teknisi"): AppNotification[] => {
  if (role === "toko") {
    return [
      {
        id: "notif-toko-1",
        type: "order",
        title: "Pesanan Marketplace Baru",
        message: "Ada pesanan baru #ORD-TK-001 untuk iPhone 13 Pro 256GB. Silakan segera proses pesanan.",
        time: "5 menit yang lalu",
        isRead: false,
        actionText: "Proses Pesanan"
      },
      {
        id: "notif-toko-2",
        type: "payment",
        title: "Pencairan Dana Berhasil",
        message: "Dana sebesar Rp 2.500.000 telah berhasil dicairkan ke rekening Anda.",
        time: "1 jam yang lalu",
        isRead: false
      },
      {
        id: "notif-toko-3",
        type: "alert",
        title: "Stok Barang Menipis",
        message: "Stok Tempered Glass iPhone 12 tinggal 2 buah. Segera tambahkan stok untuk menghindari kehabisan barang.",
        time: "1 hari yang lalu",
        isRead: true,
        actionText: "Tambah Stok"
      },
      {
        id: "notif-toko-4",
        type: "system",
        title: "Panduan Berjualan Mulus",
        message: "Yuk pelajari cara mengoptimalkan toko Anda agar lebih banyak pembeli di BeresinAja.",
        time: "3 hari yang lalu",
        isRead: true
      }
    ];
  }

  if (role === "teknisi") {
    return [
      {
        id: "notif-tek-1",
        type: "service",
        title: "Panggilan Servis Baru Masuk!",
        message: "Order Ganti LCD Samsung A52 di Jl. Sudirman. Estimasi harga Rp 600.000. Konfirmasi segera.",
        time: "2 menit yang lalu",
        isRead: false,
        actionText: "Terima Order"
      },
      {
        id: "notif-tek-2",
        type: "payment",
        title: "Komisi Pekerjaan Masuk",
        message: "Komisi sebesar Rp 150.000 untuk perbaikan Install Ulang Laptop telah masuk ke Dompet.",
        time: "2 jam yang lalu",
        isRead: false
      },
      {
        id: "notif-tek-3",
        type: "review",
        title: "Ulasan Bintang 5 Baru",
        message: "Pelanggan Budi memberikan ulasan Bintang 5: 'Teknisi sangat ramah dan handal!'.",
        time: "1 hari yang lalu",
        isRead: true
      },
      {
        id: "notif-tek-4",
        type: "alert",
        title: "Performa Di Bawah Rata-Rata",
        message: "Persentase penolakan order Anda cukup tinggi minggu ini. Pertahankan tingkat penerimaan order Anda agar tetap aktif.",
        time: "2 hari yang lalu",
        isRead: true
      }
    ];
  }

  // Pengguna (User Default)
  return [
    {
      id: "notif-usr-001",
      type: "order",
      title: "Pesanan Berhasil Dibuat",
      message: "Pesanan #ORD-20240318-001 untuk Ganti LCD iPhone 13 Pro telah berhasil dibuat. Teknisi akan segera mengonfirmasi.",
      time: "2 menit yang lalu",
      isRead: false,
      actionText: "Lihat Pesanan",
      actionUrl: "/tracking"
    },
    {
      id: "notif-usr-002",
      type: "service",
      title: "Teknisi Dalam Perjalanan",
      message: "Ahmad Hidayat sedang dalam perjalanan ke lokasi Anda. Estimasi tiba 15 menit lagi.",
      time: "15 menit yang lalu",
      isRead: false,
      actionText: "Tracking",
      actionUrl: "/tracking"
    },
    {
      id: "notif-usr-006",
      type: "promo",
      title: "🎉 Promo Spesial Weekend!",
      message: "Dapatkan diskon 25% untuk semua servis smartphone. Gunakan kode: WEEKEND25. Berlaku hingga Minggu.",
      time: "5 jam yang lalu",
      isRead: true,
      actionText: "Gunakan Promo"
    },
    {
      id: "notif-usr-007",
      type: "order",
      title: "Pesanan Marketplace Dikirim",
      message: "Pesanan iPhone 13 Pro 256GB Anda dari toko telah dikirim. Estimasi tiba 2-3 hari kerja.",
      time: "1 hari yang lalu",
      isRead: true,
      actionText: "Lacak Paket"
    }
  ];
};

export function NotificationScreen({ onBack, role }: NotificationScreenProps) {
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [notifications, setNotifications] = useState<AppNotification[]>(getDummyNotifications(role));

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "order": return <Package className="w-5 h-5 text-[#0288D1]" />;
      case "service": return <Wrench className="w-5 h-5 text-[#10B981]" />;
      case "payment": return <DollarSign className="w-5 h-5 text-[#8B5CF6]" />;
      case "review": return <Star className="w-5 h-5 text-[#F59E0B]" />;
      case "promo": return <Gift className="w-5 h-5 text-[#EC4899]" />;
      case "system": return <Megaphone className="w-5 h-5 text-[#6B6B6B]" />;
      case "alert": return <AlertCircle className="w-5 h-5 text-[#EF4444]" />;
      default: return <Bell className="w-5 h-5 text-[#6B6B6B]" />;
    }
  };

  const getNotificationBgColor = (type: NotificationType) => {
    switch (type) {
      case "order": return "from-[#0288D1]/10 to-[#4FC3F7]/10";
      case "service": return "from-[#10B981]/10 to-[#34D399]/10";
      case "payment": return "from-[#8B5CF6]/10 to-[#A78BFA]/10";
      case "review": return "from-[#F59E0B]/10 to-[#FCD34D]/10";
      case "promo": return "from-[#EC4899]/10 to-[#F472B6]/10";
      case "system": return "from-[#6B6B6B]/10 to-[#9CA3AF]/10";
      case "alert": return "from-[#EF4444]/10 to-[#F87171]/10";
      default: return "from-[#E5E7EB]/10 to-[#F3F4F6]/10";
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, isRead: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  const filteredNotifications = activeTab === "all" 
    ? notifications 
    : notifications.filter(n => !n.isRead);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Group notifications by time
  const today: AppNotification[] = [];
  const thisWeek: AppNotification[] = [];
  const older: AppNotification[] = [];

  filteredNotifications.forEach(notif => {
    if (notif.time.includes("menit") || notif.time.includes("jam")) {
      today.push(notif);
    } else if (notif.time.includes("hari")) {
      thisWeek.push(notif);
    } else {
      older.push(notif);
    }
  });

  const renderNotification = (notif: AppNotification) => (
    <div 
      key={notif.id}
      onClick={() => markAsRead(notif.id)}
      className={`
        bg-white rounded-2xl p-4 border transition-all cursor-pointer
        ${notif.isRead 
          ? 'border-[#E5E7EB] hover:border-[#0288D1]/30' 
          : 'border-[#0288D1]/30 bg-[#0288D1]/[0.02] hover:border-[#0288D1]/50'
        }
      `}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className={`
          w-11 h-11 rounded-xl bg-gradient-to-br ${getNotificationBgColor(notif.type)}
          flex items-center justify-center flex-shrink-0
        `}>
          {getNotificationIcon(notif.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className={`text-sm ${notif.isRead ? 'text-[#4A4A4A]' : 'text-[#0288D1]'}`}>
              {notif.title}
            </h3>
            {!notif.isRead && (
              <div className="w-2 h-2 bg-[#0288D1] rounded-full flex-shrink-0 mt-1.5"></div>
            )}
          </div>
          
          <p className="text-sm text-[#6B6B6B] mb-2 line-clamp-2">
            {notif.message}
          </p>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1 text-xs text-[#9CA3AF]">
              <Clock className="w-3 h-3" />
              <span>{notif.time}</span>
            </div>

            {notif.actionText && (
              <button className="text-xs text-[#0288D1] hover:text-[#0277BD] px-3 py-1 rounded-lg hover:bg-[#0288D1]/5 transition-colors">
                {notif.actionText}
              </button>
            )}
          </div>
        </div>

        {/* Delete Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteNotification(notif.id);
          }}
          className="text-[#9CA3AF] hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors self-start -mt-1 -mr-1"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-[#E5E7EB] z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack}
              className="text-[#0288D1] hover:bg-[#0288D1]/5 p-2 rounded-full -ml-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-[#4A4A4A] font-semibold">Notifikasi</h1>
              {unreadCount > 0 && (
                <p className="text-xs text-[#6B6B6B]">{unreadCount} belum dibaca</p>
              )}
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-[#0288D1] hover:text-[#0277BD] px-3 py-2 rounded-lg hover:bg-[#0288D1]/5 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4 inline mr-1" />
              Tandai Semua
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="px-6 pb-3 pt-3">
          <div className="bg-[#F8FAFC] rounded-full p-1 flex border border-[#E5E7EB]">
            <button
              onClick={() => setActiveTab("all")}
              className={`
                flex-1 py-2 rounded-full text-sm transition-all font-medium
                ${activeTab === "all" 
                  ? 'bg-white text-[#0288D1] shadow-sm' 
                  : 'text-[#6B6B6B]'
                }
              `}
            >
              Semua ({notifications.length})
            </button>
            <button
              onClick={() => setActiveTab("unread")}
              className={`
                flex-1 py-2 rounded-full text-sm transition-all relative font-medium
                ${activeTab === "unread" 
                  ? 'bg-white text-[#0288D1] shadow-sm' 
                  : 'text-[#6B6B6B]'
                }
              `}
            >
              Belum Dibaca ({unreadCount})
              {unreadCount > 0 && (
                <div className="absolute top-1 right-2 w-2 h-2 bg-[#EF4444] rounded-full"></div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="w-20 h-20 bg-gradient-to-br from-[#0288D1]/10 to-[#4FC3F7]/10 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-10 h-10 text-[#0288D1]" />
            </div>
            <h3 className="text-[#4A4A4A] mb-2 font-medium">Tidak Ada Notifikasi</h3>
            <p className="text-sm text-[#6B6B6B] text-center">
              {activeTab === "all" 
                ? "Notifikasi Anda akan muncul di sini" 
                : "Semua notifikasi sudah dibaca"
              }
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Today */}
            {today.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-[#6B6B6B] mb-3 px-1">HARI INI</h3>
                <div className="space-y-3">
                  {today.map(renderNotification)}
                </div>
              </div>
            )}

            {/* This Week */}
            {thisWeek.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-[#6B6B6B] mb-3 px-1">MINGGU INI</h3>
                <div className="space-y-3">
                  {thisWeek.map(renderNotification)}
                </div>
              </div>
            )}

            {/* Older */}
            {older.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-[#6B6B6B] mb-3 px-1">SEBELUMNYA</h3>
                <div className="space-y-3">
                  {older.map(renderNotification)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Settings Button */}
      <div className="border-t border-[#E5E7EB] bg-white p-4">
        <button className="w-full flex items-center justify-center gap-2 text-[#6B6B6B] hover:text-[#0288D1] py-3 px-4 rounded-xl hover:bg-[#F8FAFC] transition-colors font-medium">
          <Settings className="w-5 h-5" />
          <span className="text-sm">Pengaturan Notifikasi</span>
        </button>
      </div>
    </div>
  );
}
