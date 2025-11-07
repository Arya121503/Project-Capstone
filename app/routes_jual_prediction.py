"""
Routes untuk prediksi harga jual tanah dan bangunan
Menggunakan ensemble machine learning models

FASE 2 IMPROVEMENT: Added auto-upload & training endpoints
"""

from flask import Blueprint, request, jsonify, render_template, current_app
from werkzeug.utils import secure_filename
import joblib
import pandas as pd
import numpy as np
import os
import sys
from datetime import datetime

# Create blueprint
jual_prediction_bp = Blueprint('jual_prediction', __name__, url_prefix='/jual-prediction')

# Model paths
TANAH_MODEL_PATH = 'model/jual_tanah'
BANGUNAN_MODEL_PATH = 'model/jual_bangunan'

# Global variables for loaded models
tanah_models = {}
bangunan_models = {}

def load_tanah_models():
    """Load all tanah models and metadata"""
    global tanah_models
    
    try:
        model_dir = TANAH_MODEL_PATH
        
        tanah_models = {
            'voting': joblib.load(os.path.join(model_dir, 'voting_regressor.pkl')),
            'xgboost': joblib.load(os.path.join(model_dir, 'xgboost.pkl')),
            'random_forest': joblib.load(os.path.join(model_dir, 'random_forest.pkl')),
            'catboost': joblib.load(os.path.join(model_dir, 'catboost.pkl')),
            'encoders': joblib.load(os.path.join(model_dir, 'label_encoders.pkl')),
            'features': joblib.load(os.path.join(model_dir, 'feature_names.pkl'))
        }
        
        # Load performance metrics
        perf_file = os.path.join(model_dir, 'model_performance.csv')
        if os.path.exists(perf_file):
            tanah_models['performance'] = pd.read_csv(perf_file)
        
        print(f"✅ Tanah models loaded successfully")
        return True
        
    except Exception as e:
        print(f"❌ Error loading tanah models: {e}")
        return False

def load_bangunan_models():
    """Load all bangunan models and metadata"""
    global bangunan_models
    
    try:
        model_dir = BANGUNAN_MODEL_PATH
        
        bangunan_models = {
            'voting': joblib.load(os.path.join(model_dir, 'voting_regressor.pkl')),
            'xgboost': joblib.load(os.path.join(model_dir, 'xgboost.pkl')),
            'random_forest': joblib.load(os.path.join(model_dir, 'random_forest.pkl')),
            'catboost': joblib.load(os.path.join(model_dir, 'catboost.pkl')),
            'encoders': joblib.load(os.path.join(model_dir, 'label_encoders.pkl')),
            'features': joblib.load(os.path.join(model_dir, 'feature_names.pkl'))
        }
        
        # Load performance metrics
        perf_file = os.path.join(model_dir, 'model_performance.csv')
        if os.path.exists(perf_file):
            bangunan_models['performance'] = pd.read_csv(perf_file)
        
        print(f"✅ Bangunan models loaded successfully")
        return True
        
    except Exception as e:
        print(f"❌ Error loading bangunan models: {e}")
        return False

# Load models on startup
load_tanah_models()
load_bangunan_models()

@jual_prediction_bp.route('/predict-tanah', methods=['POST'])
def predict_tanah():
    """
    Endpoint untuk prediksi harga jual tanah
    
    Expected JSON input:
    {
        "kecamatan": "Gubeng",
        "sertifikat": "SHM",
        "luas_tanah": 500,
        "jenis_zona": "Komersial",
        "aksesibilitas": "Baik",
        "tingkat_keamanan": "tinggi",
        "kepadatan_penduduk": 123961,
        "jarak_ke_pusat": 5.0,
        "model_type": "voting"  // optional: voting, xgboost, random_forest, catboost
    }
    """
    try:
        # Check if models are loaded
        if not tanah_models:
            if not load_tanah_models():
                return jsonify({
                    'success': False,
                    'error': 'Models not loaded. Please train the models first.'
                }), 500
        
        # Get input data
        data = request.get_json()
        
        # Validate required fields
        required_fields = [
            'kecamatan', 'sertifikat', 'luas_tanah', 'jenis_zona',
            'aksesibilitas', 'tingkat_keamanan', 'kepadatan_penduduk', 'jarak_ke_pusat'
        ]
        
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Create input dataframe
        input_data = pd.DataFrame({
            'Kecamatan': [data['kecamatan']],
            'Sertifikat': [data['sertifikat']],
            'Luas Tanah (M²)': [float(data['luas_tanah'])],
            'Jenis Zona': [data['jenis_zona']],
            'Aksesibilitas': [data['aksesibilitas']],
            'Tingkat Keamanan': [data['tingkat_keamanan']],
            'Kepadatan_Penduduk': [int(data['kepadatan_penduduk'])],
            'Jarak ke Pusat Kota (km)': [float(data['jarak_ke_pusat'])]
        })
        
        # Encode categorical variables
        encoders = tanah_models['encoders']
        for col in ['Kecamatan', 'Sertifikat', 'Jenis Zona', 'Aksesibilitas', 'Tingkat Keamanan']:
            if col in encoders:
                try:
                    input_data[col] = encoders[col].transform(input_data[col].astype(str))
                except ValueError as e:
                    return jsonify({
                        'success': False,
                        'error': f'Invalid value for {col}. Please use values from training data.'
                    }), 400
        
        # Reorder columns to match training
        feature_names = tanah_models['features']
        input_data = input_data[feature_names]
        
        # Always use Voting Regressor (ensemble model) for best accuracy
        model = tanah_models['voting']
        
        # Make prediction using ensemble
        prediction = model.predict(input_data)[0]
        
        # Get predictions from all individual models for analysis
        all_predictions = {
            'xgboost': float(tanah_models['xgboost'].predict(input_data)[0]),
            'random_forest': float(tanah_models['random_forest'].predict(input_data)[0]),
            'catboost': float(tanah_models['catboost'].predict(input_data)[0]),
            'ensemble': float(prediction)
        }
        
        # Calculate confidence using improved method
        # Confidence based on agreement between models and prediction variance
        pred_values = [all_predictions['xgboost'], all_predictions['random_forest'], all_predictions['catboost']]
        mean_pred = np.mean(pred_values)
        std_pred = np.std(pred_values)
        
        # Calculate coefficient of variation (CV)
        cv = (std_pred / mean_pred) * 100 if mean_pred > 0 else 100
        
        # Confidence score: higher when models agree (low CV)
        # CV < 5% = High confidence (95-100%)
        # CV 5-10% = Good confidence (85-95%)
        # CV 10-20% = Moderate confidence (70-85%)
        # CV > 20% = Low confidence (< 70%)
        if cv < 5:
            confidence = 95 + (5 - cv)  # 95-100%
        elif cv < 10:
            confidence = 85 + (10 - cv)  # 85-95%
        elif cv < 20:
            confidence = 70 + (20 - cv) * 0.75  # 70-85%
        else:
            confidence = max(50, 70 - (cv - 20) * 0.5)  # 50-70%
        
        confidence = min(100, max(0, confidence))  # Clamp between 0-100
        
        return jsonify({
            'success': True,
            'prediction': float(prediction),
            'formatted_prediction': f"Rp {prediction:,.0f}",
            'model_used': 'Ensemble (XGBoost + Random Forest + CatBoost)',
            'all_predictions': all_predictions,
            'confidence': round(confidence, 2),
            'confidence_level': 'High' if confidence >= 90 else 'Good' if confidence >= 80 else 'Moderate' if confidence >= 70 else 'Low',
            'cv_percentage': round(cv, 2),
            'input_data': data,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@jual_prediction_bp.route('/predict-bangunan', methods=['POST'])
def predict_bangunan():
    """
    Endpoint untuk prediksi harga jual bangunan
    
    Expected JSON input:
    {
        "kecamatan": "Gubeng",
        "sertifikat": "SHM",
        "luas_tanah": 300,
        "luas_bangunan": 250,
        "jenis_zona": "Komersial",
        "kondisi_bangunan": "Baik",
        "jumlah_lantai": 2,
        "tahun_dibangun": 2015,
        "aksesibilitas": "Baik",
        "tingkat_keamanan": "tinggi",
        "kepadatan_penduduk": 123961,
        "jarak_ke_pusat": 5.0,
        "model_type": "voting"  // optional
    }
    """
    try:
        # Check if models are loaded
        if not bangunan_models:
            if not load_bangunan_models():
                return jsonify({
                    'success': False,
                    'error': 'Models not loaded. Please train the models first.'
                }), 500
        
        # Get input data
        data = request.get_json()
        
        # Validate required fields
        required_fields = [
            'kecamatan', 'sertifikat', 'luas_tanah', 'luas_bangunan',
            'jenis_zona', 'kondisi_bangunan', 'jumlah_lantai', 'tahun_dibangun',
            'aksesibilitas', 'tingkat_keamanan', 'kepadatan_penduduk', 'jarak_ke_pusat'
        ]
        
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Create input dataframe
        input_data = pd.DataFrame({
            'Kecamatan': [data['kecamatan']],
            'Sertifikat': [data['sertifikat']],
            'Luas Tanah (M²)': [float(data['luas_tanah'])],
            'Luas Bangunan (M²)': [float(data['luas_bangunan'])],
            'Jenis Zona': [data['jenis_zona']],
            'Kondisi Bangunan': [data['kondisi_bangunan']],
            'Jumlah Lantai': [int(data['jumlah_lantai'])],
            'Tahun Dibangun': [int(data['tahun_dibangun'])],
            'Aksesibilitas': [data['aksesibilitas']],
            'Tingkat Keamanan': [data['tingkat_keamanan']],
            'Kepadatan_Penduduk': [int(data['kepadatan_penduduk'])],
            'Jarak ke Pusat Kota (km)': [float(data['jarak_ke_pusat'])]
        })
        
        # Encode categorical variables
        encoders = bangunan_models['encoders']
        for col in ['Kecamatan', 'Sertifikat', 'Jenis Zona', 'Kondisi Bangunan', 'Aksesibilitas', 'Tingkat Keamanan']:
            if col in encoders:
                try:
                    input_data[col] = encoders[col].transform(input_data[col].astype(str))
                except ValueError as e:
                    return jsonify({
                        'success': False,
                        'error': f'Invalid value for {col}. Please use values from training data.'
                    }), 400
        
        # Reorder columns to match training
        feature_names = bangunan_models['features']
        input_data = input_data[feature_names]
        
        # Always use Voting Regressor (ensemble model) for best accuracy
        model = bangunan_models['voting']
        
        # Make prediction using ensemble
        prediction = model.predict(input_data)[0]
        
        # Get predictions from all individual models for analysis
        all_predictions = {
            'xgboost': float(bangunan_models['xgboost'].predict(input_data)[0]),
            'random_forest': float(bangunan_models['random_forest'].predict(input_data)[0]),
            'catboost': float(bangunan_models['catboost'].predict(input_data)[0]),
            'ensemble': float(prediction)
        }
        
        # Calculate confidence using improved method
        pred_values = [all_predictions['xgboost'], all_predictions['random_forest'], all_predictions['catboost']]
        mean_pred = np.mean(pred_values)
        std_pred = np.std(pred_values)
        
        # Calculate coefficient of variation (CV)
        cv = (std_pred / mean_pred) * 100 if mean_pred > 0 else 100
        
        # Confidence score calculation
        if cv < 5:
            confidence = 95 + (5 - cv)
        elif cv < 10:
            confidence = 85 + (10 - cv)
        elif cv < 20:
            confidence = 70 + (20 - cv) * 0.75
        else:
            confidence = max(50, 70 - (cv - 20) * 0.5)
        
        confidence = min(100, max(0, confidence))
        
        return jsonify({
            'success': True,
            'prediction': float(prediction),
            'formatted_prediction': f"Rp {prediction:,.0f}",
            'model_used': 'Ensemble (XGBoost + Random Forest + CatBoost)',
            'all_predictions': all_predictions,
            'confidence': round(confidence, 2),
            'confidence_level': 'High' if confidence >= 90 else 'Good' if confidence >= 80 else 'Moderate' if confidence >= 70 else 'Low',
            'cv_percentage': round(cv, 2),
            'input_data': data,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@jual_prediction_bp.route('/model-info', methods=['GET'])
def get_model_info():
    """Get information about loaded models"""
    try:
        info = {
            'tanah_models_loaded': bool(tanah_models),
            'bangunan_models_loaded': bool(bangunan_models),
            'available_models': ['voting', 'xgboost', 'random_forest', 'catboost']
        }
        
        # Add tanah model performance
        if tanah_models and 'performance' in tanah_models:
            info['tanah_performance'] = tanah_models['performance'].to_dict('records')
        
        # Add bangunan model performance
        if bangunan_models and 'performance' in bangunan_models:
            info['bangunan_performance'] = bangunan_models['performance'].to_dict('records')
        
        # Add feature names
        if tanah_models and 'features' in tanah_models:
            info['tanah_features'] = tanah_models['features']
        
        if bangunan_models and 'features' in bangunan_models:
            info['bangunan_features'] = bangunan_models['features']
        
        return jsonify({
            'success': True,
            'model_info': info
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@jual_prediction_bp.route('/reload-models', methods=['POST'])
def reload_models():
    """Reload all models (useful after retraining)"""
    try:
        tanah_success = load_tanah_models()
        bangunan_success = load_bangunan_models()
        
        return jsonify({
            'success': tanah_success and bangunan_success,
            'tanah_loaded': tanah_success,
            'bangunan_loaded': bangunan_success,
            'message': 'Models reloaded successfully' if (tanah_success and bangunan_success) else 'Some models failed to load'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@jual_prediction_bp.route('/valid-values', methods=['GET'])
def get_valid_values():
    """Get valid values for categorical fields"""
    try:
        valid_values = {}
        
        # Tanah valid values
        if tanah_models and 'encoders' in tanah_models:
            valid_values['tanah'] = {}
            for col, encoder in tanah_models['encoders'].items():
                valid_values['tanah'][col] = list(encoder.classes_)
        
        # Bangunan valid values
        if bangunan_models and 'encoders' in bangunan_models:
            valid_values['bangunan'] = {}
            for col, encoder in bangunan_models['encoders'].items():
                valid_values['bangunan'][col] = list(encoder.classes_)
        
        return jsonify({
            'success': True,
            'valid_values': valid_values
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ============================================================================
# FASE 2: AUTO-UPLOAD & TRAINING ENDPOINTS
# ============================================================================

ALLOWED_EXTENSIONS = {'csv'}

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@jual_prediction_bp.route('/upload-dataset', methods=['POST'])
def upload_dataset():
    """
    Upload dataset CSV untuk auto-training model jual prediction
    
    Expected form data:
    - jual_tanah_file: CSV file untuk tanah jual (optional)
    - jual_bangunan_file: CSV file untuk bangunan jual (optional)
    
    CSV Format untuk Jual Tanah:
    - Kecamatan, Sertifikat, Luas Tanah (M²), Jenis Zona, Aksesibilitas,
      Tingkat Keamanan, Kepadatan_Penduduk, Jarak ke Pusat Kota (km), Harga Jual (Rp)
    
    CSV Format untuk Jual Bangunan:
    - Sama seperti tanah + Luas Bangunan (M²), Kondisi Bangunan, Jumlah Lantai, Tahun Dibangun
    """
    try:
        if 'jual_tanah_file' not in request.files and 'jual_bangunan_file' not in request.files:
            return jsonify({
                'success': False,
                'error': 'Tidak ada file yang diupload. Upload minimal 1 file (tanah atau bangunan).'
            }), 400
        
        uploaded_files = []
        results = {}
        
        # Process jual tanah file if uploaded
        if 'jual_tanah_file' in request.files:
            tanah_file = request.files['jual_tanah_file']
            if tanah_file and tanah_file.filename != '' and allowed_file(tanah_file.filename):
                try:
                    # Save file to data/raw directory
                    filename = secure_filename(tanah_file.filename)
                    tanah_file_path = os.path.join(
                        current_app.root_path, '..', 'data', 'raw', 
                        f'jual_tanah_data_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
                    )
                    os.makedirs(os.path.dirname(tanah_file_path), exist_ok=True)
                    tanah_file.save(tanah_file_path)
                    uploaded_files.append(('jual_tanah', tanah_file_path))
                    
                    results['jual_tanah'] = {
                        'status': 'uploaded',
                        'file_path': tanah_file_path,
                        'message': 'File jual tanah berhasil diunggah.'
                    }
                    
                except Exception as e:
                    results['jual_tanah'] = {'error': f'Gagal memproses file jual tanah: {str(e)}'}
        
        # Process jual bangunan file if uploaded
        if 'jual_bangunan_file' in request.files:
            bangunan_file = request.files['jual_bangunan_file']
            if bangunan_file and bangunan_file.filename != '' and allowed_file(bangunan_file.filename):
                try:
                    # Save file to data/raw directory
                    filename = secure_filename(bangunan_file.filename)
                    bangunan_file_path = os.path.join(
                        current_app.root_path, '..', 'data', 'raw',
                        f'jual_bangunan_data_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
                    )
                    os.makedirs(os.path.dirname(bangunan_file_path), exist_ok=True)
                    bangunan_file.save(bangunan_file_path)
                    uploaded_files.append(('jual_bangunan', bangunan_file_path))
                    
                    results['jual_bangunan'] = {
                        'status': 'uploaded',
                        'file_path': bangunan_file_path,
                        'message': 'File jual bangunan berhasil diunggah.'
                    }
                    
                except Exception as e:
                    results['jual_bangunan'] = {'error': f'Gagal memproses file jual bangunan: {str(e)}'}
        
        # Auto-train models if files were uploaded successfully
        if uploaded_files:
            try:
                # Import auto trainer for jual prediction
                sys.path.append(os.path.join(current_app.root_path, '..'))
                from auto_model_trainer_jual import auto_train_jual_from_uploads
                
                print(f"🚀 Starting auto-training for JUAL prediction ({len(uploaded_files)} files)...")
                training_results = auto_train_jual_from_uploads(uploaded_files)
                
                if training_results['success']:
                    # Auto-reload models after successful training
                    tanah_loaded = load_tanah_models()
                    bangunan_loaded = load_bangunan_models()
                    
                    results['training'] = {
                        'status': 'success',
                        'message': 'Ensemble models berhasil dilatih dan dimuat ulang otomatis',
                        'models_trained': training_results['models_trained'],
                        'timestamp': training_results['timestamp'],
                        'tanah_reloaded': tanah_loaded,
                        'bangunan_reloaded': bangunan_loaded
                    }
                    
                    return jsonify({
                        'success': True,
                        'results': results,
                        'message': 'File berhasil diunggah dan ensemble models dilatih otomatis! 🎉'
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
                import traceback
                traceback.print_exc()
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
        current_app.logger.error(f"Error uploading dataset: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Gagal mengupload dataset: {str(e)}'}), 500

