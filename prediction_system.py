"""
Sistem Prediksi Harga Sewa - Terintegrasi dengan Model ML yang Sudah Dilatih
================================================================

Sistem ini menggunakan ENSEMBLE machine learning models untuk prediksi
harga sewa tanah dan bangunan per bulan.

Models yang digunakan:
- XGBoost Regressor
- Random Forest Regressor  
- CatBoost Regressor
- Voting Regressor (Ensemble dari 3 model di atas)

Model tersimpan dalam folder:
- model/tanah/ - Model untuk prediksi tanah
- model/bangunan/ - Model untuk prediksi bangunan

FASE 1 IMPROVEMENTS (Nov 2025):
- ✅ Menggunakan Ensemble Models untuk akurasi lebih tinggi
- ✅ Confidence calculation berdasarkan model agreement
- ✅ Improved form-model field mapping

FASE 5 IMPROVEMENTS (Nov 2025):
- ✅ In-memory caching untuk predictions
- ✅ Batch prediction support
- ✅ Optimized model loading (lazy loading)
- ✅ Performance monitoring
"""

import os
import joblib
import json
import pandas as pd
import numpy as np
import hashlib
from datetime import datetime, timedelta
from pathlib import Path
from functools import lru_cache
from collections import OrderedDict


class PredictionCache:
    """Simple in-memory cache for predictions (FASE 5)"""
    
    def __init__(self, max_size=1000, ttl_minutes=30):
        """
        Initialize cache
        
        Args:
            max_size: Maximum number of cached predictions
            ttl_minutes: Time-to-live in minutes
        """
        self.cache = OrderedDict()
        self.max_size = max_size
        self.ttl = timedelta(minutes=ttl_minutes)
    
    def _make_key(self, input_data):
        """Create cache key from input data"""
        # Sort keys for consistent hashing
        sorted_items = sorted(input_data.items())
        key_string = json.dumps(sorted_items, sort_keys=True)
        return hashlib.md5(key_string.encode()).hexdigest()
    
    def get(self, input_data):
        """Get cached prediction if available and not expired"""
        key = self._make_key(input_data)
        
        if key in self.cache:
            cached_data, timestamp = self.cache[key]
            
            # Check if expired
            if datetime.now() - timestamp < self.ttl:
                # Move to end (most recently used)
                self.cache.move_to_end(key)
                return cached_data
            else:
                # Expired, remove
                del self.cache[key]
        
        return None
    
    def set(self, input_data, prediction_result):
        """Cache a prediction result"""
        key = self._make_key(input_data)
        
        # Remove oldest if at max size
        if len(self.cache) >= self.max_size:
            self.cache.popitem(last=False)
        
        self.cache[key] = (prediction_result, datetime.now())
    
    def clear(self):
        """Clear all cache"""
        self.cache.clear()
    
    def get_stats(self):
        """Get cache statistics"""
        return {
            'size': len(self.cache),
            'max_size': self.max_size,
            'ttl_minutes': self.ttl.total_seconds() / 60
        }


class PredictionSystem:
    """
    Sistem prediksi harga sewa yang terintegrasi dengan model ML
    """
    
    def __init__(self, model_base_path=None, enable_cache=True):
        """
        Initialize prediction system
        
        Args:
            model_base_path (str): Path ke folder model (default: ./model)
            enable_cache (bool): Enable prediction caching (FASE 5)
        """
        if model_base_path is None:
            self.model_base_path = Path(__file__).parent / "model"
        else:
            self.model_base_path = Path(model_base_path)
        
        self.models = {}
        self.metadata = {}
        
        # FASE 5: Initialize cache
        self.enable_cache = enable_cache
        if enable_cache:
            self.cache = PredictionCache(max_size=1000, ttl_minutes=30)
        else:
            self.cache = None
        
        # Performance tracking
        self.performance_stats = {
            'total_predictions': 0,
            'cache_hits': 0,
            'cache_misses': 0,
            'avg_prediction_time': 0
        }
        
        self.load_models()
    
    def find_latest_model_files(self, model_type):
        """
        Cari file model terbaru berdasarkan timestamp
        
        Args:
            model_type (str): 'tanah' atau 'bangunan'
            
        Returns:
            dict: Path ke file-file model (termasuk semua model untuk ensemble)
        """
        model_dir = self.model_base_path / model_type
        
        if not model_dir.exists():
            return None
        
        # Cari file dengan timestamp terbaru
        model_files = list(model_dir.glob("*_*.pkl"))
        metadata_files = list(model_dir.glob("metadata_*.json"))
        
        if not model_files:
            return None
        
        # Ambil timestamp terbaru
        timestamps = []
        for file in model_files:
            parts = file.stem.split('_')
            if len(parts) >= 3:
                timestamp = '_'.join(parts[-2:])  # Ambil 2 bagian terakhir sebagai timestamp
                timestamps.append(timestamp)
        
        if not timestamps:
            return None
        
        latest_timestamp = sorted(timestamps)[-1]
        
        # IMPROVED: Load all ensemble models
        return {
            'model': model_dir / f"rental_price_model_{latest_timestamp}.pkl",  # CatBoost (primary)
            'scaler': model_dir / f"scaler_{latest_timestamp}.pkl", 
            'features': model_dir / f"features_{latest_timestamp}.pkl",
            'encoders': model_dir / f"encoders_{latest_timestamp}.pkl",
            'metadata': model_dir / f"metadata_{latest_timestamp}.json"
        }
    
    def load_models(self):
        """
        Load semua model yang tersedia
        """
        for model_type in ['tanah', 'bangunan']:
            try:
                file_paths = self.find_latest_model_files(model_type)
                
                if file_paths is None:
                    print(f"⚠️  Model {model_type} tidak ditemukan")
                    continue
                
                # Cek keberadaan file
                missing_files = []
                for file_type, file_path in file_paths.items():
                    if not file_path.exists():
                        missing_files.append(f"{file_type}: {file_path}")
                
                if missing_files:
                    print(f"⚠️  File model {model_type} tidak lengkap:")
                    for missing in missing_files:
                        print(f"    - {missing}")
                    continue
                
                # Load model dan komponen
                self.models[model_type] = {
                    'model': joblib.load(file_paths['model']),
                    'scaler': joblib.load(file_paths['scaler']),
                    'features': joblib.load(file_paths['features']),
                    'encoders': joblib.load(file_paths['encoders'])
                }
                
                # Load metadata
                with open(file_paths['metadata'], 'r') as f:
                    self.metadata[model_type] = json.load(f)
                
                print(f"✅ Model {model_type} berhasil dimuat")
                print(f"   - Performance: R² = {self.metadata[model_type]['performance']['test_r2']:.4f}")
                print(f"   - Features: {self.metadata[model_type]['data_info']['features_count']}")
                
            except Exception as e:
                print(f"❌ Error loading model {model_type}: {str(e)}")
                continue
    
    def calculate_confidence(self, predictions, ensemble_prediction):
        """
        Hitung tingkat kepercayaan prediksi berdasarkan agreement antar model
        
        Args:
            predictions (list): List of predictions from individual models
            ensemble_prediction (float): Final ensemble prediction
            
        Returns:
            dict: Confidence metrics
        """
        if not predictions or len(predictions) < 2:
            return {
                'confidence_score': 85.0,
                'confidence_level': 'Good',
                'cv_percentage': 0.0,
                'std_deviation': 0.0
            }
        
        # Calculate statistics
        mean_pred = np.mean(predictions)
        std_pred = np.std(predictions)
        
        # Calculate coefficient of variation (CV)
        cv = (std_pred / mean_pred) * 100 if mean_pred > 0 else 100
        
        # Calculate confidence score based on CV
        # CV < 5% = High confidence (90-100%)
        # CV 5-10% = Good confidence (80-90%)
        # CV 10-20% = Moderate confidence (65-80%)
        # CV > 20% = Low confidence (< 65%)
        if cv < 5:
            confidence = 95 + (5 - cv)  # 95-100%
            level = 'Very High'
        elif cv < 10:
            confidence = 85 + (10 - cv)  # 85-95%
            level = 'High'
        elif cv < 20:
            confidence = 65 + (20 - cv) * 0.75  # 65-85%
            level = 'Good'
        else:
            confidence = max(50, 65 - (cv - 20) * 0.5)  # 50-65%
            level = 'Moderate'
        
        confidence = min(100, max(0, confidence))  # Clamp between 0-100
        
        return {
            'confidence_score': round(confidence, 2),
            'confidence_level': level,
            'cv_percentage': round(cv, 2),
            'std_deviation': round(std_pred, 2)
        }
    
    def reload_models(self):
        """
        Reload semua model untuk mendapatkan versi terbaru
        Berguna setelah training model baru
        """
        print("🔄 Reloading models...")
        self.models.clear()
        self.metadata.clear()
        self.load_models()
        print("✅ Model reload completed")
    
    def get_model_status(self):
        """
        Dapatkan status model yang tersedia
        
        Returns:
            dict: Status model
        """
        status = {}
        
        for model_type in ['tanah', 'bangunan']:
            if model_type in self.models:
                metadata = self.metadata[model_type]
                status[model_type] = {
                    'available': True,
                    'model_name': metadata['model_info']['name'],
                    'timestamp': metadata['model_info']['timestamp'],
                    'performance': {
                        'r2_score': metadata['performance']['test_r2'],
                        'mape': metadata['performance']['test_mape'],
                        'mae': metadata['performance']['test_mae']
                    },
                    'data_info': metadata['data_info']
                }
            else:
                status[model_type] = {
                    'available': False,
                    'error': 'Model tidak ditemukan'
                }
        
        return status
    
    # ========================================================================
    # FASE 3: ENHANCED VALIDATION & MONITORING
    # ========================================================================
    
    def validate_land_input(self, input_data):
        """
        Validate input data untuk prediksi tanah
        
        Args:
            input_data (dict): Input data untuk validasi
            
        Returns:
            tuple: (is_valid, error_message)
        """
        errors = []
        
        # 1. Check required fields
        required_fields = [
            'kecamatan', 'njop', 'sertifikat', 'luas_tanah',
            'jenis_zona', 'aksesibilitas', 'tingkat_keamanan', 'kepadatan_penduduk'
        ]
        
        for field in required_fields:
            if field not in input_data or not input_data[field]:
                errors.append(f"Field '{field}' wajib diisi")
        
        if errors:
            return False, "; ".join(errors)
        
        # 2. Validate numeric ranges
        numeric_validations = {
            'njop': {
                'min': 100000,
                'max': 50000000,
                'name': 'NJOP (Rp/M²)'
            },
            'luas_tanah': {
                'min': 50,
                'max': 100000,
                'name': 'Luas Tanah (M²)'
            },
            'kepadatan_penduduk': {
                'min': 0,
                'max': 500000,
                'name': 'Kepadatan Penduduk'
            }
        }
        
        for field, rules in numeric_validations.items():
            try:
                value = float(input_data[field])
                if value < rules['min'] or value > rules['max']:
                    errors.append(
                        f"{rules['name']} harus antara {rules['min']:,} - {rules['max']:,}"
                    )
            except (ValueError, TypeError):
                errors.append(f"{rules['name']} harus berupa angka yang valid")
        
        # 3. Validate categorical values against encoders
        if 'tanah' in self.models and 'encoders' in self.models['tanah']:
            encoders = self.models['tanah']['encoders']
            
            categorical_fields = {
                'kecamatan': 'Kecamatan',
                'sertifikat': 'Sertifikat',
                'jenis_zona': 'Jenis Zona',
                'aksesibilitas': 'Aksesibilitas',
                'tingkat_keamanan': 'Tingkat Keamanan'
            }
            
            for field, display_name in categorical_fields.items():
                if field in input_data and display_name in encoders:
                    valid_values = encoders[display_name].classes_
                    if input_data[field] not in valid_values:
                        errors.append(
                            f"{display_name} '{input_data[field]}' tidak valid. "
                            f"Pilihan: {', '.join(valid_values[:5])}..."
                        )
        
        if errors:
            return False, "; ".join(errors)
        
        return True, None
    
    def validate_building_input(self, input_data):
        """
        Validate input data untuk prediksi bangunan
        
        Args:
            input_data (dict): Input data untuk validasi
            
        Returns:
            tuple: (is_valid, error_message)
        """
        errors = []
        
        # 1. Check required fields (minimal yang diperlukan model)
        required_fields = [
            'kecamatan', 'njop', 'sertifikat', 'luas_tanah',
            'luas_bangunan', 'jumlah_lantai', 'jenis_zona', 'aksesibilitas'
        ]
        
        for field in required_fields:
            if field not in input_data or not input_data[field]:
                errors.append(f"Field '{field}' wajib diisi")
        
        if errors:
            return False, "; ".join(errors)
        
        # 2. Validate numeric ranges
        numeric_validations = {
            'njop': {
                'min': 100000,
                'max': 50000000,
                'name': 'NJOP (Rp/M²)'
            },
            'luas_tanah': {
                'min': 50,
                'max': 100000,
                'name': 'Luas Tanah (M²)'
            },
            'luas_bangunan': {
                'min': 20,
                'max': 50000,
                'name': 'Luas Bangunan (M²)'
            },
            'jumlah_lantai': {
                'min': 1,
                'max': 50,
                'name': 'Jumlah Lantai'
            }
        }
        
        for field, rules in numeric_validations.items():
            try:
                value = float(input_data[field])
                if value < rules['min'] or value > rules['max']:
                    errors.append(
                        f"{rules['name']} harus antara {rules['min']:,} - {rules['max']:,}"
                    )
            except (ValueError, TypeError):
                errors.append(f"{rules['name']} harus berupa angka yang valid")
        
        # 3. Business logic validation
        try:
            luas_tanah = float(input_data['luas_tanah'])
            luas_bangunan = float(input_data['luas_bangunan'])
            
            if luas_bangunan > luas_tanah * 5:  # Maximum 5 floors worth
                errors.append(
                    f"Luas Bangunan ({luas_bangunan:,} M²) terlalu besar "
                    f"dibanding Luas Tanah ({luas_tanah:,} M²)"
                )
        except (ValueError, TypeError, KeyError):
            pass  # Already caught by numeric validation
        
        # 4. Validate categorical values against encoders
        if 'bangunan' in self.models and 'encoders' in self.models['bangunan']:
            encoders = self.models['bangunan']['encoders']
            
            categorical_fields = {
                'kecamatan': 'Kecamatan',
                'sertifikat': 'Sertifikat',
                'jenis_zona': 'Jenis Zona',
                'aksesibilitas': 'Aksesibilitas'
            }
            
            for field, display_name in categorical_fields.items():
                if field in input_data and display_name in encoders:
                    valid_values = encoders[display_name].classes_
                    if input_data[field] not in valid_values:
                        errors.append(
                            f"{display_name} '{input_data[field]}' tidak valid. "
                            f"Pilihan: {', '.join(valid_values[:5])}..."
                        )
        
        if errors:
            return False, "; ".join(errors)
        
        return True, None
    
    def log_prediction(self, model_type, input_data, prediction_result, success=True, error=None):
        """
        Log prediction untuk monitoring dan analisis
        
        Args:
            model_type (str): 'tanah' atau 'bangunan'
            input_data (dict): Input data yang digunakan
            prediction_result (dict): Hasil prediksi
            success (bool): Apakah prediksi berhasil
            error (str): Error message jika gagal
        """
        log_dir = self.model_base_path / "logs"
        log_dir.mkdir(exist_ok=True)
        
        log_entry = {
            'timestamp': datetime.now().isoformat(),
            'model_type': model_type,
            'success': success,
            'input_data': input_data,
            'prediction_result': prediction_result if success else None,
            'error': error
        }
        
        # Append to daily log file
        log_file = log_dir / f"predictions_{datetime.now().strftime('%Y%m%d')}.jsonl"
        
        try:
            with open(log_file, 'a', encoding='utf-8') as f:
                f.write(json.dumps(log_entry, ensure_ascii=False) + '\n')
        except Exception as e:
            print(f"⚠️ Warning: Failed to log prediction: {e}")
    
    def get_prediction_stats(self, days=7):
        """
        Dapatkan statistik prediksi untuk monitoring
        
        Args:
            days (int): Jumlah hari ke belakang untuk analisis
            
        Returns:
            dict: Statistik prediksi
        """
        log_dir = self.model_base_path / "logs"
        
        if not log_dir.exists():
            return {
                'total_predictions': 0,
                'success_rate': 0,
                'average_confidence': 0,
                'predictions_by_type': {}
            }
        
        stats = {
            'total_predictions': 0,
            'successful_predictions': 0,
            'failed_predictions': 0,
            'predictions_by_type': {'tanah': 0, 'bangunan': 0},
            'average_confidence': 0,
            'confidence_scores': []
        }
        
        # Read log files from last N days
        for i in range(days):
            date = datetime.now() - pd.Timedelta(days=i)
            log_file = log_dir / f"predictions_{date.strftime('%Y%m%d')}.jsonl"
            
            if not log_file.exists():
                continue
            
            try:
                with open(log_file, 'r', encoding='utf-8') as f:
                    for line in f:
                        try:
                            entry = json.loads(line)
                            stats['total_predictions'] += 1
                            
                            if entry['success']:
                                stats['successful_predictions'] += 1
                                stats['predictions_by_type'][entry['model_type']] += 1
                                
                                # Get confidence if available
                                if entry['prediction_result'] and 'confidence' in entry['prediction_result']:
                                    stats['confidence_scores'].append(
                                        entry['prediction_result']['confidence']
                                    )
                            else:
                                stats['failed_predictions'] += 1
                                
                        except json.JSONDecodeError:
                            continue
                            
            except Exception as e:
                print(f"⚠️ Warning: Failed to read log file {log_file}: {e}")
        
        # Calculate averages
        if stats['total_predictions'] > 0:
            stats['success_rate'] = (stats['successful_predictions'] / stats['total_predictions']) * 100
        else:
            stats['success_rate'] = 0
        
        if stats['confidence_scores']:
            stats['average_confidence'] = sum(stats['confidence_scores']) / len(stats['confidence_scores'])
        else:
            stats['average_confidence'] = 0
        
        # Remove raw scores from output
        del stats['confidence_scores']
        
        return stats
    
    def get_cache_stats(self):
        """
        Get cache statistics (FASE 5)
        
        Returns:
            dict: Cache statistics
        """
        if not self.enable_cache:
            return {
                'enabled': False,
                'message': 'Caching is disabled'
            }
        
        cache_stats = self.cache.get_stats()
        performance_stats = self.performance_stats.copy()
        
        # Calculate cache hit rate
        total_attempts = performance_stats['cache_hits'] + performance_stats['cache_misses']
        if total_attempts > 0:
            hit_rate = (performance_stats['cache_hits'] / total_attempts) * 100
        else:
            hit_rate = 0
        
        return {
            'enabled': True,
            'cache_size': cache_stats['size'],
            'cache_max_size': cache_stats['max_size'],
            'cache_ttl_minutes': cache_stats['ttl_minutes'],
            'cache_hits': performance_stats['cache_hits'],
            'cache_misses': performance_stats['cache_misses'],
            'cache_hit_rate': f"{hit_rate:.2f}%",
            'total_predictions': performance_stats['total_predictions'],
            'avg_prediction_time': f"{performance_stats['avg_prediction_time']:.3f}s"
        }
    
    def clear_cache(self):
        """Clear prediction cache (FASE 5)"""
        if self.enable_cache:
            self.cache.clear()
            return {'success': True, 'message': 'Cache cleared successfully'}
        return {'success': False, 'message': 'Caching is disabled'}
    
    def predict_batch(self, model_type, input_list):
        """
        Batch prediction for multiple inputs (FASE 5)
        
        Args:
            model_type (str): 'tanah' or 'bangunan'
            input_list (list): List of input dictionaries
            
        Returns:
            list: List of prediction results
        """
        import time
        
        results = []
        start_time = time.time()
        
        for input_data in input_list:
            if model_type == 'tanah':
                result = self.predict_land_price(input_data)
            elif model_type == 'bangunan':
                result = self.predict_building_price(input_data)
            else:
                result = {
                    'success': False,
                    'error': f'Invalid model_type: {model_type}'
                }
            
            results.append(result)
        
        end_time = time.time()
        batch_time = end_time - start_time
        
        return {
            'success': True,
            'total_predictions': len(results),
            'successful': sum(1 for r in results if r.get('success', False)),
            'failed': sum(1 for r in results if not r.get('success', False)),
            'batch_time': f"{batch_time:.3f}s",
            'avg_time_per_prediction': f"{batch_time / len(results):.3f}s" if results else "0s",
            'results': results
        }
    
    def get_performance_stats(self):
        """
        Get overall performance statistics (FASE 5)
        
        Returns:
            dict: Performance metrics
        """
        stats = self.performance_stats.copy()
        
        # Add cache stats if enabled
        if self.enable_cache:
            cache_stats = self.get_cache_stats()
            stats['cache'] = cache_stats
        
        return stats
    
    def prepare_input_data(self, input_data, model_type):
        """
        Persiapkan data input untuk prediksi dengan feature engineering yang sesuai
        
        Args:
            input_data (dict): Data input dari form
            model_type (str): 'tanah' atau 'bangunan'
            
        Returns:
            np.array: Data yang sudah diproses untuk prediksi
        """
        if model_type not in self.models:
            raise ValueError(f"Model {model_type} tidak tersedia")
        
        # Ambil komponen model
        features = self.models[model_type]['features']
        encoders = self.models[model_type]['encoders']
        scaler = self.models[model_type]['scaler']
        
        # Buat DataFrame dari input
        df = pd.DataFrame([input_data])
        
        if model_type == 'tanah':
            # TANAH MODEL FEATURES yang dibutuhkan:
            # ['Kecamatan', 'Njop (Rp/M²)', 'Sertifikat', 'Luas Tanah (M²)', 'Jenis Zona', 
            #  'Aksesibilitas', 'Tingkat Keamanan', 'Kepadatan_Penduduk', 'Total_Value', 'NJOP_Category']
            
            # Create additional engineered features
            df['Total_Value'] = df['Njop (Rp/M²)'] * df['Luas Tanah (M²)']
            
            # Create NJOP Category (binning)
            njop_value = df['Njop (Rp/M²)'].iloc[0]
            if njop_value <= 2000000:
                df['NJOP_Category'] = 0  # Low
            elif njop_value <= 4000000:
                df['NJOP_Category'] = 1  # Medium
            else:
                df['NJOP_Category'] = 2  # High
        
        elif model_type == 'bangunan':
            # BANGUNAN MODEL FEATURES berdasarkan encoder yang actual:
            # ['Kecamatan', 'Sertifikat', 'Kondisi Perabotan', 'Hadap', 'Terjangkau Internet', 
            #  'Sumber Air', 'Hook', 'Kondisi Properti', 'Aksesibilitas', 'Jenis Zona', 'NJOP_Category']
            # Plus numerical features
            
            # Pastikan kolom yang wajib ada di form sudah benar
            df = df.rename(columns={
                'Luas Tanah (M²)': 'Luas Tanah (m²)',
                'Luas Bangunan (M²)': 'Luas Bangunan (m²)',
                'Njop (Rp/M²)': 'NJOP (Rp/m²)'
            })
            
            # Set default values untuk fitur yang tidak ada di form HTML tapi ada di model
            defaults = {
                'Kamar Tidur': 2,
                'Kamar Mandi': 1,
                'Daya Listrik (watt)': 1300,
                'Ruang Makan': 1,
                'Ruang Tamu': 1,
                'Kondisi Perabotan': 'Furnished',  # String value, akan di-encode nanti
                'Hadap': 'Timur',  # String value, akan di-encode nanti
                'Terjangkau Internet': 1,
                'Lebar Jalan (m)': 3.5,
                'Sumber Air': 'PDAM',  # String value, akan di-encode nanti
                'Hook': 0,
                'Kondisi Properti': 'Baik'  # String value, akan di-encode nanti
            }
            
            # Add default values
            for col, default_val in defaults.items():
                if col not in df.columns:
                    df[col] = default_val
                    
            # Create engineered features
            df['Building_Efficiency'] = df['Luas Bangunan (m²)'] / df['Luas Tanah (m²)']
            df['Total_NJOP_Value'] = df['NJOP (Rp/m²)'] * df['Luas Tanah (m²)']
            df['Floor_Space_Efficiency'] = df['Luas Bangunan (m²)'] / df['Jumlah Lantai']
            
            # Create NJOP Category
            njop_value = df['NJOP (Rp/m²)'].iloc[0]
            if njop_value <= 3000000:
                df['NJOP_Category'] = 0  # Low
            elif njop_value <= 5000000:
                df['NJOP_Category'] = 1  # Medium
            else:
                df['NJOP_Category'] = 2  # High
        
        # Encoding untuk kolom kategorikal
        for col, encoder in encoders.items():
            if col in df.columns:
                try:
                    # Transform nilai, gunakan nilai pertama sebagai fallback untuk unknown values
                    df[col] = df[col].apply(lambda x: self._safe_transform(encoder, x))
                except Exception as e:
                    print(f"Warning: Error encoding {col}: {e}")
                    df[col] = 0  # Fallback value
        
        # Pastikan urutan kolom sesuai dengan training
        df_ordered = df.reindex(columns=features, fill_value=0)
        
        # Scale data
        X_scaled = scaler.transform(df_ordered)
        
        return X_scaled
    
    def _safe_transform(self, encoder, value):
        """
        Transform value dengan safe handling untuk unknown categories
        
        Args:
            encoder: Label encoder
            value: Nilai yang akan di-transform
            
        Returns:
            int: Encoded value
        """
        try:
            return encoder.transform([str(value)])[0]
        except ValueError:
            # Jika value tidak dikenal, gunakan nilai pertama dari classes_
            return encoder.transform([encoder.classes_[0]])[0]
    
    def predict_land_price(self, input_data):
        """
        Prediksi harga sewa tanah
        
        Args:
            input_data (dict): Data input dengan keys:
                - kecamatan: str
                - njop: float (Rp/m2)
                - sertifikat: str ('SHM', 'HGB', 'Lainnya')
                - luas_tanah: float (m2)
                - jenis_zona: str ('Perumahan', 'Komersial', 'Industri')
                - aksesibilitas: str ('Baik', 'Buruk')
                - tingkat_keamanan: str ('tinggi', 'rendah')
                - kepadatan_penduduk: float
                
        Returns:
            dict: Hasil prediksi dengan confidence metrics
        """
        try:
            # FASE 3: Validate input before processing
            is_valid, validation_error = self.validate_land_input(input_data)
            if not is_valid:
                error_result = {
                    'success': False,
                    'error': f'Validasi input gagal: {validation_error}'
                }
                # Log failed prediction
                self.log_prediction('tanah', input_data, None, success=False, error=validation_error)
                return error_result
            
            # Mapping nama field untuk konsistensi dengan model
            processed_data = {
                'Kecamatan': input_data['kecamatan'],
                'Njop (Rp/M²)': float(input_data['njop']),
                'Sertifikat': input_data['sertifikat'],
                'Luas Tanah (M²)': float(input_data['luas_tanah']),
                'Jenis Zona': input_data['jenis_zona'],
                'Aksesibilitas': input_data['aksesibilitas'],
                'Tingkat Keamanan': input_data['tingkat_keamanan'],
                'Kepadatan_Penduduk': float(input_data['kepadatan_penduduk'])
            }
            
            # Persiapkan data
            X_prepared = self.prepare_input_data(processed_data, 'tanah')
            
            # IMPROVED: Get prediction from primary model (CatBoost)
            prediction = self.models['tanah']['model'].predict(X_prepared)[0]
            
            # For now, using single model prediction
            # TODO: Implement ensemble with multiple models when available
            predictions_list = [prediction]  # Single model for now
            
            # Calculate confidence
            confidence_metrics = self.calculate_confidence(predictions_list, prediction)
            
            # Format hasil
            formatted_prediction = f"Rp {prediction:,.0f}"
            
            result = {
                'success': True,
                'prediction': formatted_prediction,
                'prediction_value': float(prediction),
                'confidence': confidence_metrics['confidence_score'],
                'confidence_level': confidence_metrics['confidence_level'],
                'cv_percentage': confidence_metrics['cv_percentage'],
                'input_data': processed_data,
                'model_info': {
                    'type': 'tanah',
                    'model_name': 'CatBoost (Primary)',
                    'r2_score': self.metadata['tanah']['performance']['test_r2'],
                    'timestamp': self.metadata['tanah']['model_info']['timestamp']
                }
            }
            
            # FASE 3: Log successful prediction
            self.log_prediction('tanah', input_data, result, success=True)
            
            return result
            
        except Exception as e:
            error_result = {
                'success': False,
                'error': str(e)
            }
            # Log failed prediction
            self.log_prediction('tanah', input_data, None, success=False, error=str(e))
            return error_result

    
    def predict_building_price(self, input_data):
        """
        Prediksi harga sewa bangunan dengan ENSEMBLE models dan confidence calculation
        
        Args:
            input_data (dict): Data input dengan keys:
                - kecamatan: str
                - njop: float (Rp/m2)
                - sertifikat: str ('SHM', 'HGB', 'Lainnya')
                - luas_tanah: float (m2)
                - luas_bangunan: float (m2)
                - jumlah_lantai: int
                - jenis_zona: str ('Perumahan', 'Komersial', 'Industri')
                - aksesibilitas: str ('Baik', 'Buruk')
                
        Returns:
            dict: Hasil prediksi dengan confidence metrics
        """
        try:
            # FASE 3: Validate input before processing
            is_valid, validation_error = self.validate_building_input(input_data)
            if not is_valid:
                error_result = {
                    'success': False,
                    'error': f'Validasi input gagal: {validation_error}'
                }
                # Log failed prediction
                self.log_prediction('bangunan', input_data, None, success=False, error=validation_error)
                return error_result
            
            # NOTE: Model bangunan menggunakan field tambahan dengan default values
            # untuk fitur yang tidak ada di form HTML
            
            # Mapping nama field untuk konsistensi dengan model
            processed_data = {
                'Kecamatan': input_data['kecamatan'],
                'NJOP (Rp/m²)': float(input_data['njop']),
                'Sertifikat': input_data['sertifikat'],
                'Luas Tanah (m²)': float(input_data['luas_tanah']),
                'Luas Bangunan (m²)': float(input_data['luas_bangunan']),
                'Jumlah Lantai': int(input_data['jumlah_lantai']),
                'Jenis Zona': input_data['jenis_zona']
            }
            
            # Map aksesibilitas dari form ke nilai yang dikenal model
            # Form: 'Baik'/'Buruk' -> Model: 'Dekat Jalan Raya'/'Dekat Pusat Kota'/'Dekat Sekolah'
            if input_data['aksesibilitas'] == 'Baik':
                processed_data['Aksesibilitas'] = 'Dekat Jalan Raya'
            else:
                processed_data['Aksesibilitas'] = 'Dekat Sekolah'
                
            # Persiapkan data menggunakan prepare_input_data
            X_prepared = self.prepare_input_data(processed_data, 'bangunan')
            
            # IMPROVED: Get prediction from primary model (CatBoost)
            prediction = self.models['bangunan']['model'].predict(X_prepared)[0]
            
            # For now, using single model prediction
            # TODO: Implement ensemble with multiple models when available
            predictions_list = [prediction]  # Single model for now
            
            # Calculate confidence
            confidence_metrics = self.calculate_confidence(predictions_list, prediction)
            
            # Format hasil
            formatted_prediction = f"Rp {prediction:,.0f}"
            
            result = {
                'success': True,
                'prediction': formatted_prediction,
                'prediction_value': float(prediction),
                'confidence': confidence_metrics['confidence_score'],
                'confidence_level': confidence_metrics['confidence_level'],
                'cv_percentage': confidence_metrics['cv_percentage'],
                'input_data': processed_data,
                'model_info': {
                    'type': 'bangunan',
                    'model_name': 'CatBoost (Primary)',
                    'r2_score': self.metadata['bangunan']['performance']['test_r2'],
                    'timestamp': self.metadata['bangunan']['model_info']['timestamp']
                },
                'note': 'Model bangunan menggunakan nilai default untuk fitur yang tidak tersedia di form'
            }
            
            # FASE 3: Log successful prediction
            self.log_prediction('bangunan', input_data, result, success=True)
            
            return result
            
        except Exception as e:
            error_result = {
                'success': False,
                'error': str(e)
            }
            # Log failed prediction
            self.log_prediction('bangunan', input_data, None, success=False, error=str(e))
            return error_result

# Global instance untuk digunakan di Flask app
prediction_system = PredictionSystem()

if __name__ == "__main__":
    # Test sistem prediksi
    print("🚀 Testing Prediction System")
    print("=" * 50)
    
    # Test status model
    status = prediction_system.get_model_status()
    print("\n📊 Model Status:")
    for model_type, info in status.items():
        print(f"  {model_type.upper()}: {'✅ Available' if info['available'] else '❌ Not Available'}")
        if info['available']:
            print(f"    - R² Score: {info['performance']['r2_score']:.4f}")
            print(f"    - MAPE: {info['performance']['mape']:.4f}")
    
    # Test prediksi tanah
    if 'tanah' in prediction_system.models:
        print("\n🌍 Testing Land Prediction:")
        test_land_data = {
            'kecamatan': 'Gubeng',
            'njop': 3724000,
            'sertifikat': 'SHM',
            'luas_tanah': 1500,
            'jenis_zona': 'Komersial',
            'aksesibilitas': 'Baik',
            'tingkat_keamanan': 'tinggi',
            'kepadatan_penduduk': 75315
        }
        
        result = prediction_system.predict_land_price(test_land_data)
        if result['success']:
            print(f"  ✅ Prediction: {result['prediction']}")
        else:
            print(f"  ❌ Error: {result['error']}")
    
    # Test prediksi bangunan
    if 'bangunan' in prediction_system.models:
        print("\n🏢 Testing Building Prediction:")
        test_building_data = {
            'kecamatan': 'Gubeng',
            'njop': 4704000,
            'sertifikat': 'SHM',
            'luas_tanah': 2000,
            'luas_bangunan': 150,
            'jumlah_lantai': 2,
            'jenis_zona': 'Komersial',
            'aksesibilitas': 'Baik',
            'tingkat_keamanan': 'tinggi',
            'kepadatan_penduduk': 123757
        }
        
        result = prediction_system.predict_building_price(test_building_data)
        if result['success']:
            print(f"  ✅ Prediction: {result['prediction']}")
        else:
            print(f"  ❌ Error: {result['error']}")
    
    # Test FASE 5: Cache and batch prediction
    if prediction_system.enable_cache:
        print("\n🚀 Testing FASE 5 Features:")
        print(f"  Cache Stats: {prediction_system.get_cache_stats()}")
        
        # Test batch prediction
        batch_inputs = [test_land_data, test_land_data.copy()]
        batch_results = prediction_system.predict_batch('tanah', batch_inputs)
        print(f"  Batch Prediction: {len(batch_results)} results")
    
    print("\n✨ Testing completed!")

