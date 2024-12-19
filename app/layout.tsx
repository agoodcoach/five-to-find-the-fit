import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Five To Find The Fit',
  description: 'College fit calculator by Alan Good',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
