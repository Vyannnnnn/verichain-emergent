import './globals.css'
import { Providers } from './providers'

export const metadata = {
  title: 'VeriChain Academic — Verifikasi Sertifikat & Ijazah Blockchain',
  description: 'Platform Verifikasi Sertifikat & Ijazah Akademik Berbasis Blockchain Ethereum/Polygon',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <script dangerouslySetInnerHTML={{__html:'window.addEventListener("error",function(e){if(e.error instanceof DOMException&&e.error.name==="DataCloneError"&&e.message&&e.message.includes("PerformanceServerTiming")){e.stopImmediatePropagation();e.preventDefault()}},true);'}} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
