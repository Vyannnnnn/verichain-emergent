# VeriChain Academic

Platform verifikasi sertifikat dan ijazah akademik berbasis **Next.js + MongoDB + Ethereum/Polygon (Amoy Testnet)** dengan alur **dual verification**: validasi data institusi dan bukti blockchain.

## Fitur Utama

- Verifikasi publik sertifikat melalui nomor sertifikat dan QR code.
- Penerbitan sertifikat digital dengan nomor berurutan (`CERT-YYYY-NNNN`).
- Pencatatan bukti blockchain (tx hash, contract address, network).
- Manajemen data mahasiswa (CRUD).
- Dashboard admin untuk statistik, monitoring jaringan, dan arsip sertifikat.
- Notifikasi email otomatis saat sertifikat diterbitkan (Resend).
- Download sertifikat PDF dan QR code.

## Teknologi

- **Frontend/Backend**: Next.js (App Router), React
- **Database**: MongoDB
- **Blockchain**: ethers.js (Polygon Amoy Testnet)
- **Validation**: Zod
- **Email**: Resend
- **UI**: Tailwind CSS, Radix UI, Lucide Icons

## Arsitektur Singkat

- `app/page.js`: UI utama (landing, verifikasi, dashboard admin).
- `app/api/[[...path]]/route.js`: API gateway untuk auth, students, certificates, verification, stats, email.
- `lib/db.js`: koneksi MongoDB.
- `lib/blockchain.js`: integrasi smart contract/attestation blockchain.
- `lib/email.js`: template dan pengiriman email sertifikat.
- `lib/certificate.js`: generator nomor sertifikat.

## Menjalankan Secara Lokal

### 1) Prasyarat

- Node.js 18+
- Yarn 1.x
- MongoDB aktif (lokal atau remote)

### 2) Instalasi

```bash
yarn install
```

### 3) Konfigurasi Environment

Buat file `.env.local`:

```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=verichain_academic

JWT_SECRET=your-strong-jwt-secret

RPC_URL=https://rpc-amoy.polygon.technology
PRIVATE_KEY=0xYOUR_WALLET_PRIVATE_KEY
Contract_Address=0xYOUR_CONTRACT_ADDRESS

NEXT_PUBLIC_BASE_URL=http://localhost:3000

RESEND_API_KEY=re_xxxxxxxxx
RESEND_FROM=VeriChain Academic <noreply@your-domain.com>

CORS_ORIGINS=http://localhost:3000
```

> **Penting:** gunakan kredensial dan private key milik Anda sendiri. Jangan commit file `.env*`.

### 4) Jalankan Aplikasi

```bash
yarn dev
```

Buka `http://localhost:3000`.

## Akun Demo Seed

Saat aplikasi berjalan, sistem melakukan seed data awal (jika belum ada):

- **Admin email**: `admin@verichain.ac.id`
- **Admin password**: `admin123`

Gunakan hanya untuk development/demo, lalu ganti untuk environment produksi.

## Endpoint API Inti

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/verify/:certificateNumber`
- `GET /api/students`
- `POST /api/students`
- `GET|PUT|DELETE /api/students/:id`
- `GET /api/certificates`
- `POST /api/certificates`
- `GET|DELETE /api/certificates/:id`
- `GET /api/blockchain/status`
- `GET /api/stats`
- `GET /api/email/logs`
- `POST /api/email/resend/:certificateId`
- `POST /api/email/test`

## Scripts

```bash
yarn dev      # development
yarn build    # production build
yarn start    # run production server
```

## Catatan Keamanan

- Pastikan semua secret (`JWT_SECRET`, `PRIVATE_KEY`, `RESEND_API_KEY`) hanya disimpan di environment variable.
- Gunakan private key wallet khusus testnet/dev, bukan wallet utama.
- Batasi `CORS_ORIGINS` sesuai domain resmi aplikasi saat produksi.

## Lisensi

Gunakan lisensi internal/tim Anda atau tambahkan file `LICENSE` sesuai kebutuhan proyek.
