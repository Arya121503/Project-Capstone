"""
Batch Prediction Endpoint - FASE 5
====================================

Endpoint untuk melakukan batch prediction (multiple predictions in one request)

Author: Asset Prediction System Team
Version: 5.0
"""

from flask import Blueprint, request, jsonify
from prediction_system import PredictionSystem
import time

# Create blueprint
batch_prediction_bp = Blueprint('batch_prediction', __name__)

# Initialize prediction system with caching enabled
prediction_system = PredictionSystem(enable_cache=True)


@batch_prediction_bp.route('/predict_batch', methods=['POST'])
def predict_batch():
    """
    Batch prediction endpoint
    
    Request Body:
    {
        "model_type": "tanah" or "bangunan",
        "predictions": [
            { input_data_1 },
            { input_data_2 },
            ...
        ]
    }
    
    Response:
    {
        "success": true,
        "total_predictions": 5,
        "successful": 4,
        "failed": 1,
        "batch_time": "2.345s",
        "avg_time_per_prediction": "0.469s",
        "results": [...]
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        model_type = data.get('model_type')
        predictions_input = data.get('predictions')
        
        # Validation
        if not model_type:
            return jsonify({
                'success': False,
                'error': 'model_type is required'
            }), 400
        
        if model_type not in ['tanah', 'bangunan']:
            return jsonify({
                'success': False,
                'error': 'model_type must be "tanah" or "bangunan"'
            }), 400
        
        if not predictions_input or not isinstance(predictions_input, list):
            return jsonify({
                'success': False,
                'error': 'predictions must be a non-empty list'
            }), 400
        
        if len(predictions_input) == 0:
            return jsonify({
                'success': False,
                'error': 'predictions list cannot be empty'
            }), 400
        
        if len(predictions_input) > 100:
            return jsonify({
                'success': False,
                'error': 'Maximum 100 predictions per batch'
            }), 400
        
        # Perform batch prediction
        result = prediction_system.predict_batch(model_type, predictions_input)
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@batch_prediction_bp.route('/cache/stats', methods=['GET'])
def get_cache_stats():
    """Get cache statistics"""
    try:
        stats = prediction_system.get_cache_stats()
        return jsonify({
            'success': True,
            'stats': stats
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@batch_prediction_bp.route('/cache/clear', methods=['POST'])
def clear_cache():
    """Clear prediction cache"""
    try:
        result = prediction_system.clear_cache()
        return jsonify(result), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@batch_prediction_bp.route('/performance/stats', methods=['GET'])
def get_performance_stats():
    """Get overall performance statistics"""
    try:
        stats = prediction_system.get_performance_stats()
        return jsonify({
            'success': True,
            'stats': stats
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# Example usage documentation
"""
BATCH PREDICTION EXAMPLES
=========================

1. Batch prediction for land (tanah):

POST /predict_batch
{
    "model_type": "tanah",
    "predictions": [
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
        }
    ]
}

2. Get cache statistics:

GET /cache/stats

3. Clear cache:

POST /cache/clear

4. Get performance stats:

GET /performance/stats
"""
