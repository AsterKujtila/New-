import type { Metadata, Viewport } from 'next'
import { Figtree, Fraunces } from 'next/font/google'
import './globals.css'

const figtree = Figtree({
  subsets: ['latin'],
  variable: '--font-figtree',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  weight: ['300', '700', '900'],
  style: ['normal', 'italic'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SELLR — AI Sales Coach for Whop Sellers',
  description: 'The AI sales coach built exclusively for Whop sellers. Real advice, no fluff.',
  manifest: '/favicons/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'SELLR' },
  openGraph: {
    title: 'SELLR — AI Sales Coach for Whop Sellers',
    description: 'Real AI sales coaching for Whop sellers.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#1a1210',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`dark ${figtree.variable} ${fraunces.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add('dark')`,
          }}
        />
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
        {children}
      </body>
    </html>
  )
}
