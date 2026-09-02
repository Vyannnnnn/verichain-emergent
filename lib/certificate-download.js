import { jsPDF } from 'jspdf'

/**
 * Generate a professional-looking certificate PDF for VeriChain Academic
 * @param {Object} cert - Certificate data object
 * @returns {void} - triggers browser download
 */
export function downloadCertificatePDF(cert) {
  if (!cert) return

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  })

  const W = 297 // A4 landscape width
  const H = 210 // A4 landscape height

  // ─── Background ────────────────────────────────────────────────
  doc.setFillColor(15, 23, 42)  // slate-900
  doc.rect(0, 0, W, H, 'F')

  // Inner frame
  doc.setDrawColor(99, 102, 241) // indigo-500
  doc.setLineWidth(0.8)
  doc.roundedRect(10, 10, W - 20, H - 20, 3, 3)

  // Double border accent
  doc.setDrawColor(59, 130, 246) // blue-500
  doc.setLineWidth(0.3)
  doc.roundedRect(13, 13, W - 26, H - 26, 2, 2)

  // ─── Header ────────────────────────────────────────────────────
  // Shield icon (simplified as text)
  doc.setFontSize(8)
  doc.setTextColor(99, 102, 241)
  doc.setFont('helvetica', 'bold')
  doc.text('VERICHAIN ACADEMIC', W / 2, 28, { align: 'center' })

  doc.setFontSize(6)
  doc.setTextColor(148, 163, 184)
  doc.text('Platform Verifikasi Sertifikat Digital Berbasis Blockchain', W / 2, 33, { align: 'center' })

  // Divider
  doc.setDrawColor(99, 102, 241)
  doc.setLineWidth(0.5)
  doc.line(W / 2 - 40, 36, W / 2 + 40, 36)

  // ─── Institution Name ──────────────────────────────────────────
  doc.setFontSize(10)
  doc.setTextColor(99, 102, 241)
  doc.setFont('helvetica', 'bold')
  doc.text('INSTITUT TEKNOLOGI & SAINS VERIS', W / 2, 44, { align: 'center' })

  // ─── Certificate Title ─────────────────────────────────────────
  doc.setFontSize(16)
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  const certTitle = cert.certificateName || 'Ijazah Sarjana'
  const titleLines = doc.splitTextToSize(certTitle, 200)
  doc.text(titleLines, W / 2, 55, { align: 'center' })

  const titleOffset = titleLines.length > 1 ? 8 : 0

  // Certificate Number
  doc.setFontSize(8)
  doc.setTextColor(148, 163, 184)
  doc.setFont('courier', 'normal')
  doc.text(`No: ${cert.certificateNumber || 'N/A'}`, W / 2, 63 + titleOffset, { align: 'center' })

  // ─── "Diberikan kepada" ────────────────────────────────────────
  doc.setFontSize(8)
  doc.setTextColor(148, 163, 184)
  doc.setFont('helvetica', 'normal')
  doc.text('Dengan ini diberikan kepada:', W / 2, 75 + titleOffset, { align: 'center' })

  // Student Name
  doc.setFontSize(22)
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.text(cert.studentName || 'Nama Mahasiswa', W / 2, 87 + titleOffset, { align: 'center' })

  // NIM
  doc.setFontSize(9)
  doc.setTextColor(165, 180, 252) // indigo-300
  doc.setFont('courier', 'normal')
  doc.text(`NIM: ${cert.studentNim || 'N/A'}`, W / 2, 94 + titleOffset, { align: 'center' })

  // Faculty & Major
  doc.setFontSize(8)
  doc.setTextColor(148, 163, 184)
  doc.setFont('helvetica', 'normal')
  doc.text(`${cert.faculty || ''} — ${cert.major || ''}`, W / 2, 100 + titleOffset, { align: 'center' })

  // ─── Details Grid ──────────────────────────────────────────────
  const gridY = 112 + titleOffset
  const gridItems = [
    { label: 'Gelar', value: cert.degree || '-' },
    { label: 'IPK', value: cert.gpa || '-' },
    { label: 'Predikat', value: cert.honors || '-' },
    { label: 'Tanggal Terbit', value: cert.issueDate || '-' }
  ]

  const colWidth = 55
  const startX = W / 2 - (colWidth * gridItems.length) / 2

  gridItems.forEach((item, i) => {
    const x = startX + i * colWidth + colWidth / 2
    doc.setFontSize(6)
    doc.setTextColor(100, 116, 139) // slate-500
    doc.setFont('helvetica', 'normal')
    doc.text(item.label, x, gridY, { align: 'center' })

    doc.setFontSize(9)
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    const valueLines = doc.splitTextToSize(item.value, colWidth - 5)
    doc.text(valueLines, x, gridY + 5, { align: 'center' })
  })

  // ─── Blockchain Proof ──────────────────────────────────────────
  const bcY = gridY + 20

  // Proof box background
  doc.setFillColor(22, 33, 62) // darker blue
  doc.roundedRect(30, bcY - 4, W - 60, 28, 2, 2, 'F')

  doc.setFontSize(6)
  doc.setTextColor(34, 197, 94) // green-500
  doc.setFont('helvetica', 'bold')
  doc.text('BLOCKCHAIN PROOF — ON-CHAIN VERIFIED', W / 2, bcY + 1, { align: 'center' })

  doc.setFontSize(6)
  doc.setTextColor(148, 163, 184)
  doc.setFont('helvetica', 'normal')
  doc.text('Network: Polygon Amoy Testnet (Chain ID 80002)', W / 2, bcY + 7, { align: 'center' })

  doc.setFontSize(5.5)
  doc.setTextColor(165, 180, 252)
  doc.setFont('courier', 'normal')
  const txHash = cert.txHash || 'N/A'
  doc.text(`TxHash: ${txHash}`, W / 2, bcY + 13, { align: 'center' })

  const contractAddr = cert.contractAddress || ''
  if (contractAddr) {
    doc.text(`Contract: ${contractAddr}`, W / 2, bcY + 18, { align: 'center' })
  }

  // ─── QR Code ───────────────────────────────────────────────────
  if (cert.qrCodeDataUrl) {
    try {
      doc.addImage(cert.qrCodeDataUrl, 'PNG', W - 55, bcY - 6, 22, 22)
      doc.setFontSize(4.5)
      doc.setTextColor(148, 163, 184)
      doc.text('Scan QR untuk', W - 44, bcY + 18, { align: 'center' })
      doc.text('verifikasi', W - 44, bcY + 21, { align: 'center' })
    } catch (e) {
      // QR code failed, skip
    }
  }

  // ─── Verify URL ────────────────────────────────────────────────
  const verifyUrl = cert.verifyUrl || ''
  if (verifyUrl) {
    doc.setFontSize(5)
    doc.setTextColor(99, 102, 241)
    doc.setFont('courier', 'normal')
    doc.text(`Verifikasi online: ${verifyUrl}`, W / 2, bcY + 30, { align: 'center' })
  }

  // ─── Footer ────────────────────────────────────────────────────
  doc.setFontSize(5)
  doc.setTextColor(100, 116, 139)
  doc.setFont('helvetica', 'normal')
  doc.text(
    `Dokumen ini di-generate oleh VeriChain Academic — Sertifikat tercatat permanen di blockchain Ethereum/Polygon`,
    W / 2,
    H - 17,
    { align: 'center' }
  )
  doc.text(
    `© ${new Date().getFullYear()} VeriChain Academic. Generated: ${new Date().toLocaleString('id-ID')}`,
    W / 2,
    H - 13,
    { align: 'center' }
  )

  // ─── Download ──────────────────────────────────────────────────
  const fileName = `VeriChain_${cert.certificateNumber || 'Certificate'}_${cert.studentName?.replace(/\s+/g, '_') || 'Student'}.pdf`
  doc.save(fileName)
}

/**
 * Download the QR code as a PNG image
 * @param {Object} cert - Certificate data with qrCodeDataUrl
 */
export function downloadQRCodeImage(cert) {
  if (!cert?.qrCodeDataUrl) return

  const link = document.createElement('a')
  link.href = cert.qrCodeDataUrl
  link.download = `QR_${cert.certificateNumber || 'VeriChain'}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
