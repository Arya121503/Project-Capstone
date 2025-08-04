#!/usr/bin/env python3
"""
Test comprehensive prediction calculations untuk validasi
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from prediction_system import PredictionSystem

def test_various_inputs():
    """Test berbagai input untuk memastikan konsistensi"""
    print("=== Comprehensive Prediction Testing ===\n")
    
    ps = PredictionSystem()
    
    # Test case 1: Input yang sama dengan placeholder di form HTML
    print("1. Testing dengan form placeholder values:")
    print("   Tanah prediction:")
    tanah_form_data = {
        'kecamatan': 'Gubeng',
        'njop': 3724000,
        'sertifikat': 'SHM',
        'luas_tanah': 1500,
        'jenis_zona': 'Perumahan',
        'aksesibilitas': 'Baik',
        'tingkat_keamanan': 'tinggi',
        'kepadatan_penduduk': 75315
    }
    
    result = ps.predict_land_price(tanah_form_data)
    if result['success']:
        print(f"     ✅ Hasil: {result['prediction']}")
        print(f"     📊 Input processed: {result['input_data']}")
    else:
        print(f"     ❌ Error: {result['error']}")
    
    print("\n   Bangunan prediction:")
    bangunan_form_data = {
        'kecamatan': 'Gubeng',
        'njop': 4704000,
        'sertifikat': 'SHM',
        'luas_tanah': 2000,
        'luas_bangunan': 150,
        'jumlah_lantai': 2,
        'jenis_zona': 'Perumahan',
        'aksesibilitas': 'Baik'
    }
    
    result = ps.predict_building_price(bangunan_form_data)
    if result['success']:
        print(f"     ✅ Hasil: {result['prediction']}")
        print(f"     📊 Input processed: {result['input_data']}")
    else:
        print(f"     ❌ Error: {result['error']}")
    
    # Test case 2: Variasi kecamatan
    print("\n2. Testing variasi kecamatan:")
    kecamatans = ['Gubeng', 'Sukolilo', 'Wonocolo', 'Rungkut']
    
    for kec in kecamatans:
        test_data = tanah_form_data.copy()
        test_data['kecamatan'] = kec
        result = ps.predict_land_price(test_data)
        if result['success']:
            print(f"   {kec}: {result['prediction']}")
    
    # Test case 3: Variasi NJOP
    print("\n3. Testing variasi NJOP (tanah):")
    njop_values = [2000000, 3724000, 5000000, 8000000]
    
    for njop in njop_values:
        test_data = tanah_form_data.copy()
        test_data['njop'] = njop
        result = ps.predict_land_price(test_data)
        if result['success']:
            print(f"   NJOP {njop:,}: {result['prediction']}")
    
    # Test case 4: Variasi aksesibilitas
    print("\n4. Testing variasi aksesibilitas:")
    for aksesibilitas in ['Baik', 'Buruk']:
        test_data = tanah_form_data.copy()
        test_data['aksesibilitas'] = aksesibilitas
        result = ps.predict_land_price(test_data)
        if result['success']:
            print(f"   Aksesibilitas {aksesibilitas}: {result['prediction']}")
    
    # Test case 5: Edge cases
    print("\n5. Testing edge cases:")
    
    # Minimal values
    minimal_data = {
        'kecamatan': 'Gubeng',
        'njop': 1000000,  # Minimal NJOP
        'sertifikat': 'Lainnya',
        'luas_tanah': 100,  # Minimal luas
        'jenis_zona': 'Industri',
        'aksesibilitas': 'Buruk',
        'tingkat_keamanan': 'rendah',
        'kepadatan_penduduk': 1000
    }
    
    result = ps.predict_land_price(minimal_data)
    if result['success']:
        print(f"   Minimal values: {result['prediction']}")
    
    # Maximal values
    maximal_data = {
        'kecamatan': 'Gubeng',
        'njop': 15000000,  # High NJOP
        'sertifikat': 'SHM',
        'luas_tanah': 5000,  # Large area
        'jenis_zona': 'Komersial',
        'aksesibilitas': 'Baik',
        'tingkat_keamanan': 'tinggi',
        'kepadatan_penduduk': 100000
    }
    
    result = ps.predict_land_price(maximal_data)
    if result['success']:
        print(f"   Maximal values: {result['prediction']}")
    
    print("\n=== Testing Complete ===")

def test_consistency():
    """Test konsistensi prediksi dengan multiple runs"""
    print("\n=== Consistency Testing ===")
    
    ps = PredictionSystem()
    
    test_data = {
        'kecamatan': 'Gubeng',
        'njop': 3724000,
        'sertifikat': 'SHM',
        'luas_tanah': 1500,
        'jenis_zona': 'Perumahan',
        'aksesibilitas': 'Baik',
        'tingkat_keamanan': 'tinggi',
        'kepadatan_penduduk': 75315
    }
    
    print("Running same input 5 times to check consistency:")
    results = []
    
    for i in range(5):
        result = ps.predict_land_price(test_data)
        if result['success']:
            results.append(result['prediction_value'])
            print(f"Run {i+1}: {result['prediction']}")
    
    # Check if all results are identical
    if len(set(results)) == 1:
        print("✅ Results are perfectly consistent!")
    else:
        print("❌ Results vary between runs:")
        for i, val in enumerate(results):
            print(f"   Run {i+1}: {val}")

if __name__ == "__main__":
    test_various_inputs()
    test_consistency()
