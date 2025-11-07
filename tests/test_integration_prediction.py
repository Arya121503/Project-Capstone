"""
Integration Tests for Prediction System (FASE 4)
=================================================

End-to-end testing untuk complete workflow:
Upload → Train → Predict → Validate → Log → Analytics

Run tests:
    python -m pytest tests/test_integration_prediction.py -v -s
"""

import pytest
import requests
import json
import os
import time
from pathlib import Path
import pandas as pd

# Configuration
BASE_URL = "http://localhost:5000"
TEST_DATA_DIR = Path(__file__).parent / "test_data"

@pytest.fixture(scope="module")
def ensure_test_data_dir():
    """Ensure test data directory exists"""
    TEST_DATA_DIR.mkdir(exist_ok=True)
    return TEST_DATA_DIR

@pytest.fixture(scope="module")
def sample_rental_tanah_dataset(ensure_test_data_dir):
    """Create sample dataset for rental land prediction"""
    data = {
        'kecamatan': ['Gubeng', 'Mulyorejo', 'Sukolilo', 'Rungkut', 'Tenggilis Mejoyo'] * 20,
        'njop': [3724000, 3500000, 3200000, 2800000, 2500000] * 20,
        'sertifikat': ['SHM', 'HGB', 'SHM', 'HP', 'Girik'] * 20,
        'luas_tanah': [500, 400, 600, 350, 450] * 20,
        'jenis_zona': ['Komersial', 'Residensial', 'Komersial', 'Residensial', 'Industri'] * 20,
        'aksesibilitas': ['Baik', 'Sedang', 'Baik', 'Sedang', 'Buruk'] * 20,
        'tingkat_keamanan': ['tinggi', 'sedang', 'tinggi', 'sedang', 'rendah'] * 20,
        'kepadatan_penduduk': [123961, 95000, 110000, 88000, 92000] * 20,
        'harga_sewa': [50000000, 35000000, 45000000, 30000000, 28000000] * 20
    }
    
    df = pd.DataFrame(data)
    csv_path = TEST_DATA_DIR / "sample_rental_tanah.csv"
    df.to_csv(csv_path, index=False)
    
    return csv_path

@pytest.fixture(scope="module")
def sample_jual_tanah_dataset(ensure_test_data_dir):
    """Create sample dataset for sale land prediction"""
    data = {
        'kecamatan': ['Gubeng', 'Mulyorejo', 'Sukolilo', 'Rungkut', 'Tenggilis Mejoyo'] * 20,
        'njop': [3724000, 3500000, 3200000, 2800000, 2500000] * 20,
        'sertifikat': ['SHM', 'HGB', 'SHM', 'HP', 'Girik'] * 20,
        'luas_tanah': [500, 400, 600, 350, 450] * 20,
        'harga_jual': [2500000000, 1800000000, 2200000000, 1500000000, 1400000000] * 20
    }
    
    df = pd.DataFrame(data)
    csv_path = TEST_DATA_DIR / "sample_jual_tanah.csv"
    df.to_csv(csv_path, index=False)
    
    return csv_path


class TestCompleteRentalWorkflow:
    """Test complete workflow for rental prediction"""
    
    def test_01_upload_and_train_rental_model(self, sample_rental_tanah_dataset):
        """Step 1: Upload dataset and train rental model"""
        url = f"{BASE_URL}/upload_rental_dataset"
        
        with open(sample_rental_tanah_dataset, 'rb') as f:
            files = {'file': f}
            data = {'model_type': 'tanah'}
            
            response = requests.post(url, files=files, data=data)
        
        assert response.status_code == 200
        result = response.json()
        
        assert result['success'] == True
        assert 'performance' in result
        assert 'voting' in result['performance']
        
        # Check that model performance is reasonable
        r2_score = result['performance']['voting']['r2_score']
        assert r2_score > 0.5, f"R² score too low: {r2_score}"
        
        print(f"\n✅ Training completed - R² Score: {r2_score:.4f}")
        
        # Wait for model to be loaded
        time.sleep(2)
    
    def test_02_predict_rental_land_valid_input(self):
        """Step 2: Make prediction with valid input"""
        url = f"{BASE_URL}/predict_land_price"
        
        data = {
            "kecamatan": "Gubeng",
            "njop": 3724000,
            "sertifikat": "SHM",
            "luas_tanah": 500,
            "jenis_zona": "Komersial",
            "aksesibilitas": "Baik",
            "tingkat_keamanan": "tinggi",
            "kepadatan_penduduk": 123961
        }
        
        response = requests.post(url, json=data)
        
        assert response.status_code == 200
        result = response.json()
        
        assert result['success'] == True
        assert 'prediction' in result
        assert 'prediction_value' in result
        assert 'confidence' in result
        
        # Check confidence structure
        confidence = result['confidence']
        assert 'confidence_score' in confidence
        assert 'confidence_level' in confidence
        assert 'cv_percentage' in confidence
        
        # Check prediction value is reasonable
        prediction_value = result['prediction_value']
        assert prediction_value > 0
        assert prediction_value < 1000000000  # Less than 1 billion
        
        print(f"\n✅ Prediction: {result['prediction']}")
        print(f"   Confidence: {confidence['confidence_score']:.1f}% ({confidence['confidence_level']})")
    
    def test_03_predict_rental_land_invalid_njop(self):
        """Step 3: Test validation with invalid NJOP"""
        url = f"{BASE_URL}/predict_land_price"
        
        data = {
            "kecamatan": "Gubeng",
            "njop": 50000,  # Too low
            "sertifikat": "SHM",
            "luas_tanah": 500,
            "jenis_zona": "Komersial",
            "aksesibilitas": "Baik",
            "tingkat_keamanan": "tinggi",
            "kepadatan_penduduk": 123961
        }
        
        response = requests.post(url, json=data)
        
        assert response.status_code == 400
        result = response.json()
        
        assert result['success'] == False
        assert 'error' in result
        assert 'njop' in result['error'].lower() or '100,000' in result['error']
        
        print(f"\n✅ Validation error caught: {result['error']}")
    
    def test_04_check_analytics_after_predictions(self):
        """Step 4: Check analytics data is logged"""
        url = f"{BASE_URL}/prediction_analytics"
        
        response = requests.get(url, params={'days': 7})
        
        assert response.status_code == 200
        result = response.json()
        
        assert result['success'] == True
        assert 'stats' in result
        
        stats = result['stats']
        assert 'total_predictions' in stats
        assert 'success_rate' in stats
        
        # Should have at least 1 successful prediction from test_02
        assert stats['total_predictions'] >= 1
        
        print(f"\n✅ Analytics:")
        print(f"   Total Predictions: {stats['total_predictions']}")
        print(f"   Success Rate: {stats['success_rate']:.2f}%")


class TestCompleteSaleWorkflow:
    """Test complete workflow for sale prediction"""
    
    def test_01_upload_and_train_sale_model(self, sample_jual_tanah_dataset):
        """Step 1: Upload dataset and train sale model"""
        url = f"{BASE_URL}/jual/upload-dataset"
        
        with open(sample_jual_tanah_dataset, 'rb') as f:
            files = {'file': f}
            data = {'model_type': 'tanah'}
            
            response = requests.post(url, files=files, data=data)
        
        assert response.status_code == 200
        result = response.json()
        
        assert result['success'] == True
        assert 'performance' in result
        
        # Check all 4 models were trained
        assert 'random_forest' in result['performance']
        assert 'xgboost' in result['performance']
        assert 'catboost' in result['performance']
        assert 'voting' in result['performance']
        
        print(f"\n✅ Sale models trained:")
        for model_name, perf in result['performance'].items():
            print(f"   {model_name}: R² = {perf['r2_score']:.4f}")
        
        # Wait for model to be loaded
        time.sleep(2)
    
    def test_02_predict_sale_land_valid_input(self):
        """Step 2: Make sale prediction with valid input"""
        url = f"{BASE_URL}/predict_jual_tanah"
        
        data = {
            "kecamatan": "Gubeng",
            "njop": 3724000,
            "sertifikat": "SHM",
            "luas_tanah": 500
        }
        
        response = requests.post(url, json=data)
        
        assert response.status_code == 200
        result = response.json()
        
        assert result['success'] == True
        assert 'prediction' in result
        assert 'confidence' in result
        
        # Check prediction value is in reasonable range for sale
        prediction_value = result['prediction_value']
        assert prediction_value > 100000000  # More than 100 million
        assert prediction_value < 100000000000  # Less than 100 billion
        
        print(f"\n✅ Sale Prediction: {result['prediction']}")
        print(f"   Confidence: {result['confidence']['confidence_score']:.1f}%")
    
    def test_03_predict_sale_land_missing_field(self):
        """Step 3: Test validation with missing required field"""
        url = f"{BASE_URL}/predict_jual_tanah"
        
        data = {
            "kecamatan": "Gubeng",
            "njop": 3724000,
            # Missing 'sertifikat'
            "luas_tanah": 500
        }
        
        response = requests.post(url, json=data)
        
        assert response.status_code == 400
        result = response.json()
        
        assert result['success'] == False
        assert 'error' in result
        
        print(f"\n✅ Validation error for missing field: {result['error']}")


class TestModelStatus:
    """Test model status endpoint"""
    
    def test_get_model_status(self):
        """Test retrieving model status"""
        url = f"{BASE_URL}/model_status"
        
        response = requests.get(url)
        
        assert response.status_code == 200
        result = response.json()
        
        assert result['success'] == True
        assert 'models' in result
        
        models = result['models']
        
        # Check that models exist
        assert 'tanah' in models
        assert 'bangunan' in models
        
        print(f"\n✅ Model Status:")
        for model_type, status in models.items():
            if status.get('available'):
                print(f"   {model_type}: Available")
                if 'performance' in status:
                    print(f"      R²: {status['performance'].get('r2_score', 'N/A')}")
            else:
                print(f"   {model_type}: Not Available")


class TestConfidenceScenarios:
    """Test different confidence score scenarios"""
    
    def test_high_confidence_scenario(self):
        """Test scenario that should produce high confidence"""
        url = f"{BASE_URL}/predict_land_price"
        
        # Use typical, common values
        data = {
            "kecamatan": "Gubeng",
            "njop": 3724000,
            "sertifikat": "SHM",
            "luas_tanah": 500,
            "jenis_zona": "Komersial",
            "aksesibilitas": "Baik",
            "tingkat_keamanan": "tinggi",
            "kepadatan_penduduk": 123961
        }
        
        response = requests.post(url, json=data)
        result = response.json()
        
        if result['success']:
            confidence = result['confidence']['confidence_score']
            level = result['confidence']['confidence_level']
            
            print(f"\n✅ Typical input confidence: {confidence:.1f}% ({level})")
            
            # Should generally be moderate to high
            assert confidence >= 60, "Confidence too low for typical input"


class TestEndToEndPerformance:
    """Test end-to-end performance metrics"""
    
    def test_multiple_predictions_performance(self):
        """Test making multiple predictions and measure performance"""
        url = f"{BASE_URL}/predict_land_price"
        
        test_cases = [
            {
                "kecamatan": "Gubeng",
                "njop": 3724000,
                "sertifikat": "SHM",
                "luas_tanah": 500,
                "jenis_zona": "Komersial",
                "aksesibilitas": "Baik",
                "tingkat_keamanan": "tinggi",
                "kepadatan_penduduk": 123961
            },
            {
                "kecamatan": "Mulyorejo",
                "njop": 3500000,
                "sertifikat": "HGB",
                "luas_tanah": 400,
                "jenis_zona": "Residensial",
                "aksesibilitas": "Sedang",
                "tingkat_keamanan": "sedang",
                "kepadatan_penduduk": 95000
            },
            {
                "kecamatan": "Sukolilo",
                "njop": 3200000,
                "sertifikat": "SHM",
                "luas_tanah": 600,
                "jenis_zona": "Komersial",
                "aksesibilitas": "Baik",
                "tingkat_keamanan": "tinggi",
                "kepadatan_penduduk": 110000
            }
        ]
        
        response_times = []
        successful_predictions = 0
        
        for i, test_case in enumerate(test_cases):
            start_time = time.time()
            response = requests.post(url, json=test_case)
            end_time = time.time()
            
            response_times.append(end_time - start_time)
            
            if response.status_code == 200 and response.json()['success']:
                successful_predictions += 1
        
        avg_response_time = sum(response_times) / len(response_times)
        success_rate = (successful_predictions / len(test_cases)) * 100
        
        print(f"\n✅ Performance Metrics:")
        print(f"   Test Cases: {len(test_cases)}")
        print(f"   Successful: {successful_predictions}")
        print(f"   Success Rate: {success_rate:.1f}%")
        print(f"   Avg Response Time: {avg_response_time:.3f}s")
        
        # Performance assertions
        assert success_rate == 100, "Not all predictions succeeded"
        assert avg_response_time < 5.0, f"Response time too slow: {avg_response_time:.3f}s"


class TestDataValidationWorkflow:
    """Test data validation workflow"""
    
    @pytest.mark.parametrize("invalid_input,expected_error_keyword", [
        (
            {"kecamatan": "Gubeng", "njop": 50000, "sertifikat": "SHM", 
             "luas_tanah": 500, "jenis_zona": "Komersial", 
             "aksesibilitas": "Baik", "tingkat_keamanan": "tinggi", 
             "kepadatan_penduduk": 123961},
            "njop"  # NJOP too low
        ),
        (
            {"kecamatan": "Gubeng", "njop": 3724000, "sertifikat": "SHM", 
             "luas_tanah": 10, "jenis_zona": "Komersial",  # Luas too small
             "aksesibilitas": "Baik", "tingkat_keamanan": "tinggi", 
             "kepadatan_penduduk": 123961},
            "luas"
        ),
        (
            {"kecamatan": "Gubeng", "njop": 3724000,  # Missing sertifikat
             "luas_tanah": 500, "jenis_zona": "Komersial", 
             "aksesibilitas": "Baik", "tingkat_keamanan": "tinggi", 
             "kepadatan_penduduk": 123961},
            "sertifikat"
        )
    ])
    def test_validation_catches_invalid_inputs(self, invalid_input, expected_error_keyword):
        """Test that validation catches various invalid inputs"""
        url = f"{BASE_URL}/predict_land_price"
        
        response = requests.post(url, json=invalid_input)
        
        assert response.status_code == 400
        result = response.json()
        
        assert result['success'] == False
        assert expected_error_keyword.lower() in result['error'].lower()
        
        print(f"\n✅ Caught validation error for {expected_error_keyword}: {result['error']}")


if __name__ == '__main__':
    # Run with verbose output
    pytest.main([__file__, '-v', '-s', '--tb=short'])
