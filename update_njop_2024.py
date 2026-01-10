import pandas as pd
import os

# Path to the files
jual_bangunan_path = r'c:\Users\bobok\ProjectCaps\Project-Capstone\data\raw\Jual_Bangunan_Prediksi.csv'
jual_tanah_path = r'c:\Users\bobok\ProjectCaps\Project-Capstone\data\raw\Jual_Tanah_Prediksi.csv'

# Faktor peningkatan dari 2017 ke 2024 (7 tahun)
# Menggunakan rata-rata inflasi properti Indonesia ~6% per tahun
inflation_rate = 0.06
years = 7
adjustment_factor = (1 + inflation_rate) ** years

print(f"Faktor Penyesuaian NJOP dari 2017 ke 2024: {adjustment_factor:.4f}")
print(f"Persentase peningkatan: {(adjustment_factor - 1) * 100:.2f}%\n")

# ===== UPDATE JUAL BANGUNAN =====
print("Memproses file Jual_Bangunan_Prediksi.csv...")
df_bangunan = pd.read_csv(jual_bangunan_path)

# Update kolom NJOP
df_bangunan['NJOP (Rp/m²)'] = (df_bangunan['NJOP (Rp/m²)'] * adjustment_factor).round(0).astype(int)

# Update kolom Nilai Jual Bangunan (asumsi nilai jual juga meningkat sebanding)
df_bangunan['Nilai Jual Bangunan (Rp)'] = (df_bangunan['Nilai Jual Bangunan (Rp)'] * adjustment_factor).round(0).astype(int)

# Simpan file
df_bangunan.to_csv(jual_bangunan_path, index=False)
print(f"✓ File Jual_Bangunan_Prediksi.csv berhasil diupdate")
print(f"  Total baris: {len(df_bangunan)}\n")

# ===== UPDATE JUAL TANAH =====
print("Memproses file Jual_Tanah_Prediksi.csv...")
df_tanah = pd.read_csv(jual_tanah_path)

# Update kolom Nilai Jual Tanah
df_tanah['Nilai Jual Tanah (Rp)'] = (df_tanah['Nilai Jual Tanah (Rp)'] * adjustment_factor).round(0).astype(int)

# Simpan file
df_tanah.to_csv(jual_tanah_path, index=False)
print(f"✓ File Jual_Tanah_Prediksi.csv berhasil diupdate")
print(f"  Total baris: {len(df_tanah)}\n")

# ===== VERIFIKASI =====
print("Verifikasi data setelah update:")
print("\n--- Jual Bangunan (5 baris pertama) ---")
df_bangunan_verify = pd.read_csv(jual_bangunan_path)
print(df_bangunan_verify[['Kecamatan', 'NJOP (Rp/m²)', 'Nilai Jual Bangunan (Rp)']].head())

print("\n--- Jual Tanah (5 baris pertama) ---")
df_tanah_verify = pd.read_csv(jual_tanah_path)
print(df_tanah_verify[['Kecamatan', 'Nilai Jual Tanah (Rp)']].head())

print("\n✓ Update selesai!")
print(f"  Faktor peningkatan: {adjustment_factor:.4f}x ({(adjustment_factor - 1) * 100:.2f}%)")
