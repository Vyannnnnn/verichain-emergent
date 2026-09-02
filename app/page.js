'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import {
  Shield, CheckCircle2, XCircle, Search, Award, GraduationCap,
  FileCheck, ExternalLink, QrCode, Lock, Copy, Check, Users,
  Plus, Trash2, Edit3, ArrowRight, RefreshCw, LogIn, LogOut,
  LayoutDashboard, FileText, Activity, AlertTriangle, Printer,
  Eye, Sparkles, Building2, ChevronRight, Hash, Database,
  Share2, Download, Info, Mail, Send, Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import { downloadCertificatePDF, downloadQRCodeImage } from '@/lib/certificate-download'
import LandingPage from '@/components/LandingPage'

export function App() {
  // Navigation & View State: 'home' | 'verify' | 'login' | 'dashboard' | 'students' | 'certificates' | 'blockchain'
  const [currentView, setCurrentView] = useState('home')
  const [authToken, setAuthToken] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)

  // Quick Verification State
  const [searchCertNumber, setSearchCertNumber] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState(null)
  const [verificationQuery, setVerificationQuery] = useState('')

  // Stats & Network State
  const [stats, setStats] = useState({
    totalStudents: 3,
    totalCertificates: 2,
    institutionsCount: 48,
    accuracyRate: '100%',
    blockchainStatus: 'ONLINE',
    network: 'Polygon Amoy Testnet (Chain ID 80002)',
    contractAddress: '0xb35f19C21bc69EFc515178333aBd57002cBc20BA',
    walletAddress: ''
  })
  const [blockchainInfo, setBlockchainInfo] = useState(null)
  const [isRefreshingChain, setIsRefreshingChain] = useState(false)

  // Students & Certificates Data State
  const [students, setStudents] = useState([])
  const [certificates, setCertificates] = useState([])
  const [isLoadingStudents, setIsLoadingStudents] = useState(false)
  const [isLoadingCertificates, setIsLoadingCertificates] = useState(false)

  // Modals & Dialogs
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false)
  const [studentForm, setStudentForm] = useState({ name: '', nim: '', email: '', faculty: 'Fakultas Ilmu Komputer', major: 'Teknik Informatika (S1)' })
  const [editingStudentId, setEditingStudentId] = useState(null)
  const [isSubmittingStudent, setIsSubmittingStudent] = useState(false)

  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false)
  const [issueForm, setIssueForm] = useState({
    studentId: '',
    certificateName: 'Ijazah Sarjana Komputer (S.Kom)',
    degree: 'Sarjana Komputer (S.Kom)',
    faculty: 'Fakultas Ilmu Komputer',
    major: 'Teknik Informatika (S1)',
    gpa: '3.88',
    honors: 'Dengan Pujian (Cum Laude)',
    issueDate: new Date().toISOString().split('T')[0]
  })
  const [isIssuingCert, setIsIssuingCert] = useState(false)
  const [issueStep, setIssueStep] = useState(0) // 0: idle, 1: validate, 2: no generate, 3: blockchain mint, 4: done

  const [selectedCertificateDetail, setSelectedCertificateDetail] = useState(null)
  const [qrModalCert, setQrModalCert] = useState(null)
  const [isResendingEmail, setIsResendingEmail] = useState(false)

  // Login Form State
  const [loginForm, setLoginForm] = useState({ email: 'admin@verichain.ac.id', password: 'admin123' })
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  // Search filter states
  const [studentSearch, setStudentSearch] = useState('')
  const [certSearch, setCertSearch] = useState('')
  const [copiedText, setCopiedText] = useState(null)

  // Printable ref
  const certificatePrintRef = useRef(null)

  // 1. Initial Load & Auth Check
  useEffect(() => {
    checkAuthSession()
    fetchStats()
    fetchBlockchainStatus()
  }, [])

  // 2. Fetch data when view changes
  useEffect(() => {
    if (currentView === 'dashboard' || currentView === 'certificates') {
      fetchCertificates()
      fetchStudents()
    } else if (currentView === 'students') {
      fetchStudents()
    }
  }, [currentView])

  const copyToClipboard = (text, label) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopiedText(label || text)
    toast.success(`${label || 'Teks'} berhasil disalin ke clipboard!`)
    setTimeout(() => setCopiedText(null), 2000)
  }

  const checkAuthSession = async () => {
    try {
      setIsAuthLoading(true)
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        if (data.authenticated && data.user) {
          setCurrentUser(data.user)
          setAuthToken('cookie-session')
        }
      }
    } catch (e) {
      console.error('Session check failed:', e)
    } finally {
      setIsAuthLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(prev => ({ ...prev, ...data }))
      }
    } catch (e) {
      console.error('Fetch stats failed:', e)
    }
  }

  const fetchBlockchainStatus = async () => {
    try {
      setIsRefreshingChain(true)
      const res = await fetch('/api/blockchain/status')
      if (res.ok) {
        const data = await res.json()
        setBlockchainInfo(data)
        if (data.walletAddress) {
          setStats(prev => ({ ...prev, walletAddress: data.walletAddress, network: data.network }))
        }
      }
    } catch (e) {
      console.error('Fetch blockchain status failed:', e)
    } finally {
      setIsRefreshingChain(false)
    }
  }

  const fetchStudents = async () => {
    try {
      setIsLoadingStudents(true)
      const res = await fetch('/api/students')
      if (res.ok) {
        const data = await res.json()
        setStudents(data)
      }
    } catch (e) {
      toast.error('Gagal memuat data mahasiswa')
    } finally {
      setIsLoadingStudents(false)
    }
  }

  const fetchCertificates = async () => {
    try {
      setIsLoadingCertificates(true)
      const res = await fetch('/api/certificates')
      if (res.ok) {
        const data = await res.json()
        setCertificates(data)
      }
    } catch (e) {
      toast.error('Gagal memuat daftar sertifikat')
    } finally {
      setIsLoadingCertificates(false)
    }
  }

  // Verification Handler
  const handleVerify = async (certNumberToVerify) => {
    const target = (certNumberToVerify !== undefined && certNumberToVerify !== null && certNumberToVerify !== '' ? certNumberToVerify : searchCertNumber).trim()
    if (!target) {
      toast.error('Silakan masukkan nomor sertifikat')
      return
    }

    setSearchCertNumber(target)
    setVerificationQuery(target)
    setVerificationResult(null)
    setIsVerifying(true)
    setCurrentView('verify')

    try {
      const res = await fetch(`/api/verify/${encodeURIComponent(target)}`)
      const data = await res.json()
      setVerificationResult(data)
      if (res.ok && data.valid) {
        toast.success('Sertifikat terverifikasi valid & asli di Blockchain!')
      } else {
        toast.error(data.message || 'Sertifikat tidak valid atau tidak ditemukan')
      }
    } catch (e) {
      setVerificationResult({
        valid: false,
        status: 'ERROR',
        message: 'Gagal menghubungi server verifikasi.',
        databaseCheck: { status: 'FAILED', message: 'Koneksi terputus' },
        blockchainCheck: { status: 'FAILED', message: 'Koneksi terputus' }
      })
      toast.error('Gagal memverifikasi sertifikat')
    } finally {
      setIsVerifying(false)
    }
  }

  // Login Handler
  const handleLogin = async (e) => {
    e?.preventDefault()
    if (!loginForm.email || !loginForm.password) {
      toast.error('Email dan password harus diisi')
      return
    }

    setIsLoggingIn(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      })
      const data = await res.json()

      if (res.ok && data.success) {
        setCurrentUser(data.user)
        setAuthToken(data.token)
        toast.success(`Selamat datang kembali, ${data.user.name || 'Admin'}!`)
        setCurrentView('dashboard')
        fetchStats()
        fetchCertificates()
        fetchStudents()
      } else {
        toast.error(data.error || 'Email atau password salah')
      }
    } catch (e) {
      toast.error('Terjadi kesalahan saat login')
    } finally {
      setIsLoggingIn(false)
    }
  }

  // Logout Handler
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setCurrentUser(null)
      setAuthToken(null)
      toast.success('Anda telah keluar dari akun Admin')
      setCurrentView('home')
    } catch (e) {
      setCurrentUser(null)
      setAuthToken(null)
      setCurrentView('home')
    }
  }

  // Student CRUD
  const handleSaveStudent = async (e) => {
    e.preventDefault()
    if (!studentForm.name || !studentForm.nim || !studentForm.email) {
      toast.error('Semua kolom wajib diisi')
      return
    }

    setIsSubmittingStudent(true)
    try {
      const url = editingStudentId ? `/api/students/${editingStudentId}` : '/api/students'
      const method = editingStudentId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentForm)
      })
      const data = await res.json()

      if (res.ok) {
        toast.success(editingStudentId ? 'Data mahasiswa berhasil diperbarui' : 'Mahasiswa baru berhasil didaftarkan')
        setIsStudentModalOpen(false)
        setEditingStudentId(null)
        setStudentForm({ name: '', nim: '', email: '', faculty: 'Fakultas Ilmu Komputer', major: 'Teknik Informatika (S1)' })
        fetchStudents()
        fetchStats()
      } else {
        toast.error(data.error || 'Gagal menyimpan data mahasiswa')
      }
    } catch (e) {
      toast.error('Terjadi kesalahan pada server')
    } finally {
      setIsSubmittingStudent(false)
    }
  }

  const handleDeleteStudent = async (id, name) => {
    if (!confirm(`Hapus data mahasiswa ${name}?`)) return
    try {
      const res = await fetch(`/api/students/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success(`Data mahasiswa ${name} berhasil dihapus`)
        fetchStudents()
        fetchStats()
      } else {
        toast.error('Gagal menghapus mahasiswa')
      }
    } catch (e) {
      toast.error('Gagal menghapus mahasiswa')
    }
  }

  // Certificate Issuance Flow
  const handleIssueCertificate = async (e) => {
    e.preventDefault()
    if (!issueForm.studentId || !issueForm.certificateName) {
      toast.error('Mahasiswa dan nama sertifikat harus diisi')
      return
    }

    setIsIssuingCert(true)
    setIssueStep(1) // 1: Validating

    try {
      await new Promise(r => setTimeout(r, 600))
      setIssueStep(2) // 2: Generating Unique Number & Metadata Hash

      await new Promise(r => setTimeout(r, 700))
      setIssueStep(3) // 3: Blockchain Minting & EIP-191 Signing

      const res = await fetch('/api/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(issueForm)
      })
      const data = await res.json()

      if (res.ok && data.success) {
        setIssueStep(4) // 4: Done
        await new Promise(r => setTimeout(r, 600))
        
        // Show certificate success + email notification status
        const emailInfo = data.emailNotification
        if (emailInfo?.sent) {
          toast.success(`Sertifikat ${data.certificate.certificateNumber} berhasil diterbitkan! 📧 Email notifikasi dikirim ke ${emailInfo.recipientEmail}`)
        } else if (emailInfo?.skipped) {
          toast.success(`Sertifikat ${data.certificate.certificateNumber} berhasil diterbitkan di Blockchain!`)
        } else {
          toast.success(`Sertifikat ${data.certificate.certificateNumber} berhasil diterbitkan! ⚠️ Email notifikasi gagal dikirim`)
        }
        
        setIsIssueModalOpen(false)
        setIssueStep(0)
        setSelectedCertificateDetail(data.certificate)
        fetchCertificates()
        fetchStats()
      } else {
        toast.error(data.error || 'Gagal menerbitkan sertifikat')
        setIssueStep(0)
      }
    } catch (e) {
      toast.error('Terjadi kesalahan saat memproses ke blockchain')
      setIssueStep(0)
    } finally {
      setIsIssuingCert(false)
    }
  }

  const handlePrintCertificate = () => {
    window.print()
  }

  const handleResendEmail = async (cert) => {
    if (!cert?.id && !cert?.certificateNumber) return
    setIsResendingEmail(true)
    try {
      const certIdentifier = cert.id || cert.certificateNumber
      const res = await fetch(`/api/email/resend/${certIdentifier}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success(`📧 ${data.message}`)
      } else {
        toast.error(data.message || data.error || 'Gagal mengirim ulang email')
      }
    } catch (err) {
      toast.error('Terjadi kesalahan saat mengirim email')
    } finally {
      setIsResendingEmail(false)
    }
  }

  // Filtered lists
  const filteredStudents = students.filter(s =>
    s.name?.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.nim?.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.major?.toLowerCase().includes(studentSearch.toLowerCase())
  )

  const filteredCertificates = certificates.filter(c =>
    c.certificateNumber?.toLowerCase().includes(certSearch.toLowerCase()) ||
    c.studentName?.toLowerCase().includes(certSearch.toLowerCase()) ||
    c.studentNim?.toLowerCase().includes(certSearch.toLowerCase()) ||
    c.certificateName?.toLowerCase().includes(certSearch.toLowerCase()) ||
    c.txHash?.toLowerCase().includes(certSearch.toLowerCase())
  )

  return (
    <div suppressHydrationWarning className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* 1. Global Navigation Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <button
            onClick={() => setCurrentView('home')}
            className="flex items-center gap-3 group text-left transition-all"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Shield className="w-6 h-6 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-indigo-300">
                  VeriChain
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Academic
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">
                Verifikasi Sertifikat Digital Berbasis Blockchain
              </p>
            </div>
          </button>

          {/* Nav Items */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800/80">
            <button
              onClick={() => setCurrentView('home')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                currentView === 'home'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Beranda
            </button>
            <button
              onClick={() => setCurrentView('verify')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                currentView === 'verify'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              Verifikasi Publik
            </button>
            {currentUser && (
              <>
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                    currentView === 'dashboard'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </button>
                <button
                  onClick={() => setCurrentView('students')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                    currentView === 'students'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Mahasiswa
                </button>
                <button
                  onClick={() => setCurrentView('certificates')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                    currentView === 'certificates'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  Sertifikat
                </button>
              </>
            )}
            <button
              onClick={() => setCurrentView('blockchain')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                currentView === 'blockchain'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Activity className="w-4 h-4" />
              Status Chain
            </button>
          </nav>

          {/* Right Action: Chain Badge + Auth Button */}
          <div className="flex items-center gap-3">
            {/* Blockchain Network Pill */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Polygon Amoy Testnet
            </div>

            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-sm font-medium text-slate-200 transition-all"
                >
                  <div className="w-6 h-6 rounded-full bg-indigo-500 text-white text-xs flex items-center justify-center font-bold">
                    {currentUser.name ? currentUser.name[0] : 'A'}
                  </div>
                  <span className="hidden sm:inline">{currentUser.name?.split(' ')[0] || 'Admin'}</span>
                </button>
                <button
                  onClick={handleLogout}
                  title="Keluar"
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30 text-slate-400 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setCurrentView('login')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 transition-all"
              >
                <LogIn className="w-4 h-4" />
                Portal Admin
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 pb-16">
        {/* ========================================================= */}
        {/* VIEW 1: HOME / LANDING PAGE */}
        {/* ========================================================= */}
        {currentView === 'home' && (
          <LandingPage
            searchCertNumber={searchCertNumber}
            setSearchCertNumber={setSearchCertNumber}
            handleVerify={handleVerify}
            isVerifying={isVerifying}
            stats={stats}
            setCurrentView={setCurrentView}
          />
        )}

        {/* ========================================================= */}
        {/* VIEW 2: DUAL VERIFICATION PORTAL */}
        {/* ========================================================= */}
        {currentView === 'verify' && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            {/* Search Header */}
            <div className="bg-slate-900/80 backdrop-blur rounded-2xl p-6 border border-slate-800 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Portal Verifikasi Publik VeriChain</h2>
                  <p className="text-xs text-slate-400">Periksa keabsahan ijazah & sertifikat digital secara langsung di blockchain</p>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleVerify(searchCertNumber)
                }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchCertNumber}
                    onChange={(e) => setSearchCertNumber(e.target.value)}
                    placeholder="Masukkan Nomor Sertifikat (contoh: CERT-2026-0001)"
                    className="w-full pl-11 pr-4 py-3 bg-slate-950 text-white placeholder-slate-500 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
                >
                  {isVerifying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  Verifikasi Sertifikat
                </button>
              </form>

              {/* Sample quick buttons */}
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span>Contoh:</span>
                <button
                  type="button"
                  onClick={() => {
                    setSearchCertNumber('CERT-2026-0001')
                    handleVerify('CERT-2026-0001')
                  }}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 font-mono"
                >
                  CERT-2026-0001
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSearchCertNumber('CERT-2026-0002')
                    handleVerify('CERT-2026-0002')
                  }}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 font-mono"
                >
                  CERT-2026-0002
                </button>
              </div>
            </div>

            {/* Verification Result Display */}
            {isVerifying && (
              <div className="p-12 text-center rounded-2xl bg-slate-900/50 border border-slate-800">
                <RefreshCw className="w-10 h-10 text-indigo-400 animate-spin mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white">Memverifikasi Sertifikat On-Chain...</h3>
                <p className="text-sm text-slate-400 mt-1">Menghubungi smart contract dan mencocokkan hash data...</p>
              </div>
            )}

            {!isVerifying && verificationResult && (
              <div>
                {/* Result Status Banner */}
                {verificationResult.valid ? (
                  <div data-testid="valid-certificate-banner" className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                        <CheckCircle2 className="w-7 h-7" />
                      </div>
                      <div>
                        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wide">
                          ✓ Terverifikasi Asli & Valid
                        </div>
                        <h3 className="text-lg font-extrabold text-white mt-1">Sertifikat Akademik Resmi Terdaftar</h3>
                        <p className="text-xs text-emerald-300/80">
                          Data cocok 100% pada pangkalan data institusi & smart contract blockchain Ethereum/Polygon
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={handlePrintCertificate}
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
                      >
                        <Printer className="w-4 h-4" />
                        Cetak / PDF
                      </button>
                      <button
                        onClick={() => copyToClipboard(window.location.href, 'Tautan Verifikasi')}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20"
                      >
                        <Share2 className="w-4 h-4" />
                        Bagikan
                      </button>
                    </div>
                  </div>
                ) : (
                  <div data-testid="invalid-certificate-banner" className="p-6 rounded-2xl bg-rose-950/40 border border-rose-500/40 mb-8 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                      <XCircle className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold uppercase tracking-wide">
                        ❌ Tidak Valid / Palsu
                      </div>
                      <h3 className="text-lg font-extrabold text-white mt-1">Sertifikat Tidak Ditemukan</h3>
                      <p className="text-sm text-rose-300/80 mt-1">
                        {verificationResult.message || `Nomor sertifikat "${verificationQuery}" tidak tercatat dalam arsip akademik maupun ledger smart contract.`}
                      </p>
                      <div className="mt-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
                        Pastikan Anda memasukkan nomor sertifikat dengan benar sesuai format (contoh: <code className="text-indigo-400">CERT-2026-0001</code>).
                      </div>
                    </div>
                  </div>
                )}

                {/* Valid Certificate Document & Dual Proofs */}
                {verificationResult.valid && verificationResult.certificate && (
                  <div className="space-y-8">
                    {/* Official Certificate Paper UI */}
                    <div
                      id="printable-certificate"
                      className="relative bg-gradient-to-b from-slate-900 to-slate-950 p-8 sm:p-12 rounded-3xl border-2 border-indigo-500/30 shadow-2xl overflow-hidden print:bg-white print:text-black print:border-black"
                    >
                      {/* Decorative Gold & Indigo Border Elements */}
                      <div className="absolute top-3 left-3 right-3 bottom-3 border border-indigo-500/20 rounded-2xl pointer-events-none" />
                      <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-indigo-400 rounded-tl-xl pointer-events-none" />
                      <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-indigo-400 rounded-tr-xl pointer-events-none" />
                      <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-indigo-400 rounded-bl-xl pointer-events-none" />
                      <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-indigo-400 rounded-br-xl pointer-events-none" />

                      {/* Header of Diploma */}
                      <div className="text-center relative z-10 mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 p-2 mx-auto mb-3 flex items-center justify-center">
                          <GraduationCap className="w-10 h-10 text-indigo-400" />
                        </div>
                        <h4 className="text-xs uppercase tracking-widest font-extrabold text-indigo-400">
                          INSTITUT TEKNOLOGI & SAINS VERIS
                        </h4>
                        <h2 className="text-2xl sm:text-3xl font-black text-white mt-1 tracking-tight">
                          SERTIFIKAT KELULUSAN AKADEMIK
                        </h2>
                        <p className="text-xs text-slate-400 mt-1 font-mono">
                          Nomor Ijazah: <span className="text-indigo-300 font-bold">{verificationResult.certificate.certificateNumber}</span>
                        </p>
                      </div>

                      {/* Recipient Details */}
                      <div className="text-center max-w-xl mx-auto mb-10 relative z-10 space-y-4">
                        <p className="text-xs sm:text-sm text-slate-400 italic">
                          Dengan ini menyatakan bahwa:
                        </p>
                        <h3 className="text-2xl sm:text-3xl font-black text-white underline decoration-indigo-500 decoration-2 underline-offset-8">
                          {verificationResult.certificate.studentName}
                        </h3>
                        <p className="text-xs font-mono text-slate-300">
                          Nomor Induk Mahasiswa (NIM): <span className="font-bold text-white">{verificationResult.certificate.studentNim}</span>
                        </p>
                        <div className="py-2">
                          <p className="text-xs text-slate-400">telah menyelesaikan seluruh persyaratan akademik pada:</p>
                          <p className="text-base font-bold text-indigo-300 mt-0.5">
                            {verificationResult.certificate.faculty} — {verificationResult.certificate.major}
                          </p>
                          <p className="text-sm font-semibold text-slate-200 mt-1">
                            dan berhak menyandang gelar <span className="text-white font-extrabold">{verificationResult.certificate.degree || verificationResult.certificate.certificateName}</span>
                          </p>
                          {verificationResult.certificate.honors && (
                            <p className="text-xs font-bold text-amber-400 mt-2 inline-block px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20">
                              Predikat: {verificationResult.certificate.honors} {verificationResult.certificate.gpa ? `(IPK: ${verificationResult.certificate.gpa})` : ''}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Footer: Date, Signatures & QR Code */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center pt-6 border-t border-slate-800/80 relative z-10">
                        {/* Date & Location */}
                        <div className="text-center sm:text-left text-xs text-slate-400 space-y-1">
                          <p className="font-semibold text-slate-300">Diterbitkan di Jakarta</p>
                          <p>Tanggal: <span className="text-white font-medium">{verificationResult.certificate.issueDate || '15 Februari 2026'}</span></p>
                          <p className="text-[11px] text-slate-500">VeriChain Cryptographic Ledger</p>
                        </div>

                        {/* Centered QR Code */}
                        <div className="flex flex-col items-center justify-center text-center">
                          {verificationResult.certificate.qrCodeDataUrl ? (
                            <div className="p-2 bg-white rounded-xl shadow-lg border border-slate-200">
                              <img
                                src={verificationResult.certificate.qrCodeDataUrl}
                                alt="VeriChain QR Code"
                                className="w-24 h-24"
                              />
                            </div>
                          ) : (
                            <div className="w-24 h-24 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400">
                              <QrCode className="w-10 h-10" />
                            </div>
                          )}
                          <span className="text-[10px] text-slate-400 font-mono mt-1.5">Scan untuk Verifikasi</span>
                        </div>

                        {/* Signer Seal */}
                        <div className="text-center sm:text-right text-xs text-slate-400 space-y-1">
                          <p className="font-bold text-slate-200">Rektor Institusi</p>
                          <div className="h-10 flex items-center justify-center sm:justify-end">
                            <span className="font-serif italic text-base text-indigo-400 font-bold">Prof. Dr. Ir. Veris Blockchain, M.Kom</span>
                          </div>
                          <p className="text-[11px] text-slate-500">NIP: 197804122003121002</p>
                        </div>
                      </div>
                    </div>

                    {/* Dual Layer Verification Technical Proof Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Layer 1: Database Proof */}
                      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Database className="w-5 h-5 text-indigo-400" />
                            <h4 className="font-bold text-white text-sm">Lapis 1: Database Kampus</h4>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                            ✓ Terverifikasi
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          {verificationResult.databaseCheck?.message || 'Nomor sertifikat terdaftar di repositori data akademik resmi.'}
                        </p>
                        <div className="p-3 bg-slate-950 rounded-xl space-y-1.5 text-xs font-mono">
                          <div className="flex justify-between">
                            <span className="text-slate-500">ID Sertifikat:</span>
                            <span className="text-slate-300">{verificationResult.certificate.id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Mahasiswa:</span>
                            <span className="text-slate-300">{verificationResult.certificate.studentName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Status Data:</span>
                            <span className="text-emerald-400">TERSIMPAN_VALID</span>
                          </div>
                        </div>
                      </div>

                      {/* Layer 2: Blockchain Smart Contract Proof */}
                      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-cyan-400" />
                            <h4 className="font-bold text-white text-sm">Lapis 2: Smart Contract Blockchain</h4>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                            ✓ On-Chain Verified
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          Dicatat secara imutabel di ledger Ethereum/Polygon Amoy dengan tanda tangan digital cryptographic.
                        </p>
                        <div className="p-3 bg-slate-950 rounded-xl space-y-2 text-xs font-mono">
                          <div>
                            <div className="text-slate-500 mb-0.5">Transaction Hash (TxHash):</div>
                            <div className="flex items-center justify-between gap-2 bg-slate-900 p-1.5 rounded text-indigo-300 break-all text-[11px]">
                              <span>{verificationResult.blockchainCheck?.txHash || verificationResult.certificate.txHash}</span>
                              <button
                                onClick={() => copyToClipboard(verificationResult.blockchainCheck?.txHash || verificationResult.certificate.txHash, 'TxHash')}
                                className="p-1 hover:text-white shrink-0"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Jaringan:</span>
                            <span className="text-cyan-400">{verificationResult.blockchainCheck?.network || 'Polygon Amoy Testnet'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Smart Contract:</span>
                            <span className="text-slate-300 font-mono text-[11px]">
                              {verificationResult.blockchainCheck?.contractAddress?.substring(0, 10)}...
                              {verificationResult.blockchainCheck?.contractAddress?.substring(34)}
                            </span>
                          </div>
                        </div>

                        {verificationResult.blockchainCheck?.blockExplorer && (
                          <a
                            href={verificationResult.blockchainCheck.blockExplorer}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Buka di Polygonscan Explorer
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!isVerifying && !verificationResult && (
              <div className="p-12 text-center rounded-2xl bg-slate-900/30 border border-slate-800">
                <Search className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h4 className="text-base font-bold text-white">Masukkan Nomor Sertifikat untuk Memulai</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Ketik nomor sertifikat pada kolom pencarian di atas untuk memeriksa validitas database dan pembuktian smart contract.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 3: ADMIN LOGIN */}
        {/* ========================================================= */}
        {currentView === 'login' && (
          <div className="max-w-md mx-auto px-4 pt-12">
            <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur">
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto mb-3">
                  <Lock className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black text-white">Login Portal Admin</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Akses khusus untuk admin pendaftaran dan penerbitan sertifikat
                </p>
              </div>

              {/* Demo quick fill button */}
              <button
                type="button"
                onClick={() => setLoginForm({ email: 'admin@verichain.ac.id', password: 'admin123' })}
                className="w-full mb-5 py-2 px-3 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Isi Otomatis Akun Demo Admin
              </button>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email Administrator</label>
                  <input
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    required
                    placeholder="admin@verichain.ac.id"
                    className="w-full px-4 py-2.5 bg-slate-950 text-white placeholder-slate-500 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-slate-950 text-white placeholder-slate-500 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoggingIn ? <RefreshCw className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                  Masuk ke Dashboard
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 4: ADMIN DASHBOARD */}
        {/* ========================================================= */}
        {currentView === 'dashboard' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
            {/* Top Overview Banner */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold mb-2">
                  <Shield className="w-3.5 h-3.5" />
                  Pusat Kendali VeriChain Academic
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  Dashboard Administrasi Kampus
                </h2>
                <p className="text-sm text-slate-300 mt-1">
                  Selamat bertugas, <span className="text-white font-semibold">{currentUser?.name || 'Admin'}</span> ({currentUser?.email})
                </p>
              </div>

              {/* Quick action buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setIsIssueModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
                >
                  <Award className="w-4 h-4" />
                  + Terbitkan Sertifikat
                </button>
                <button
                  onClick={() => {
                    setEditingStudentId(null)
                    setStudentForm({ name: '', nim: '', email: '', faculty: 'Fakultas Ilmu Komputer', major: 'Teknik Informatika (S1)' })
                    setIsStudentModalOpen(true)
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all"
                >
                  <Users className="w-4 h-4" />
                  + Tambah Mahasiswa
                </button>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center justify-between text-indigo-400 mb-2">
                  <Users className="w-6 h-6" />
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/10">Mahasiswa</span>
                </div>
                <h3 className="text-3xl font-extrabold text-white">{students.length || stats.totalStudents}</h3>
                <p className="text-xs text-slate-400 mt-1">Total Mahasiswa Terdaftar</p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center justify-between text-blue-400 mb-2">
                  <Award className="w-6 h-6" />
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/10">Sertifikat</span>
                </div>
                <h3 className="text-3xl font-extrabold text-white">{certificates.length || stats.totalCertificates}</h3>
                <p className="text-xs text-slate-400 mt-1">Sertifikat On-Chain Terbit</p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center justify-between text-emerald-400 mb-2">
                  <Activity className="w-6 h-6" />
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10">Blockchain</span>
                </div>
                <h3 className="text-2xl font-extrabold text-emerald-400">AKTIF ON-CHAIN</h3>
                <p className="text-xs text-slate-400 mt-1">Polygon Amoy Testnet</p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center justify-between text-cyan-400 mb-2">
                  <CheckCircle2 className="w-6 h-6" />
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-cyan-500/10">Integritas</span>
                </div>
                <h3 className="text-3xl font-extrabold text-cyan-400">100%</h3>
                <p className="text-xs text-slate-400 mt-1">Tervalidasi Smart Contract</p>
              </div>
            </div>

            {/* Blockchain Network & Wallet Live Card */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Status Koneksi Blockchain Ethereum/Polygon</h3>
                    <p className="text-xs text-slate-400">Node RPC & Smart Contract VeriChain Academic</p>
                  </div>
                </div>

                <button
                  onClick={fetchBlockchainStatus}
                  disabled={isRefreshingChain}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-all self-start sm:self-auto"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingChain ? 'animate-spin' : ''}`} />
                  Ping RPC Node
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                <div className="p-3.5 bg-slate-950 rounded-xl space-y-1">
                  <span className="text-slate-500 block">Smart Contract Address:</span>
                  <div className="flex items-center justify-between text-indigo-300">
                    <span className="truncate">{stats.contractAddress || '0xb35f19C21bc69EFc515178333aBd57002cBc20BA'}</span>
                    <button onClick={() => copyToClipboard(stats.contractAddress, 'Contract Address')} className="p-1 hover:text-white">
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-xl space-y-1">
                  <span className="text-slate-500 block">Admin Wallet Address:</span>
                  <div className="flex items-center justify-between text-cyan-300">
                    <span className="truncate">{blockchainInfo?.walletAddress || '0x644c6888...7D93e'}</span>
                    <button onClick={() => copyToClipboard(blockchainInfo?.walletAddress, 'Wallet Address')} className="p-1 hover:text-white">
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-xl space-y-1">
                  <span className="text-slate-500 block">Jaringan / Chain ID:</span>
                  <div className="text-emerald-400 font-bold">
                    Polygon Amoy (Chain ID 80002)
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Certificates Table */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-indigo-400" />
                  Sertifikat Terbaru Diterbitkan
                </h3>
                <button
                  onClick={() => setCurrentView('certificates')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                >
                  Lihat Semua ({certificates.length}) <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {certificates.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">
                  Belum ada sertifikat yang diterbitkan. Klik tombol &ldquo;+ Terbitkan Sertifikat&rdquo; untuk memulai.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold tracking-wider">
                        <th className="py-3 px-3">No. Sertifikat</th>
                        <th className="py-3 px-3">Nama Mahasiswa</th>
                        <th className="py-3 px-3">Judul Sertifikat</th>
                        <th className="py-3 px-3">Tx Hash Blockchain</th>
                        <th className="py-3 px-3">Tanggal</th>
                        <th className="py-3 px-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {certificates.slice(0, 5).map((cert) => (
                        <tr key={cert.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-3 font-mono font-bold text-indigo-300">{cert.certificateNumber}</td>
                          <td className="py-3 px-3 font-semibold text-white">{cert.studentName}</td>
                          <td className="py-3 px-3 text-slate-300">{cert.certificateName}</td>
                          <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                            <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                              {cert.txHash ? `${cert.txHash.substring(0, 10)}...` : '0x...'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-400">{cert.issueDate || '2026-02-15'}</td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedCertificateDetail(cert)}
                                title="Lihat Ijazah"
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setQrModalCert(cert)}
                                title="Buka QR Code"
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-400"
                              >
                                <QrCode className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleResendEmail(cert)}
                                title="Kirim Email Notifikasi"
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400"
                              >
                                <Mail className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleVerify(cert.certificateNumber)}
                                title="Verifikasi Publik"
                                className="p-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300"
                              >
                                <FileCheck className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 5: STUDENT MANAGEMENT */}
        {/* ========================================================= */}
        {currentView === 'students' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-white flex items-center gap-2.5">
                  <Users className="w-7 h-7 text-indigo-400" />
                  Manajemen Mahasiswa
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Daftarkan dan kelola data induk mahasiswa sebelum penerbitan sertifikat
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingStudentId(null)
                  setStudentForm({ name: '', nim: '', email: '', faculty: 'Fakultas Ilmu Komputer', major: 'Teknik Informatika (S1)' })
                  setIsStudentModalOpen(true)
                }}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                Daftarkan Mahasiswa Baru
              </button>
            </div>

            {/* Search filter */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Cari mahasiswa berdasarkan nama, NIM, atau jurusan..."
                className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            {/* Student Table */}
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                      <th className="py-3.5 px-4">NIM</th>
                      <th className="py-3.5 px-4">Nama Lengkap</th>
                      <th className="py-3.5 px-4">Email</th>
                      <th className="py-3.5 px-4">Fakultas & Program Studi</th>
                      <th className="py-3.5 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400">
                          Tidak ada data mahasiswa ditemukan.
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((std) => (
                        <tr key={std.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-indigo-300">{std.nim}</td>
                          <td className="py-3.5 px-4 font-semibold text-white">{std.name}</td>
                          <td className="py-3.5 px-4 text-slate-300">{std.email}</td>
                          <td className="py-3.5 px-4 text-slate-400">
                            {std.faculty || 'Fakultas Ilmu Komputer'} — <span className="text-slate-300">{std.major}</span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setIssueForm({
                                    studentId: std.id,
                                    certificateName: 'Ijazah Sarjana Komputer (S.Kom)',
                                    degree: 'Sarjana Komputer (S.Kom)',
                                    faculty: std.faculty || 'Fakultas Ilmu Komputer',
                                    major: std.major || 'Teknik Informatika (S1)',
                                    gpa: '3.85',
                                    honors: 'Dengan Pujian (Cum Laude)',
                                    issueDate: new Date().toISOString().split('T')[0]
                                  })
                                  setIsIssueModalOpen(true)
                                }}
                                title="Terbitkan Sertifikat Mahasiswa Ini"
                                className="px-2.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 text-xs font-semibold flex items-center gap-1"
                              >
                                <Award className="w-3.5 h-3.5" />
                                Terbitkan
                              </button>
                              <button
                                onClick={() => {
                                  setEditingStudentId(std.id)
                                  setStudentForm({
                                    name: std.name,
                                    nim: std.nim,
                                    email: std.email,
                                    faculty: std.faculty || '',
                                    major: std.major || ''
                                  })
                                  setIsStudentModalOpen(true)
                                }}
                                title="Edit"
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteStudent(std.id, std.name)}
                                title="Hapus"
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 6: CERTIFICATES MANAGEMENT */}
        {/* ========================================================= */}
        {currentView === 'certificates' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-white flex items-center gap-2.5">
                  <Award className="w-7 h-7 text-indigo-400" />
                  Manajemen & Penerbitan Sertifikat
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Arsip sertifikat digital tercatat on-chain dengan QR Code dan verifikasi publik
                </p>
              </div>

              <button
                onClick={() => setIsIssueModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                + Terbitkan Sertifikat Baru
              </button>
            </div>

            {/* Search filter */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={certSearch}
                onChange={(e) => setCertSearch(e.target.value)}
                placeholder="Cari berdasarkan nomor sertifikat, nama mahasiswa, NIM, atau TxHash..."
                className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            {/* Certificates Table */}
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                      <th className="py-3.5 px-4">No. Sertifikat</th>
                      <th className="py-3.5 px-4">Mahasiswa & NIM</th>
                      <th className="py-3.5 px-4">Judul Dokumen</th>
                      <th className="py-3.5 px-4">TxHash Blockchain</th>
                      <th className="py-3.5 px-4">Tanggal Terbit</th>
                      <th className="py-3.5 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredCertificates.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          Tidak ada sertifikat ditemukan.
                        </td>
                      </tr>
                    ) : (
                      filteredCertificates.map((cert) => (
                        <tr key={cert.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-indigo-300">
                            {cert.certificateNumber}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-white">{cert.studentName}</div>
                            <div className="font-mono text-slate-400 text-[11px]">{cert.studentNim}</div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-300 font-medium">
                            {cert.certificateName}
                            {cert.degree && <span className="block text-slate-400 text-[11px]">{cert.degree}</span>}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[11px]">
                            <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                              {cert.txHash ? `${cert.txHash.substring(0, 10)}...` : '0x...'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-400">{cert.issueDate || '2026-02-15'}</td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedCertificateDetail(cert)}
                                title="Lihat Ijazah Lengkap"
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setQrModalCert(cert)}
                                title="Lihat QR Code"
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-400"
                              >
                                <QrCode className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleResendEmail(cert)}
                                title="Kirim Email Notifikasi"
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400"
                              >
                                <Mail className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleVerify(cert.certificateNumber)}
                                title="Buka Portal Verifikasi"
                                className="p-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300"
                              >
                                <FileCheck className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 7: BLOCKCHAIN STATUS & DIAGNOSTICS */}
        {/* ========================================================= */}
        {currentView === 'blockchain' && (
          <div className="max-w-4xl mx-auto px-4 pt-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-white flex items-center gap-2.5">
                  <Activity className="w-7 h-7 text-emerald-400" />
                  Status Blockchain & Smart Contract
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Detail parameter jaringan Ethereum-compatible & smart contract pencatat sertifikat
                </p>
              </div>

              <button
                onClick={fetchBlockchainStatus}
                disabled={isRefreshingChain}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingChain ? 'animate-spin' : ''}`} />
                Segarkan Jaringan
              </button>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                <div>
                  <h3 className="font-bold text-white text-sm">Polygon Amoy Testnet (Chain ID 80002)</h3>
                  <p className="text-xs text-emerald-400">Status Node: Online & Siap Menandatangani Transaksi</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-4 bg-slate-950 rounded-2xl space-y-1">
                  <span className="text-slate-500 font-sans font-semibold block">RPC Node Endpoint:</span>
                  <p className="text-slate-300 break-all">https://rpc-amoy.polygon.technology</p>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl space-y-1">
                  <span className="text-slate-500 font-sans font-semibold block">Smart Contract Address:</span>
                  <p className="text-indigo-400 break-all">0xb35f19C21bc69EFc515178333aBd57002cBc20BA</p>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl space-y-1">
                  <span className="text-slate-500 font-sans font-semibold block">Admin Signer Wallet:</span>
                  <p className="text-cyan-400 break-all">{blockchainInfo?.walletAddress || '0x644c68882bA59c037B5Cba0a0F45cf961d67D93e'}</p>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl space-y-1">
                  <span className="text-slate-500 font-sans font-semibold block">Standar Kriptografi:</span>
                  <p className="text-emerald-400">ECDSA secp256k1 + Keccak256 On-Chain Proof</p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <a
                  href={`https://amoy.polygonscan.com/address/0xb35f19C21bc69EFc515178333aBd57002cBc20BA`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold flex items-center gap-2 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Buka Kontrak di Polygonscan Explorer
                </a>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* MODAL 1: REGISTER / EDIT STUDENT */}
      {/* ========================================================= */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                {editingStudentId ? 'Edit Data Mahasiswa' : 'Daftarkan Mahasiswa Baru'}
              </h3>
              <button
                onClick={() => setIsStudentModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Lengkap Mahasiswa *</label>
                <input
                  type="text"
                  required
                  value={studentForm.name}
                  onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                  placeholder="Contoh: Michael Tanudjaya"
                  className="w-full px-4 py-2.5 bg-slate-950 text-white rounded-xl border border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nomor Induk Mahasiswa (NIM) *</label>
                  <input
                    type="text"
                    required
                    value={studentForm.nim}
                    onChange={(e) => setStudentForm({ ...studentForm, nim: e.target.value })}
                    placeholder="Contoh: 20220801004"
                    className="w-full px-4 py-2.5 bg-slate-950 text-white rounded-xl border border-slate-700 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email Mahasiswa *</label>
                  <input
                    type="email"
                    required
                    value={studentForm.email}
                    onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                    placeholder="nama@student.verichain.ac.id"
                    className="w-full px-4 py-2.5 bg-slate-950 text-white rounded-xl border border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Fakultas</label>
                <input
                  type="text"
                  value={studentForm.faculty}
                  onChange={(e) => setStudentForm({ ...studentForm, faculty: e.target.value })}
                  placeholder="Fakultas Ilmu Komputer"
                  className="w-full px-4 py-2.5 bg-slate-950 text-white rounded-xl border border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Program Studi / Jurusan</label>
                <input
                  type="text"
                  value={studentForm.major}
                  onChange={(e) => setStudentForm({ ...studentForm, major: e.target.value })}
                  placeholder="Teknik Informatika (S1)"
                  className="w-full px-4 py-2.5 bg-slate-950 text-white rounded-xl border border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsStudentModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingStudent}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 disabled:opacity-50"
                >
                  {isSubmittingStudent ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {editingStudentId ? 'Simpan Perubahan' : 'Daftarkan Mahasiswa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: ISSUE NEW CERTIFICATE (4-STEP PROGRESS) */}
      {/* ========================================================= */}
      {isIssueModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-400" />
                Penerbitan Sertifikat On-Chain
              </h3>
              <button
                onClick={() => {
                  if (!isIssuingCert) setIsIssueModalOpen(false)
                }}
                disabled={isIssuingCert}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Issuance Steps Animation / Form */}
            {isIssuingCert ? (
              <div className="py-8 text-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 mx-auto animate-pulse">
                  <RefreshCw className="w-8 h-8 animate-spin" />
                </div>

                <div className="space-y-2">
                  <h4 className="text-lg font-bold text-white">Memproses Penerbitan ke Blockchain...</h4>
                  <div className="max-w-xs mx-auto text-xs space-y-2 font-mono">
                    <div className={`flex items-center gap-2 ${issueStep >= 1 ? 'text-emerald-400' : 'text-slate-600'}`}>
                      {issueStep > 1 ? <Check className="w-4 h-4" /> : <RefreshCw className="w-4 h-4 animate-spin" />}
                      1. Validasi Input Data Mahasiswa
                    </div>
                    <div className={`flex items-center gap-2 ${issueStep >= 2 ? 'text-emerald-400' : 'text-slate-600'}`}>
                      {issueStep > 2 ? <Check className="w-4 h-4" /> : (issueStep === 2 ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span className="w-4 h-4 inline-block" />)}
                      2. Generate Nomor Unik (CERT-2026-XXXX)
                    </div>
                    <div className={`flex items-center gap-2 ${issueStep >= 3 ? 'text-emerald-400' : 'text-slate-600'}`}>
                      {issueStep > 3 ? <Check className="w-4 h-4" /> : (issueStep === 3 ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span className="w-4 h-4 inline-block" />)}
                      3. Signing Smart Contract On-Chain
                    </div>
                    <div className={`flex items-center gap-2 ${issueStep >= 4 ? 'text-emerald-400' : 'text-slate-600'}`}>
                      {issueStep >= 4 ? <Check className="w-4 h-4" /> : <span className="w-4 h-4 inline-block" />}
                      4. Menyimpan Arsip & QR Code Instan
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleIssueCertificate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Pilih Mahasiswa Penerima *</label>
                  <select
                    required
                    value={issueForm.studentId}
                    onChange={(e) => {
                      const selected = students.find(s => s.id === e.target.value)
                      setIssueForm({
                        ...issueForm,
                        studentId: e.target.value,
                        faculty: selected?.faculty || issueForm.faculty,
                        major: selected?.major || issueForm.major
                      })
                    }}
                    className="w-full px-4 py-2.5 bg-slate-950 text-white rounded-xl border border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- Pilih Mahasiswa Terdaftar --</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.nim}) — {s.major}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Judul / Nama Sertifikat *</label>
                  <input
                    type="text"
                    required
                    value={issueForm.certificateName}
                    onChange={(e) => setIssueForm({ ...issueForm, certificateName: e.target.value })}
                    placeholder="Ijazah Sarjana Komputer (S.Kom)"
                    className="w-full px-4 py-2.5 bg-slate-950 text-white rounded-xl border border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Gelar Akademik</label>
                    <input
                      type="text"
                      value={issueForm.degree}
                      onChange={(e) => setIssueForm({ ...issueForm, degree: e.target.value })}
                      placeholder="Sarjana Komputer (S.Kom)"
                      className="w-full px-4 py-2.5 bg-slate-950 text-white rounded-xl border border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Tanggal Kelulusan</label>
                    <input
                      type="date"
                      value={issueForm.issueDate}
                      onChange={(e) => setIssueForm({ ...issueForm, issueDate: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-950 text-white rounded-xl border border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">IPK Kelulusan</label>
                    <input
                      type="text"
                      value={issueForm.gpa}
                      onChange={(e) => setIssueForm({ ...issueForm, gpa: e.target.value })}
                      placeholder="3.88"
                      className="w-full px-4 py-2.5 bg-slate-950 text-white rounded-xl border border-slate-700 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Predikat Kelulusan</label>
                    <input
                      type="text"
                      value={issueForm.honors}
                      onChange={(e) => setIssueForm({ ...issueForm, honors: e.target.value })}
                      placeholder="Dengan Pujian (Cum Laude)"
                      className="w-full px-4 py-2.5 bg-slate-950 text-white rounded-xl border border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="p-3 bg-indigo-950/40 rounded-xl border border-indigo-500/20 text-xs text-indigo-300 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span>
                    Sistem akan secara otomatis mencatat sertifikat ini ke dalam smart contract Polygon Amoy Testnet dan menghasilkan QR Code unik.
                  </span>
                </div>

                <div className="pt-3 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsIssueModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30"
                  >
                    <Award className="w-4 h-4" />
                    Terbitkan Sekarang ke Blockchain
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: CERTIFICATE DETAIL PREVIEW */}
      {/* ========================================================= */}
      {selectedCertificateDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl my-8">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Award className="w-6 h-6 text-indigo-400" />
                <h3 className="text-lg font-bold text-white">Detail Ijazah & Sertifikat Akademik</h3>
              </div>
              <button
                onClick={() => setSelectedCertificateDetail(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Certificate Visual Box */}
            <div className="bg-slate-950 p-6 sm:p-8 rounded-2xl border border-indigo-500/30 mb-6 relative">
              <div className="text-center space-y-2">
                <GraduationCap className="w-12 h-12 text-indigo-400 mx-auto" />
                <h4 className="text-xs uppercase tracking-widest font-extrabold text-indigo-400">
                  INSTITUT TEKNOLOGI & SAINS VERIS
                </h4>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {selectedCertificateDetail.certificateName}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  No: <span className="text-indigo-300 font-bold">{selectedCertificateDetail.certificateNumber}</span>
                </p>
              </div>

              <div className="my-6 text-center space-y-2">
                <p className="text-xs text-slate-400">Diberikan kepada:</p>
                <h4 className="text-2xl font-black text-white">{selectedCertificateDetail.studentName}</h4>
                <p className="text-xs font-mono text-slate-300">NIM: {selectedCertificateDetail.studentNim}</p>
                <p className="text-xs text-slate-400">{selectedCertificateDetail.faculty} — {selectedCertificateDetail.major}</p>
              </div>

              <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
                <div className="text-slate-400">
                  Tanggal: <span className="text-white">{selectedCertificateDetail.issueDate}</span>
                </div>
                {selectedCertificateDetail.qrCodeDataUrl && (
                  <img src={selectedCertificateDetail.qrCodeDataUrl} alt="QR Code" className="w-16 h-16 bg-white p-1 rounded-lg" />
                )}
              </div>
            </div>

            {/* Blockchain On-Chain Receipt */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs font-mono mb-6">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-sans font-bold">Bukti Kriptografis Blockchain:</span>
                <span className="text-emerald-400 font-bold">✓ ON-CHAIN</span>
              </div>
              <div className="text-slate-500">Transaction Hash:</div>
              <div className="flex items-center justify-between bg-slate-900 p-2 rounded text-indigo-300 break-all text-[11px]">
                <span>{selectedCertificateDetail.txHash}</span>
                <button onClick={() => copyToClipboard(selectedCertificateDetail.txHash, 'TxHash')} className="p-1 hover:text-white">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                onClick={() => downloadCertificatePDF(selectedCertificateDetail)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-2 transition-colors border border-slate-700"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
              <button
                onClick={() => handleResendEmail(selectedCertificateDetail)}
                disabled={isResendingEmail}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center gap-2 transition-colors"
              >
                {isResendingEmail ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Mail className="w-4 h-4" />
                )}
                {isResendingEmail ? 'Mengirim...' : 'Email Lulusan'}
              </button>
              <button
                onClick={() => {
                  setSelectedCertificateDetail(null)
                  handleVerify(selectedCertificateDetail.certificateNumber)
                }}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2"
              >
                <FileCheck className="w-4 h-4" />
                Portal Verifikasi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: QR CODE VIEWER */}
      {/* ========================================================= */}
      {qrModalCert && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center shadow-2xl">
            <div className="flex justify-end">
              <button onClick={() => setQrModalCert(null)} className="p-1 text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto mb-3">
              <QrCode className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-white">QR Code Verifikasi Publik</h3>
            <p className="text-xs text-slate-400 mt-0.5">{qrModalCert.certificateNumber}</p>
            <p className="text-xs font-semibold text-white mt-1">{qrModalCert.studentName}</p>

            <div className="my-5 p-3 bg-white rounded-2xl inline-block shadow-xl">
              {qrModalCert.qrCodeDataUrl ? (
                <img src={qrModalCert.qrCodeDataUrl} alt="QR Code" className="w-48 h-48" />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-slate-400">QR Code Error</div>
              )}
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  const link = `${window.location.origin}/verify/${qrModalCert.certificateNumber}`
                  copyToClipboard(link, 'Link Verifikasi QR')
                }}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Salin Tautan Verifikasi
              </button>
              <button
                onClick={() => downloadQRCodeImage(qrModalCert)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center gap-2 border border-slate-700"
              >
                <Download className="w-4 h-4" />
                Download QR Code (PNG)
              </button>
              <button
                onClick={() => downloadCertificatePDF(qrModalCert)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center gap-2 border border-slate-700"
              >
                <FileText className="w-4 h-4" />
                Download Sertifikat (PDF)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-400" />
            <span suppressHydrationWarning>&copy; {new Date().getFullYear()} <strong>VeriChain Academic</strong>. Standardized Ethereum/Polygon Digital Credential Ledger.</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Polygon Amoy Testnet (80002)</span>
            <span>•</span>
            <span className="font-mono text-[11px]">Contract: 0xb35f...cBc20BA</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
