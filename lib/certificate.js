import { getCollection } from './db'

/**
 * Generates the next sequential certificate number: CERT-YYYY-NNNN (e.g., CERT-2026-0001)
 */
export async function generateNextCertificateNumber() {
  const currentYear = new Date().getFullYear()
  const prefix = `CERT-${currentYear}-`

  const certCollection = await getCollection('certificates')
  
  // Find highest certificate number for the current year
  const count = await certCollection.countDocuments({
    certificateNumber: { $regex: `^${prefix}` }
  })

  const nextSeq = count + 1
  const paddedSeq = String(nextSeq).padStart(4, '0')
  return `${prefix}${paddedSeq}`
}
