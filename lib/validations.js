import { z } from 'zod'

export const StudentSchema = z.object({
  name: z.string().min(2, { message: 'Nama mahasiswa minimal 2 karakter' }),
  nim: z.string().min(4, { message: 'NIM minimal 4 karakter' }),
  email: z.string().email({ message: 'Email tidak valid' }),
  faculty: z.string().optional(),
  major: z.string().optional()
})

export const CertificateIssueSchema = z.object({
  studentId: z.string().min(1, { message: 'Mahasiswa harus dipilih' }),
  certificateName: z.string().min(3, { message: 'Nama/judul sertifikat minimal 3 karakter' }),
  degree: z.string().optional(),
  faculty: z.string().optional(),
  major: z.string().optional(),
  gpa: z.string().optional(),
  honors: z.string().optional(),
  issueDate: z.string().optional()
})

export const LoginSchema = z.object({
  email: z.string().email({ message: 'Email tidak valid' }),
  password: z.string().min(6, { message: 'Password minimal 6 karakter' })
})
