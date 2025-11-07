"""
API routes untuk data NJOP dan kelas bumi berdasarkan PERWALI NO 2 TH 2017
"""
from flask import Blueprint, jsonify, request

# Create blueprint for NJOP API
njop_bp = Blueprint('njop_api', __name__)

# Data NJOP berdasarkan PERWALI NO 2 TH 2017
# Format: {kecamatan: {kelas: {nilai_min, nilai_max, recommended_njop, range_text}}}
NJOP_DATA = {
    'ASEMROWO': {
        'A1': {'nilai_min': 1500000, 'nilai_max': 2500000, 'recommended_njop': 2000000, 'range_text': 'Rp 1.500.000 s/d Rp 2.500.000'},
        'A2': {'nilai_min': 1000000, 'nilai_max': 1500000, 'recommended_njop': 1250000, 'range_text': 'Rp 1.000.000 s/d Rp 1.500.000'},
        'B': {'nilai_min': 500000, 'nilai_max': 1000000, 'recommended_njop': 750000, 'range_text': 'Rp 500.000 s/d Rp 1.000.000'},
    },
    'BENOWO': {
        'A': {'nilai_min': 1000000, 'nilai_max': 1500000, 'recommended_njop': 1250000, 'range_text': 'Rp 1.000.000 s/d Rp 1.500.000'},
        'B': {'nilai_min': 500000, 'nilai_max': 1000000, 'recommended_njop': 750000, 'range_text': 'Rp 500.000 s/d Rp 1.000.000'},
        'C': {'nilai_min': 200000, 'nilai_max': 500000, 'recommended_njop': 350000, 'range_text': 'Rp 200.000 s/d Rp 500.000'},
    },
    'BUBUTAN': {
        'A1': {'nilai_min': 3000000, 'nilai_max': 5000000, 'recommended_njop': 4000000, 'range_text': 'Rp 3.000.000 s/d Rp 5.000.000'},
        'A2': {'nilai_min': 2000000, 'nilai_max': 3000000, 'recommended_njop': 2500000, 'range_text': 'Rp 2.000.000 s/d Rp 3.000.000'},
        'B': {'nilai_min': 1000000, 'nilai_max': 2000000, 'recommended_njop': 1500000, 'range_text': 'Rp 1.000.000 s/d Rp 2.000.000'},
    },
}

class NJOPExtractor:
    """Simple NJOP data extractor"""
    
    def __init__(self):
        self.data = NJOP_DATA
    
    def get_kelas_bumi_by_kecamatan(self, kecamatan):
        """Mendapatkan daftar kelas bumi untuk kecamatan tertentu"""
        kecamatan_upper = kecamatan.upper()
        if kecamatan_upper in self.data:
            return list(self.data[kecamatan_upper].keys())
        return []
    
    def get_njop_by_kelas(self, kecamatan, kelas):
        """Mendapatkan data NJOP untuk kecamatan dan kelas tertentu"""
        kecamatan_upper = kecamatan.upper()
        kelas_upper = kelas.upper()
        if kecamatan_upper in self.data and kelas_upper in self.data[kecamatan_upper]:
            return self.data[kecamatan_upper][kelas_upper]
        return None
    
    def get_range_suggestions(self, kecamatan):
        """Mendapatkan range NJOP untuk kecamatan"""
        kecamatan_upper = kecamatan.upper()
        if kecamatan_upper in self.data:
            all_values = []
            for kelas_data in self.data[kecamatan_upper].values():
                all_values.append(kelas_data['nilai_min'])
                all_values.append(kelas_data['nilai_max'])
            
            if all_values:
                return {
                    'min_range': min(all_values),
                    'max_range': max(all_values),
                    'suggestion_text': f"Range NJOP untuk {kecamatan}: Rp {min(all_values):,} - Rp {max(all_values):,}"
                }
        return None
    
    def get_all_data(self):
        """Mendapatkan semua data NJOP"""
        return self.data

# Initialize NJOP extractor (singleton pattern)
njop_extractor = None

def get_extractor():
    global njop_extractor
    if njop_extractor is None:
        njop_extractor = NJOPExtractor()
    return njop_extractor

@njop_bp.route('/api/kelas-bumi/<kecamatan>')
def get_kelas_bumi(kecamatan):
    """
    Endpoint untuk mendapatkan daftar kelas bumi berdasarkan kecamatan
    """
    try:
        extractor = get_extractor()
        
        # Coba beberapa variasi nama kecamatan
        kecamatan_variants = [
            kecamatan,  # Original 
            kecamatan.upper(),  # UPPERCASE
            kecamatan.title(),  # Title Case
            kecamatan.lower()   # lowercase
        ]
        
        kelas_list = []
        matched_kecamatan = kecamatan
        
        for variant in kecamatan_variants:
            kelas_list = extractor.get_kelas_bumi_by_kecamatan(variant)
            if kelas_list:
                matched_kecamatan = variant
                break
        
        # Format data untuk frontend
        formatted_data = []
        for kelas in kelas_list:
            njop_data = extractor.get_njop_by_kelas(matched_kecamatan, kelas)
            if njop_data:
                formatted_data.append({
                    'kelas': kelas,
                    'label': f"{kelas} - {njop_data['range_text']}",
                    'recommended_njop': njop_data['recommended_njop'],
                    'range_text': njop_data['range_text'],
                    'nilai_min': njop_data['nilai_min'],
                    'nilai_max': njop_data['nilai_max']
                })
        
        return jsonify({
            'success': True,
            'kecamatan': kecamatan,
            'kelas_bumi': formatted_data
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@njop_bp.route('/api/njop-suggestion')
def get_njop_suggestion():
    """
    Endpoint untuk mendapatkan saran NJOP berdasarkan kecamatan dan kelas bumi
    """
    try:
        kecamatan_input = request.args.get('kecamatan', '')
        kelas_bumi = request.args.get('kelas_bumi', '').upper()
        
        if not kecamatan_input or not kelas_bumi:
            return jsonify({
                'success': False,
                'error': 'Parameter kecamatan dan kelas_bumi harus diisi'
            }), 400
        
        extractor = get_extractor()
        
        # Coba beberapa variasi nama kecamatan
        kecamatan_variants = [
            kecamatan_input,  # Original 
            kecamatan_input.upper(),  # UPPERCASE
            kecamatan_input.title(),  # Title Case
            kecamatan_input.lower()   # lowercase
        ]
        
        njop_data = None
        matched_kecamatan = kecamatan_input
        
        for variant in kecamatan_variants:
            njop_data = extractor.get_njop_by_kelas(variant, kelas_bumi)
            if njop_data:
                matched_kecamatan = variant
                break
        
        if njop_data:
            return jsonify({
                'success': True,
                'kecamatan': matched_kecamatan,
                'kelas_bumi': kelas_bumi,
                'recommended_njop': njop_data['recommended_njop'],
                'range_text': njop_data['range_text'],
                'nilai_min': njop_data['nilai_min'],
                'nilai_max': njop_data['nilai_max'],
                'formatted_njop': f"Rp {njop_data['recommended_njop']:,}",
                'suggestion_message': f"Rekomendasi NJOP untuk {matched_kecamatan} kelas {kelas_bumi}: Rp {njop_data['recommended_njop']:,}"
            })
        else:
            return jsonify({
                'success': False,
                'error': f'Data tidak ditemukan untuk {kecamatan_input} kelas {kelas_bumi}'
            }), 404
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@njop_bp.route('/api/njop-range/<kecamatan>')
def get_njop_range(kecamatan):
    """
    Endpoint untuk mendapatkan range NJOP untuk kecamatan tertentu
    """
    try:
        extractor = get_extractor()
        
        # Coba beberapa variasi nama kecamatan
        kecamatan_variants = [
            kecamatan,  # Original 
            kecamatan.upper(),  # UPPERCASE
            kecamatan.title(),  # Title Case
            kecamatan.lower()   # lowercase
        ]
        
        range_data = None
        matched_kecamatan = kecamatan
        
        for variant in kecamatan_variants:
            range_data = extractor.get_range_suggestions(variant)
            if range_data:
                matched_kecamatan = variant
                break
        
        if range_data:
            return jsonify({
                'success': True,
                'kecamatan': matched_kecamatan,
                'min_range': range_data['min_range'],
                'max_range': range_data['max_range'],
                'suggestion_text': range_data['suggestion_text'],
                'formatted_range': f"Rp {range_data['min_range']:,} - Rp {range_data['max_range']:,}"
            })
        else:
            return jsonify({
                'success': False,
                'error': f'Data tidak ditemukan untuk kecamatan {kecamatan}'
            }), 404
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@njop_bp.route('/api/all-njop-data')
def get_all_njop_data():
    """
    Endpoint untuk mendapatkan semua data NJOP (untuk debugging/testing)
    """
    try:
        extractor = get_extractor()
        all_data = extractor.get_all_data()
        
        # Format untuk frontend
        formatted_data = {}
        for kecamatan, kelas_data in all_data.items():
            formatted_data[kecamatan] = []
            for kelas, njop_info in kelas_data.items():
                formatted_data[kecamatan].append({
                    'kelas': kelas,
                    'label': f"{kelas} - Rp {njop_info['nilai_min']:,} s/d Rp {njop_info['nilai_max']:,}",
                    'recommended_njop': njop_info['recommended_njop'],
                    'range_text': njop_info['range_text']
                })
        
        return jsonify({
            'success': True,
            'data': formatted_data,
            'total_kecamatan': len(formatted_data)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
