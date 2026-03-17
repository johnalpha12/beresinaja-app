/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: "/home",
        destination: "/beranda",
        permanent: true,
      },
      {
        source: "/profile",
        destination: "/profil",
        permanent: true,
      },
      {
        source: "/tracking",
        destination: "/pelacakan",
        permanent: true,
      },
      {
        source: "/product-detail",
        destination: "/detail-produk",
        permanent: true,
      },
      {
        source: "/teknisi-detail",
        destination: "/detail-teknisi",
        permanent: true,
      },
      {
        source: "/orderan-berhasil",
        destination: "/pesanan-berhasil",
        permanent: true,
      },
    ]
  },
}

export default nextConfig
