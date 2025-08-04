# Catatan Versi (Changelog)

## [1.2.0] - 2025-07-25
### Fitur Baru
- **Sistem Notifikasi Pengguna**
  - Notifikasi real-time di ikon lonceng untuk pemberitahuan status pengajuan sewa (disetujui/ditolak)
  - Penanda unread/read untuk notifikasi
  - Tombol "Tandai Semua Dibaca" untuk memudahkan manajemen notifikasi
  - Pengelompokan notifikasi berdasarkan jenis (sewa, transaksi, pembayaran)

- **Riwayat Pengajuan Sewa**
  - Halaman khusus untuk melihat semua pengajuan sewa
  - Filter berdasarkan status (pending, disetujui, ditolak, dll)
  - Detail lengkap setiap pengajuan sewa
  - Kemampuan untuk mengedit pengajuan yang masih pending
  - Kemampuan untuk membatalkan pengajuan yang masih pending

- **Transaksi Sewa**
  - Dashboard ringkasan semua transaksi sewa aktif
  - Detail transaksi sewa termasuk tanggal mulai/berakhir dan status pembayaran
  - Fitur perpanjangan masa kontrak untuk aset yang sedang disewa
  - Notifikasi otomatis ketika kontrak akan berakhir
  - Riwayat perpanjangan untuk setiap transaksi

### Perbaikan
- Peningkatan UI/UX untuk navigasi yang lebih intuitif
- Perbaikan notifikasi admin yang terkadang tidak muncul
- Optimasi performa pada penampilan daftar aset
- Perbaikan bug pada sistem filter pencarian aset

### Perubahan Teknis
- Penambahan model `RentalTransaction` untuk pengelolaan transaksi sewa
- Penambahan model `UserNotification` untuk notifikasi pengguna
- API baru untuk pengelolaan notifikasi dan transaksi
- Pengoptimalan kueri database untuk meningkatkan performa

## [1.1.0] - 2025-05-15
### Fitur Baru
- Sistem notifikasi untuk admin
- Pengelolaan pengajuan sewa (approve/reject)
- Dashboard admin yang lebih informatif
- Sistem pencarian aset berdasarkan lokasi dan jenis

### Perbaikan
- Perbaikan bug pada sistem login
- Peningkatan keamanan dengan validasi input
- Peningkatan responsivitas pada tampilan mobile

## [1.0.0] - 2025-03-01
### Fitur Awal
- Sistem pendaftaran dan login pengguna
- Katalog aset yang tersedia untuk disewa
- Detail aset dengan gambar dan spesifikasi
- Formulir pengajuan sewa
- Dasbor admin dasar
- Manajemen aset (tambah, edit, hapus)
