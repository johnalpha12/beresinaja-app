import { ArrowLeft, TrendingUp, DollarSign, Package, ShoppingCart, Star } from "lucide-react";
import type { StoreDashboardData } from "@/types/dashboard";

interface StoreStatsScreenProps {
  onBack: () => void;
  dashboardData: StoreDashboardData;
}

export function StoreStatsScreen({ onBack, dashboardData }: StoreStatsScreenProps) {
  const { summary, stats, topProducts } = dashboardData;

  const statIcons = [ShoppingCart, DollarSign, Package, Star];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col pb-6">
      <div className="bg-gradient-to-br from-[#0288D1] to-[#4FC3F7] px-6 pt-10 pb-6 rounded-b-[2rem] shadow-sm mb-6">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={onBack}
            className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-white flex-1">Statistik Penjualan</h1>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 text-white">
          <div className="grid grid-cols-2 divide-x divide-white/20">
            <div className="pr-4">
              <div className="flex items-center gap-2 mb-1 opacity-80">
                <DollarSign className="w-4 h-4" />
                <span className="text-xs">Pendapatan Hari Ini</span>
              </div>
              <p className="text-xl font-bold">{summary.todaySales}</p>
            </div>
            <div className="pl-4">
              <div className="flex items-center gap-2 mb-1 opacity-80">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs">Total Bulan Ini</span>
              </div>
              <p className="text-xl font-bold">{summary.monthlySales}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-6">
        <div>
          <h2 className="text-[#4A4A4A] font-semibold mb-3">Ringkasan Aktivitas</h2>
          <div className="grid grid-cols-2 gap-3">
            {stats.map((stat, i) => {
              const Icon = statIcons[i % statIcons.length];
              return (
                <div key={stat.label} className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-sm flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#0288D1]/10 flex items-center justify-center text-[#0288D1] shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-[#6B6B6B] mb-0.5">{stat.label}</p>
                    <p className="text-lg font-bold text-[#4A4A4A] leading-none mb-1">{stat.value}</p>
                    <p className="text-[10px] text-[#10B981]">{stat.subvalue}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="text-[#4A4A4A] font-semibold mb-3">Produk Terlaris Anda</h2>
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm divide-y divide-[#E5E7EB]">
            {topProducts.length > 0 ? (
              topProducts.map((product, idx) => (
                <div key={product.id} className="p-4 flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0288D1] to-[#4FC3F7] text-white flex items-center justify-center font-bold shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[#4A4A4A] font-medium truncate">{product.name}</h3>
                    <p className="text-xs text-[#6B6B6B]">{product.price}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#4A4A4A]">{product.sold}</p>
                    <p className="text-[10px] text-[#0288D1]">Terjual</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-[#6B6B6B] text-sm">
                Belum ada data barang terjual.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
