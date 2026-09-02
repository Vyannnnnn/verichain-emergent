'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import {
  Shield, CheckCircle2, Search, Award, GraduationCap,
  FileCheck, QrCode, Lock, Users, ArrowRight, RefreshCw,
  Sparkles, Building2, ChevronRight, Activity, Fingerprint,
  Zap, Globe, Layers, Mail, Eye
} from 'lucide-react'

// ─── Animated Counter Hook ───────────────────────────────────────
function useCounter(target, duration = 2000, startWhenVisible = true) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (!startWhenVisible || !isInView || hasAnimated.current) return
    hasAnimated.current = true
    const num = typeof target === 'string' ? parseInt(target.replace(/[^0-9]/g, ''), 10) : target
    if (isNaN(num) || num === 0) { setCount(0); return }

    let start = 0
    const step = Math.ceil(num / (duration / 16))
    const timer = setInterval(() => {
      start += step
      if (start >= num) { setCount(num); clearInterval(timer) }
      else setCount(start)
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration, isInView, startWhenVisible])

  return { count, ref }
}

// ─── Animation Variants ──────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 30, filter: 'blur(8px)' },
  visible: (i = 0) => ({
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }
  })
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: (i = 0) => ({
    opacity: 1, scale: 1,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }
  })
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
}

const staggerItem = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
}

// ─── Floating Particle Component ─────────────────────────────────
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${2 + Math.random() * 4}px`,
            height: `${2 + Math.random() * 4}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: ['#818cf8', '#22d3ee', '#34d399', '#f472b6', '#fbbf24'][i % 5],
            opacity: 0.15 + Math.random() * 0.25,
            animation: `float-particle ${8 + Math.random() * 12}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}
    </div>
  )
}

// ─── Glowing Orb Background ──────────────────────────────────────
function AuroraBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-br from-indigo-600/25 via-blue-500/15 to-cyan-400/10 blur-[140px] rounded-full animate-aurora-1" />
      <div className="absolute top-20 -left-40 w-[500px] h-[400px] bg-gradient-to-br from-violet-600/15 via-purple-500/10 to-fuchsia-400/5 blur-[120px] rounded-full animate-aurora-2" />
      <div className="absolute -bottom-20 right-0 w-[600px] h-[350px] bg-gradient-to-br from-emerald-600/10 via-teal-500/8 to-cyan-400/5 blur-[130px] rounded-full animate-aurora-3" />
    </div>
  )
}

// ─── Stat Card Component ─────────────────────────────────────────
function StatCard({ value, label, suffix = '', color, icon: Icon, delay = 0 }) {
  const { count, ref } = useCounter(value, 1800)
  const colors = {
    indigo: 'from-indigo-500/20 to-indigo-600/5 border-indigo-500/30 shadow-indigo-500/10',
    emerald: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/30 shadow-emerald-500/10',
    cyan: 'from-cyan-500/20 to-cyan-600/5 border-cyan-500/30 shadow-cyan-500/10',
    amber: 'from-amber-500/20 to-amber-600/5 border-amber-500/30 shadow-amber-500/10',
  }
  const textColors = {
    indigo: 'text-indigo-300',
    emerald: 'text-emerald-300',
    cyan: 'text-cyan-300',
    amber: 'text-amber-300',
  }

  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      custom={delay}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`relative p-5 rounded-2xl bg-gradient-to-br ${colors[color]} border backdrop-blur-xl shadow-lg cursor-default group overflow-hidden`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl bg-slate-950/50 flex items-center justify-center ${textColors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className={`text-2xl sm:text-3xl font-black tracking-tight tabular-nums ${textColors[color]}`}>
            {count.toLocaleString()}{suffix}
          </p>
          <p className="text-[11px] sm:text-xs font-medium text-slate-400 mt-0.5">{label}</p>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Feature Card Component ──────────────────────────────────────
function FeatureCard({ icon: Icon, title, description, color, index }) {
  const glowColors = {
    indigo: 'group-hover:border-indigo-500/50 group-hover:shadow-indigo-500/10',
    blue: 'group-hover:border-blue-500/50 group-hover:shadow-blue-500/10',
    cyan: 'group-hover:border-cyan-500/50 group-hover:shadow-cyan-500/10',
    emerald: 'group-hover:border-emerald-500/50 group-hover:shadow-emerald-500/10',
  }
  const iconBg = {
    indigo: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    cyan: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  }

  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ y: -6, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
      whileTap={{ scale: 0.98 }}
      className={`group relative p-6 rounded-2xl bg-slate-900/60 backdrop-blur-sm border border-slate-800/80 shadow-xl shadow-slate-950/50 transition-all duration-300 ${glowColors[color]} cursor-default overflow-hidden`}
    >
      {/* Hover glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative">
        <motion.div
          whileHover={{ rotate: [0, -5, 5, 0], transition: { duration: 0.5 } }}
          className={`w-12 h-12 rounded-xl ${iconBg[color]} border flex items-center justify-center mb-5`}
        >
          <Icon className="w-6 h-6" />
        </motion.div>
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
      </div>
    </motion.div>
  )
}

// ─── Step Card Component ─────────────────────────────────────────
function StepCard({ number, title, description, color, isLast }) {
  const dotColors = {
    indigo: 'bg-indigo-500 shadow-indigo-500/50',
    blue: 'bg-blue-500 shadow-blue-500/50',
    cyan: 'bg-cyan-500 shadow-cyan-500/50',
    emerald: 'bg-emerald-500 shadow-emerald-500/50',
  }
  const numColors = {
    indigo: 'text-indigo-400',
    blue: 'text-blue-400',
    cyan: 'text-cyan-400',
    emerald: 'text-emerald-400',
  }

  return (
    <motion.div variants={staggerItem} className="relative">
      {/* Connector line */}
      {!isLast && (
        <div className="hidden md:block absolute top-8 left-[calc(100%+0px)] w-full h-px bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 -translate-x-1/2 z-0" />
      )}
      <div className="relative p-6 rounded-2xl bg-slate-950/80 border border-slate-800 backdrop-blur-sm hover:border-slate-700 transition-all group">
        {/* Step dot */}
        <div className={`absolute -top-2 left-6 w-4 h-4 rounded-full ${dotColors[color]} shadow-lg z-10`} />
        <div className={`text-4xl font-black ${numColors[color]} opacity-20 mb-2 font-mono`}>{number}</div>
        <h4 className="text-base font-bold text-white mb-2">{title}</h4>
        <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// MAIN LANDING PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════
export default function LandingPage({
  searchCertNumber,
  setSearchCertNumber,
  handleVerify,
  isVerifying,
  stats,
  setCurrentView
}) {
  const heroRef = useRef(null)
  const heroInView = useInView(heroRef, { once: true })

  return (
    <div>
      {/* ═══════════════════════════════════════════════════════════ */}
      {/* HERO SECTION                                               */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative pt-8 sm:pt-16 pb-24 overflow-hidden">
        <AuroraBackground />
        <FloatingParticles />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '64px 64px'
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Animated Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={heroInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs sm:text-sm font-semibold mb-8 backdrop-blur-sm"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-400" />
              </span>
              Standar Baru Verifikasi Akademik Kriptografis
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight text-white leading-[1.1] mb-6"
            >
              Verifikasi Ijazah{' '}
              <span className="relative inline-block">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 animate-gradient-x">
                  Berbasis Blockchain
                </span>
                <motion.span
                  className="absolute -bottom-1 left-0 right-0 h-1 rounded-full bg-gradient-to-r from-indigo-500 via-cyan-500 to-emerald-500"
                  initial={{ scaleX: 0, originX: 0 }}
                  animate={heroInView ? { scaleX: 1 } : {}}
                  transition={{ duration: 1, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
                />
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="text-base sm:text-lg text-slate-300/90 font-normal leading-relaxed mb-10 max-w-2xl mx-auto"
            >
              Mencegah pemalsuan dokumen akademik dengan pencatatan permanen on-chain{' '}
              <span className="text-cyan-400 font-semibold">Ethereum/Polygon</span>.
              Cepat, transparan, dan dapat diverifikasi oleh siapa saja.
            </motion.p>

            {/* ═══ Verification Search Box ═══ */}
            <motion.div
              initial={{ opacity: 0, y: 25, scale: 0.97 }}
              animate={heroInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.7, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-2xl mx-auto relative"
            >
              {/* Outer glow ring */}
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-cyan-500/20 to-emerald-500/20 rounded-3xl blur-xl opacity-60" />

              <div className="relative bg-slate-900/90 backdrop-blur-2xl p-3 sm:p-4 rounded-2xl border border-slate-700/60 shadow-2xl shadow-slate-950/80">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleVerify(searchCertNumber)
                  }}
                  className="flex flex-col sm:flex-row items-stretch gap-2.5"
                >
                  <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                    <input
                      type="text"
                      value={searchCertNumber}
                      onChange={(e) => setSearchCertNumber(e.target.value)}
                      placeholder="Masukkan Nomor Sertifikat (contoh: CERT-2026-0001)"
                      className="w-full pl-12 pr-4 py-4 bg-slate-950/60 text-white placeholder-slate-500 rounded-xl border border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 text-sm font-medium transition-all"
                    />
                  </div>
                  <motion.button
                    type="submit"
                    disabled={isVerifying}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-7 py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 hover:from-indigo-500 hover:via-blue-500 hover:to-cyan-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 active:shadow-sm"
                  >
                    {isVerifying ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Memverifikasi...
                      </>
                    ) : (
                      <>
                        <FileCheck className="w-4 h-4" />
                        Verifikasi Sekarang
                      </>
                    )}
                  </motion.button>
                </form>

                {/* Demo Certificate Buttons */}
                <div className="mt-3.5 pt-3 border-t border-slate-800/60 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">Coba Demo:</span>
                  <motion.button
                    type="button"
                    data-testid="demo-cert-valid-1"
                    onClick={() => handleVerify('CERT-2026-0001')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/25 transition-all font-mono text-[11px]"
                  >
                    <CheckCircle2 className="w-3 h-3 inline mr-1" />
                    CERT-2026-0001
                  </motion.button>
                  <motion.button
                    type="button"
                    data-testid="demo-cert-valid-2"
                    onClick={() => handleVerify('CERT-2026-0002')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/25 transition-all font-mono text-[11px]"
                  >
                    <CheckCircle2 className="w-3 h-3 inline mr-1" />
                    CERT-2026-0002
                  </motion.button>
                  <motion.button
                    type="button"
                    data-testid="demo-cert-invalid"
                    onClick={() => handleVerify('PALSU-999-XXXX')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/25 transition-all font-mono text-[11px]"
                  >
                    ✕ PALSU-999-XXXX
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ═══ Stats Section ═══ */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-30px' }}
            variants={staggerContainer}
            className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-5xl mx-auto"
          >
            <StatCard value={1280} suffix="+" label="Sertifikat Terverifikasi" color="indigo" icon={Award} delay={0} />
            <StatCard value={48} suffix="+" label="Fakultas & Kampus Mitra" color="amber" icon={Building2} delay={1} />
            <StatCard value={100} suffix="%" label="Imutabilitas Blockchain" color="emerald" icon={Lock} delay={2} />
            <StatCard value={1} suffix="s" label="Waktu Validasi Instan" color="cyan" icon={Zap} delay={3} />
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* TRUST VISUAL BANNER                                        */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="py-14 border-y border-slate-800/50 bg-slate-900/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 to-slate-950/30 pointer-events-none" />
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={staggerContainer}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
            {[
              {
                src: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f',
                tag: 'Perlindungan Ijazah',
                title: 'Kelulusan Resmi Terakreditasi',
                color: 'indigo'
              },
              {
                src: 'https://images.unsplash.com/photo-1589330694653-ded6df03f754',
                tag: 'Keaslian Dokumen',
                title: 'QR Code & Kriptografi On-Chain',
                color: 'cyan'
              },
              {
                src: 'https://images.unsplash.com/photo-1633265486064-086b219458ec',
                tag: 'Smart Contract',
                title: 'Ledger Terdesentralisasi Permanen',
                color: 'emerald'
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={staggerItem}
                whileHover={{ y: -5, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
                className="relative rounded-2xl overflow-hidden border border-slate-800/60 h-60 group cursor-default"
              >
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out opacity-60 group-hover:opacity-75"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
                <div className="absolute inset-0 p-5 flex flex-col justify-end">
                  <span className={`text-xs font-bold uppercase tracking-wider mb-1 ${
                    item.color === 'indigo' ? 'text-indigo-400' :
                    item.color === 'cyan' ? 'text-cyan-400' : 'text-emerald-400'
                  }`}>
                    {item.tag}
                  </span>
                  <h4 className="text-base font-bold text-white">{item.title}</h4>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* FEATURES SHOWCASE                                          */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-indigo-600/5 blur-[150px] rounded-full pointer-events-none" />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
          className="text-center max-w-2xl mx-auto mb-16 relative z-10"
        >
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3">
            <Layers className="w-3.5 h-3.5" />
            Keunggulan Sistem
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">Mengapa VeriChain Academic?</h2>
          <p className="text-slate-400 text-sm mt-3 max-w-lg mx-auto">
            Solusi terpadu bagi universitas, politeknik, dan institusi pendidikan dalam menerbitkan kredensial digital berstandar global.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 relative z-10"
        >
          <FeatureCard
            icon={Lock}
            title="Imutabilitas Blockchain"
            description="Setiap nomor sertifikat di-hash dengan kriptografi SHA-256/Keccak256 dan dicatat di smart contract yang tidak dapat diedit atau dihapus."
            color="indigo"
            index={0}
          />
          <FeatureCard
            icon={CheckCircle2}
            title="Dual-Layer Verification"
            description="Verifikasi dua lapis independen: pencocokan pangkalan data kampus dan validasi ledger blockchain Ethereum/Polygon."
            color="blue"
            index={1}
          />
          <FeatureCard
            icon={QrCode}
            title="QR Code Level H"
            description="QR code berketahanan koreksi kesalahan tinggi untuk pemindaian instan oleh perekrut kerja, instansi, atau kedutaan."
            color="cyan"
            index={2}
          />
          <FeatureCard
            icon={Building2}
            title="Portal Institusi Terpadu"
            description="Kelola data mahasiswa, terbitkan ijazah digital langsung, dan pantau status smart contract melalui dashboard admin."
            color="emerald"
            index={3}
          />
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* HOW IT WORKS                                               */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-slate-900/30 border-t border-slate-800/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[300px] bg-cyan-600/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={fadeUp}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-400 mb-3">
              <Activity className="w-3.5 h-3.5" />
              Alur Kerja Sistem
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">Bagaimana Proses Verifikasi Bekerja?</h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-4 gap-5"
          >
            <StepCard
              number="01"
              title="Admin Menerbitkan"
              description="Admin kampus memilih data mahasiswa dan menerbitkan sertifikat dengan nomor unik terstandar."
              color="indigo"
            />
            <StepCard
              number="02"
              title="Pencatatan On-Chain"
              description="Sistem memanggil smart contract Ethereum/Polygon dan menandatangani hash sertifikat dengan wallet admin."
              color="blue"
            />
            <StepCard
              number="03"
              title="QR Code & Email"
              description="QR code unik dihasilkan dan email notifikasi dikirim otomatis ke lulusan berisi link verifikasi."
              color="cyan"
            />
            <StepCard
              number="04"
              title="Dual Verifikasi Publik"
              description="Pihak eksternal memindai QR code untuk memeriksa validitas database dan pembuktian smart contract."
              color="emerald"
              isLast
            />
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* CTA SECTION                                                */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 via-blue-600/5 to-cyan-600/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-600/10 blur-[140px] rounded-full pointer-events-none" />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="max-w-3xl mx-auto px-4 text-center relative z-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold mb-6">
            <Globe className="w-3.5 h-3.5" />
            Siap Digunakan Sekarang
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Mulai Lindungi Kredensial Akademik Anda
          </h2>
          <p className="text-slate-400 text-sm mb-8 max-w-lg mx-auto">
            Bergabung dengan jaringan institusi pendidikan yang telah mengadopsi teknologi blockchain untuk verifikasi dokumen.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <motion.button
              onClick={() => setCurrentView('login')}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/25 transition-all flex items-center gap-2"
            >
              Mulai Sekarang
              <ArrowRight className="w-4 h-4" />
            </motion.button>
            <motion.button
              onClick={() => setCurrentView('verify')}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="px-8 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-white font-semibold text-sm transition-all flex items-center gap-2"
            >
              <FileCheck className="w-4 h-4" />
              Coba Verifikasi
            </motion.button>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
