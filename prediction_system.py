"""
Sistem Prediksi Harga Sewa - Terintegrasi dengan Model ML yang Sudah Dilatih
================================================================

Sistem ini menggunakan model CatBoost yang sudah dilatih untuk prediksi
harga sewa tanah dan bangunan per bulan.

Model tersimpan dalam folder:
- model/tanah/ - Model untuk prediksi tanah
- model/bangunan/ - Model untuk prediksi bangunan

"""

import os
import joblib
import json
import pandas as pd
import numpy as np
from datetime import datetime
from pathlib import Path

class PredictionSystem:
    """
    Sistem prediksi harga sewa yang terintegrasi dengan model ML
    """
    
    def __init__(self, model_base_path=None):
        """
        Initialize prediction system
        
        Args:
            model_base_path (str): Path ke folder model (default: ./model)
        """
        if model_base_path is None:
            self.model_base_path = Path(__file__).parent / "model"
        else:
            self.model_base_path = Path(model_base_path)
        
        self.models = {}
        self.metadata = {}
        self.load_models()
    
    def find_latest_model_files(self, model_type):
        """
        Cari file model terbaru berdasarkan timestamp
        
        Args:
            model_type (str): 'tanah' atau 'bangunan'
            
        Returns:
            dict: Path ke file-file model
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
        
        return {
            'model': model_dir / f"rental_price_model_{latest_timestamp}.pkl",
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
                - njop: float (Rp/m²)
                - sertifikat: str ('SHM', 'HGB', 'Lainnya')
                - luas_tanah: float (m²)
                - jenis_zona: str ('Perumahan', 'Komersial', 'Industri')
                - aksesibilitas: str ('Baik', 'Buruk')
                - tingkat_keamanan: str ('tinggi', 'rendah')
                - kepadatan_penduduk: float
                
        Returns:
            dict: Hasil prediksi
        """
        try:
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
            
            # Prediksi
            prediction = self.models['tanah']['model'].predict(X_prepared)[0]
            
            # Format hasil
            formatted_prediction = f"Rp {prediction:,.0f}"
            
            return {
                'success': True,
                'prediction': formatted_prediction,
                'prediction_value': float(prediction),
                'input_data': processed_data,
                'model_info': {
                    'type': 'tanah',
                    'r2_score': self.metadata['tanah']['performance']['test_r2'],
                    'timestamp': self.metadata['tanah']['model_info']['timestamp']
                }
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def predict_building_price(self, input_data):
        """
        Prediksi harga sewa bangunan
        
        Args:
            input_data (dict): Data input dengan keys:
                - kecamatan: str
                - njop: float (Rp/m²)
                - sertifikat: str ('SHM', 'HGB', 'Lainnya')
                - luas_tanah: float (m²)
                - luas_bangunan: float (m²)
                - jumlah_lantai: int
                - jenis_zona: str ('Perumahan', 'Komersial', 'Industri')
                - aksesibilitas: str ('Baik', 'Buruk')
                - tingkat_keamanan: str ('tinggi', 'rendah') - TIDAK DIGUNAKAN untuk bangunan
                - kepadatan_penduduk: float - TIDAK DIGUNAKAN untuk bangunan
                
        Returns:
            dict: Hasil prediksi
        """
        try:
            # NOTE: Model bangunan tidak menggunakan 'tingkat_keamanan' dan 'kepadatan_penduduk'
            # dari form HTML karena tidak ada dalam dataset training
            
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
            
            # Prediksi
            prediction = self.models['bangunan']['model'].predict(X_prepared)[0]
            
            # Format hasil
            formatted_prediction = f"Rp {prediction:,.0f}"
            
            return {
                'success': True,
                'prediction': formatted_prediction,
                'prediction_value': float(prediction),
                'input_data': processed_data,
                'model_info': {
                    'type': 'bangunan',
                    'r2_score': self.metadata['bangunan']['performance']['test_r2'],
                    'timestamp': self.metadata['bangunan']['model_info']['timestamp']
                },
                'note': 'Model bangunan menggunakan nilai default untuk fitur yang tidak tersedia di form'
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

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
    
    print("\n✨ Testing completed!")
