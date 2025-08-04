#!/usr/bin/env python3
"""
Auto Training System untuk Model Update
========================================

Script ini akan otomatis training model ketika CSV baru diupload 
melalui dashboard admin, tanpa perlu manual notebook execution.
"""

import os
import sys
import pandas as pd
import numpy as np
import joblib
import json
from datetime import datetime
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score, mean_absolute_percentage_error
from sklearn.ensemble import RandomForestRegressor
from catboost import CatBoostRegressor
import warnings
warnings.filterwarnings('ignore')

class AutoModelTrainer:
    """
    Auto training system untuk update model
    """
    
    def __init__(self, project_root=None):
        if project_root is None:
            self.project_root = Path(__file__).parent
        else:
            self.project_root = Path(project_root)
        
        self.data_dir = self.project_root / "data" / "raw"
        self.model_dir = self.project_root / "model"
        self.random_state = 42
        
    def train_models_from_files(self, tanah_file_path=None, bangunan_file_path=None):
        """
        Training model dari file CSV yang diupload
        
        Args:
            tanah_file_path (str): Path ke file CSV tanah
            bangunan_file_path (str): Path ke file CSV bangunan
            
        Returns:
            dict: Hasil training
        """
        results = {
            'success': True,
            'models_trained': [],
            'errors': [],
            'timestamp': datetime.now().strftime("%Y%m%d_%H%M%S")
        }
        
        # Training model tanah
        if tanah_file_path and os.path.exists(tanah_file_path):
            try:
                print(f"🏞️ Training model tanah dari: {tanah_file_path}")
                tanah_result = self._train_tanah_model(tanah_file_path, results['timestamp'])
                results['models_trained'].append(tanah_result)
                print(f"✅ Model tanah berhasil dilatih: R² = {tanah_result['performance']['test_r2']:.4f}")
            except Exception as e:
                error_msg = f"Error training tanah model: {str(e)}"
                results['errors'].append(error_msg)
                print(f"❌ {error_msg}")
        
        # Training model bangunan
        if bangunan_file_path and os.path.exists(bangunan_file_path):
            try:
                print(f"🏢 Training model bangunan dari: {bangunan_file_path}")
                bangunan_result = self._train_bangunan_model(bangunan_file_path, results['timestamp'])
                results['models_trained'].append(bangunan_result)
                print(f"✅ Model bangunan berhasil dilatih: R² = {bangunan_result['performance']['test_r2']:.4f}")
            except Exception as e:
                error_msg = f"Error training bangunan model: {str(e)}"
                results['errors'].append(error_msg)
                print(f"❌ {error_msg}")
        
        if results['errors']:
            results['success'] = False
            
        return results
    
    def _train_tanah_model(self, csv_path, timestamp):
        """Training model untuk prediksi tanah"""
        
        # Load data
        df = pd.read_csv(csv_path)
        print(f"📊 Data tanah loaded: {df.shape}")
        
        # Data preprocessing
        df_clean = df.dropna()
        
        # Prepare features and target
        target_col = 'Sewa Per Bulan (Rp)'
        feature_cols = [
            'Kecamatan', 'Njop (Rp/M²)', 'Sertifikat', 'Luas Tanah (M²)',
            'Jenis Zona', 'Aksesibilitas', 'Tingkat Keamanan', 'Kepadatan_Penduduk'
        ]
        
        # Feature engineering
        df_clean['Total_Value'] = df_clean['Njop (Rp/M²)'] * df_clean['Luas Tanah (M²)']
        
        # NJOP Category
        df_clean['NJOP_Category'] = pd.cut(
            df_clean['Njop (Rp/M²)'], 
            bins=[0, 2000000, 4000000, float('inf')], 
            labels=[0, 1, 2]
        ).astype(int)
        
        # Final features
        features = feature_cols + ['Total_Value', 'NJOP_Category']
        
        X = df_clean[features].copy()
        y = df_clean[target_col]
        
        # Encode categorical variables
        categorical_cols = ['Kecamatan', 'Sertifikat', 'Jenis Zona', 'Aksesibilitas', 'Tingkat Keamanan']
        numerical_cols = ['Njop (Rp/M²)', 'Luas Tanah (M²)', 'Kepadatan_Penduduk', 'Total_Value', 'NJOP_Category']
        
        encoders = {}
        for col in categorical_cols:
            encoder = LabelEncoder()
            X[col] = encoder.fit_transform(X[col].astype(str))
            encoders[col] = encoder
        
        # Train-test split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=self.random_state
        )
        
        # Scale features
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        # Train CatBoost model (best performer)
        model = CatBoostRegressor(
            iterations=1000,
            learning_rate=0.1,
            depth=6,
            random_state=self.random_state,
            verbose=False
        )
        
        model.fit(X_train_scaled, y_train)
        
        # Evaluate
        y_pred = model.predict(X_test_scaled)
        r2 = r2_score(y_test, y_pred)
        mape = mean_absolute_percentage_error(y_test, y_pred)
        mae = mean_absolute_error(y_test, y_pred)
        
        # Save model and artifacts
        model_dir = self.model_dir / "tanah"
        model_dir.mkdir(parents=True, exist_ok=True)
        
        # Save files
        joblib.dump(model, model_dir / f"rental_price_model_{timestamp}.pkl")
        joblib.dump(scaler, model_dir / f"scaler_{timestamp}.pkl")
        joblib.dump(features, model_dir / f"features_{timestamp}.pkl")
        joblib.dump(encoders, model_dir / f"encoders_{timestamp}.pkl")
        
        # Save metadata
        metadata = {
            'model_info': {
                'name': 'CatBoost_Tanah_Regressor',
                'timestamp': timestamp,
                'features_count': len(features)
            },
            'performance': {
                'test_r2': float(r2),
                'test_mape': float(mape),
                'test_mae': float(mae)
            },
            'data_info': {
                'total_samples': len(df_clean),
                'features_count': len(features),
                'target_column': target_col
            }
        }
        
        with open(model_dir / f"metadata_{timestamp}.json", 'w') as f:
            json.dump(metadata, f, indent=2)
        
        print(f"💾 Model tanah tersimpan di: {model_dir}")
        
        return {
            'model_type': 'tanah',
            'timestamp': timestamp,
            'performance': metadata['performance'],
            'data_info': metadata['data_info']
        }
    
    def _train_bangunan_model(self, csv_path, timestamp):
        """Training model untuk prediksi bangunan"""
        
        # Load data
        df = pd.read_csv(csv_path)
        print(f"📊 Data bangunan loaded: {df.shape}")
        
        # Data preprocessing
        df_clean = df.dropna()
        
        # Convert data types for problematic columns in bangunan dataset
        if 'Terjangkau Internet' in df_clean.columns:
            # Convert text to numeric: 'Ya' -> 1, 'Tidak' -> 0
            df_clean['Terjangkau Internet'] = df_clean['Terjangkau Internet'].map({'Ya': 1, 'Tidak': 0}).fillna(0)
            
        if 'Hook' in df_clean.columns:
            # Convert text to numeric: 'Ya' -> 1, 'Tidak' -> 0  
            df_clean['Hook'] = df_clean['Hook'].map({'Ya': 1, 'Tidak': 0}).fillna(0)
        
        # Prepare features and target
        target_col = 'Sewa per Bulan (Rp)'
        
        # Rename columns to match model expectations
        df_clean = df_clean.rename(columns={
            'Luas Tanah (M²)': 'Luas Tanah (m²)',
            'Luas Bangunan (M²)': 'Luas Bangunan (m²)', 
            'Njop (Rp/M²)': 'NJOP (Rp/m²)'
        })
        
        # Add default features that model expects but not in form (only if not exists)
        defaults = {
            'Kamar Tidur': 2,
            'Kamar Mandi': 1,
            'Daya Listrik (watt)': 1300,
            'Ruang Makan': 1,
            'Ruang Tamu': 1,
            'Kondisi Perabotan': 'Furnished',
            'Hadap': 'Timur',
            'Terjangkau Internet': 1,
            'Lebar Jalan (m)': 3.5,
            'Sumber Air': 'PDAM',
            'Hook': 0,
            'Kondisi Properti': 'Baik'
        }
        
        # Only add defaults for missing columns
        for col, default_val in defaults.items():
            if col not in df_clean.columns:
                df_clean[col] = default_val
                print(f"  📝 Added default for {col}: {default_val}")
            else:
                print(f"  ✅ Column {col} already exists in dataset")
        
        # Feature engineering
        df_clean['Building_Efficiency'] = df_clean['Luas Bangunan (m²)'] / df_clean['Luas Tanah (m²)']
        df_clean['Total_NJOP_Value'] = df_clean['NJOP (Rp/m²)'] * df_clean['Luas Tanah (m²)']
        df_clean['Floor_Space_Efficiency'] = df_clean['Luas Bangunan (m²)'] / df_clean['Jumlah Lantai']
        
        # NJOP Category for bangunan
        df_clean['NJOP_Category'] = pd.cut(
            df_clean['NJOP (Rp/m²)'], 
            bins=[0, 3000000, 5000000, float('inf')], 
            labels=[0, 1, 2]
        ).astype(int)
        
        # Define features (matching the model structure)
        categorical_cols = [
            'Kecamatan', 'Sertifikat', 'Kondisi Perabotan', 'Hadap', 
            'Sumber Air', 'Kondisi Properti', 'Aksesibilitas', 'Jenis Zona'
        ]
        
        numerical_cols = [
            'NJOP (Rp/m²)', 'Luas Tanah (m²)', 'Luas Bangunan (m²)', 'Jumlah Lantai',
            'Kamar Tidur', 'Kamar Mandi', 'Daya Listrik (watt)', 'Ruang Makan', 'Ruang Tamu',
            'Terjangkau Internet', 'Lebar Jalan (m)', 'Hook',
            'Building_Efficiency', 'Total_NJOP_Value', 'Floor_Space_Efficiency', 'NJOP_Category'
        ]
        
        features = categorical_cols + numerical_cols
        
        X = df_clean[features].copy()
        y = df_clean[target_col]
        
        # Encode categorical variables
        encoders = {}
        for col in categorical_cols:
            encoder = LabelEncoder()
            X[col] = encoder.fit_transform(X[col].astype(str))
            encoders[col] = encoder
        
        # Train-test split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=self.random_state
        )
        
        # Scale features
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        # Train CatBoost model
        model = CatBoostRegressor(
            iterations=1000,
            learning_rate=0.1,
            depth=6,
            random_state=self.random_state,
            verbose=False
        )
        
        model.fit(X_train_scaled, y_train)
        
        # Evaluate
        y_pred = model.predict(X_test_scaled)
        r2 = r2_score(y_test, y_pred)
        mape = mean_absolute_percentage_error(y_test, y_pred)
        mae = mean_absolute_error(y_test, y_pred)
        
        # Save model and artifacts
        model_dir = self.model_dir / "bangunan"
        model_dir.mkdir(parents=True, exist_ok=True)
        
        # Save files
        joblib.dump(model, model_dir / f"rental_price_model_{timestamp}.pkl")
        joblib.dump(scaler, model_dir / f"scaler_{timestamp}.pkl")
        joblib.dump(features, model_dir / f"features_{timestamp}.pkl")
        joblib.dump(encoders, model_dir / f"encoders_{timestamp}.pkl")
        
        # Save metadata
        metadata = {
            'model_info': {
                'name': 'CatBoost_Bangunan_Regressor',
                'timestamp': timestamp,
                'features_count': len(features)
            },
            'performance': {
                'test_r2': float(r2),
                'test_mape': float(mape),
                'test_mae': float(mae)
            },
            'data_info': {
                'total_samples': len(df_clean),
                'features_count': len(features),
                'target_column': target_col
            }
        }
        
        with open(model_dir / f"metadata_{timestamp}.json", 'w') as f:
            json.dump(metadata, f, indent=2)
        
        print(f"💾 Model bangunan tersimpan di: {model_dir}")
        
        return {
            'model_type': 'bangunan',
            'timestamp': timestamp,
            'performance': metadata['performance'],
            'data_info': metadata['data_info']
        }

def auto_train_from_uploads(uploaded_files):
    """
    Main function untuk auto training dari uploaded files
    
    Args:
        uploaded_files (list): List of (type, path) tuples
        
    Returns:
        dict: Training results
    """
    trainer = AutoModelTrainer()
    
    tanah_file = None
    bangunan_file = None
    
    # Parse uploaded files
    for file_type, file_path in uploaded_files:
        if file_type == 'tanah':
            tanah_file = file_path
        elif file_type == 'bangunan':
            bangunan_file = file_path
    
    # Start training
    print("🚀 Starting auto training...")
    results = trainer.train_models_from_files(tanah_file, bangunan_file)
    
    if results['success']:
        print(f"✅ Auto training completed successfully!")
        print(f"📊 Models trained: {len(results['models_trained'])}")
        for model_result in results['models_trained']:
            print(f"   - {model_result['model_type']}: R² = {model_result['performance']['test_r2']:.4f}")
    else:
        print(f"❌ Auto training completed with errors:")
        for error in results['errors']:
            print(f"   - {error}")
    
    return results

if __name__ == "__main__":
    # Test auto training
    print("🧪 Testing Auto Training System")
    print("="*50)
    
    # Example usage - use the uploaded files
    uploaded_files = [
        ('tanah', 'data/raw/Doubled_Dataset.csv'),
        ('bangunan', 'data/raw/Doubled_Building_Dataset.csv')
    ]
    
    results = auto_train_from_uploads(uploaded_files)
    print(f"\n🎯 Final Results: {results}")
