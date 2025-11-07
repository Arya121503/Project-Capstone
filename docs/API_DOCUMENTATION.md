# 🚀 API Documentation - Prediction System

## 📋 Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Rental Prediction Endpoints](#rental-prediction-endpoints)
4. [Sale Prediction Endpoints](#sale-prediction-endpoints)
5. [Upload & Training Endpoints](#upload--training-endpoints)
6. [Analytics Endpoints](#analytics-endpoints)
7. [Error Handling](#error-handling)
8. [Code Examples](#code-examples)

---

## Overview

**Base URL**: `http://localhost:5000`

**API Version**: 4.0

**Response Format**: JSON

**Encoding**: UTF-8

### Features

✅ **Ensemble ML Models**: 4 models (Random Forest, XGBoost, CatBoost, Voting)  
✅ **Confidence Scores**: All predictions include confidence metrics  
✅ **Input Validation**: Automatic validation with detailed error messages  
✅ **Auto-Training**: Upload datasets for automatic model training  
✅ **Analytics**: Performance monitoring and statistics  

---

## Authentication

### Current Status
🔓 **No Authentication Required** (Development Mode)

### Future Implementation
🔐 **Planned**: JWT-based authentication

```json
Headers:
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

---

## Rental Prediction Endpoints

### 1. Predict Land Rental Price

**Endpoint**: `POST /predict_land_price`

**Description**: Predicts rental price for land using ensemble ML models

**Request Body**:
```json
{
  "kecamatan": "Gubeng",
  "njop": 3724000,
  "sertifikat": "SHM",
  "luas_tanah": 500,
  "jenis_zona": "Komersial",
  "aksesibilitas": "Baik",
  "tingkat_keamanan": "tinggi",
  "kepadatan_penduduk": 123961
}
```

**Request Fields**:

| Field | Type | Required | Range/Options | Description |
|-------|------|----------|---------------|-------------|
| `kecamatan` | string | ✅ | 31 districts | District name in Surabaya |
| `njop` | number | ✅ | 100,000 - 50,000,000 | Tax Object Value per m² |
| `sertifikat` | string | ✅ | SHM, HGB, HP, Girik | Land certificate type |
| `luas_tanah` | number | ✅ | 50 - 100,000 | Land area in m² |
| `jenis_zona` | string | ✅ | Residensial, Komersial, Industri | Zone type |
| `aksesibilitas` | string | ✅ | Baik, Sedang, Buruk | Accessibility level |
| `tingkat_keamanan` | string | ✅ | tinggi, sedang, rendah | Security level |
| `kepadatan_penduduk` | number | ✅ | > 0 | Population density |

**Success Response (200)**:
```json
{
  "success": true,
  "prediction": "Rp 50,000,000",
  "prediction_value": 50000000,
  "confidence": {
    "confidence_score": 94.5,
    "confidence_level": "Very High",
    "cv_percentage": 2.3
  },
  "model_details": {
    "random_forest": "Rp 49,800,000",
    "xgboost": "Rp 50,200,000",
    "catboost": "Rp 49,900,000",
    "voting": "Rp 50,000,000"
  },
  "input_summary": {
    "kecamatan": "Gubeng",
    "luas_tanah": "500 m²",
    "njop": "Rp 3,724,000",
    "sertifikat": "SHM"
  }
}
```

**Error Response (400)**:
```json
{
  "success": false,
  "error": "Input tidak valid: NJOP harus antara Rp 100,000 dan Rp 50,000,000"
}
```

**Error Response (500)**:
```json
{
  "success": false,
  "error": "Model tidak tersedia. Silakan upload dataset terlebih dahulu."
}
```

---

### 2. Predict Building Rental Price

**Endpoint**: `POST /predict_building_price`

**Description**: Predicts rental price for building using ensemble ML models

**Request Body**:
```json
{
  "kecamatan": "Gubeng",
  "njop": 3724000,
  "sertifikat": "SHM",
  "luas_tanah": 300,
  "luas_bangunan": 250,
  "jumlah_lantai": 2,
  "jenis_zona": "Komersial",
  "aksesibilitas": "Baik"
}
```

**Request Fields**:

| Field | Type | Required | Range/Options | Description |
|-------|------|----------|---------------|-------------|
| `kecamatan` | string | ✅ | 31 districts | District name |
| `njop` | number | ✅ | 100,000 - 50,000,000 | Tax Object Value per m² |
| `sertifikat` | string | ✅ | SHM, HGB, HP, Girik | Certificate type |
| `luas_tanah` | number | ✅ | 50 - 100,000 | Land area in m² |
| `luas_bangunan` | number | ✅ | 20 - 500,000 | Building area in m² |
| `jumlah_lantai` | number | ✅ | 1 - 50 | Number of floors |
| `jenis_zona` | string | ✅ | Residensial, Komersial, Industri | Zone type |
| `aksesibilitas` | string | ✅ | Baik, Sedang, Buruk | Accessibility |

**Validation Rule**:
⚠️ `luas_bangunan` must be ≤ 5 × `luas_tanah`

**Success Response (200)**:
```json
{
  "success": true,
  "prediction": "Rp 75,000,000",
  "prediction_value": 75000000,
  "confidence": {
    "confidence_score": 91.2,
    "confidence_level": "Very High",
    "cv_percentage": 3.8
  },
  "model_details": {
    "random_forest": "Rp 74,500,000",
    "xgboost": "Rp 75,300,000",
    "catboost": "Rp 74,800,000",
    "voting": "Rp 75,000,000"
  },
  "input_summary": {
    "kecamatan": "Gubeng",
    "luas_tanah": "300 m²",
    "luas_bangunan": "250 m²",
    "jumlah_lantai": "2 lantai"
  }
}
```

---

## Sale Prediction Endpoints

### 3. Predict Land Sale Price

**Endpoint**: `POST /predict_jual_tanah`

**Description**: Predicts sale price for land using ensemble models

**Request Body**:
```json
{
  "kecamatan": "Gubeng",
  "njop": 3724000,
  "sertifikat": "SHM",
  "luas_tanah": 500
}
```

**Request Fields**:

| Field | Type | Required | Range/Options |
|-------|------|----------|---------------|
| `kecamatan` | string | ✅ | 31 districts |
| `njop` | number | ✅ | 100,000 - 50,000,000 |
| `sertifikat` | string | ✅ | SHM, HGB, HP, Girik |
| `luas_tanah` | number | ✅ | 50 - 100,000 |

**Success Response (200)**:
```json
{
  "success": true,
  "prediction": "Rp 2,500,000,000",
  "prediction_value": 2500000000,
  "confidence": {
    "confidence_score": 93.7,
    "confidence_level": "Very High",
    "cv_percentage": 2.8
  },
  "model_details": {
    "random_forest": "Rp 2,480,000,000",
    "xgboost": "Rp 2,510,000,000",
    "catboost": "Rp 2,490,000,000",
    "voting": "Rp 2,500,000,000"
  }
}
```

---

### 4. Predict Building Sale Price

**Endpoint**: `POST /predict_jual_bangunan`

**Description**: Predicts sale price for building

**Request Body**:
```json
{
  "kecamatan": "Gubeng",
  "njop": 3724000,
  "sertifikat": "SHM",
  "luas_tanah": 300,
  "luas_bangunan": 250,
  "jumlah_lantai": 2
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "prediction": "Rp 3,500,000,000",
  "prediction_value": 3500000000,
  "confidence": {
    "confidence_score": 89.4,
    "confidence_level": "High",
    "cv_percentage": 4.5
  },
  "model_details": {
    "random_forest": "Rp 3,450,000,000",
    "xgboost": "Rp 3,530,000,000",
    "catboost": "Rp 3,480,000,000",
    "voting": "Rp 3,500,000,000"
  }
}
```

---

## Upload & Training Endpoints

### 5. Upload Rental Dataset

**Endpoint**: `POST /upload_rental_dataset`

**Description**: Upload CSV dataset and trigger automatic model training for rental predictions

**Content-Type**: `multipart/form-data`

**Request Parameters**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | file | ✅ | CSV file (max 50 MB) |
| `model_type` | string | ✅ | "tanah" or "bangunan" |

**CSV Format (Tanah)**:
```csv
kecamatan,njop,sertifikat,luas_tanah,jenis_zona,aksesibilitas,tingkat_keamanan,kepadatan_penduduk,harga_sewa
Gubeng,3724000,SHM,500,Komersial,Baik,tinggi,123961,50000000
Mulyorejo,3500000,HGB,400,Residensial,Sedang,sedang,95000,35000000
```

**CSV Format (Bangunan)**:
```csv
kecamatan,njop,sertifikat,luas_tanah,luas_bangunan,jumlah_lantai,jenis_zona,aksesibilitas,harga_sewa
Gubeng,3724000,SHM,300,250,2,Komersial,Baik,75000000
```

**cURL Example**:
```bash
curl -X POST http://localhost:5000/upload_rental_dataset \
  -F "file=@dataset_tanah.csv" \
  -F "model_type=tanah"
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Model berhasil dilatih!",
  "model_type": "tanah",
  "performance": {
    "random_forest": {
      "r2_score": 0.89,
      "mae": 2500000,
      "rmse": 3200000
    },
    "xgboost": {
      "r2_score": 0.91,
      "mae": 2300000,
      "rmse": 2900000
    },
    "catboost": {
      "r2_score": 0.90,
      "mae": 2400000,
      "rmse": 3000000
    },
    "voting": {
      "r2_score": 0.93,
      "mae": 2100000,
      "rmse": 2700000
    }
  },
  "training_time": "45.2 seconds",
  "dataset_info": {
    "rows": 1500,
    "columns": 9,
    "train_size": 1200,
    "test_size": 300
  }
}
```

**Error Response (400)**:
```json
{
  "success": false,
  "error": "File tidak valid. Hanya menerima file CSV."
}
```

---

### 6. Upload Sale Dataset

**Endpoint**: `POST /jual/upload-dataset`

**Description**: Upload dataset and train models for sale price prediction

**Content-Type**: `multipart/form-data`

**Request Parameters**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | file | ✅ | CSV file (max 50 MB) |
| `model_type` | string | ✅ | "tanah" or "bangunan" |

**CSV Format (Jual Tanah)**:
```csv
kecamatan,njop,sertifikat,luas_tanah,harga_jual
Gubeng,3724000,SHM,500,2500000000
Mulyorejo,3500000,HGB,400,1800000000
```

**CSV Format (Jual Bangunan)**:
```csv
kecamatan,njop,sertifikat,luas_tanah,luas_bangunan,jumlah_lantai,harga_jual
Gubeng,3724000,SHM,300,250,2,3500000000
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Dataset uploaded and models trained successfully",
  "model_type": "tanah",
  "performance": {
    "random_forest": {"r2_score": 0.87},
    "xgboost": {"r2_score": 0.89},
    "catboost": {"r2_score": 0.88},
    "voting": {"r2_score": 0.91}
  },
  "models_saved": [
    "model/jual_tanah/random_forest_jual_tanah.pkl",
    "model/jual_tanah/xgboost_jual_tanah.pkl",
    "model/jual_tanah/catboost_jual_tanah.pkl",
    "model/jual_tanah/voting_jual_tanah.pkl"
  ]
}
```

---

## Analytics Endpoints

### 7. Get Prediction Analytics

**Endpoint**: `GET /prediction_analytics`

**Description**: Get statistics and analytics for predictions over the last 7 days

**Query Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `days` | number | ❌ | 7 | Number of days to analyze |

**Request Example**:
```
GET /prediction_analytics?days=7
```

**Success Response (200)**:
```json
{
  "success": true,
  "period": "Last 7 days",
  "stats": {
    "total_predictions": 1247,
    "successful_predictions": 1229,
    "failed_predictions": 18,
    "success_rate": 98.56,
    "average_confidence": 91.2,
    "predictions_by_type": {
      "tanah": 687,
      "bangunan": 560
    },
    "predictions_by_day": [
      {"date": "2025-11-01", "count": 178},
      {"date": "2025-11-02", "count": 182},
      {"date": "2025-11-03", "count": 175},
      {"date": "2025-11-04", "count": 189},
      {"date": "2025-11-05", "count": 165},
      {"date": "2025-11-06", "count": 171},
      {"date": "2025-11-07", "count": 187}
    ],
    "confidence_distribution": {
      "very_high": 892,
      "high": 287,
      "moderate": 50,
      "low": 0
    },
    "model_performance": {
      "tanah": {
        "r2_score": 0.89,
        "last_trained": "2025-11-05T10:30:00"
      },
      "bangunan": {
        "r2_score": 0.91,
        "last_trained": "2025-11-04T15:20:00"
      }
    }
  }
}
```

---

### 8. Get Model Status

**Endpoint**: `GET /model_status`

**Description**: Get current status and information about all models

**Success Response (200)**:
```json
{
  "success": true,
  "models": {
    "tanah": {
      "available": true,
      "model_name": "Ensemble (RF + XGBoost + CatBoost + Voting)",
      "last_trained": "2025-11-05T10:30:00",
      "file_size": "125 MB",
      "performance": {
        "r2_score": 0.89,
        "mae": 2500000,
        "rmse": 3200000
      },
      "model_files": [
        "model/tanah/random_forest_tanah.pkl",
        "model/tanah/xgboost_tanah.pkl",
        "model/tanah/catboost_tanah.pkl",
        "model/tanah/voting_tanah.pkl"
      ]
    },
    "bangunan": {
      "available": true,
      "model_name": "Ensemble (RF + XGBoost + CatBoost + Voting)",
      "last_trained": "2025-11-04T15:20:00",
      "file_size": "142 MB",
      "performance": {
        "r2_score": 0.91,
        "mae": 3200000,
        "rmse": 4100000
      }
    },
    "jual_tanah": {
      "available": true,
      "last_trained": "2025-11-03T09:15:00"
    },
    "jual_bangunan": {
      "available": true,
      "last_trained": "2025-11-02T14:45:00"
    }
  }
}
```

---

## Error Handling

### Standard Error Response Format

```json
{
  "success": false,
  "error": "Error message here",
  "error_code": "ERROR_CODE",
  "timestamp": "2025-11-07T10:30:00"
}
```

### Error Codes

| Code | HTTP Status | Description | Solution |
|------|-------------|-------------|----------|
| `VALIDATION_ERROR` | 400 | Input validation failed | Check input fields against requirements |
| `MODEL_NOT_FOUND` | 500 | Model file not available | Upload dataset to train model |
| `FILE_TOO_LARGE` | 413 | Upload file exceeds 50 MB | Reduce file size or split dataset |
| `INVALID_FILE_TYPE` | 400 | File is not CSV | Upload only CSV files |
| `TRAINING_FAILED` | 500 | Model training encountered error | Check dataset format and data quality |
| `PREDICTION_FAILED` | 500 | Prediction process failed | Verify input data and model availability |

### Common Validation Errors

**1. NJOP Out of Range**:
```json
{
  "success": false,
  "error": "Input tidak valid: NJOP harus antara Rp 100,000 dan Rp 50,000,000",
  "error_code": "VALIDATION_ERROR"
}
```

**2. Missing Required Field**:
```json
{
  "success": false,
  "error": "Input tidak valid: Field 'sertifikat' wajib diisi",
  "error_code": "VALIDATION_ERROR"
}
```

**3. Building Too Large**:
```json
{
  "success": false,
  "error": "Input tidak valid: Luas bangunan tidak boleh lebih dari 5x luas tanah",
  "error_code": "VALIDATION_ERROR"
}
```

---

## Code Examples

### JavaScript (Fetch API)

```javascript
// Predict Land Rental Price
async function predictLandPrice() {
  const data = {
    kecamatan: "Gubeng",
    njop: 3724000,
    sertifikat: "SHM",
    luas_tanah: 500,
    jenis_zona: "Komersial",
    aksesibilitas: "Baik",
    tingkat_keamanan: "tinggi",
    kepadatan_penduduk: 123961
  };

  try {
    const response = await fetch('http://localhost:5000/predict_land_price', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('Prediction:', result.prediction);
      console.log('Confidence:', result.confidence.confidence_score + '%');
      console.log('Level:', result.confidence.confidence_level);
    } else {
      console.error('Error:', result.error);
    }
  } catch (error) {
    console.error('Request failed:', error);
  }
}
```

### JavaScript (Upload Dataset)

```javascript
async function uploadDataset() {
  const fileInput = document.getElementById('fileInput');
  const formData = new FormData();
  formData.append('file', fileInput.files[0]);
  formData.append('model_type', 'tanah');

  try {
    const response = await fetch('http://localhost:5000/upload_rental_dataset', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('Training completed!');
      console.log('Performance:', result.performance);
    } else {
      console.error('Upload failed:', result.error);
    }
  } catch (error) {
    console.error('Request failed:', error);
  }
}
```

### Python (requests)

```python
import requests
import json

# Predict Land Price
def predict_land_price():
    url = "http://localhost:5000/predict_land_price"
    
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
        print(f"Prediction: {result['prediction']}")
        print(f"Confidence: {result['confidence']['confidence_score']}%")
    else:
        print(f"Error: {result['error']}")

# Upload Dataset
def upload_dataset():
    url = "http://localhost:5000/upload_rental_dataset"
    
    files = {'file': open('dataset_tanah.csv', 'rb')}
    data = {'model_type': 'tanah'}
    
    response = requests.post(url, files=files, data=data)
    result = response.json()
    
    if result['success']:
        print("Training completed!")
        print(f"R² Score: {result['performance']['voting']['r2_score']}")
    else:
        print(f"Error: {result['error']}")
```

### cURL Examples

**Predict Land Price**:
```bash
curl -X POST http://localhost:5000/predict_land_price \
  -H "Content-Type: application/json" \
  -d '{
    "kecamatan": "Gubeng",
    "njop": 3724000,
    "sertifikat": "SHM",
    "luas_tanah": 500,
    "jenis_zona": "Komersial",
    "aksesibilitas": "Baik",
    "tingkat_keamanan": "tinggi",
    "kepadatan_penduduk": 123961
  }'
```

**Upload Dataset**:
```bash
curl -X POST http://localhost:5000/upload_rental_dataset \
  -F "file=@dataset_tanah.csv" \
  -F "model_type=tanah"
```

**Get Analytics**:
```bash
curl -X GET "http://localhost:5000/prediction_analytics?days=7"
```

---

## Rate Limiting

### Current Status
⚠️ **No Rate Limiting** (Development Mode)

### Future Implementation
Planned rate limits:
- **Public Endpoints**: 100 requests/hour
- **Upload Endpoints**: 10 requests/hour
- **Analytics Endpoints**: 50 requests/hour

---

## Changelog

### Version 4.0 (FASE 4 - Current)
- ✅ Comprehensive API documentation
- ✅ Code examples for multiple languages
- ✅ Detailed error handling guide

### Version 3.0 (FASE 3)
- ✅ Added input validation endpoints
- ✅ Added analytics endpoint
- ✅ Enhanced error responses

### Version 2.0 (FASE 2)
- ✅ Added sale prediction endpoints
- ✅ Added upload & training for sale models

### Version 1.0 (FASE 1)
- ✅ Initial rental prediction endpoints
- ✅ Confidence score integration

---

**Last Updated**: 2025-11-07  
**Maintained By**: Asset Prediction System Team  
**Support**: admin@assetprediction.com
