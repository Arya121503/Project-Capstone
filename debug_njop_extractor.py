"""
Debug script untuk mengecek ekstraksi data NJOP
"""

import re
from perwali_njop_enhancement import NJOPDataExtractor

# Test ekstraksi untuk ASEM ROWO
extractor = NJOPDataExtractor()

# Debug ekstraksi
with open("PERWALI_NO_2_TH_2017_EXTRACTED_TEXT.txt", 'r', encoding='utf-8') as file:
    content = file.read()

# Pattern untuk menangkap kecamatan
kecamatan_pattern = r'KECAMATAN\s*:\s*\d+\s*-\s*([A-Z\s]+)'

# Cari semua kecamatan
kecamatan_matches = re.findall(kecamatan_pattern, content)
print("Kecamatan yang ditemukan:")
for k in set(kecamatan_matches):
    print(f"- '{k}'")

print("\nMencari ASEM ROWO specifically:")
asem_rowo_matches = [k for k in kecamatan_matches if 'ASEM' in k]
print(f"ASEM ROWO matches: {asem_rowo_matches}")

# Test mapping
mapping = {
    'ASEM ROWO': 'Asemrowo',
    'PABEAN CANTIAN': 'Pabean Cantikan',
}

print("\nSetelah mapping:")
for match in asem_rowo_matches:
    mapped = mapping.get(match, match)
    print(f"'{match}' -> '{mapped}'")

# Extract data dan check
print("\n=== Extracting data ===")
extractor.extract_njop_data()

print(f"Kecamatan dalam data hasil ekstraksi: {list(extractor.njop_data.keys())}")

if 'Asemrowo' in extractor.njop_data:
    print(f"Data Asemrowo: {extractor.njop_data['Asemrowo']}")
else:
    print("Asemrowo tidak ditemukan dalam hasil ekstraksi")
