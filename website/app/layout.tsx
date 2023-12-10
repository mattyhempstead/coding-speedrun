import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'


import { SubmissionHistoryProvider } from '@/submissions/submissions'


const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Speedrun Coding Website',
  description: 'Generated by create next app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SubmissionHistoryProvider>
          {children}
        </SubmissionHistoryProvider>
      </body>
    </html>
  )
}
