
import React from 'react'
// import { usePathname } from 'next/navigation'
import { AuthProvider } from '@/contexts/auth-context'
import '@/styles/globals.css'
import { Metadata } from 'next'
import logo from "../assets/chainsnobg.png"

export const metadata: Metadata = {
  title: 'Chains-ERP',
  description: 'Chains-ERP',
  icons: {
    icon: logo.src,
  },
}

export default function RootLayout({

  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full" title='Chains-ERP'>
      <body className="h-full bg-gray-50">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
