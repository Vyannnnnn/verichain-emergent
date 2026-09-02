import { Resend } from 'resend'

// ─── Resend Client (lazy-initialized) ────────────────────────────────────────
let resendClient = null

export function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return null
  if (!resendClient) {
    resendClient = new Resend(apiKey)
  }
  return resendClient
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function escapeHtml(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Extract raw Base64 and content type from a data URL.
 * e.g. "data:image/png;base64,iVBOR..." → { base64: "iVBOR...", contentType: "image/png" }
 */
function parseDataUrl(dataUrl) {
  if (!dataUrl || typeof dataUrl !== 'string') return null
  const match = dataUrl.match(/^data:(image\/(?:png|jpeg|jpg|gif|webp));base64,(.+)$/s)
  if (!match) return null
  return {
    contentType: match[1] === 'image/jpg' ? 'image/jpeg' : match[1],
    base64: match[2].replace(/\s/g, '')
  }
}

// ─── Email Template ──────────────────────────────────────────────────────────

function buildCertificateEmailHtml({
  studentName,
  certificateNumber,
  certificateName,
  degree,
  faculty,
  major,
  gpa,
  honors,
  issueDate,
  txHash,
  blockExplorerUrl,
  verifyUrl
}) {
  const s = (v) => escapeHtml(v)

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Sertifikat Akademik Digital - VeriChain Academic</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 50%,#0f172a 100%);padding:40px 32px;text-align:center;">
              <div style="font-size:14px;letter-spacing:3px;color:#60a5fa;font-weight:600;text-transform:uppercase;margin-bottom:8px;">
                &#x1f393; VeriChain Academic
              </div>
              <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:0 0 8px 0;line-height:1.3;">
                Selamat, ${s(studentName)}!
              </h1>
              <p style="color:#94a3b8;font-size:14px;margin:0;">
                Sertifikat akademik Anda telah berhasil diterbitkan dan dicatat secara permanen di blockchain.
              </p>
            </td>
          </tr>

          <!-- Certificate Info Card -->
          <tr>
            <td style="padding:32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
                <tr>
                  <td style="padding:24px;">
                    <div style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;margin-bottom:16px;">
                      Detail Sertifikat
                    </div>
                    
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:6px 0;color:#64748b;font-size:13px;width:140px;vertical-align:top;">No. Sertifikat</td>
                        <td style="padding:6px 0;color:#0f172a;font-size:14px;font-weight:700;letter-spacing:0.5px;">${s(certificateNumber)}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;color:#64748b;font-size:13px;vertical-align:top;">Nama Sertifikat</td>
                        <td style="padding:6px 0;color:#0f172a;font-size:14px;font-weight:600;">${s(certificateName)}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;color:#64748b;font-size:13px;vertical-align:top;">Gelar</td>
                        <td style="padding:6px 0;color:#0f172a;font-size:14px;">${s(degree)}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;color:#64748b;font-size:13px;vertical-align:top;">Fakultas</td>
                        <td style="padding:6px 0;color:#0f172a;font-size:14px;">${s(faculty)}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;color:#64748b;font-size:13px;vertical-align:top;">Program Studi</td>
                        <td style="padding:6px 0;color:#0f172a;font-size:14px;">${s(major)}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;color:#64748b;font-size:13px;vertical-align:top;">IPK</td>
                        <td style="padding:6px 0;color:#0f172a;font-size:14px;font-weight:600;">${s(gpa)}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;color:#64748b;font-size:13px;vertical-align:top;">Predikat</td>
                        <td style="padding:6px 0;color:#0f172a;font-size:14px;">${s(honors)}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;color:#64748b;font-size:13px;vertical-align:top;">Tanggal Terbit</td>
                        <td style="padding:6px 0;color:#0f172a;font-size:14px;">${s(issueDate)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- QR Code Section -->
          <tr>
            <td style="padding:0 32px 24px 32px;text-align:center;">
              <div style="background-color:#eff6ff;border:2px dashed #93c5fd;border-radius:12px;padding:24px;">
                <div style="font-size:13px;color:#1e40af;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">
                  QR Code Verifikasi
                </div>
                <img src="cid:qr-code" alt="QR Code Verifikasi Sertifikat" width="200" height="200" style="display:block;margin:0 auto 12px auto;border-radius:8px;border:4px solid #ffffff;box-shadow:0 2px 8px rgba(0,0,0,0.1);" />
                <p style="font-size:12px;color:#64748b;margin:0;">
                  Scan QR code ini untuk memverifikasi keaslian sertifikat secara instan
                </p>
              </div>
            </td>
          </tr>

          <!-- Verify Button -->
          <tr>
            <td style="padding:0 32px 24px 32px;text-align:center;">
              <a href="${s(verifyUrl)}" target="_blank" style="display:inline-block;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:8px;font-size:15px;font-weight:600;letter-spacing:0.5px;">
                &#x1f50d; Verifikasi Sertifikat Online
              </a>
              <p style="font-size:12px;color:#94a3b8;margin:12px 0 0 0;">
                atau kunjungi: <a href="${s(verifyUrl)}" style="color:#2563eb;text-decoration:underline;word-break:break-all;">${s(verifyUrl)}</a>
              </p>
            </td>
          </tr>

          <!-- Blockchain Proof Section -->
          <tr>
            <td style="padding:0 32px 32px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;overflow:hidden;">
                <tr>
                  <td style="padding:20px;">
                    <div style="font-size:12px;color:#16a34a;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;margin-bottom:12px;">
                      &#x26d3;&#xfe0f; Bukti Blockchain (Immutable)
                    </div>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:4px 0;color:#64748b;font-size:12px;vertical-align:top;">Network</td>
                        <td style="padding:4px 0;color:#0f172a;font-size:12px;">Polygon Amoy Testnet</td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;color:#64748b;font-size:12px;vertical-align:top;width:90px;">TxHash</td>
                        <td style="padding:4px 0;font-size:11px;word-break:break-all;">
                          <a href="${s(blockExplorerUrl)}" target="_blank" style="color:#2563eb;text-decoration:underline;">${s(txHash)}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc;border-top:1px solid #e2e8f0;padding:24px 32px;text-align:center;">
              <p style="font-size:12px;color:#94a3b8;margin:0 0 8px 0;">
                Email ini dikirim secara otomatis oleh <strong>VeriChain Academic</strong> saat sertifikat berhasil di-mint on-chain.
              </p>
              <p style="font-size:11px;color:#cbd5e1;margin:0;">
                &copy; ${new Date().getFullYear()} VeriChain Academic &mdash; Platform Verifikasi Sertifikat Berbasis Blockchain
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// ─── Plain Text Fallback ─────────────────────────────────────────────────────

function buildCertificateEmailText({
  studentName,
  certificateNumber,
  certificateName,
  degree,
  faculty,
  major,
  gpa,
  honors,
  issueDate,
  txHash,
  blockExplorerUrl,
  verifyUrl
}) {
  return `VERICHAIN ACADEMIC - Sertifikat Digital Blockchain
=====================================================

Selamat, ${studentName}!

Sertifikat akademik Anda telah berhasil diterbitkan dan dicatat secara permanen di blockchain.

DETAIL SERTIFIKAT
-----------------
No. Sertifikat : ${certificateNumber}
Nama Sertifikat: ${certificateName}
Gelar          : ${degree}
Fakultas       : ${faculty}
Program Studi  : ${major}
IPK            : ${gpa}
Predikat       : ${honors}
Tanggal Terbit : ${issueDate}

VERIFIKASI ONLINE
-----------------
Link: ${verifyUrl}

BUKTI BLOCKCHAIN
----------------
Network : Polygon Amoy Testnet
TxHash  : ${txHash}
Explorer: ${blockExplorerUrl}

---
Email ini dikirim otomatis oleh VeriChain Academic.
© ${new Date().getFullYear()} VeriChain Academic`
}

// ─── Main Send Function ──────────────────────────────────────────────────────

/**
 * Send a certificate notification email to the graduate.
 * Gracefully degrades if RESEND_API_KEY is not configured.
 *
 * @param {Object} certificate - Full certificate document from MongoDB
 * @returns {Object} { success, emailId?, error?, skipped? }
 */
export async function sendCertificateEmail(certificate) {
  const resend = getResendClient()

  // Graceful degradation: if no API key, log and skip
  if (!resend) {
    console.warn('[VeriChain Email] RESEND_API_KEY tidak dikonfigurasi. Email notifikasi dilewati.')
    return {
      success: false,
      skipped: true,
      error: 'RESEND_API_KEY tidak dikonfigurasi'
    }
  }

  const recipientEmail = certificate.studentEmail
  if (!recipientEmail) {
    console.warn('[VeriChain Email] Student email tidak tersedia untuk sertifikat:', certificate.certificateNumber)
    return {
      success: false,
      skipped: true,
      error: 'Email mahasiswa tidak tersedia'
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://localhost:3000'
  const verifyUrl = certificate.verifyUrl || `${baseUrl}/verify/${certificate.certificateNumber}`
  const blockExplorerUrl = certificate.txHash
    ? `https://amoy.polygonscan.com/tx/${certificate.txHash}`
    : `https://amoy.polygonscan.com/address/${process.env.Contract_Address}`

  const templateData = {
    studentName: certificate.studentName,
    certificateNumber: certificate.certificateNumber,
    certificateName: certificate.certificateName,
    degree: certificate.degree || '',
    faculty: certificate.faculty || '',
    major: certificate.major || '',
    gpa: certificate.gpa || '',
    honors: certificate.honors || '',
    issueDate: certificate.issueDate || '',
    txHash: certificate.txHash || 'Pending...',
    blockExplorerUrl,
    verifyUrl
  }

  const html = buildCertificateEmailHtml(templateData)
  const text = buildCertificateEmailText(templateData)

  // Build email payload
  const fromAddress = process.env.RESEND_FROM || 'VeriChain Academic <onboarding@resend.dev>'

  const emailPayload = {
    from: fromAddress,
    to: [recipientEmail],
    subject: `🎓 Sertifikat Digital Anda Telah Terbit — ${certificate.certificateNumber}`,
    html,
    text
  }

  // Attach QR code as inline CID image if available
  if (certificate.qrCodeDataUrl) {
    const parsed = parseDataUrl(certificate.qrCodeDataUrl)
    if (parsed) {
      emailPayload.attachments = [{
        content: parsed.base64,
        filename: 'qr-verification.png',
        content_type: parsed.contentType
      }]
      // Also add as inline CID attachment
      emailPayload.attachments = [{
        content: parsed.base64,
        filename: 'qr-verification.png',
        contentType: parsed.contentType,
        contentId: 'qr-code'
      }]
    }
  }

  try {
    const { data, error } = await resend.emails.send(emailPayload)

    if (error) {
      console.error('[VeriChain Email] Resend error:', error.name, error.message)
      return {
        success: false,
        error: error.message
      }
    }

    console.log('[VeriChain Email] ✅ Email berhasil dikirim ke', recipientEmail, '| ID:', data?.id)
    return {
      success: true,
      emailId: data?.id,
      recipientEmail
    }
  } catch (err) {
    console.error('[VeriChain Email] Exception saat mengirim email:', err.message)
    return {
      success: false,
      error: err.message
    }
  }
}
