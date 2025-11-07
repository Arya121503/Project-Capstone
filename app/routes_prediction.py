import os
import sys
import pandas as pd
import numpy as np
import joblib
import json
from datetime import datetime
from flask import Blueprint, request, jsonify, current_app, render_template, flash, redirect, url_for
from werkzeug.utils import secure_filename
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
import xgboost as xgb
from catboost import CatBoostRegressor

# Import sistem prediksi yang sudah distandarisasi
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from prediction_system import prediction_system

prediction_bp = Blueprint('prediction', __name__)

# Konfigurasi upload
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'csv'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@prediction_bp.route('/predict_land_price', methods=['POST'])
def predict_land_price():
    """Predict land rental price using standardized prediction system"""
    try:
        # Validasi dan dapatkan data form
        try:
            # Validasi field string yang diperlukan
            kecamatan = request.form.get('kecamatan', '').strip()
            sertifikat = request.form.get('sertifikat', '').strip()
            jenis_zona = request.form.get('jenis_zona', '').strip()
            aksesibilitas = request.form.get('aksesibilitas', '').strip()
            tingkat_keamanan = request.form.get('tingkat_keamanan', '').strip()
            
            if not all([kecamatan, sertifikat, jenis_zona, aksesibilitas, tingkat_keamanan]):
                return jsonify({'error': 'Semua field dropdown harus diisi'}), 400
            
            # Validasi dan konversi field numerik
            njop_str = request.form.get('njop', '').strip()
            luas_tanah_str = request.form.get('luas_tanah', '').strip()
            kepadatan_penduduk_str = request.form.get('kepadatan_penduduk', '').strip()
            
            if not all([njop_str, luas_tanah_str, kepadatan_penduduk_str]):
                return jsonify({'error': 'Semua field numerik harus diisi'}), 400
            
            # Konversi ke nilai numerik
            njop = float(njop_str)
            luas_tanah = float(luas_tanah_str)
            kepadatan_penduduk = float(kepadatan_penduduk_str)
            
            # Validasi range
            if njop <= 0:
                return jsonify({'error': 'NJOP harus lebih dari 0'}), 400
            if luas_tanah <= 0:
                return jsonify({'error': 'Luas tanah harus lebih dari 0'}), 400
            if kepadatan_penduduk <= 0:
                return jsonify({'error': 'Kepadatan penduduk harus lebih dari 0'}), 400
                
        except ValueError as ve:
            return jsonify({'error': f'Format input tidak valid: {str(ve)}'}), 400
        
        # Siapkan data untuk prediksi
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
        
        # Lakukan prediksi menggunakan sistem prediksi terstandarisasi
        result = prediction_system.predict_land_price(input_data)
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify({'error': result['error']}), 500
        
    except Exception as e:
        current_app.logger.error(f"Error in land price prediction: {str(e)}")
        return jsonify({'error': f'Gagal melakukan prediksi: {str(e)}'}), 500

@prediction_bp.route('/predict_building_price', methods=['POST'])
def predict_building_price():
    """Predict building rental price using standardized prediction system"""
    try:
        # Validasi dan dapatkan data form
        try:
            # Validasi field string yang diperlukan untuk bangunan
            # NOTE: Model bangunan tidak memerlukan tingkat_keamanan dan kepadatan_penduduk
            kecamatan = request.form.get('kecamatan', '').strip()
            sertifikat = request.form.get('sertifikat', '').strip()
            jenis_zona = request.form.get('jenis_zona', '').strip()
            aksesibilitas = request.form.get('aksesibilitas', '').strip()
            
            if not all([kecamatan, sertifikat, jenis_zona, aksesibilitas]):
                return jsonify({'error': 'Semua field dropdown harus diisi'}), 400
            
            # Validasi dan konversi field numerik
            njop_str = request.form.get('njop', '').strip()
            luas_tanah_str = request.form.get('luas_tanah', '').strip()
            luas_bangunan_str = request.form.get('luas_bangunan', '').strip()
            jumlah_lantai_str = request.form.get('jumlah_lantai', '').strip()
            
            if not all([njop_str, luas_tanah_str, luas_bangunan_str, jumlah_lantai_str]):
                return jsonify({'error': 'Semua field numerik harus diisi'}), 400
            
            # Konversi ke nilai numerik
            njop = float(njop_str)
            luas_tanah = float(luas_tanah_str)
            luas_bangunan = float(luas_bangunan_str)
            jumlah_lantai = int(jumlah_lantai_str)
            
            # Validasi range
            if njop <= 0:
                return jsonify({'error': 'NJOP harus lebih dari 0'}), 400
            if luas_tanah <= 0:
                return jsonify({'error': 'Luas tanah harus lebih dari 0'}), 400
            if luas_bangunan <= 0:
                return jsonify({'error': 'Luas bangunan harus lebih dari 0'}), 400
            if jumlah_lantai <= 0 or jumlah_lantai > 10:
                return jsonify({'error': 'Jumlah lantai harus antara 1-10'}), 400
                
        except ValueError as ve:
            return jsonify({'error': f'Format input tidak valid: {str(ve)}'}), 400
        
        # Siapkan data untuk prediksi (hanya field yang diperlukan untuk bangunan)
        input_data = {
            'kecamatan': kecamatan,
            'njop': njop,
            'sertifikat': sertifikat,
            'luas_tanah': luas_tanah,
            'luas_bangunan': luas_bangunan,
            'jumlah_lantai': jumlah_lantai,
            'jenis_zona': jenis_zona,
            'aksesibilitas': aksesibilitas
            # tingkat_keamanan dan kepadatan_penduduk tidak diperlukan untuk model bangunan
        }
        
        # Lakukan prediksi menggunakan sistem prediksi terstandarisasi
        result = prediction_system.predict_building_price(input_data)
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify({'error': result['error']}), 500
        
    except Exception as e:
        current_app.logger.error(f"Error in building price prediction: {str(e)}")
        return jsonify({'error': f'Gagal melakukan prediksi: {str(e)}'}), 500

@prediction_bp.route('/model_status', methods=['GET'])
def get_model_status():
    """Get status of available prediction models"""
    try:
        status = prediction_system.get_model_status()
        return jsonify(status)
    except Exception as e:
        current_app.logger.error(f"Error getting model status: {str(e)}")
        return jsonify({'error': f'Gagal mendapatkan status model: {str(e)}'}), 500

@prediction_bp.route('/update_prediction_models', methods=['POST'])
def update_prediction_models():
    """Update prediction models using uploaded CSV data with auto-training"""
    try:
        # Check if files were uploaded
        if 'tanah_file' not in request.files and 'bangunan_file' not in request.files:
            return jsonify({'error': 'Tidak ada file yang diunggah'}), 400
        
        results = {}
        uploaded_files = []
        
        # Process tanah file if uploaded
        if 'tanah_file' in request.files:
            tanah_file = request.files['tanah_file']
            if tanah_file and tanah_file.filename != '' and allowed_file(tanah_file.filename):
                try:
                    # Save file to data/raw directory
                    filename = secure_filename(tanah_file.filename)
                    tanah_file_path = os.path.join(current_app.root_path, '..', 'data', 'raw', f'tanah_data_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv')
                    os.makedirs(os.path.dirname(tanah_file_path), exist_ok=True)
                    tanah_file.save(tanah_file_path)
                    uploaded_files.append(('tanah', tanah_file_path))
                    
                    results['tanah'] = {
                        'status': 'uploaded',
                        'file_path': tanah_file_path,
                        'message': 'File tanah berhasil diunggah.'
                    }
                    
                except Exception as e:
                    results['tanah'] = {'error': f'Gagal memproses file tanah: {str(e)}'}
        
        # Process bangunan file if uploaded
        if 'bangunan_file' in request.files:
            bangunan_file = request.files['bangunan_file']
            if bangunan_file and bangunan_file.filename != '' and allowed_file(bangunan_file.filename):
                try:
                    # Save file to data/raw directory
                    filename = secure_filename(bangunan_file.filename)
                    bangunan_file_path = os.path.join(current_app.root_path, '..', 'data', 'raw', f'bangunan_data_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv')
                    os.makedirs(os.path.dirname(bangunan_file_path), exist_ok=True)
                    bangunan_file.save(bangunan_file_path)
                    uploaded_files.append(('bangunan', bangunan_file_path))
                    
                    results['bangunan'] = {
                        'status': 'uploaded',
                        'file_path': bangunan_file_path,
                        'message': 'File bangunan berhasil diunggah.'
                    }
                    
                except Exception as e:
                    results['bangunan'] = {'error': f'Gagal memproses file bangunan: {str(e)}'}
        
        # Auto-train models if files were uploaded successfully
        if uploaded_files:
            try:
                # Import auto trainer
                sys.path.append(os.path.join(current_app.root_path, '..'))
                from auto_model_trainer import auto_train_from_uploads
                
                print(f"🚀 Starting auto-training for {len(uploaded_files)} files...")
                training_results = auto_train_from_uploads(uploaded_files)
                
                if training_results['success']:
                    # Auto-reload models after successful training
                    prediction_system.reload_models()
                    
                    results['training'] = {
                        'status': 'success',
                        'message': 'Model berhasil dilatih dan dimuat ulang otomatis',
                        'models_trained': training_results['models_trained'],
                        'timestamp': training_results['timestamp']
                    }
                    
                    return jsonify({
                        'success': True,
                        'results': results,
                        'message': 'File berhasil diunggah dan model dilatih otomatis!'
                    })
                else:
                    results['training'] = {
                        'status': 'error',
                        'message': 'Training gagal',
                        'errors': training_results['errors']
                    }
                    
                    return jsonify({
                        'success': False,
                        'results': results,
                        'message': 'File diunggah tapi training gagal'
                    }), 500
                    
            except Exception as e:
                current_app.logger.error(f"Auto-training error: {str(e)}")
                results['training'] = {
                    'status': 'error', 
                    'message': f'Error dalam auto-training: {str(e)}'
                }
                
                return jsonify({
                    'success': False,
                    'results': results,
                    'message': 'File diunggah tapi auto-training gagal'
                }), 500
        
        # If no files were uploaded successfully
        return jsonify({
            'success': False,
            'results': results,
            'message': 'Tidak ada file yang berhasil diunggah'
        }), 400
        
    except Exception as e:
        current_app.logger.error(f"Error updating models: {str(e)}")
        return jsonify({'error': f'Gagal memperbarui model: {str(e)}'}), 500

@prediction_bp.route('/reload_models', methods=['POST'])
def reload_models():
    """Reload prediction models to get latest trained versions"""
    try:
        # Reload models dari sistem prediksi
        prediction_system.reload_models()
        
        # Get updated model status
        status = prediction_system.get_model_status()
        
        return jsonify({
            'success': True,
            'message': 'Model berhasil dimuat ulang',
            'model_status': status
        })
        
    except Exception as e:
        current_app.logger.error(f"Error reloading models: {str(e)}")
        return jsonify({'error': f'Gagal memuat ulang model: {str(e)}'}), 500

@prediction_bp.route('/get_prediction_stats', methods=['GET'])
def get_prediction_stats():
    """Get prediction model statistics with model availability check"""
    try:
        stats = prediction_system.get_model_status()
        
        return jsonify({
            'success': True,
            'stats': stats
        })
        
    except Exception as e:
        current_app.logger.error(f"Error getting prediction stats: {str(e)}")
        return jsonify({'error': f'Gagal mendapatkan statistik: {str(e)}'}), 500

# ============================================================================
# FASE 3: PREDICTION MONITORING & ANALYTICS
# ============================================================================

@prediction_bp.route('/prediction_analytics', methods=['GET'])
def get_prediction_analytics():
    """
    Get prediction analytics dan monitoring statistics
    
    Query Parameters:
        days (int): Jumlah hari ke belakang untuk analisis (default: 7)
        
    Returns:
        JSON dengan prediction stats dan model status
    """
    try:
        # Get days parameter
        days = request.args.get('days', 7, type=int)
        
        # Get prediction statistics from logs
        prediction_stats = prediction_system.get_prediction_stats(days=days)
        
        # Get current model status
        model_status = prediction_system.get_model_status()
        
        return jsonify({
            'success': True,
            'period_days': days,
            'prediction_stats': prediction_stats,
            'model_status': model_status,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        current_app.logger.error(f"Error getting prediction analytics: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Gagal mendapatkan analytics: {str(e)}'
        }), 500
