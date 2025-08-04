#!/usr/bin/env python3
"""
Production Model Training Script
Synchronized with notebook: aset_sewa_bulanan.ipynb
Compatible with web application prediction routes
"""

import pandas as pd
import numpy as np
import os
import joblib
import json
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

# ML imports
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import (
    mean_squared_error, 
    mean_absolute_error, 
    r2_score, 
    mean_absolute_percentage_error
)
from sklearn.ensemble import RandomForestRegressor, VotingRegressor
import xgboost as xgb
from catboost import CatBoostRegressor

# Configuration
RANDOM_STATE = 42
np.random.seed(RANDOM_STATE)

class ProductionModelTrainer:
    """
    Production model trainer synchronized with notebook standards
    """
    
    def __init__(self):
        self.models = None
        self.results = []
        self.trained_models = {}
        
    def get_models(self):
        """Define the 4 standard models"""
        return {
            'RandomForest': RandomForestRegressor(
                n_estimators=100,
                random_state=RANDOM_STATE,
                n_jobs=-1
            ),
            'XGBoost': xgb.XGBRegressor(
                n_estimators=100,
                random_state=RANDOM_STATE,
                n_jobs=-1,
                verbosity=0
            ),
            'CatBoost': CatBoostRegressor(
                iterations=100,
                random_state=RANDOM_STATE,
                verbose=False
            ),
            'VotingRegressor': VotingRegressor([
                ('rf', RandomForestRegressor(n_estimators=100, random_state=RANDOM_STATE, n_jobs=-1)),
                ('xgb', xgb.XGBRegressor(n_estimators=100, random_state=RANDOM_STATE, n_jobs=-1, verbosity=0)),
                ('cat', CatBoostRegressor(iterations=100, random_state=RANDOM_STATE, verbose=False))
            ])
        }
    
    def evaluate_model(self, y_true, y_pred, model_name, dataset_type):
        """Calculate the 4 standard evaluation metrics"""
        
        r2 = r2_score(y_true, y_pred)
        mae = mean_absolute_error(y_true, y_pred)
        rmse = np.sqrt(mean_squared_error(y_true, y_pred))
        mape = mean_absolute_percentage_error(y_true, y_pred) * 100
        
        return {
            'Model': model_name,
            'Dataset': dataset_type,
            'R²': r2,
            'MAPE': mape,
            'MAE': mae,
            'RMSE': rmse
        }
    
    def train_tanah_model(self):
        """Train models for tanah dataset"""
        print("🏞️ Training Tanah Models...")
        
        # Load dataset
        df_tanah = pd.read_csv('data/raw/Dataset_Tanah_Surabaya.csv')
        print(f"   📊 Loaded {len(df_tanah)} records")
        
        # Preprocessing
        df_clean = df_tanah.drop_duplicates()
        
        # Define features and target
        target_col = 'Sewa Per Bulan (Rp)'
        features = [col for col in df_clean.columns if col != target_col and col != 'Alamat']
        
        # Separate numerical and categorical
        numerical_cols = df_clean[features].select_dtypes(include=[np.number]).columns.tolist()
        categorical_cols = df_clean[features].select_dtypes(include=['object']).columns.tolist()
        
        # Encode categorical variables
        df_encoded = df_clean.copy()
        encoders = {}
        
        for col in categorical_cols:
            encoder = LabelEncoder()
            df_encoded[col] = encoder.fit_transform(df_encoded[col].astype(str))
            encoders[col] = encoder
        
        # Prepare data
        X = df_encoded[features]
        y = df_encoded[target_col]
        
        # Train-test split (80:20)
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=RANDOM_STATE, shuffle=True
        )
        
        # Feature scaling
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        # Train models
        models = self.get_models()
        tanah_results = []
        tanah_models = {}
        
        for model_name, model in models.items():
            print(f"   🔄 Training {model_name}...")
            
            try:
                model.fit(X_train_scaled, y_train)
                y_pred = model.predict(X_test_scaled)
                
                results = self.evaluate_model(y_test, y_pred, model_name, 'Tanah')
                tanah_results.append(results)
                tanah_models[model_name] = model
                
                print(f"      ✅ R²: {results['R²']:.4f}, MAPE: {results['MAPE']:.2f}%")
                
            except Exception as e:
                print(f"      ❌ Failed: {e}")
        
        # Save best model
        best_result = max(tanah_results, key=lambda x: x['R²'])
        best_model = tanah_models[best_result['Model']]
        
        self._save_model(best_model, scaler, features, best_result, 'tanah', target_col)
        
        return tanah_results
    
    def train_bangunan_model(self):
        """Train models for bangunan dataset"""
        print("🏢 Training Bangunan Models...")
        
        # Load dataset
        df_bangunan = pd.read_csv('data/raw/Dataset_Bangunan_Surabaya.csv')
        print(f"   📊 Loaded {len(df_bangunan)} records")
        
        # Preprocessing
        df_clean = df_bangunan.drop_duplicates()
        
        # Define key features (aligned with web app)
        target_col = 'Sewa per Bulan (Rp)'
        key_features = [
            'Kecamatan', 'NJOP (Rp/m²)', 'Sertifikat', 'Luas Tanah (m²)', 
            'Luas Bangunan (m²)', 'Jumlah Lantai', 'Jenis Zona', 
            'Aksesibilitas', 'Tingkat Keamanan'
        ]
        
        # Filter available features
        features = [f for f in key_features if f in df_clean.columns]
        
        # Separate numerical and categorical
        numerical_cols = df_clean[features].select_dtypes(include=[np.number]).columns.tolist()
        categorical_cols = df_clean[features].select_dtypes(include=['object']).columns.tolist()
        
        # Encode categorical variables
        df_encoded = df_clean.copy()
        encoders = {}
        
        for col in categorical_cols:
            encoder = LabelEncoder()
            df_encoded[col] = encoder.fit_transform(df_encoded[col].astype(str))
            encoders[col] = encoder
        
        # Prepare data
        X = df_encoded[features]
        y = df_encoded[target_col]
        
        # Train-test split (80:20)
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=RANDOM_STATE, shuffle=True
        )
        
        # Feature scaling
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        # Train models
        models = self.get_models()
        bangunan_results = []
        bangunan_models = {}
        
        for model_name, model in models.items():
            print(f"   🔄 Training {model_name}...")
            
            try:
                model.fit(X_train_scaled, y_train)
                y_pred = model.predict(X_test_scaled)
                
                results = self.evaluate_model(y_test, y_pred, model_name, 'Bangunan')
                bangunan_results.append(results)
                bangunan_models[model_name] = model
                
                print(f"      ✅ R²: {results['R²']:.4f}, MAPE: {results['MAPE']:.2f}%")
                
            except Exception as e:
                print(f"      ❌ Failed: {e}")
        
        # Save best model
        best_result = max(bangunan_results, key=lambda x: x['R²'])
        best_model = bangunan_models[best_result['Model']]
        
        self._save_model(best_model, scaler, features, best_result, 'bangunan', target_col)
        
        return bangunan_results
    
    def _save_model(self, model, scaler, features, results, dataset_type, target_col):
        """Save model in production format"""
        
        # Create directory
        model_dir = f'model/{dataset_type}'
        os.makedirs(model_dir, exist_ok=True)
        
        # Save model components
        joblib.dump(model, f'{model_dir}/rental_price_model.pkl')
        joblib.dump(scaler, f'{model_dir}/scaler.pkl')
        joblib.dump(features, f'{model_dir}/feature_names.pkl')
        
        # Save metadata
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        metadata = {
            'model_name': results['Model'],
            'model_type': type(model).__name__,
            'training_timestamp': timestamp,
            'dataset': f'Dataset_{dataset_type.title()}_Surabaya.csv',
            'features': features,
            'target_column': target_col,
            'performance': {
                'r2_score': float(results['R²']),
                'mape': float(results['MAPE']),
                'mae': float(results['MAE']),
                'rmse': float(results['RMSE'])
            },
            'data_split': {'train': 0.8, 'test': 0.2},
            'random_state': RANDOM_STATE
        }
        
        with open(f'{model_dir}/model_metadata.json', 'w') as f:
            json.dump(metadata, f, indent=2)
        
        print(f"   💾 Model saved: {model_dir}/")
        print(f"   🏆 Best model: {results['Model']} (R²: {results['R²']:.4f})")

def main():
    """Main training function"""
    print("🚀 PRODUCTION MODEL TRAINING")
    print("="*50)
    print("📊 Data Split: 80:20")
    print("🤖 Models: RandomForest, XGBoost, CatBoost, VotingRegressor")
    print("📈 Metrics: R², MAPE, MAE, RMSE")
    print("🔗 Web App Compatible: ✅")
    print()
    
    trainer = ProductionModelTrainer()
    
    try:
        # Train tanah models
        tanah_results = trainer.train_tanah_model()
        print()
        
        # Train bangunan models
        bangunan_results = trainer.train_bangunan_model()
        print()
        
        # Summary
        all_results = tanah_results + bangunan_results
        avg_r2 = np.mean([r['R²'] for r in all_results])
        avg_mape = np.mean([r['MAPE'] for r in all_results])
        
        print("="*50)
        print("🎯 TRAINING SUMMARY")
        print("="*50)
        print(f"📊 Total models trained: {len(all_results)}")
        print(f"📈 Average R²: {avg_r2:.4f}")
        print(f"📈 Average MAPE: {avg_mape:.2f}%")
        print("✅ Models ready for web application!")
        print("🔗 Compatible with dashboard admin features!")
        
    except Exception as e:
        print(f"❌ Training failed: {e}")
        return False
    
    return True

if __name__ == "__main__":
    success = main()
    if success:
        print("\n🎉 Training completed successfully!")
    else:
        print("\n💥 Training failed!")
