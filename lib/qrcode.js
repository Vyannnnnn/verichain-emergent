import QRCode from 'qrcode'

/**
 * Generates a high-quality QR code data URL (PNG)
 * with high error correction level 'H'
 */
export async function generateCertificateQRCode(verifyUrl) {
  try {
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      },
      width: 320
    })
    return qrDataUrl
  } catch (err) {
    console.error('Failed to generate QR Code:', err)
    return null
  }
}
