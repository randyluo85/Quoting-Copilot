// frontend/app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'SmartQuote - 智能报价系统',
  description: '双轨核算 AI 报价系统',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>
        <nav className="border-b p-4 flex gap-6 bg-gray-50">
          <Link href="/" className="text-gray-700 hover:text-blue-600 transition">
            首页
          </Link>
          <Link href="/dashboard/materials" className="text-gray-700 hover:text-blue-600 transition">
            物料库
          </Link>
        </nav>
        {children}
      </body>
    </html>
  )
}
