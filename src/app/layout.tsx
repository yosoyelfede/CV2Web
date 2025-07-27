import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CV2W - Transform CVs into Professional Websites',
  description: 'Automated CV processing and website generation powered by AI. Transform static resumes into dynamic, professional web portfolios in minutes.',
  keywords: 'CV processing, website generation, AI automation, portfolio creation, resume to website',
  authors: [{ name: 'CV2W Team' }],
  creator: 'CV2W',
  publisher: 'CV2W',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://cv2w.com'),
  openGraph: {
    title: 'CV2W - Transform CVs into Professional Websites',
    description: 'Automated CV processing and website generation powered by AI.',
    url: 'https://cv2w.com',
    siteName: 'CV2W',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CV2W - AI-Powered CV to Website Automation',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CV2W - Transform CVs into Professional Websites',
    description: 'Automated CV processing and website generation powered by AI.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3B82F6" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="h-full antialiased">
        <div id="root" className="h-full">
          {children}
        </div>
      </body>
    </html>
  )
} 