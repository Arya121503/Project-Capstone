#!/usr/bin/env python3
"""
ML Input Adapter for Property Prediction
Maps web form inputs to ML model expected format
"""

import pandas as pd
import numpy as np
from typing import Dict, Any

class PropertyInputAdapter:
    """Adapter to convert web form inputs to ML model format"""
    
    def __init__(self):
        # Default NJOP values per area (Rp/m²) - estimated values for Surabaya
        self.default_njop = {
            'Surabaya Timur': 2500000,
            'Surabaya Barat': 2800000,
            'Surabaya Utara': 3200000,
            'Surabaya Selatan': 2700000,
            'Surabaya Pusat': 4000000
        }
        
        # Default kecamatan mapping
        self.kecamatan_mapping = {
            'Surabaya Timur': 'Wonocolo',
            'Surabaya Barat': 'Lakarsantri', 
            'Surabaya Utara': 'Pabean Cantikan',
            'Surabaya Selatan': 'Sawahan',
            'Surabaya Pusat': 'Krembangan'
        }
        
        # Default alamat mapping
        self.alamat_mapping = {
            'Surabaya Timur': 'Jl. Wonocolo No. 16, Surabaya',
            'Surabaya Barat': 'Jl. Raya Lakarsantri No. 10, Surabaya',
            'Surabaya Utara': 'Jl. Petemon No. 77, Sawahan, Surabaya',
            'Surabaya Selatan': 'Jl. Krembangan No. 8, Surabaya',
            'Surabaya Pusat': 'Jl. Raya Lontar No. 88, Sambikerep, Surabaya'
        }
    
    def adapt_tanah_input(self, form_data: Dict[str, Any]) -> Dict[str, Any]:
        """Convert tanah form input to model format"""
        
        lokasi = form_data.get('lokasi', 'Surabaya Timur')
        luas_tanah = float(form_data.get('luas_tanah', 200))
        sertifikat = form_data.get('sertifikat', 'SHM')
        akses_jalan = form_data.get('akses_jalan', 'Mudah')
        
        # Calculate derived values
        njop_per_m2 = self.default_njop.get(lokasi, 2500000)
        njop_total = njop_per_m2 * luas_tanah
        
        # Map to model format
        model_input = {
            # Main features
            'Njop (Rp/M²)': njop_per_m2,
            'Luas Tanah (M²)': luas_tanah,
            'NJOP_Total': njop_total,
            
            # Location features (one-hot encoded)
            'Alamat_Jl. Krembangan No. 8, Surabaya': 1 if lokasi == 'Surabaya Pusat' else 0,
            'Alamat_Jl. Petemon No. 77, Sawahan, Surabaya': 1 if lokasi == 'Surabaya Utara' else 0,
            'Alamat_Jl. Raya Lakarsantri No. 10, Surabaya': 1 if lokasi == 'Surabaya Barat' else 0,
            'Alamat_Jl. Raya Lontar No. 88, Sambikerep, Surabaya': 1 if lokasi == 'Surabaya Pusat' else 0,
            'Alamat_Jl. Wonocolo No. 16, Surabaya': 1 if lokasi == 'Surabaya Timur' else 0,
            
            # Kecamatan features (one-hot encoded)
            'Kecamatan_Krembangan': 1 if lokasi == 'Surabaya Pusat' else 0,
            'Kecamatan_Lakarsantri': 1 if lokasi == 'Surabaya Barat' else 0,
            'Kecamatan_Pabean Cantikan': 1 if lokasi == 'Surabaya Utara' else 0,
            'Kecamatan_Sambikerep': 1 if lokasi == 'Surabaya Barat' else 0,
            'Kecamatan_Sawahan': 1 if lokasi == 'Surabaya Selatan' else 0,
            'Kecamatan_Wonocolo': 1 if lokasi == 'Surabaya Timur' else 0,
            
            # Density feature
            'Density_Category_Very_High': 1 if lokasi in ['Surabaya Pusat', 'Surabaya Utara'] else 0,
            
            # Additional features for compatibility
            'Jenis_zona': 'Residential',
            'Aksesibilitas': akses_jalan,
            'Tingkat_Keamanan': 'Baik',
            'Kecamatan': self.kecamatan_mapping.get(lokasi, 'Wonocolo'),
            'Alamat': self.alamat_mapping.get(lokasi, 'Jl. Wonocolo No. 16, Surabaya')
        }
        
        return model_input
    
    def adapt_bangunan_input(self, form_data: Dict[str, Any]) -> Dict[str, Any]:
        """Convert bangunan form input to model format"""
        
        lokasi = form_data.get('lokasi', 'Surabaya Timur')
        luas_bangunan = float(form_data.get('luas_bangunan', 150))
        jumlah_kamar = int(form_data.get('jumlah_kamar', 3))
        jumlah_kamar_mandi = int(form_data.get('jumlah_kamar_mandi', 2))
        kondisi = form_data.get('kondisi', 'Baik')
        sertifikat = form_data.get('sertifikat', 'SHM')
        akses_jalan = form_data.get('akses_jalan', 'Mudah')
        
        # Calculate derived values
        luas_tanah = luas_bangunan * 1.5  # Estimate land area
        njop_per_m2 = self.default_njop.get(lokasi, 2500000)
        njop_total = njop_per_m2 * luas_tanah
        total_rooms = jumlah_kamar + jumlah_kamar_mandi + 2  # Add living room, kitchen
        total_area = luas_bangunan + luas_tanah
        building_land_ratio = luas_bangunan / luas_tanah
        bedroom_bathroom_ratio = jumlah_kamar / max(jumlah_kamar_mandi, 1)
        
        model_input = {
            # Main features
            'Kamar Tidur': jumlah_kamar,
            'Kamar Mandi': jumlah_kamar_mandi,
            'Luas Tanah (m²)': luas_tanah,
            'Luas Bangunan (m²)': luas_bangunan,
            'Daya Listrik (watt)': 2200,  # Default
            'Jumlah Lantai': 1,  # Default
            'Kondisi Properti': kondisi,
            'Aksesibilitas': akses_jalan,
            'NJOP (Rp/m²)': njop_per_m2,
            'Tingkat Keamanan': 'Baik',
            'Jenis Zona': 'Residential',
            'Lebar Jalan (m)': 6,  # Default
            
            # Derived features
            'Total_Rooms': total_rooms,
            'Total_Area': total_area,
            'Building_Land_Ratio': building_land_ratio,
            'Bedroom_Bathroom_Ratio': bedroom_bathroom_ratio,
            'NJOP_Total': njop_total,
            'Ruang Tamu': 1,
            'Ruang Makan': 1,
            
            # Location
            'Kecamatan': self.kecamatan_mapping.get(lokasi, 'Wonocolo')
        }
        
        return model_input
    
    def adapt_input(self, form_data: Dict[str, Any], property_type: str) -> Dict[str, Any]:
        """Main adapter function"""
        if property_type == 'tanah':
            return self.adapt_tanah_input(form_data)
        elif property_type == 'bangunan':
            return self.adapt_bangunan_input(form_data)
        else:
            raise ValueError(f"Unsupported property type: {property_type}")

# Test the adapter
if __name__ == "__main__":
    adapter = PropertyInputAdapter()
    
    # Test tanah input
    tanah_input = {
        'lokasi': 'Surabaya Timur',
        'luas_tanah': 200,
        'sertifikat': 'SHM',
        'akses_jalan': 'Mudah'
    }
    
    adapted_tanah = adapter.adapt_tanah_input(tanah_input)
    print("Tanah adapted input:")
    for k, v in adapted_tanah.items():
        print(f"  {k}: {v}")
    
    print("\n" + "="*50 + "\n")
    
    # Test bangunan input
    bangunan_input = {
        'lokasi': 'Surabaya Pusat',
        'luas_bangunan': 150,
        'jumlah_kamar': 3,
        'jumlah_kamar_mandi': 2,
        'kondisi': 'Baik',
        'sertifikat': 'SHM',
        'akses_jalan': 'Mudah'
    }
    
    adapted_bangunan = adapter.adapt_bangunan_input(bangunan_input)
    print("Bangunan adapted input:")
    for k, v in adapted_bangunan.items():
        print(f"  {k}: {v}")
