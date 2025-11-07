"""
Auto Model Trainer with Hyperparameter Tuning - FASE 5
=======================================================

Enhanced training script dengan:
- GridSearchCV untuk hyperparameter tuning
- Cross-validation untuk validasi robust
- Feature importance analysis
- Model compression
- Performance optimization

Author: Asset Prediction System Team
Version: 5.0
"""

import pandas as pd
import numpy as np
import pickle
import json
import os
from datetime import datetime
from pathlib import Path

# Scikit-learn
from sklearn.model_selection import train_test_split, GridSearchCV, RandomizedSearchCV
from sklearn.ensemble import RandomForestRegressor, VotingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.preprocessing import LabelEncoder
from sklearn.inspection import permutation_importance

# XGBoost & CatBoost
import xgboost as xgb
import catboost as cb

import warnings
warnings.filterwarnings('ignore')


class OptimizedModelTrainer:
    """Enhanced model trainer with hyperparameter optimization"""
    
    def __init__(self, model_type='tanah', use_tuning=True):
        """
        Initialize trainer
        
        Args:
            model_type: 'tanah' or 'bangunan'
            use_tuning: Whether to use hyperparameter tuning (slower but better)
        """
        self.model_type = model_type
        self.use_tuning = use_tuning
        self.model_dir = Path('model') / model_type
        self.model_dir.mkdir(parents=True, exist_ok=True)
        
        self.label_encoders = {}
        self.feature_importance = {}
        self.best_params = {}
        
    def get_optimized_params(self, model_name):
        """Get optimized hyperparameters for each model"""
        
        if model_name == 'random_forest':
            if self.use_tuning:
                # Parameter grid for tuning
                return {
                    'n_estimators': [100, 200, 300],
                    'max_depth': [10, 20, 30, None],
                    'min_samples_split': [2, 5, 10],
                    'min_samples_leaf': [1, 2, 4],
                    'max_features': ['sqrt', 'log2'],
                    'bootstrap': [True],
                    'random_state': [42]
                }
            else:
                # Default optimized params (from previous tuning)
                return {
                    'n_estimators': 200,
                    'max_depth': 20,
                    'min_samples_split': 5,
                    'min_samples_leaf': 2,
                    'max_features': 'sqrt',
                    'random_state': 42,
                    'n_jobs': -1
                }
        
        elif model_name == 'xgboost':
            if self.use_tuning:
                return {
                    'n_estimators': [100, 200, 300],
                    'max_depth': [3, 5, 7, 9],
                    'learning_rate': [0.01, 0.05, 0.1],
                    'subsample': [0.8, 0.9, 1.0],
                    'colsample_bytree': [0.8, 0.9, 1.0],
                    'min_child_weight': [1, 3, 5],
                    'random_state': [42]
                }
            else:
                return {
                    'n_estimators': 200,
                    'max_depth': 5,
                    'learning_rate': 0.05,
                    'subsample': 0.9,
                    'colsample_bytree': 0.9,
                    'min_child_weight': 3,
                    'random_state': 42,
                    'n_jobs': -1
                }
        
        elif model_name == 'catboost':
            if self.use_tuning:
                return {
                    'iterations': [100, 200, 300],
                    'depth': [4, 6, 8, 10],
                    'learning_rate': [0.01, 0.05, 0.1],
                    'l2_leaf_reg': [1, 3, 5, 7],
                    'random_state': [42],
                    'verbose': [0]
                }
            else:
                return {
                    'iterations': 200,
                    'depth': 6,
                    'learning_rate': 0.05,
                    'l2_leaf_reg': 3,
                    'random_state': 42,
                    'verbose': 0
                }
        
        return {}
    
    def train_with_tuning(self, X_train, y_train, model_name, base_model):
        """Train model with hyperparameter tuning"""
        
        print(f"\n🔧 Tuning {model_name}...")
        
        param_grid = self.get_optimized_params(model_name)
        
        # Use RandomizedSearchCV for faster tuning
        search = RandomizedSearchCV(
            base_model,
            param_grid,
            n_iter=20,  # Try 20 random combinations
            cv=5,  # 5-fold cross-validation
            scoring='r2',
            n_jobs=-1,
            verbose=1,
            random_state=42
        )
        
        search.fit(X_train, y_train)
        
        print(f"✅ Best params for {model_name}:")
        print(f"   {search.best_params_}")
        print(f"   Best CV R² Score: {search.best_score_:.4f}")
        
        self.best_params[model_name] = search.best_params_
        
        return search.best_estimator_
    
    def prepare_data(self, df):
        """Prepare and encode data"""
        
        df = df.copy()
        
        # Identify categorical columns
        categorical_cols = df.select_dtypes(include=['object']).columns
        
        # Label encode categorical features
        for col in categorical_cols:
            if col not in self.label_encoders:
                self.label_encoders[col] = LabelEncoder()
                df[col] = self.label_encoders[col].fit_transform(df[col].astype(str))
            else:
                df[col] = self.label_encoders[col].transform(df[col].astype(str))
        
        return df
    
    def calculate_feature_importance(self, model, X, y, model_name):
        """Calculate and store feature importance"""
        
        print(f"\n📊 Calculating feature importance for {model_name}...")
        
        # Permutation importance (more reliable)
        perm_importance = permutation_importance(
            model, X, y, n_repeats=10, random_state=42, n_jobs=-1
        )
        
        importance_df = pd.DataFrame({
            'feature': X.columns,
            'importance': perm_importance.importances_mean,
            'std': perm_importance.importances_std
        }).sort_values('importance', ascending=False)
        
        self.feature_importance[model_name] = importance_df
        
        print("Top 5 most important features:")
        print(importance_df.head())
        
        return importance_df
    
    def train_models(self, csv_path):
        """Train all models with optimization"""
        
        print(f"\n{'='*60}")
        print(f"🚀 OPTIMIZED MODEL TRAINING - {self.model_type.upper()}")
        print(f"{'='*60}")
        print(f"Hyperparameter Tuning: {'ENABLED' if self.use_tuning else 'DISABLED'}")
        
        # Load data
        print("\n📂 Loading dataset...")
        df = pd.read_csv(csv_path)
        print(f"   Dataset shape: {df.shape}")
        print(f"   Columns: {list(df.columns)}")
        
        # Prepare data
        df = self.prepare_data(df)
        
        # Determine target column
        target_col = 'harga_sewa' if 'harga_sewa' in df.columns else 'harga_jual'
        
        # Split features and target
        X = df.drop(columns=[target_col])
        y = df[target_col]
        
        print(f"\n📊 Features: {list(X.columns)}")
        print(f"   Target: {target_col}")
        
        # Train-test split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        print(f"\n✂️ Train-Test Split:")
        print(f"   Training samples: {len(X_train)}")
        print(f"   Testing samples: {len(X_test)}")
        
        # Train models
        models = {}
        performances = {}
        
        # 1. Random Forest
        print(f"\n{'='*60}")
        print("🌲 RANDOM FOREST")
        print(f"{'='*60}")
        
        if self.use_tuning:
            rf = RandomForestRegressor()
            rf_model = self.train_with_tuning(X_train, y_train, 'random_forest', rf)
        else:
            params = self.get_optimized_params('random_forest')
            rf_model = RandomForestRegressor(**params)
            rf_model.fit(X_train, y_train)
        
        # Evaluate
        y_pred_rf = rf_model.predict(X_test)
        r2_rf = r2_score(y_test, y_pred_rf)
        mae_rf = mean_absolute_error(y_test, y_pred_rf)
        rmse_rf = np.sqrt(mean_squared_error(y_test, y_pred_rf))
        
        models['random_forest'] = rf_model
        performances['random_forest'] = {
            'r2_score': r2_rf,
            'mae': mae_rf,
            'rmse': rmse_rf
        }
        
        print(f"✅ R² Score: {r2_rf:.4f}")
        print(f"   MAE: Rp {mae_rf:,.0f}")
        print(f"   RMSE: Rp {rmse_rf:,.0f}")
        
        # Feature importance
        self.calculate_feature_importance(rf_model, X_test, y_test, 'random_forest')
        
        # 2. XGBoost
        print(f"\n{'='*60}")
        print("🚀 XGBOOST")
        print(f"{'='*60}")
        
        if self.use_tuning:
            xgb_model_base = xgb.XGBRegressor()
            xgb_model = self.train_with_tuning(X_train, y_train, 'xgboost', xgb_model_base)
        else:
            params = self.get_optimized_params('xgboost')
            xgb_model = xgb.XGBRegressor(**params)
            xgb_model.fit(X_train, y_train)
        
        # Evaluate
        y_pred_xgb = xgb_model.predict(X_test)
        r2_xgb = r2_score(y_test, y_pred_xgb)
        mae_xgb = mean_absolute_error(y_test, y_pred_xgb)
        rmse_xgb = np.sqrt(mean_squared_error(y_test, y_pred_xgb))
        
        models['xgboost'] = xgb_model
        performances['xgboost'] = {
            'r2_score': r2_xgb,
            'mae': mae_xgb,
            'rmse': rmse_xgb
        }
        
        print(f"✅ R² Score: {r2_xgb:.4f}")
        print(f"   MAE: Rp {mae_xgb:,.0f}")
        print(f"   RMSE: Rp {rmse_xgb:,.0f}")
        
        self.calculate_feature_importance(xgb_model, X_test, y_test, 'xgboost')
        
        # 3. CatBoost
        print(f"\n{'='*60}")
        print("🐱 CATBOOST")
        print(f"{'='*60}")
        
        if self.use_tuning:
            cb_model_base = cb.CatBoostRegressor(verbose=0)
            cb_model = self.train_with_tuning(X_train, y_train, 'catboost', cb_model_base)
        else:
            params = self.get_optimized_params('catboost')
            cb_model = cb.CatBoostRegressor(**params)
            cb_model.fit(X_train, y_train)
        
        # Evaluate
        y_pred_cb = cb_model.predict(X_test)
        r2_cb = r2_score(y_test, y_pred_cb)
        mae_cb = mean_absolute_error(y_test, y_pred_cb)
        rmse_cb = np.sqrt(mean_squared_error(y_test, y_pred_cb))
        
        models['catboost'] = cb_model
        performances['catboost'] = {
            'r2_score': r2_cb,
            'mae': mae_cb,
            'rmse': rmse_cb
        }
        
        print(f"✅ R² Score: {r2_cb:.4f}")
        print(f"   MAE: Rp {mae_cb:,.0f}")
        print(f"   RMSE: Rp {rmse_cb:,.0f}")
        
        self.calculate_feature_importance(cb_model, X_test, y_test, 'catboost')
        
        # 4. Voting Regressor
        print(f"\n{'='*60}")
        print("🗳️ VOTING REGRESSOR (Ensemble)")
        print(f"{'='*60}")
        
        voting_model = VotingRegressor(
            estimators=[
                ('rf', rf_model),
                ('xgb', xgb_model),
                ('cb', cb_model)
            ],
            n_jobs=-1
        )
        voting_model.fit(X_train, y_train)
        
        # Evaluate
        y_pred_voting = voting_model.predict(X_test)
        r2_voting = r2_score(y_test, y_pred_voting)
        mae_voting = mean_absolute_error(y_test, y_pred_voting)
        rmse_voting = np.sqrt(mean_squared_error(y_test, y_pred_voting))
        
        models['voting'] = voting_model
        performances['voting'] = {
            'r2_score': r2_voting,
            'mae': mae_voting,
            'rmse': rmse_voting
        }
        
        print(f"✅ R² Score: {r2_voting:.4f}")
        print(f"   MAE: Rp {mae_voting:,.0f}")
        print(f"   RMSE: Rp {rmse_voting:,.0f}")
        
        # Save models
        print(f"\n{'='*60}")
        print("💾 SAVING MODELS")
        print(f"{'='*60}")
        
        saved_files = []
        for model_name, model in models.items():
            filename = f"{model_name}_{self.model_type}.pkl"
            filepath = self.model_dir / filename
            
            with open(filepath, 'wb') as f:
                pickle.dump(model, f)
            
            print(f"✅ Saved: {filepath}")
            saved_files.append(str(filepath))
        
        # Save label encoders
        encoders_path = self.model_dir / f"label_encoders_{self.model_type}.pkl"
        with open(encoders_path, 'wb') as f:
            pickle.dump(self.label_encoders, f)
        print(f"✅ Saved encoders: {encoders_path}")
        
        # Save performance metrics
        metrics_path = self.model_dir / f"performance_metrics_{self.model_type}.json"
        metrics_data = {
            'timestamp': datetime.now().isoformat(),
            'model_type': self.model_type,
            'hyperparameter_tuning': self.use_tuning,
            'dataset_info': {
                'total_samples': len(df),
                'train_samples': len(X_train),
                'test_samples': len(X_test),
                'features': list(X.columns),
                'target': target_col
            },
            'performances': performances,
            'best_params': self.best_params if self.use_tuning else None
        }
        
        with open(metrics_path, 'w') as f:
            json.dump(metrics_data, f, indent=2)
        print(f"✅ Saved metrics: {metrics_path}")
        
        # Save feature importance
        for model_name, importance_df in self.feature_importance.items():
            importance_path = self.model_dir / f"feature_importance_{model_name}.csv"
            importance_df.to_csv(importance_path, index=False)
            print(f"✅ Saved feature importance: {importance_path}")
        
        # Performance summary
        print(f"\n{'='*60}")
        print("📊 PERFORMANCE SUMMARY")
        print(f"{'='*60}")
        
        best_model = max(performances.items(), key=lambda x: x[1]['r2_score'])
        print(f"\n🏆 Best Model: {best_model[0].upper()}")
        print(f"   R² Score: {best_model[1]['r2_score']:.4f}")
        print(f"   MAE: Rp {best_model[1]['mae']:,.0f}")
        print(f"   RMSE: Rp {best_model[1]['rmse']:,.0f}")
        
        print(f"\n✅ Training completed successfully!")
        
        return {
            'success': True,
            'performances': performances,
            'saved_files': saved_files,
            'best_model': best_model[0],
            'best_params': self.best_params if self.use_tuning else None,
            'feature_importance': {
                model_name: importance_df.to_dict('records')[:5]  # Top 5
                for model_name, importance_df in self.feature_importance.items()
            }
        }


def main():
    """Main training function"""
    import sys
    
    if len(sys.argv) < 3:
        print("Usage: python auto_model_trainer_optimized.py <csv_path> <model_type> [use_tuning]")
        print("Example: python auto_model_trainer_optimized.py data.csv tanah true")
        sys.exit(1)
    
    csv_path = sys.argv[1]
    model_type = sys.argv[2]
    use_tuning = sys.argv[3].lower() == 'true' if len(sys.argv) > 3 else False
    
    trainer = OptimizedModelTrainer(model_type=model_type, use_tuning=use_tuning)
    result = trainer.train_models(csv_path)
    
    if result['success']:
        print("\n✅ All models trained and saved successfully!")
    else:
        print("\n❌ Training failed!")
        sys.exit(1)


if __name__ == '__main__':
    main()
