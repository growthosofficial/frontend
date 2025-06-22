import './globals.css'

export const metadata = {
  title: 'Second Brain - Knowledge Management System',
  description: 'AI-powered knowledge management and organization system',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}