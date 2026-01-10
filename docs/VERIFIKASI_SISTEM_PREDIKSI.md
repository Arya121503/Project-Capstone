# Verifikasi Sistem Prediksi (Model Sewa & Jual)

Tanggal: 2026-01-06  
Lingkungan: Windows, Python 3.13.5  
Workspace: Project-Capstone

Dokumen ini merangkum hasil verifikasi eksekusi sistem prediksi yang diperkuat dengan:
- Cuplikan log eksekusi (hasil run command).
- Potongan kode yang menunjukkan pemanggilan model prediksi.

> Catatan: Verifikasi ini berfokus pada **ketersediaan model, proses load, dan jalur pemanggilan `predict()`**. Untuk verifikasi end-to-end via HTTP endpoint, tersedia integration test, namun membutuhkan server berjalan.

---

## 1) Ringkasan Hasil

- Model sewa **tanah** dan **bangunan** berhasil dimuat (`joblib.load`) saat import `prediction_system`.
- Status model menunjukkan kedua model **available: True** dan metadata performa (R², MAPE, MAE) tampil.
- Terdapat peringatan kompatibilitas versi scikit-learn saat unpickle (model dibuat dengan 1.7.0, runtime 1.7.1). Ini **bukan error**, namun perlu dicatat sebagai risiko kompatibilitas.
- Unit test `tests/test_prediction_validation.py` **belum dapat dijalankan** karena modul `pytest` belum terpasang pada environment saat verifikasi.

---

## 2) Bukti Log Eksekusi

### 2.1. Verifikasi load model + status model

Command yang dieksekusi:

```powershell
python --version
python -c "from prediction_system import prediction_system; print('MODEL_STATUS=', prediction_system.get_model_status())"
```

Cuplikan output terminal (apa adanya):

```text
Python 3.13.5
C:\Users\bobok\AppData\Local\Programs\Python\Python313\Lib\site-packages\sklearn\base.py:442: InconsistentVersionWarning: Trying to unpickle estimator StandardScaler from version 1.7.0 when using version 1.7.1. This might lead to breaking code or invalid results. Use at your own risk. For more info please refer to:https://scikit-learn.org/stable/model_persistence.html#security-maintainability-limitations
C:\Users\bobok\AppData\Local\Programs\Python\Python313\Lib\site-packages\sklearn\base.py:442: InconsistentVersionWarning: Trying to unpickle estimator LabelEncoder from version 1.7.0 when using version 1.7.1. This might lead to breaking code or invalid results. Use at your own risk. For more info please refer to:  https://scikit-learn.org/stable/model_persistence.html#security-maintainability-limitations
✅ Model tanah berhasil dimuat
   - Performance: R² = 0.9750
   - Features: 10
✅ Model bangunan berhasil dimuat
   - Performance: R² = 0.9254
   - Features: 25
MODEL_STATUS= {
  'tanah': {
    'available': True,
    'model_name': 'CatBoost',
    'timestamp': '20250803_235254',
    'performance': {'r2_score': 0.9750128986214744, 'mape': 0.32495547746776837, 'mae': 3576695.11206545},
    'data_info': {'target_column': 'Sewa Per Bulan (Rp)', 'features_count': 10, 'samples_trained': 793, 'samples_tested': 199}
  },
  'bangunan': {
    'available': True,
    'model_name': 'CatBoost',
    'timestamp': '20250803_235254',
    'performance': {'r2_score': 0.9253865278251928, 'mape': 0.2079719876006733, 'mae': 12247350.029199429},
    'data_info': {'target_column': 'Sewa per Bulan (Rp)', 'features_count': 25, 'samples_trained': 800, 'samples_tested': 200}
  }
}
```

Interpretasi singkat:
- Ada output `✅ Model ... berhasil dimuat` untuk kedua model ⇒ jalur `PredictionSystem.load_models()` dieksekusi dan file model ditemukan.
- `MODEL_STATUS` mengembalikan struktur status yang lengkap ⇒ method `get_model_status()` dapat diakses dan metadata terbaca.

### 2.2. Verifikasi unit test (gagal karena dependency)

Command yang dieksekusi:

```powershell
python -m pytest -q tests/test_prediction_validation.py
```

Output terminal:

```text
python.exe: No module named pytest
```

Implikasi:
- File test sudah tersedia, tapi environment belum memiliki `pytest`.
- Jika ingin menjalankan test, perlu install: `pip install pytest` (atau menambahkan `pytest` ke `requirements.txt` / `requirements-dev.txt`).

---

## 3) Bukti Potongan Kode Pemanggilan Model

Bagian ini menunjukkan secara eksplisit di mana `predict()` model dipanggil dan dari mana endpoint memanggil sistem prediksi.

### 3.1. Load model via joblib

Lokasi: `prediction_system.py` (method `load_models()`)

```python
self.models[model_type] = {
    'model': joblib.load(file_paths['model']),
    'scaler': joblib.load(file_paths['scaler']),
    'features': joblib.load(file_paths['features']),
    'encoders': joblib.load(file_paths['encoders'])
}
```

Ini membuktikan komponen model dan preprocessing (scaler/features/encoders) dibaca dari file `.pkl` yang tersimpan.

### 3.2. Pemanggilan `predict()` untuk sewa tanah

Lokasi: `prediction_system.py` (method `predict_land_price()`)

```python
X_prepared = self.prepare_input_data(processed_data, 'tanah')
prediction = self.models['tanah']['model'].predict(X_prepared)[0]
```

### 3.3. Pemanggilan `predict()` untuk sewa bangunan

Lokasi: `prediction_system.py` (method `predict_building_price()`)

```python
X_prepared = self.prepare_input_data(processed_data, 'bangunan')
prediction = self.models['bangunan']['model'].predict(X_prepared)[0]
```

### 3.4. Endpoint Flask yang memanggil `PredictionSystem`

Lokasi: `app/routes_prediction.py`

Contoh untuk tanah:

```python
input_data = {
    'kecamatan': kecamatan,
    'njop': njop,
    'sertifikat': sertifikat,
    'luas_tanah': luas_tanah,
    'jenis_zona': jenis_zona,
    'aksesibilitas': aksesibilitas,
    'tingkat_keamanan': tingkat_keamanan,
    'kepadatan_penduduk': kepadatan_penduduk
}

result = prediction_system.predict_land_price(input_data)
```

Contoh untuk bangunan:

```python
input_data = {
    'kecamatan': kecamatan,
    'njop': njop,
    'sertifikat': sertifikat,
    'luas_tanah': luas_tanah,
    'luas_bangunan': luas_bangunan,
    'jumlah_lantai': jumlah_lantai,
    'jenis_zona': jenis_zona,
    'aksesibilitas': aksesibilitas
}

result = prediction_system.predict_building_price(input_data)
```

### 3.5. Endpoint jual (ensemble voting) yang memanggil `predict()`

Lokasi: `app/routes_jual_prediction.py`

```python
model = tanah_models['voting']
prediction = model.predict(input_data)[0]
```

---

## 4) Catatan Risiko & Rekomendasi Singkat

- **InconsistentVersionWarning (scikit-learn 1.7.0 vs 1.7.1)**
  - Risiko: hasil transform/preprocessing bisa berbeda atau error pada kasus tertentu.
  - Rekomendasi: pin versi `scikit-learn` agar sama dengan versi saat training, atau retrain model dengan versi runtime.

- **Unit test belum jalan karena `pytest` tidak terpasang**
  - Rekomendasi: tambahkan dependency dev (mis. `requirements-dev.txt`) atau menambahkan `pytest` untuk kemudahan verifikasi CI.

---

## 5) Cara Mengulang Verifikasi (Repro)

1) Verifikasi load model + status:

```powershell
python -c "from prediction_system import prediction_system; print(prediction_system.get_model_status())"
```

2) (Opsional) Install pytest lalu jalankan unit test:

```powershell
pip install pytest
python -m pytest -q tests/test_prediction_validation.py
```
