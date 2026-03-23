import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { CartProvider } from '@/components/context/CartContext'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'BeresinAja - Servis Perangkat & Marketplace',
  description: 'Layanan servis perangkat elektronik terpercaya. Ganti LCD, upgrade RAM, install ulang OS, dan beli/jual perangkat bekas di BeresinAja.',
  generator: 'beresin-aja',
}

export const viewport: Viewport = {
  themeColor: '#2196F3',
  width: 'device-width',
  initialScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const showVercelAnalytics = process.env.VERCEL === "1"

  return (
    <html lang="id">
      <body className={`${inter.variable} font-sans antialiased`}>
        <div className="app-shell">
          <AuthProvider>
            <CartProvider>{children}</CartProvider>
          </AuthProvider>
        </div>
        {showVercelAnalytics ? <Analytics /> : null}
      </body>
    </html>
  )
}
