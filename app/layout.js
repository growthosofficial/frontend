import './globals.css'
import { Montserrat, Inter } from 'next/font/google'

export const metadata = {
  title: 'Second Brain - Knowledge Management System',
  description: 'AI-powered knowledge management and organization system',
}

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} ${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}
