import type { Metadata } from 'next'
import { Prompt } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { CartProvider } from '@/context/CartContext'
import CartDrawer from '@/components/cart/CartDrawer'
import CommandPalette from '@/components/layout/CommandPalette'
import FitAiAdvisor from '@/components/ai/FitAiAdvisor'

const promptFont = Prompt({
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-prompt',
})

export const metadata: Metadata = {
  title: {
    default: 'FIT SUPPLEMENT | ร้านค้าและสารานุกรมอาหารเสริมมาตรฐานระดับพรีเมียม',
    template: '%s | FIT SUPPLEMENT',
  },
  description:
    'แหล่งข้อมูลและร้านค้าอาหารเสริมทางการสำหรับคนไทยที่เข้าฟิตเนส อิงหลักฐานทางวิทยาศาสตร์ สินค้าแท้ 100% มีเลข อย. รับรอง',
  keywords: ['อาหารเสริม', 'ฟิตเนส', 'โปรตีน', 'creatine', 'สุขภาพ', 'fitwhey', 'baam'],
  robots: 'index, follow',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th" className={promptFont.variable}>
      <body className={`${promptFont.className} bg-background text-textPrimary min-h-screen flex flex-col antialiased text-[15px] leading-relaxed tracking-normal`}>
        <CartProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <CartDrawer />
          <CommandPalette />
          <FitAiAdvisor />
        </CartProvider>
      </body>
    </html>
  )
}
