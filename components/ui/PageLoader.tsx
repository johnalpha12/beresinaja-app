type PageLoaderProps = {
  message?: string
  fullScreen?: boolean
}

export function PageLoader({
  message = "Memuat data...",
  fullScreen = true,
}: PageLoaderProps) {
  return (
    <div
      className={
        fullScreen
          ? "min-h-screen bg-[#F8FAFC] flex items-center justify-center px-6"
          : "w-full flex items-center justify-center py-16 px-6"
      }
    >
      <div className="text-center">
        <div className="relative mx-auto mb-4 h-14 w-14">
          <div className="absolute inset-0 rounded-full bg-[#0288D1]/10" />
          <div className="absolute inset-0 rounded-full border-4 border-[#0288D1]/20" />
          <div className="absolute inset-0 rounded-full border-4 border-[#0288D1] border-t-transparent animate-spin" />
        </div>
        <p className="text-sm text-[#6B6B6B]">{message}</p>
      </div>
    </div>
  )
}
