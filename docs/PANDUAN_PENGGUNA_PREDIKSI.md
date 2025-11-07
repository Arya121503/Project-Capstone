# 📘 Panduan Pengguna - Fitur Prediksi Harga

## 📋 Daftar Isi
1. [Pendahuluan](#pendahuluan)
2. [Fitur Prediksi Harga Sewa](#fitur-prediksi-harga-sewa)
3. [Fitur Prediksi Harga Jual](#fitur-prediksi-harga-jual)
4. [Upload & Training Dataset](#upload--training-dataset)
5. [Memahami Confidence Score](#memahami-confidence-score)
6. [Dashboard Analytics](#dashboard-analytics)
7. [Troubleshooting](#troubleshooting)

---

## Pendahuluan

Sistem prediksi harga menggunakan **Machine Learning Ensemble** dengan 4 model canggih:
- 🌲 **Random Forest**
- 🚀 **XGBoost**
- 🐱 **CatBoost**
- 🗳️ **Voting Regressor** (kombinasi semua model)

### Keunggulan Sistem
✅ **Akurasi Tinggi**: Menggunakan ensemble 4 model untuk hasil lebih akurat  
✅ **Confidence Score**: Menampilkan tingkat kepercayaan prediksi (0-100%)  
✅ **Auto-Training**: Upload dataset baru untuk training otomatis  
✅ **Validasi Input**: Sistem mencegah input yang tidak valid  
✅ **Analytics**: Dashboard untuk monitoring performa prediksi  

---

## Fitur Prediksi Harga Sewa

### 🏞️ Prediksi Harga Sewa Tanah

#### Input yang Diperlukan:

| Field | Deskripsi | Range Valid | Contoh |
|-------|-----------|-------------|--------|
| **Kecamatan** | Lokasi kecamatan di Surabaya | 31 kecamatan | Gubeng, Mulyorejo, dll |
| **NJOP** | Nilai Jual Objek Pajak per m² | Rp 100,000 - Rp 50,000,000 | Rp 3,724,000 |
| **Sertifikat** | Jenis sertifikat tanah | SHM, HGB, HP, Girik | SHM |
| **Luas Tanah** | Luas tanah dalam m² | 50 - 100,000 m² | 500 m² |
| **Jenis Zona** | Tipe zona lokasi | Residensial, Komersial, Industri | Komersial |
| **Aksesibilitas** | Akses ke jalan utama | Baik, Sedang, Buruk | Baik |
| **Tingkat Keamanan** | Tingkat keamanan area | tinggi, sedang, rendah | tinggi |
| **Kepadatan Penduduk** | Jumlah penduduk di kecamatan | Otomatis terisi | 123,961 |

#### Cara Menggunakan:

1. **Buka Halaman Prediksi Sewa**
   - Navigasi: Dashboard → Prediksi Harga Sewa → Tanah

2. **Isi Form Input**
   ```
   Kecamatan: Gubeng
   NJOP: Rp 3,724,000
   Sertifikat: SHM
   Luas Tanah: 500 m²
   Jenis Zona: Komersial
   Aksesibilitas: Baik
   Tingkat Keamanan: tinggi
   ```
   ⚠️ **Catatan**: Kepadatan penduduk akan terisi otomatis setelah memilih kecamatan

3. **Klik "Prediksi Harga Sewa"**

4. **Hasil Prediksi** akan menampilkan:
   ```
   🎯 Prediksi Harga Sewa: Rp 50,000,000
   📊 Confidence Score: 94.5% (Very High)
   📈 Model: Random Forest + XGBoost + CatBoost + Voting
   ```

### 🏢 Prediksi Harga Sewa Bangunan

#### Input yang Diperlukan:

| Field | Deskripsi | Range Valid | Contoh |
|-------|-----------|-------------|--------|
| **Kecamatan** | Lokasi kecamatan | 31 kecamatan | Gubeng |
| **NJOP** | Nilai Jual Objek Pajak per m² | Rp 100,000 - Rp 50,000,000 | Rp 3,724,000 |
| **Sertifikat** | Jenis sertifikat | SHM, HGB, HP, Girik | SHM |
| **Luas Tanah** | Luas tanah dalam m² | 50 - 100,000 m² | 300 m² |
| **Luas Bangunan** | Luas bangunan dalam m² | 20 - 500,000 m² | 250 m² |
| **Jumlah Lantai** | Jumlah lantai bangunan | 1 - 50 lantai | 2 lantai |
| **Jenis Zona** | Tipe zona lokasi | Residensial, Komersial, Industri | Komersial |
| **Aksesibilitas** | Akses ke jalan utama | Baik, Sedang, Buruk | Baik |

#### Validasi Khusus:
⚠️ **Luas Bangunan maksimal 5x Luas Tanah**
```
Contoh VALID:
- Luas Tanah: 300 m²
- Luas Bangunan: 250 m² ✅ (< 1500 m²)

Contoh INVALID:
- Luas Tanah: 100 m²
- Luas Bangunan: 600 m² ❌ (> 500 m²)
```

---

## Fitur Prediksi Harga Jual

### 🏞️ Prediksi Harga Jual Tanah

#### Input yang Diperlukan:

| Field | Deskripsi | Range Valid | Contoh |
|-------|-----------|-------------|--------|
| **Kecamatan** | Lokasi kecamatan | 31 kecamatan | Gubeng |
| **NJOP** | Nilai Jual Objek Pajak per m² | Rp 100,000 - Rp 50,000,000 | Rp 3,724,000 |
| **Sertifikat** | Jenis sertifikat | SHM, HGB, HP, Girik | SHM |
| **Luas Tanah** | Luas tanah dalam m² | 50 - 100,000 m² | 500 m² |

#### Cara Menggunakan:

1. **Buka Halaman Prediksi Jual**
   - Navigasi: Dashboard → Prediksi Harga Jual → Tanah

2. **Isi Form Input**
   ```
   Kecamatan: Gubeng
   NJOP: Rp 3,724,000
   Sertifikat: SHM
   Luas Tanah: 500 m²
   ```

3. **Klik "Prediksi Harga Jual"**

4. **Hasil Prediksi**:
   ```
   💰 Prediksi Harga Jual: Rp 2,500,000,000
   📊 Confidence Score: 91.2% (Very High)
   
   Detail Model:
   - Random Forest: Rp 2,480,000,000
   - XGBoost: Rp 2,510,000,000
   - CatBoost: Rp 2,490,000,000
   - Final (Voting): Rp 2,500,000,000
   ```

### 🏢 Prediksi Harga Jual Bangunan

Input sama dengan prediksi sewa bangunan, ditambah:
- Semua validasi yang sama berlaku
- Menggunakan ensemble model untuk akurasi maksimal

---

## Upload & Training Dataset

### 📤 Upload Dataset Baru (Admin Only)

#### Untuk Prediksi Sewa:

1. **Akses Dashboard Admin**
   - URL: `/dashboard_admin`
   - Scroll ke bagian "Upload & Train Dataset Sewa"

2. **Pilih Tipe Model**
   - Tanah: Untuk training model prediksi sewa tanah
   - Bangunan: Untuk training model prediksi sewa bangunan

3. **Upload File CSV**
   - Format: `.csv` dengan encoding UTF-8
   - Ukuran maksimal: 50 MB

4. **Format Dataset Tanah**:
   ```csv
   kecamatan,njop,sertifikat,luas_tanah,jenis_zona,aksesibilitas,tingkat_keamanan,kepadatan_penduduk,harga_sewa
   Gubeng,3724000,SHM,500,Komersial,Baik,tinggi,123961,50000000
   Mulyorejo,3500000,HGB,400,Residensial,Sedang,sedang,95000,35000000
   ```

5. **Format Dataset Bangunan**:
   ```csv
   kecamatan,njop,sertifikat,luas_tanah,luas_bangunan,jumlah_lantai,jenis_zona,aksesibilitas,harga_sewa
   Gubeng,3724000,SHM,300,250,2,Komersial,Baik,75000000
   ```

6. **Klik "Upload & Train Model"**

7. **Proses Training**:
   ```
   ⏳ Training in progress...
   📊 Training 4 models: Random Forest, XGBoost, CatBoost, Voting
   ✅ Training completed!
   
   Performance:
   - Random Forest R²: 0.89
   - XGBoost R²: 0.91
   - CatBoost R²: 0.90
   - Voting R²: 0.93
   ```

#### Untuk Prediksi Jual:

1. **Akses Dashboard Admin**
   - Scroll ke bagian "Upload & Train Dataset Jual"

2. **Format Dataset Jual Tanah**:
   ```csv
   kecamatan,njop,sertifikat,luas_tanah,harga_jual
   Gubeng,3724000,SHM,500,2500000000
   Mulyorejo,3500000,HGB,400,1800000000
   ```

3. **Format Dataset Jual Bangunan**:
   ```csv
   kecamatan,njop,sertifikat,luas_tanah,luas_bangunan,jumlah_lantai,harga_jual
   Gubeng,3724000,SHM,300,250,2,3500000000
   ```

### ⚙️ Auto-Reload Model

Setelah training selesai, sistem **otomatis reload model baru** tanpa perlu restart server!

```
✅ Model trained successfully!
🔄 Auto-reloading new model...
✅ New model active and ready for predictions!
```

---

## Memahami Confidence Score

### 🎯 Apa itu Confidence Score?

**Confidence Score** adalah ukuran seberapa yakin sistem terhadap hasil prediksi, dihitung dari **kesepakatan antar model** (CV = Coefficient of Variation).

### 📊 Tingkat Confidence

| Score | Level | Arti | Rekomendasi |
|-------|-------|------|-------------|
| **95-100%** | 🟢 Very High | Model sangat sepakat, prediksi sangat akurat | Gunakan langsung untuk keputusan |
| **85-94%** | 🔵 High | Model cukup sepakat, prediksi dapat dipercaya | Gunakan dengan sedikit verifikasi |
| **70-84%** | 🟡 Moderate | Model agak berbeda pendapat | Lakukan cross-check dengan data lain |
| **<70%** | 🔴 Low | Model banyak perbedaan pendapat | Hati-hati, mungkin data input tidak biasa |

### 💡 Contoh Perhitungan

**Contoh 1: High Agreement (Very High Confidence)**
```
Prediksi 4 Model:
- Random Forest: Rp 50,000,000
- XGBoost: Rp 51,000,000
- CatBoost: Rp 49,500,000
- Voting: Rp 50,000,000

CV = 1.5% (model sangat sepakat)
→ Confidence Score: 98% (Very High)
```

**Contoh 2: Low Agreement (Low Confidence)**
```
Prediksi 4 Model:
- Random Forest: Rp 50,000,000
- XGBoost: Rp 75,000,000
- CatBoost: Rp 45,000,000
- Voting: Rp 55,000,000

CV = 22% (model banyak perbedaan)
→ Confidence Score: 62% (Low)
```

### ⚠️ Kapan Confidence Rendah?

1. **Input Tidak Biasa**
   - NJOP sangat tinggi/rendah untuk area tersebut
   - Kombinasi fitur yang jarang ada di dataset

2. **Data Training Kurang**
   - Area/kecamatan belum banyak data
   - Tipe properti yang jarang

3. **Solusi**:
   - Upload dataset lebih banyak
   - Verifikasi input sudah benar
   - Konsultasi dengan expert untuk prediksi confidence rendah

---

## Dashboard Analytics

### 📈 Monitoring Performa Prediksi

Dashboard analytics menampilkan statistik 7 hari terakhir:

#### Metrics yang Ditampilkan:

1. **Total Prediksi**
   ```
   📊 Total Predictions (7 days): 1,247
   ```

2. **Success Rate**
   ```
   ✅ Success Rate: 98.5%
   ❌ Failed: 1.5%
   ```

3. **Average Confidence**
   ```
   📈 Average Confidence: 91.2%
   ```

4. **Predictions by Type**
   ```
   🏞️ Tanah: 687 (55%)
   🏢 Bangunan: 560 (45%)
   ```

5. **Model Performance**
   ```
   Random Forest R²: 0.89
   XGBoost R²: 0.91
   CatBoost R²: 0.90
   Voting R²: 0.93 ⭐ (Best)
   ```

#### Cara Mengakses:

1. **Dashboard Admin**
   - URL: `/dashboard_admin`
   - Scroll ke bagian "Prediction Analytics"

2. **Refresh Data**
   - Klik "Refresh Analytics" untuk update real-time

---

## Troubleshooting

### ❌ Error: "Input tidak valid"

**Penyebab**: Input tidak sesuai range atau format

**Solusi**:
1. Cek range valid untuk setiap field
2. Pastikan NJOP antara Rp 100,000 - Rp 50,000,000
3. Luas tanah minimal 50 m²
4. Luas bangunan < 5x luas tanah

### ❌ Error: "Model belum tersedia"

**Penyebab**: Model belum di-training atau file model corrupt

**Solusi**:
1. Upload dataset baru via Dashboard Admin
2. Training model dari awal
3. Hubungi admin jika masalah berlanjut

### ❌ Confidence Score Sangat Rendah (<50%)

**Penyebab**: Input sangat tidak biasa atau model belum cukup data

**Solusi**:
1. Verifikasi input sudah benar
2. Coba input yang lebih "normal"
3. Jika yakin input benar, upload dataset lebih banyak

### ❌ Prediksi Terlihat Tidak Masuk Akal

**Contoh**: Tanah 100 m² diprediksi Rp 10 Miliar

**Solusi**:
1. Cek confidence score - jika rendah, jangan percaya penuh
2. Cross-check dengan NJOP dan harga pasar
3. Re-training model dengan dataset lebih lengkap

### ❌ Upload Dataset Gagal

**Penyebab**: Format CSV salah atau ukuran terlalu besar

**Solusi**:
1. Pastikan format CSV sesuai template
2. Encoding: UTF-8
3. Ukuran maksimal: 50 MB
4. Kolom harus sesuai dengan yang diperlukan

### 🆘 Butuh Bantuan?

**Contact Admin**:
- Email: admin@assetprediction.com
- Dashboard Admin: `/dashboard_admin`
- Log System: `model/logs/predictions_YYYYMMDD.jsonl`

---

## 📝 Best Practices

### ✅ Do's

1. **Selalu cek confidence score** sebelum gunakan prediksi untuk keputusan penting
2. **Upload dataset berkala** untuk menjaga akurasi model
3. **Verifikasi input** sebelum submit prediksi
4. **Monitor analytics** untuk cek performa sistem

### ❌ Don'ts

1. **Jangan percaya 100%** pada prediksi dengan confidence < 70%
2. **Jangan upload dataset** yang tidak valid atau corrupt
3. **Jangan input nilai ekstrem** yang tidak realistis
4. **Jangan abaikan error messages** - baca dan pahami

---

## 🎓 Tips Penggunaan

### Untuk Hasil Terbaik:

1. **Gunakan Data Terkini**
   - NJOP update sesuai Perwali terbaru
   - Sertifikat yang valid dan legal

2. **Kombinasi Model**
   - Sistem otomatis gunakan 4 model
   - Hasil final = voting dari semua model

3. **Interpretasi Confidence**
   - High confidence (>90%) → Gunakan langsung
   - Moderate (70-90%) → Verifikasi dengan data lain
   - Low (<70%) → Hati-hati, cek ulang input

4. **Regular Updates**
   - Upload dataset baru setiap 1-3 bulan
   - Monitor performa di analytics dashboard

---

**Last Updated**: 2025-11-07  
**Version**: 4.0 (FASE 4 - Testing & Documentation)  
**Author**: Asset Prediction System Team
