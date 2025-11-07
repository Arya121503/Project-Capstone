#!/usr/bin/env python3
"""
Auto Training System untuk Model Prediksi Harga JUAL
=====================================================

Script ini akan otomatis training ensemble models (XGBoost, Random Forest, CatBoost, Voting Regressor)
untuk prediksi harga jual tanah dan bangunan ketika CSV baru diupload melalui dashboard admin.

FASE 2 IMPROVEMENT: Auto-upload & training untuk jual prediction
"""

import os
import sys
import pandas as pd
import numpy as np
import joblib
import json
from datetime import datetime
from pathlib import Path
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score, mean_absolute_percentage_error
from sklearn.ensemble import RandomForestRegressor, VotingRegressor
from xgboost import XGBRegressor
from catboost import CatBoostRegressor
import warnings
warnings.filterwarnings('ignore')

class AutoModelTrainerJual:
    """
    Auto training system untuk update model prediksi harga JUAL
    Menggunakan ensemble models untuk akurasi maksimal
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
        Training ensemble models dari file CSV yang diupload
        
        Args:
            tanah_file_path (str): Path ke file CSV tanah jual
            bangunan_file_path (str): Path ke file CSV bangunan jual
            
        Returns:
            dict: Hasil training dengan metrics untuk semua model
        """
        results = {
            'success': True,
            'models_trained': [],
            'errors': [],
            'timestamp': datetime.now().strftime("%Y%m%d_%H%M%S")
        }
        
        # Training model tanah jual
        if tanah_file_path and os.path.exists(tanah_file_path):
            try:
                print(f"🏞️ Training JUAL TANAH ensemble models dari: {tanah_file_path}")
                tanah_result = self._train_tanah_jual_ensemble(tanah_file_path, results['timestamp'])
                results['models_trained'].append(tanah_result)
                print(f"✅ Ensemble tanah jual berhasil dilatih!")
                print(f"   - Voting Regressor R²: {tanah_result['performance']['voting_r2']:.4f}")
            except Exception as e:
                error_msg = f"Error training tanah jual ensemble: {str(e)}"
                results['errors'].append(error_msg)
                print(f"❌ {error_msg}")
        
        # Training model bangunan jual
        if bangunan_file_path and os.path.exists(bangunan_file_path):
            try:
                print(f"🏢 Training JUAL BANGUNAN ensemble models dari: {bangunan_file_path}")
                bangunan_result = self._train_bangunan_jual_ensemble(bangunan_file_path, results['timestamp'])
                results['models_trained'].append(bangunan_result)
                print(f"✅ Ensemble bangunan jual berhasil dilatih!")
                print(f"   - Voting Regressor R²: {bangunan_result['performance']['voting_r2']:.4f}")
            except Exception as e:
                error_msg = f"Error training bangunan jual ensemble: {str(e)}"
                results['errors'].append(error_msg)
                print(f"❌ {error_msg}")
        
        if results['errors']:
            results['success'] = False
            
        return results
    
    def _train_tanah_jual_ensemble(self, csv_path, timestamp):
        """
        Training ensemble models untuk prediksi JUAL tanah
        Models: XGBoost, Random Forest, CatBoost, Voting Regressor
        """
        
        # Load data
        df = pd.read_csv(csv_path)
        print(f"📊 Data tanah jual loaded: {df.shape}")
        
        # Data preprocessing
        df_clean = df.dropna()
        
        # Prepare features and target
        target_col = 'Harga Jual (Rp)'
        
        # Features yang digunakan (sesuai dengan jual_aset.ipynb)
        feature_cols = [
            'Kecamatan', 'Sertifikat', 'Luas Tanah (M²)', 'Jenis Zona',
            'Aksesibilitas', 'Tingkat Keamanan', 'Kepadatan_Penduduk', 
            'Jarak ke Pusat Kota (km)'
        ]
        
        X = df_clean[feature_cols].copy()
        y = df_clean[target_col]
        
        # Encode categorical variables
        categorical_cols = ['Kecamatan', 'Sertifikat', 'Jenis Zona', 'Aksesibilitas', 'Tingkat Keamanan']
        
        encoders = {}
        for col in categorical_cols:
            encoder = LabelEncoder()
            X[col] = encoder.fit_transform(X[col].astype(str))
            encoders[col] = encoder
        
        # Train-test split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=self.random_state
        )
        
        print("🤖 Training ensemble models...")
        
        # 1. Train XGBoost
        print("   1/4 Training XGBoost...")
        xgb_model = XGBRegressor(
            n_estimators=300,
            learning_rate=0.05,
            max_depth=8,
            random_state=self.random_state,
            n_jobs=-1
        )
        xgb_model.fit(X_train, y_train)
        xgb_pred = xgb_model.predict(X_test)
        xgb_r2 = r2_score(y_test, xgb_pred)
        xgb_mape = mean_absolute_percentage_error(y_test, xgb_pred)
        print(f"      XGBoost R²: {xgb_r2:.4f}, MAPE: {xgb_mape:.4f}")
        
        # 2. Train Random Forest
        print("   2/4 Training Random Forest...")
        rf_model = RandomForestRegressor(
            n_estimators=300,
            max_depth=20,
            random_state=self.random_state,
            n_jobs=-1
        )
        rf_model.fit(X_train, y_train)
        rf_pred = rf_model.predict(X_test)
        rf_r2 = r2_score(y_test, rf_pred)
        rf_mape = mean_absolute_percentage_error(y_test, rf_pred)
        print(f"      Random Forest R²: {rf_r2:.4f}, MAPE: {rf_mape:.4f}")
        
        # 3. Train CatBoost
        print("   3/4 Training CatBoost...")
        cat_model = CatBoostRegressor(
            iterations=300,
            learning_rate=0.05,
            depth=8,
            random_state=self.random_state,
            verbose=False
        )
        cat_model.fit(X_train, y_train)
        cat_pred = cat_model.predict(X_test)
        cat_r2 = r2_score(y_test, cat_pred)
        cat_mape = mean_absolute_percentage_error(y_test, cat_pred)
        print(f"      CatBoost R²: {cat_r2:.4f}, MAPE: {cat_mape:.4f}")
        
        # 4. Train Voting Regressor (Ensemble)
        print("   4/4 Training Voting Regressor (Ensemble)...")
        voting_model = VotingRegressor([
            ('xgb', xgb_model),
            ('rf', rf_model),
            ('cat', cat_model)
        ])
        voting_model.fit(X_train, y_train)
        voting_pred = voting_model.predict(X_test)
        voting_r2 = r2_score(y_test, voting_pred)
        voting_mape = mean_absolute_percentage_error(y_test, voting_pred)
        voting_mae = mean_absolute_error(y_test, voting_pred)
        print(f"      Voting Regressor R²: {voting_r2:.4f}, MAPE: {voting_mape:.4f}")
        
        # Summary
        print("\n   === MODEL PERFORMANCE SUMMARY ===")
        print(f"   XGBoost:          R² = {xgb_r2:.4f}")
        print(f"   Random Forest:    R² = {rf_r2:.4f}")
        print(f"   CatBoost:         R² = {cat_r2:.4f}")
        print(f"   Voting Ensemble:  R² = {voting_r2:.4f} ⭐")
        
        # Save all models and artifacts
        model_dir = self.model_dir / "jual_tanah"
        model_dir.mkdir(parents=True, exist_ok=True)
        
        print(f"\n💾 Saving models to: {model_dir}")
        
        # Save individual models
        joblib.dump(xgb_model, model_dir / "xgboost.pkl")
        joblib.dump(rf_model, model_dir / "random_forest.pkl")
        joblib.dump(cat_model, model_dir / "catboost.pkl")
        joblib.dump(voting_model, model_dir / "voting_regressor.pkl")
        
        # Save encoders and feature names
        joblib.dump(encoders, model_dir / "label_encoders.pkl")
        joblib.dump(feature_cols, model_dir / "feature_names.pkl")
        
        # Save performance metrics as CSV
        performance_df = pd.DataFrame({
            'Model': ['XGBoost', 'Random Forest', 'CatBoost', 'Voting Regressor'],
            'R2_Score': [xgb_r2, rf_r2, cat_r2, voting_r2],
            'MAPE': [xgb_mape, rf_mape, cat_mape, voting_mape],
            'MAE': [
                mean_absolute_error(y_test, xgb_pred),
                mean_absolute_error(y_test, rf_pred),
                mean_absolute_error(y_test, cat_pred),
                voting_mae
            ]
        })
        performance_df.to_csv(model_dir / "model_performance.csv", index=False)
        
        # Save detailed metadata
        metadata = {
            'model_info': {
                'type': 'Ensemble - Jual Tanah',
                'timestamp': timestamp,
                'models': ['XGBoost', 'Random Forest', 'CatBoost', 'Voting Regressor'],
                'features_count': len(feature_cols)
            },
            'performance': {
                'xgboost_r2': float(xgb_r2),
                'random_forest_r2': float(rf_r2),
                'catboost_r2': float(cat_r2),
                'voting_r2': float(voting_r2),
                'voting_mape': float(voting_mape),
                'voting_mae': float(voting_mae)
            },
            'data_info': {
                'total_samples': len(df_clean),
                'train_samples': len(X_train),
                'test_samples': len(X_test),
                'features_count': len(feature_cols),
                'target_column': target_col
            },
            'features': feature_cols
        }
        
        with open(model_dir / f"metadata_{timestamp}.json", 'w') as f:
            json.dump(metadata, f, indent=2)
        
        print(f"✅ All models saved successfully!")
        
        return {
            'model_type': 'jual_tanah',
            'timestamp': timestamp,
            'performance': metadata['performance'],
            'data_info': metadata['data_info']
        }
    
    def _train_bangunan_jual_ensemble(self, csv_path, timestamp):
        """
        Training ensemble models untuk prediksi JUAL bangunan
        Models: XGBoost, Random Forest, CatBoost, Voting Regressor
        """
        
        # Load data
        df = pd.read_csv(csv_path)
        print(f"📊 Data bangunan jual loaded: {df.shape}")
        
        # Data preprocessing
        df_clean = df.dropna()
        
        # Prepare features and target
        target_col = 'Harga Jual (Rp)'
        
        # Features yang digunakan (sesuai dengan jual_aset.ipynb)
        feature_cols = [
            'Kecamatan', 'Sertifikat', 'Luas Tanah (M²)', 'Luas Bangunan (M²)',
            'Jenis Zona', 'Kondisi Bangunan', 'Jumlah Lantai', 'Tahun Dibangun',
            'Aksesibilitas', 'Tingkat Keamanan', 'Kepadatan_Penduduk',
            'Jarak ke Pusat Kota (km)'
        ]
        
        X = df_clean[feature_cols].copy()
        y = df_clean[target_col]
        
        # Encode categorical variables
        categorical_cols = ['Kecamatan', 'Sertifikat', 'Jenis Zona', 'Kondisi Bangunan', 
                           'Aksesibilitas', 'Tingkat Keamanan']
        
        encoders = {}
        for col in categorical_cols:
            encoder = LabelEncoder()
            X[col] = encoder.fit_transform(X[col].astype(str))
            encoders[col] = encoder
        
        # Train-test split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=self.random_state
        )
        
        print("🤖 Training ensemble models...")
        
        # 1. Train XGBoost
        print("   1/4 Training XGBoost...")
        xgb_model = XGBRegressor(
            n_estimators=300,
            learning_rate=0.05,
            max_depth=8,
            random_state=self.random_state,
            n_jobs=-1
        )
        xgb_model.fit(X_train, y_train)
        xgb_pred = xgb_model.predict(X_test)
        xgb_r2 = r2_score(y_test, xgb_pred)
        xgb_mape = mean_absolute_percentage_error(y_test, xgb_pred)
        print(f"      XGBoost R²: {xgb_r2:.4f}, MAPE: {xgb_mape:.4f}")
        
        # 2. Train Random Forest
        print("   2/4 Training Random Forest...")
        rf_model = RandomForestRegressor(
            n_estimators=300,
            max_depth=20,
            random_state=self.random_state,
            n_jobs=-1
        )
        rf_model.fit(X_train, y_train)
        rf_pred = rf_model.predict(X_test)
        rf_r2 = r2_score(y_test, rf_pred)
        rf_mape = mean_absolute_percentage_error(y_test, rf_pred)
        print(f"      Random Forest R²: {rf_r2:.4f}, MAPE: {rf_mape:.4f}")
        
        # 3. Train CatBoost
        print("   3/4 Training CatBoost...")
        cat_model = CatBoostRegressor(
            iterations=300,
            learning_rate=0.05,
            depth=8,
            random_state=self.random_state,
            verbose=False
        )
        cat_model.fit(X_train, y_train)
        cat_pred = cat_model.predict(X_test)
        cat_r2 = r2_score(y_test, cat_pred)
        cat_mape = mean_absolute_percentage_error(y_test, cat_pred)
        print(f"      CatBoost R²: {cat_r2:.4f}, MAPE: {cat_mape:.4f}")
        
        # 4. Train Voting Regressor (Ensemble)
        print("   4/4 Training Voting Regressor (Ensemble)...")
        voting_model = VotingRegressor([
            ('xgb', xgb_model),
            ('rf', rf_model),
            ('cat', cat_model)
        ])
        voting_model.fit(X_train, y_train)
        voting_pred = voting_model.predict(X_test)
        voting_r2 = r2_score(y_test, voting_pred)
        voting_mape = mean_absolute_percentage_error(y_test, voting_pred)
        voting_mae = mean_absolute_error(y_test, voting_pred)
        print(f"      Voting Regressor R²: {voting_r2:.4f}, MAPE: {voting_mape:.4f}")
        
        # Summary
        print("\n   === MODEL PERFORMANCE SUMMARY ===")
        print(f"   XGBoost:          R² = {xgb_r2:.4f}")
        print(f"   Random Forest:    R² = {rf_r2:.4f}")
        print(f"   CatBoost:         R² = {cat_r2:.4f}")
        print(f"   Voting Ensemble:  R² = {voting_r2:.4f} ⭐")
        
        # Save all models and artifacts
        model_dir = self.model_dir / "jual_bangunan"
        model_dir.mkdir(parents=True, exist_ok=True)
        
        print(f"\n💾 Saving models to: {model_dir}")
        
        # Save individual models
        joblib.dump(xgb_model, model_dir / "xgboost.pkl")
        joblib.dump(rf_model, model_dir / "random_forest.pkl")
        joblib.dump(cat_model, model_dir / "catboost.pkl")
        joblib.dump(voting_model, model_dir / "voting_regressor.pkl")
        
        # Save encoders and feature names
        joblib.dump(encoders, model_dir / "label_encoders.pkl")
        joblib.dump(feature_cols, model_dir / "feature_names.pkl")
        
        # Save performance metrics as CSV
        performance_df = pd.DataFrame({
            'Model': ['XGBoost', 'Random Forest', 'CatBoost', 'Voting Regressor'],
            'R2_Score': [xgb_r2, rf_r2, cat_r2, voting_r2],
            'MAPE': [xgb_mape, rf_mape, cat_mape, voting_mape],
            'MAE': [
                mean_absolute_error(y_test, xgb_pred),
                mean_absolute_error(y_test, rf_pred),
                mean_absolute_error(y_test, cat_pred),
                voting_mae
            ]
        })
        performance_df.to_csv(model_dir / "model_performance.csv", index=False)
        
        # Save detailed metadata
        metadata = {
            'model_info': {
                'type': 'Ensemble - Jual Bangunan',
                'timestamp': timestamp,
                'models': ['XGBoost', 'Random Forest', 'CatBoost', 'Voting Regressor'],
                'features_count': len(feature_cols)
            },
            'performance': {
                'xgboost_r2': float(xgb_r2),
                'random_forest_r2': float(rf_r2),
                'catboost_r2': float(cat_r2),
                'voting_r2': float(voting_r2),
                'voting_mape': float(voting_mape),
                'voting_mae': float(voting_mae)
            },
            'data_info': {
                'total_samples': len(df_clean),
                'train_samples': len(X_train),
                'test_samples': len(X_test),
                'features_count': len(feature_cols),
                'target_column': target_col
            },
            'features': feature_cols
        }
        
        with open(model_dir / f"metadata_{timestamp}.json", 'w') as f:
            json.dump(metadata, f, indent=2)
        
        print(f"✅ All models saved successfully!")
        
        return {
            'model_type': 'jual_bangunan',
            'timestamp': timestamp,
            'performance': metadata['performance'],
            'data_info': metadata['data_info']
        }

def auto_train_jual_from_uploads(uploaded_files):
    """
    Main function untuk auto training JUAL models dari uploaded files
    
    Args:
        uploaded_files (list): List of (type, path) tuples
                             type = 'jual_tanah' or 'jual_bangunan'
        
    Returns:
        dict: Training results dengan metrics untuk semua model
    """
    trainer = AutoModelTrainerJual()
    
    tanah_file = None
    bangunan_file = None
    
    # Parse uploaded files
    for file_type, file_path in uploaded_files:
        if file_type == 'jual_tanah':
            tanah_file = file_path
        elif file_type == 'jual_bangunan':
            bangunan_file = file_path
    
    # Start training
    print("🚀 Starting auto training for JUAL prediction models...")
    print("=" * 60)
    results = trainer.train_models_from_files(tanah_file, bangunan_file)
    
    if results['success']:
        print(f"\n✅ Auto training completed successfully!")
        print(f"📊 Models trained: {len(results['models_trained'])}")
        for model_result in results['models_trained']:
            print(f"\n   Model Type: {model_result['model_type']}")
            print(f"   Voting Regressor R²: {model_result['performance']['voting_r2']:.4f}")
            print(f"   Voting Regressor MAPE: {model_result['performance']['voting_mape']:.4f}")
    else:
        print(f"\n❌ Auto training completed with errors:")
        for error in results['errors']:
            print(f"   - {error}")
    
    print("=" * 60)
    return results

if __name__ == "__main__":
    # Test auto training untuk jual prediction
    print("🧪 Testing Auto Training System for JUAL PREDICTION")
    print("=" * 60)
    
    # Example usage - gunakan files yang sudah ada
    # Anda perlu punya CSV untuk jual tanah dan jual bangunan
    uploaded_files = [
        # ('jual_tanah', 'data/raw/jual_tanah_dataset.csv'),
        # ('jual_bangunan', 'data/raw/jual_bangunan_dataset.csv')
    ]
    
    if uploaded_files:
        results = auto_train_jual_from_uploads(uploaded_files)
        print(f"\n🎯 Final Results: {json.dumps(results, indent=2)}")
    else:
        print("\n⚠️  No dataset files specified.")
        print("📝 Please upload CSV files for jual tanah and/or jual bangunan first.")
        print("   Expected columns:")
        print("   - Jual Tanah: Kecamatan, Sertifikat, Luas Tanah (M²), Jenis Zona, etc.")
        print("   - Jual Bangunan: + Luas Bangunan (M²), Kondisi Bangunan, Jumlah Lantai, etc.")
