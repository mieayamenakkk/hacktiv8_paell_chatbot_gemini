# TravelBot API
## preview
<img width="1920" height="1080" alt="compressed_Screenshot 2026-10-30 at 21 18 51" src="https://github.com/user-attachments/assets/213e5b23-2193-48fc-8567-756bee427787" />

REST API untuk **TravelBot**, asisten perencanaan perjalanan berbahasa Indonesia. Backend ini menggunakan **Node.js**, **Express.js**, dan **Google Gemini API** untuk membantu pengguna menemukan destinasi, menyusun itinerary, menyiapkan barang bawaan, serta merangkum pembagian tagihan.

## Daftar Isi

- [Fitur](#fitur)
- [Teknologi](#teknologi)
- [Persyaratan](#persyaratan)
- [Instalasi dan Menjalankan](#instalasi-dan-menjalankan)
- [Konfigurasi Environment](#konfigurasi-environment)
- [Dokumentasi API](#dokumentasi-api)
- [Struktur Proyek](#struktur-proyek)
- [Pengujian](#pengujian)
- [Keamanan](#keamanan)
- [Catatan](#catatan)

## Fitur

- **Rekomendasi destinasi** — rekomendasi tempat wisata sesuai pesan, kota asal, anggaran, gaya liburan, dan durasi.
- **Itinerary** — menyusun aktivitas perjalanan per hari (pagi, siang, sore, malam) beserta perkiraan waktu tempuh.
- **Packing list** — membuat checklist barang bawaan berdasarkan destinasi dan tanggal perjalanan.
- **Split bill** — mengolah teks transaksi menjadi ringkasan total, pembayar utama, dan rincian utang.

## Teknologi

- Node.js (ES Modules)
- Express.js
- Google GenAI SDK (`@google/genai`)
- dotenv
- Multer

## Persyaratan

- Node.js dan npm versi yang kompatibel
- API key Google Gemini

## Instalasi dan Menjalankan

1. **Clone repository**
   ```bash
   git clone <URL_REPOSITORY>
   cd <NAMA_FOLDER_REPOSITORY>
   ```

2. **Install dependency**
   ```bash
   npm install
   ```

3. **Siapkan environment variable**  
   Buat file `.env` di direktori utama proyek. Lihat [Konfigurasi Environment](#konfigurasi-environment).

4. **Jalankan server**
   ```bash
   npm start
   ```

Jika berhasil, server berjalan di `http://localhost:3000` secara default. Port dapat diubah melalui variabel `PORT`.

## Konfigurasi Environment

Buat file `.env` di root proyek:

```env
GEMINI_API_KEY=masukkan_api_key_anda
PORT=3000
# Opsional: model pilihan untuk endpoint destinasi
GEMINI_MODEL=gemini-2.5-flash
```

`GEMINI_MODEL` bersifat opsional dan digunakan oleh endpoint destinasi. Endpoint itinerary dan packing menentukan modelnya di kode.

## Dokumentasi API

Base URL lokal:

```text
http://localhost:3000
```

Semua endpoint di bawah menggunakan metode **POST** dan menerima JSON, kecuali jika disebutkan lain.

### 1. Rekomendasi Destinasi

`POST /api/destination`

**Request body**

| Field | Tipe | Keterangan |
|---|---|---|
| `message` | string | Pesan atau permintaan pengguna |
| `budget` | string | Anggaran perjalanan (opsional) |
| `asal` | string | Kota asal (opsional) |
| `gaya` | string | Gaya liburan (opsional) |
| `durasi` | string | Durasi perjalanan (opsional) |

Contoh:

```json
{
  "message": "Aku mau liburan ke Yogyakarta, rekomendasi tempat yang bagus dong",
  "budget": "Rp2.000.000",
  "asal": "Jakarta",
  "gaya": "kuliner dan budaya",
  "durasi": "3 hari"
}
```

**Contoh respons**

```json
{
  "jawaban": "Berikut beberapa ide untuk perjalananmu...",
  "rekomendasi": [
    {
      "nama_destinasi": "Contoh tempat",
      "alasan_kesesuaian": "Alasan rekomendasi",
      "estimasi_biaya": "Estimasi biaya"
    }
  ]
}
```

Field pada request dapat dikirim secara opsional. Jika seluruh input kosong, API memberikan sapaan awal. Bentuk konten rekomendasi bergantung pada hasil model AI.

### 2. Itinerary

`POST /api/itinerary`

**Request body**

| Field | Tipe | Keterangan |
|---|---|---|
| `destinasi` | string | Tujuan perjalanan |
| `durasi` | number/string | Lama perjalanan dalam hari |

Contoh:

```json
{
  "destinasi": "Bandung",
  "durasi": 2
}
```

**Contoh respons**

```json
[
  {
    "hari_ke": 1,
    "aktivitas": [
      {
        "waktu": "Pagi",
        "lokasi": "Contoh lokasi",
        "estimasi_waktu_tempuh": "Sekitar 20 menit"
      }
    ]
  }
]
```

### 3. Packing List

`POST /api/packing`

**Request body**

| Field | Tipe | Keterangan |
|---|---|---|
| `destinasi` | string | Tujuan perjalanan |
| `tanggal` | string | Tanggal perjalanan |

Contoh:

```json
{
  "destinasi": "Bali",
  "tanggal": "2026-12-20"
}
```

**Contoh respons**

```json
{
  "prakiraan_cuaca": "Ringkasan kondisi cuaca",
  "checklist_barang": [
    "Pakaian nyaman",
    "Payung"
  ],
  "peringatan": "Informasi atau peringatan"
}
```

### 4. Split Bill

`POST /api/splitbill`

**Request body**

| Field | Tipe | Keterangan |
|---|---|---|
| `chat` | string | Teks transaksi atau percakapan terkait tagihan |

Contoh:

```json
{
  "chat": "Rani bayar total Rp150.000. Dika berutang Rp50.000 dan Sita Rp40.000."
}
```

**Contoh respons**

```json
{
  "total_transaksi": 150000,
  "pembayar_utama": "Rani",
  "rincian_utang": [
    {
      "peminjam": "Dika",
      "nominal_utang": 50000
    },
    {
      "peminjam": "Sita",
      "nominal_utang": 40000
    }
  ]
}
```

> Contoh respons di atas adalah ilustrasi format. Keluaran aktual mengikuti implementasi dan hasil pemrosesan AI.

## Struktur Proyek

```text
.
├── index.js
├── package.json
├── package-lock.json
├── public/
└── src/
    ├── controllers/
    │   ├── destinationController.js
    │   ├── itineraryController.js
    │   ├── packingController.js
    │   └── splitbillController.js
    └── routes/
        ├── destination.js
        ├── itinerary.js
        ├── packing.js
        └── splitbill.js
```

## Pengujian

Pastikan server berjalan, lalu uji endpoint destinasi:

```bash
curl -X POST http://localhost:3000/api/destination \
  -H "Content-Type: application/json" \
  -d '{"message":"Rekomendasi wisata di Makassar"}'
```

Uji endpoint itinerary:

```bash
curl -X POST http://localhost:3000/api/itinerary \
  -H "Content-Type: application/json" \
  -d '{"destinasi":"Bandung","durasi":2}'
```

## Keamanan

Sebelum mengunggah proyek ke GitHub:

- **Jangan commit `.env`**, API key, token, atau kredensial.
- Pastikan `.gitignore` memuat setidaknya:
  ```gitignore
  node_modules/
  .env
  .DS_Store
  ```
- Jika API key pernah masuk ke repository atau arsip publik, segera cabut/rotasi key melalui penyedia API.
- Terapkan validasi input, rate limiting, dan penanganan error yang aman sebelum digunakan di lingkungan produksi.

## Catatan

- Folder `public/` disajikan sebagai file statis oleh Express.
- Endpoint AI dapat gagal karena masalah API key, kuota, jaringan, atau ketersediaan model.
- Keluaran terkait destinasi, estimasi biaya, itinerary, dan cuaca merupakan hasil AI. Verifikasi informasi penting melalui sumber tepercaya sebelum digunakan.
- README ini mendokumentasikan API berdasarkan implementasi proyek; sesuaikan contoh bila kontrak endpoint berubah.

