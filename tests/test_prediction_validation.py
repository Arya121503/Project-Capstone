"""
Unit Tests for Prediction System Validation (FASE 3)
====================================================

Tests untuk memastikan validation, logging, dan analytics berfungsi dengan baik.

Run tests:
    python -m pytest tests/test_prediction_validation.py -v
"""

import pytest
import json
import os
from pathlib import Path
from datetime import datetime
import sys

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from prediction_system import PredictionSystem

@pytest.fixture
def prediction_system():
    """Create a prediction system instance for testing"""
    system = PredictionSystem()
    return system

class TestLandInputValidation:
    """Test cases for land prediction input validation"""
    
    def test_valid_land_input(self, prediction_system):
        """Test validation passes for valid land input"""
        valid_input = {
            'kecamatan': 'Gubeng',
            'njop': 3724000,
            'sertifikat': 'SHM',
            'luas_tanah': 500,
            'jenis_zona': 'Komersial',
            'aksesibilitas': 'Baik',
            'tingkat_keamanan': 'tinggi',
            'kepadatan_penduduk': 123961
        }
        
        is_valid, error = prediction_system.validate_land_input(valid_input)
        
        assert is_valid == True
        assert error is None
    
    def test_missing_required_field(self, prediction_system):
        """Test validation fails when required field is missing"""
        invalid_input = {
            'kecamatan': 'Gubeng',
            'njop': 3724000,
            # Missing 'sertifikat'
            'luas_tanah': 500,
            'jenis_zona': 'Komersial',
            'aksesibilitas': 'Baik',
            'tingkat_keamanan': 'tinggi',
            'kepadatan_penduduk': 123961
        }
        
        is_valid, error = prediction_system.validate_land_input(invalid_input)
        
        assert is_valid == False
        assert error is not None
        assert 'sertifikat' in error.lower()
    
    def test_njop_too_low(self, prediction_system):
        """Test validation fails for NJOP below minimum"""
        invalid_input = {
            'kecamatan': 'Gubeng',
            'njop': 50000,  # Below minimum (100,000)
            'sertifikat': 'SHM',
            'luas_tanah': 500,
            'jenis_zona': 'Komersial',
            'aksesibilitas': 'Baik',
            'tingkat_keamanan': 'tinggi',
            'kepadatan_penduduk': 123961
        }
        
        is_valid, error = prediction_system.validate_land_input(invalid_input)
        
        assert is_valid == False
        assert error is not None
        assert 'njop' in error.lower() or '100,000' in error
    
    def test_njop_too_high(self, prediction_system):
        """Test validation fails for NJOP above maximum"""
        invalid_input = {
            'kecamatan': 'Gubeng',
            'njop': 60000000,  # Above maximum (50,000,000)
            'sertifikat': 'SHM',
            'luas_tanah': 500,
            'jenis_zona': 'Komersial',
            'aksesibilitas': 'Baik',
            'tingkat_keamanan': 'tinggi',
            'kepadatan_penduduk': 123961
        }
        
        is_valid, error = prediction_system.validate_land_input(invalid_input)
        
        assert is_valid == False
        assert error is not None
        assert 'njop' in error.lower() or '50,000,000' in error
    
    def test_luas_tanah_too_small(self, prediction_system):
        """Test validation fails for luas tanah below minimum"""
        invalid_input = {
            'kecamatan': 'Gubeng',
            'njop': 3724000,
            'sertifikat': 'SHM',
            'luas_tanah': 10,  # Below minimum (50)
            'jenis_zona': 'Komersial',
            'aksesibilitas': 'Baik',
            'tingkat_keamanan': 'tinggi',
            'kepadatan_penduduk': 123961
        }
        
        is_valid, error = prediction_system.validate_land_input(invalid_input)
        
        assert is_valid == False
        assert error is not None
        assert 'luas tanah' in error.lower() or '50' in error
    
    def test_invalid_numeric_type(self, prediction_system):
        """Test validation fails for non-numeric values"""
        invalid_input = {
            'kecamatan': 'Gubeng',
            'njop': 'not_a_number',  # Invalid type
            'sertifikat': 'SHM',
            'luas_tanah': 500,
            'jenis_zona': 'Komersial',
            'aksesibilitas': 'Baik',
            'tingkat_keamanan': 'tinggi',
            'kepadatan_penduduk': 123961
        }
        
        is_valid, error = prediction_system.validate_land_input(invalid_input)
        
        assert is_valid == False
        assert error is not None


class TestBuildingInputValidation:
    """Test cases for building prediction input validation"""
    
    def test_valid_building_input(self, prediction_system):
        """Test validation passes for valid building input"""
        valid_input = {
            'kecamatan': 'Gubeng',
            'njop': 3724000,
            'sertifikat': 'SHM',
            'luas_tanah': 300,
            'luas_bangunan': 250,
            'jumlah_lantai': 2,
            'jenis_zona': 'Komersial',
            'aksesibilitas': 'Baik'
        }
        
        is_valid, error = prediction_system.validate_building_input(valid_input)
        
        assert is_valid == True
        assert error is None
    
    def test_building_too_large_for_land(self, prediction_system):
        """Test validation fails when building is too large relative to land"""
        invalid_input = {
            'kecamatan': 'Gubeng',
            'njop': 3724000,
            'sertifikat': 'SHM',
            'luas_tanah': 100,
            'luas_bangunan': 600,  # > 5x luas tanah
            'jumlah_lantai': 2,
            'jenis_zona': 'Komersial',
            'aksesibilitas': 'Baik'
        }
        
        is_valid, error = prediction_system.validate_building_input(invalid_input)
        
        assert is_valid == False
        assert error is not None
        assert 'luas bangunan' in error.lower()
    
    def test_jumlah_lantai_too_many(self, prediction_system):
        """Test validation fails for too many floors"""
        invalid_input = {
            'kecamatan': 'Gubeng',
            'njop': 3724000,
            'sertifikat': 'SHM',
            'luas_tanah': 300,
            'luas_bangunan': 250,
            'jumlah_lantai': 60,  # Above maximum (50)
            'jenis_zona': 'Komersial',
            'aksesibilitas': 'Baik'
        }
        
        is_valid, error = prediction_system.validate_building_input(invalid_input)
        
        assert is_valid == False
        assert error is not None
        assert 'lantai' in error.lower() or '50' in error


class TestPredictionLogging:
    """Test cases for prediction logging system"""
    
    def test_log_successful_prediction(self, prediction_system, tmp_path):
        """Test that successful predictions are logged correctly"""
        # Override log directory to temp path
        original_base_path = prediction_system.model_base_path
        prediction_system.model_base_path = tmp_path
        
        test_input = {
            'kecamatan': 'Gubeng',
            'njop': 3724000,
            'sertifikat': 'SHM',
            'luas_tanah': 500
        }
        
        test_result = {
            'success': True,
            'prediction': 'Rp 10,000,000',
            'confidence': 94.5
        }
        
        # Log the prediction
        prediction_system.log_prediction(
            'tanah', 
            test_input, 
            test_result, 
            success=True
        )
        
        # Check log file exists
        log_dir = tmp_path / "logs"
        today = datetime.now().strftime('%Y%m%d')
        log_file = log_dir / f"predictions_{today}.jsonl"
        
        assert log_file.exists()
        
        # Check log content
        with open(log_file, 'r', encoding='utf-8') as f:
            log_entry = json.loads(f.readline())
        
        assert log_entry['success'] == True
        assert log_entry['model_type'] == 'tanah'
        assert log_entry['input_data'] == test_input
        assert log_entry['prediction_result'] == test_result
        
        # Restore original path
        prediction_system.model_base_path = original_base_path
    
    def test_log_failed_prediction(self, prediction_system, tmp_path):
        """Test that failed predictions are logged correctly"""
        # Override log directory
        original_base_path = prediction_system.model_base_path
        prediction_system.model_base_path = tmp_path
        
        test_input = {
            'kecamatan': 'Invalid',
            'njop': -1000
        }
        
        error_message = "Validation failed: Invalid input"
        
        # Log the failed prediction
        prediction_system.log_prediction(
            'tanah',
            test_input,
            None,
            success=False,
            error=error_message
        )
        
        # Check log file
        log_dir = tmp_path / "logs"
        today = datetime.now().strftime('%Y%m%d')
        log_file = log_dir / f"predictions_{today}.jsonl"
        
        assert log_file.exists()
        
        # Check log content
        with open(log_file, 'r', encoding='utf-8') as f:
            log_entry = json.loads(f.readline())
        
        assert log_entry['success'] == False
        assert log_entry['error'] == error_message
        assert log_entry['prediction_result'] is None
        
        # Restore
        prediction_system.model_base_path = original_base_path


class TestPredictionAnalytics:
    """Test cases for prediction analytics"""
    
    def test_empty_stats(self, prediction_system, tmp_path):
        """Test analytics with no log files"""
        # Override log directory
        original_base_path = prediction_system.model_base_path
        prediction_system.model_base_path = tmp_path
        
        stats = prediction_system.get_prediction_stats(days=7)
        
        assert stats['total_predictions'] == 0
        assert stats['success_rate'] == 0
        assert stats['average_confidence'] == 0
        
        # Restore
        prediction_system.model_base_path = original_base_path
    
    def test_stats_calculation(self, prediction_system, tmp_path):
        """Test that stats are calculated correctly from logs"""
        # Override log directory
        original_base_path = prediction_system.model_base_path
        prediction_system.model_base_path = tmp_path
        
        # Create log directory
        log_dir = tmp_path / "logs"
        log_dir.mkdir()
        
        # Create sample log file
        today = datetime.now().strftime('%Y%m%d')
        log_file = log_dir / f"predictions_{today}.jsonl"
        
        sample_logs = [
            {
                'timestamp': '2025-11-07T10:00:00',
                'model_type': 'tanah',
                'success': True,
                'input_data': {},
                'prediction_result': {'confidence': 95.0},
                'error': None
            },
            {
                'timestamp': '2025-11-07T10:05:00',
                'model_type': 'bangunan',
                'success': True,
                'input_data': {},
                'prediction_result': {'confidence': 85.0},
                'error': None
            },
            {
                'timestamp': '2025-11-07T10:10:00',
                'model_type': 'tanah',
                'success': False,
                'input_data': {},
                'prediction_result': None,
                'error': 'Validation failed'
            }
        ]
        
        with open(log_file, 'w', encoding='utf-8') as f:
            for log in sample_logs:
                f.write(json.dumps(log) + '\n')
        
        # Get stats
        stats = prediction_system.get_prediction_stats(days=7)
        
        assert stats['total_predictions'] == 3
        assert stats['successful_predictions'] == 2
        assert stats['failed_predictions'] == 1
        assert stats['success_rate'] == pytest.approx(66.67, abs=0.1)
        assert stats['predictions_by_type']['tanah'] == 1  # Only successful
        assert stats['predictions_by_type']['bangunan'] == 1
        assert stats['average_confidence'] == pytest.approx(90.0, abs=0.1)  # (95+85)/2
        
        # Restore
        prediction_system.model_base_path = original_base_path


class TestConfidenceCalculation:
    """Test cases for confidence calculation (FASE 1)"""
    
    def test_single_model_confidence(self, prediction_system):
        """Test confidence calculation with single model (should give default)"""
        predictions = [10000000]
        final_pred = 10000000
        
        confidence = prediction_system.calculate_confidence(predictions, final_pred)
        
        assert 'confidence_score' in confidence
        assert 'confidence_level' in confidence
        assert 'cv_percentage' in confidence
        # Single model should give default confidence
        assert confidence['confidence_score'] >= 50
    
    def test_high_agreement_confidence(self, prediction_system):
        """Test confidence calculation with high model agreement"""
        predictions = [10000000, 10100000, 9950000, 10050000]  # Close values
        final_pred = 10025000
        
        confidence = prediction_system.calculate_confidence(predictions, final_pred)
        
        # Low CV (< 5%) should give very high confidence (> 95%)
        assert confidence['cv_percentage'] < 5
        assert confidence['confidence_score'] >= 95
        assert confidence['confidence_level'] == 'Very High'
    
    def test_low_agreement_confidence(self, prediction_system):
        """Test confidence calculation with low model agreement"""
        predictions = [10000000, 15000000, 8000000, 20000000]  # Spread out
        final_pred = 13250000
        
        confidence = prediction_system.calculate_confidence(predictions, final_pred)
        
        # High CV (> 20%) should give low confidence
        assert confidence['cv_percentage'] > 20
        assert confidence['confidence_score'] < 70
        assert confidence['confidence_level'] in ['Moderate', 'Low']


class TestModelStatus:
    """Test cases for model status reporting"""
    
    def test_get_model_status(self, prediction_system):
        """Test that model status is retrieved correctly"""
        status = prediction_system.get_model_status()
        
        assert 'tanah' in status
        assert 'bangunan' in status
        
        # Check structure for each model type
        for model_type in ['tanah', 'bangunan']:
            model_status = status[model_type]
            
            if model_status['available']:
                assert 'model_name' in model_status
                assert 'timestamp' in model_status
                assert 'performance' in model_status
                assert 'r2_score' in model_status['performance']
            else:
                assert 'error' in model_status


if __name__ == '__main__':
    pytest.main([__file__, '-v', '--tb=short'])
