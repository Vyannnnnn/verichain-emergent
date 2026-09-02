'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import {
  Shield, CheckCircle2, XCircle, GraduationCap, ExternalLink,
  QrCode, Database, Lock, Copy, ArrowRight, Loader2, Search, Download, FileText
} from 'lucide-react'
import { toast } from 'sonner'
import { downloadCertificatePDF, downloadQRCodeImage } from '@/lib/certificate-download'

export default function VerifyPage() {
  const params = useParams()
  const certNumber = params?.certNumber ? decodeURIComponent(params.certNumber) : ''

  const [verificationResult, setVerificationResult] = useState(null)
  const [isVerifying, setIsVerifying] = useState(true)
  const [copiedText, setCopiedText] = useState(null)
  const [manualSearch, setManualSearch] = useState('')

  const copyToClipboard = (text, label) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopiedText(label || text)
    toast.success(`${label || 'Teks'} berhasil disalin!`)
    setTimeout(() => setCopiedText(null), 2000)
  }

  const doVerify = async (target) => {
    if (!target) return
    setIsVerifying(true)
    setVerificationResult(null)
    try {
      const res = await fetch(`/api/verify/${encodeURIComponent(target.trim())}`)
      const data = await res.json()
      setVerificationResult(data)
    } catch (e) {
      setVerificationResult({
        valid: false,
        status: 'ERROR',
        message: 'Gagal menghubungi server verifikasi.',
        databaseCheck: { status: 'FAILED', message: 'Koneksi terputus' },
        blockchainCheck: { status: 'FAILED', message: 'Koneksi terputus' }
      })
    } finally {
      setIsVerifying(false)
    }
  }

  useEffect(() => {
    if (certNumber) {
      doVerify(certNumber)
    } else {
      setIsVerifying(false)
    }
  }, [certNumber])

  const handleManualSearch = (e) => {
    e.preventDefault()
    if (manualSearch.trim()) {
      doVerify(manualSearch.trim())
    }
  }

  const cert = verificationResult?.certificate
  const dbCheck = verificationResult?.databaseCheck
  const bcCheck = verificationResult?.blockchainCheck

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-indigo-300">
                VeriChain
              </span>
              <span className="ml-1.5 text-xs font-semibold px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Academic
              </span>
            </div>
          </a>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Polygon Amoy Testnet
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-4">
            <Shield className="w-3.5 h-3.5" />
            Portal Verifikasi Sertifikat Digital
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Verifikasi Keaslian Sertifikat
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Dual-verification: Database Akademik + Blockchain Ethereum/Polygon
          </p>
        </div>

        {/* Manual Search Form */}
        <form onSubmit={handleManualSearch} className="max-w-2xl mx-auto mb-8">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={manualSearch}
                onChange={(e) => setManualSearch(e.target.value)}
                placeholder="Masukkan nomor sertifikat (contoh: CERT-2026-0001)"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              disabled={isVerifying}
              className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-bold flex items-center gap-2 transition-colors"
            >
              {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Verifikasi
            </button>
          </div>
        </form>

        {/* Loading State */}
        {isVerifying && (
          <div className="text-center py-16">
            <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mx-auto mb-4" />
            <p className="text-slate-300 font-semibold">Memverifikasi sertifikat...</p>
            <p className="text-xs text-slate-500 mt-1">
              Mencocokkan di database akademik & blockchain Polygon
            </p>
          </div>
        )}

        {/* No cert number provided */}
        {!isVerifying && !certNumber && !verificationResult && (
          <div className="text-center py-16 text-slate-400">
            <QrCode className="w-16 h-16 mx-auto mb-4 opacity-40" />
            <p className="text-lg font-semibold">Masukkan nomor sertifikat untuk verifikasi</p>
          </div>
        )}

        {/* VALID Certificate Result */}
        {!isVerifying && verificationResult?.valid && cert && (
          <div className="space-y-6">
            {/* Success Banner */}
            <div data-testid="valid-certificate-banner" className="p-5 rounded-2xl bg-gradient-to-r from-emerald-900/40 to-green-900/20 border border-emerald-500/30 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <h2 className="text-xl font-black text-emerald-300 uppercase tracking-wider">
                Terverifikasi Asli &amp; Valid
              </h2>
              <p className="text-sm text-emerald-200/70 mt-1">
                Sertifikat ini tercatat resmi di database akademik dan terverifikasi di blockchain
              </p>
            </div>

            {/* Certificate Visual */}
            <div className="bg-slate-900 rounded-2xl border border-indigo-500/30 overflow-hidden">
              <div className="bg-slate-950 p-6 sm:p-8 text-center space-y-3">
                <GraduationCap className="w-14 h-14 text-indigo-400 mx-auto" />
                <h4 className="text-xs uppercase tracking-[4px] font-extrabold text-indigo-400">
                  INSTITUT TEKNOLOGI & SAINS VERIS
                </h4>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {cert.certificateName}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  No: <span className="text-indigo-300 font-bold">{cert.certificateNumber}</span>
                </p>

                <div className="pt-4 border-t border-slate-800 space-y-1">
                  <p className="text-xs text-slate-500">Diberikan kepada:</p>
                  <h4 className="text-2xl font-black text-white">{cert.studentName}</h4>
                  <p className="text-sm font-mono text-slate-300">NIM: {cert.studentNim}</p>
                  <p className="text-xs text-slate-400">{cert.faculty} — {cert.major}</p>
                </div>

                <div className="pt-4 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                  <div>
                    <div className="text-slate-500">Gelar</div>
                    <div className="font-bold text-white">{cert.degree}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">IPK</div>
                    <div className="font-bold text-white">{cert.gpa}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Predikat</div>
                    <div className="font-bold text-white">{cert.honors}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Tanggal</div>
                    <div className="font-bold text-white">{cert.issueDate}</div>
                  </div>
                </div>

                {cert.qrCodeDataUrl && (
                  <div className="pt-4">
                    <img
                      src={cert.qrCodeDataUrl}
                      alt="QR Code"
                      className="w-24 h-24 mx-auto bg-white p-1.5 rounded-xl shadow-lg"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Dual Verification Proof Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Database Proof */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Database className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">Lapis 1: Database Akademik</h5>
                    <span className="text-[10px] text-emerald-400 font-bold">✓ {dbCheck?.status}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400">{dbCheck?.message}</p>
              </div>

              {/* Blockchain Proof */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <Lock className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">Lapis 2: Blockchain Ethereum</h5>
                    <span className="text-[10px] text-emerald-400 font-bold">✓ {bcCheck?.status}</span>
                  </div>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="text-slate-500">Network: <span className="text-slate-300">{bcCheck?.network}</span></div>
                  <div className="text-slate-500">Block: <span className="text-slate-300">{bcCheck?.blockNumber}</span></div>
                </div>
              </div>
            </div>

            {/* Transaction Receipt */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white">Transaction Hash (On-Chain Proof)</span>
                <span className="text-[10px] text-emerald-400 font-bold">✓ ON-CHAIN</span>
              </div>
              <div className="flex items-center justify-between bg-slate-950 p-2 rounded-xl text-xs font-mono text-indigo-300 break-all">
                <span>{cert.txHash || bcCheck?.txHash}</span>
                <button
                  onClick={() => copyToClipboard(cert.txHash || bcCheck?.txHash, 'TxHash')}
                  className="p-1 hover:text-white flex-shrink-0 ml-2"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              {bcCheck?.blockExplorer && (
                <a
                  href={bcCheck.blockExplorer}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 mt-2"
                >
                  <ExternalLink className="w-3 h-3" />
                  Lihat di Polygonscan Explorer
                </a>
              )}
            </div>

            {/* Download Buttons */}
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => downloadCertificatePDF(cert)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download Sertifikat (PDF)
              </button>
              {cert.qrCodeDataUrl && (
                <button
                  onClick={() => downloadQRCodeImage(cert)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-2 transition-colors border border-slate-700"
                >
                  <QrCode className="w-4 h-4" />
                  Download QR Code
                </button>
              )}
            </div>
          </div>
        )}

        {/* INVALID Certificate Result */}
        {!isVerifying && verificationResult && !verificationResult.valid && (
          <div className="space-y-6">
            <div data-testid="invalid-certificate-banner" className="p-6 rounded-2xl bg-gradient-to-r from-red-900/40 to-rose-900/20 border border-red-500/30 text-center">
              <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <h2 className="text-xl font-black text-red-300 uppercase tracking-wider">
                Tidak Valid / Palsu
              </h2>
              <p className="text-sm text-red-200/70 mt-1">
                {verificationResult.message}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900 border border-red-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-5 h-5 text-red-400" />
                  <h5 className="text-xs font-bold text-red-300">Database Check</h5>
                </div>
                <p className="text-xs text-slate-400">
                  {verificationResult.databaseCheck?.message || 'Tidak ditemukan'}
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-slate-900 border border-red-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-5 h-5 text-red-400" />
                  <h5 className="text-xs font-bold text-red-300">Blockchain Check</h5>
                </div>
                <p className="text-xs text-slate-400">
                  {verificationResult.blockchainCheck?.message || 'Tidak terverifikasi'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Back to Home */}
        <div className="text-center mt-10">
          <a
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold transition-colors"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            Kembali ke Beranda
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          <span>&copy; {new Date().getFullYear()} <strong>VeriChain Academic</strong> — Verifikasi Sertifikat Digital Berbasis Blockchain</span>
        </div>
      </footer>
    </div>
  )
}
