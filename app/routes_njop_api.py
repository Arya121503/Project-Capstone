"""
API routes untuk data NJOP dan kelas bumi berdasarkan PERWALI NO 2 TH 2017
"""
from flask import Blueprint, jsonify, request
from perwali_njop_enhancement import get_njop_extractor

# Create blueprint for NJOP API
njop_bp = Blueprint('njop_api', __name__)

# Initialize NJOP extractor (singleton pattern)
njop_extractor = None

def get_extractor():
    global njop_extractor
    if njop_extractor is None:
        njop_extractor = get_njop_extractor()
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
