#!/usr/bin/env python3
"""
Test Script untuk Verifikasi Bug Fix Model Update
=================================================

Script ini menguji apakah model reload berfungsi dengan benar setelah training model baru.
"""

import os
import sys
import time
import json
from datetime import datetime
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent
sys.path.append(str(project_root))

def test_model_timestamps():
    """Test untuk melihat timestamp model yang dimuat"""
    print("🔍 TESTING MODEL TIMESTAMPS")
    print("="*50)
    
    try:
        from prediction_system import prediction_system
        
        # Get current model status
        status = prediction_system.get_model_status()
        
        print("📊 Current Model Status:")
        for model_type, info in status.items():
            if info['available']:
                print(f"  {model_type.upper()}:")
                print(f"    ✅ Available: {info['available']}")
                print(f"    📅 Timestamp: {info['timestamp']}")
                print(f"    📈 R² Score: {info['performance']['r2_score']:.4f}")
                print(f"    📉 MAPE: {info['performance']['mape']:.4f}")
            else:
                print(f"  {model_type.upper()}: ❌ Not Available")
        
        return status
        
    except Exception as e:
        print(f"❌ Error loading models: {e}")
        return None

def test_model_reload():
    """Test model reload functionality"""
    print("\n🔄 TESTING MODEL RELOAD")
    print("="*50)
    
    try:
        from prediction_system import prediction_system
        
        # Get timestamp before reload
        print("📅 Before reload:")
        status_before = prediction_system.get_model_status()
        timestamps_before = {}
        for model_type, info in status_before.items():
            if info['available']:
                timestamps_before[model_type] = info['timestamp']
                print(f"  {model_type}: {info['timestamp']}")
        
        # Perform reload
        print("\n🔄 Performing reload...")
        prediction_system.reload_models()
        
        # Get timestamp after reload
        print("\n📅 After reload:")
        status_after = prediction_system.get_model_status()
        timestamps_after = {}
        for model_type, info in status_after.items():
            if info['available']:
                timestamps_after[model_type] = info['timestamp']
                print(f"  {model_type}: {info['timestamp']}")
        
        # Compare timestamps
        print("\n🔍 Comparison:")
        for model_type in timestamps_before:
            if model_type in timestamps_after:
                if timestamps_before[model_type] == timestamps_after[model_type]:
                    print(f"  {model_type}: ✅ Same timestamp (no new model)")
                else:
                    print(f"  {model_type}: 🆕 Different timestamp (new model loaded)")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing reload: {e}")
        return False

def check_model_files():
    """Check what model files are available"""
    print("\n📁 CHECKING MODEL FILES")
    print("="*50)
    
    model_base_path = project_root / "model"
    
    for model_type in ['tanah', 'bangunan']:
        model_dir = model_base_path / model_type
        print(f"\n🏷️ {model_type.upper()} Models:")
        
        if model_dir.exists():
            # List all model files
            model_files = list(model_dir.glob("*.pkl"))
            metadata_files = list(model_dir.glob("*.json"))
            
            print(f"  📊 Model files found: {len(model_files)}")
            print(f"  📋 Metadata files found: {len(metadata_files)}")
            
            # Show latest files
            if model_files:
                timestamps = []
                for file in model_files:
                    parts = file.stem.split('_')
                    if len(parts) >= 3:
                        timestamp = '_'.join(parts[-2:])
                        timestamps.append(timestamp)
                
                if timestamps:
                    latest_timestamp = sorted(timestamps)[-1]
                    print(f"  📅 Latest timestamp: {latest_timestamp}")
                    
                    # List files with latest timestamp
                    latest_files = list(model_dir.glob(f"*{latest_timestamp}*"))
                    print(f"  📄 Latest files:")
                    for file in sorted(latest_files):
                        file_size = file.stat().st_size / 1024  # KB
                        print(f"    - {file.name} ({file_size:.1f} KB)")
        else:
            print(f"  ❌ Directory not found: {model_dir}")

def test_prediction_functionality():
    """Test if predictions still work after reload"""
    print("\n🎯 TESTING PREDICTION FUNCTIONALITY")
    print("="*50)
    
    try:
        from prediction_system import prediction_system
        
        # Test tanah prediction
        print("🏞️ Testing Tanah Prediction:")
        test_tanah_data = {
            'kecamatan': 'Gubeng',
            'njop': 3724000,
            'sertifikat': 'SHM',
            'luas_tanah': 1500,
            'jenis_zona': 'Komersial',
            'aksesibilitas': 'Baik',
            'tingkat_keamanan': 'tinggi',
            'kepadatan_penduduk': 75315
        }
        
        result = prediction_system.predict_land_price(test_tanah_data)
        if result['success']:
            print(f"  ✅ Prediction successful: {result['prediction']}")
        else:
            print(f"  ❌ Prediction failed: {result['error']}")
        
        # Test bangunan prediction
        print("\n🏢 Testing Bangunan Prediction:")
        test_bangunan_data = {
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
        
        result = prediction_system.predict_building_price(test_bangunan_data)
        if result['success']:
            print(f"  ✅ Prediction successful: {result['prediction']}")
        else:
            print(f"  ❌ Prediction failed: {result['error']}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing predictions: {e}")
        return False

def main():
    """Main test runner"""
    print("🧪 MODEL UPDATE BUG FIX VERIFICATION")
    print("="*60)
    print(f"📅 Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"📁 Project Root: {project_root}")
    
    # Run tests
    check_model_files()
    test_model_timestamps()
    test_model_reload()
    test_prediction_functionality()
    
    print(f"\n✨ BUG FIX SUMMARY")
    print("="*50)
    print("🔧 Changes Made:")
    print("  1. ✅ Added reload_models() method to PredictionSystem class")
    print("  2. ✅ Added /reload_models endpoint in routes")
    print("  3. ✅ Updated /api/model-updated to auto-reload models")
    print("  4. ✅ Added manual reload button in admin dashboard")
    print("  5. ✅ Added notification system in notebook")
    print("  6. ✅ Added dataset configuration in notebook")
    
    print(f"\n🎯 Expected Behavior:")
    print("  1. Upload new CSV files via admin dashboard")
    print("  2. Open notebook and update dataset paths")
    print("  3. Run notebook training - models save with new timestamp")
    print("  4. Notebook automatically notifies Flask app")
    print("  5. Flask app automatically reloads new models")
    print("  6. Predictions now use updated models")
    
    print(f"\n💡 Testing Instructions:")
    print("  1. Run this script to see current model timestamps")
    print("  2. Upload new CSV files and train models in notebook")
    print("  3. Run this script again to verify new timestamps")
    print("  4. Test predictions to confirm they use new models")

if __name__ == "__main__":
    main()
