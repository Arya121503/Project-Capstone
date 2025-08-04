"""
Module untuk ekstraksi dan pengelolaan data NJOP dari file PERWALI NO 2 TH 2017
"""

import re
import json
from collections import defaultdict

class NJOPDataExtractor:
    def __init__(self, file_path="PERWALI_NO_2_TH_2017_EXTRACTED_TEXT.txt"):
        self.file_path = file_path
        self.njop_data = defaultdict(lambda: defaultdict(dict))
        
        # Mapping untuk menangani perbedaan nama kecamatan
        self.kecamatan_mapping = {
            'ASEM ROWO': 'Asemrowo',
            'PABEAN CANTIAN': 'Pabean Cantikan',
            # Bisa menambahkan mapping lain jika diperlukan
        }
        
    def extract_njop_data(self):
        """Ekstraksi data NJOP berdasarkan kecamatan dan kelas bumi"""
        try:
            with open(self.file_path, 'r', encoding='utf-8') as file:
                content = file.read()
                
            # Pattern untuk menangkap kecamatan
            kecamatan_pattern = r'KECAMATAN\s*:\s*\d+\s*-\s*([A-Z\s]+)'
            
            # Pattern untuk menangkap data kelas bumi dan NJOP
            # Format: BLK KELAS PENGGOLONGAN NILAI JUAL
            data_pattern = r'(\d{3})\s+([A-Z]\d{3})\s+([\d,.]+)\s+s/d\s+([\d,.]+)\s+([\d,.]+)'
            
            current_kecamatan = None
            
            lines = content.split('\n')
            i = 0
            
            while i < len(lines):
                line = lines[i].strip()
                
                # Cek apakah baris ini berisi nama kecamatan
                kecamatan_match = re.search(kecamatan_pattern, line)
                if kecamatan_match:
                    raw_kecamatan = kecamatan_match.group(1).strip()
                    # Gunakan mapping jika ada, jika tidak gunakan nama asli
                    current_kecamatan = self.kecamatan_mapping.get(raw_kecamatan, raw_kecamatan)
                    # Skip beberapa baris sampai ke data
                    i += 1
                    continue
                
                # Cek apakah baris ini berisi data NJOP
                if current_kecamatan and re.match(r'\d{3}\s+[A-Z]\d{3}', line):
                    data_match = re.search(data_pattern, line)
                    if data_match:
                        blk = data_match.group(1)
                        kelas_bumi = data_match.group(2)
                        nilai_min = int(data_match.group(3).replace(',', '').replace('.', ''))
                        nilai_max = int(data_match.group(4).replace(',', '').replace('.', ''))
                        nilai_jual = int(data_match.group(5).replace(',', '').replace('.', ''))
                        
                        self.njop_data[current_kecamatan][kelas_bumi] = {
                            'blk': blk,
                            'nilai_min': nilai_min,
                            'nilai_max': nilai_max,
                            'nilai_jual': nilai_jual,
                            'range_text': f"Rp {nilai_min:,} - Rp {nilai_max:,}",
                            'recommended_njop': nilai_jual
                        }
                
                i += 1
                
        except Exception as e:
            print(f"Error extracting NJOP data: {e}")
            self._create_fallback_data()
    
    def _create_fallback_data(self):
        """Data fallback jika ekstraksi gagal"""
        fallback_data = {
            "BUBUTAN": {
                "A064": {"nilai_min": 1086000, "nilai_max": 1207000, "nilai_jual": 1147000},
                "A065": {"nilai_min": 977000, "nilai_max": 1086000, "nilai_jual": 1032000},
                "A066": {"nilai_min": 855000, "nilai_max": 977000, "nilai_jual": 916000},
                "A045": {"nilai_min": 5350000, "nilai_max": 5900000, "nilai_jual": 5625000},
                "A063": {"nilai_min": 1207000, "nilai_max": 1341000, "nilai_jual": 1274000}
            },
            "KENJERAN": {
                "A066": {"nilai_min": 855000, "nilai_max": 977000, "nilai_jual": 916000},
                "A065": {"nilai_min": 977000, "nilai_max": 1086000, "nilai_jual": 1032000},
                "A064": {"nilai_min": 1086000, "nilai_max": 1207000, "nilai_jual": 1147000},
                "A061": {"nilai_min": 1611000, "nilai_max": 1799000, "nilai_jual": 1705000}
            },
            "BULAK": {
                "A067": {"nilai_min": 748000, "nilai_max": 855000, "nilai_jual": 802000},
                "A066": {"nilai_min": 855000, "nilai_max": 977000, "nilai_jual": 916000},
                "A065": {"nilai_min": 977000, "nilai_max": 1086000, "nilai_jual": 1032000}
            },
            "SEMAMPIR": {
                "A066": {"nilai_min": 855000, "nilai_max": 977000, "nilai_jual": 916000},
                "A065": {"nilai_min": 977000, "nilai_max": 1086000, "nilai_jual": 1032000},
                "A064": {"nilai_min": 1086000, "nilai_max": 1207000, "nilai_jual": 1147000},
                "A063": {"nilai_min": 1207000, "nilai_max": 1341000, "nilai_jual": 1274000}
            },
            "PABEAN CANTIKAN": {
                "A067": {"nilai_min": 748000, "nilai_max": 855000, "nilai_jual": 802000},
                "A066": {"nilai_min": 855000, "nilai_max": 977000, "nilai_jual": 916000},
                "A065": {"nilai_min": 977000, "nilai_max": 1086000, "nilai_jual": 1032000},
                "A064": {"nilai_min": 1086000, "nilai_max": 1207000, "nilai_jual": 1147000}
            }
        }
        
        for kecamatan, data in fallback_data.items():
            for kelas, values in data.items():
                self.njop_data[kecamatan][kelas] = {
                    'blk': '001',
                    'nilai_min': values['nilai_min'],
                    'nilai_max': values['nilai_max'],
                    'nilai_jual': values['nilai_jual'],
                    'range_text': f"Rp {values['nilai_min']:,} - Rp {values['nilai_max']:,}",
                    'recommended_njop': values['nilai_jual']
                }
    
    def get_kelas_bumi_by_kecamatan(self, kecamatan):
        """Mendapatkan daftar kelas bumi berdasarkan kecamatan"""
        if kecamatan in self.njop_data:
            return list(self.njop_data[kecamatan].keys())
        return []
    
    def get_njop_by_kelas(self, kecamatan, kelas_bumi):
        """Mendapatkan data NJOP berdasarkan kecamatan dan kelas bumi"""
        if kecamatan in self.njop_data and kelas_bumi in self.njop_data[kecamatan]:
            return self.njop_data[kecamatan][kelas_bumi]
        return None
    
    def get_all_data(self):
        """Mendapatkan semua data NJOP dalam format JSON"""
        return dict(self.njop_data)
    
    def save_to_json(self, output_file="njop_data.json"):
        """Menyimpan data ke file JSON"""
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(self.get_all_data(), f, indent=2, ensure_ascii=False)
    
    def get_range_suggestions(self, kecamatan):
        """Mendapatkan saran range NJOP untuk kecamatan tertentu"""
        if kecamatan not in self.njop_data:
            return None
            
        all_values = []
        for kelas_data in self.njop_data[kecamatan].values():
            all_values.extend([kelas_data['nilai_min'], kelas_data['nilai_max']])
        
        if all_values:
            return {
                'min_range': min(all_values),
                'max_range': max(all_values),
                'suggestion_text': f"Range NJOP untuk {kecamatan}: Rp {min(all_values):,} - Rp {max(all_values):,}"
            }
        return None

# Fungsi untuk digunakan dalam Flask app
def get_njop_extractor():
    """Factory function untuk mendapatkan instance NJOPDataExtractor"""
    extractor = NJOPDataExtractor()
    extractor.extract_njop_data()
    return extractor

# Test script
if __name__ == "__main__":
    extractor = NJOPDataExtractor()
    extractor.extract_njop_data()
    
    # Test dengan beberapa kecamatan
    test_kecamatan = ["BUBUTAN", "KENJERAN", "BULAK"]
    
    for kecamatan in test_kecamatan:
        print(f"\n=== {kecamatan} ===")
        kelas_list = extractor.get_kelas_bumi_by_kecamatan(kecamatan)
        print(f"Kelas Bumi tersedia: {kelas_list}")
        
        for kelas in kelas_list[:3]:  # Show first 3 classes
            data = extractor.get_njop_by_kelas(kecamatan, kelas)
            if data:
                print(f"  {kelas}: {data['range_text']} (Rekomendasi: Rp {data['recommended_njop']:,})")
        
        range_info = extractor.get_range_suggestions(kecamatan)
        if range_info:
            print(f"  {range_info['suggestion_text']}")
    
    # Save to JSON for frontend use
    extractor.save_to_json("static/data/njop_data.json")
    print("\nData saved to static/data/njop_data.json")
