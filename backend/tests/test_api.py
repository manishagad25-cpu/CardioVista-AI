import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["models_loaded"] is True

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["models_loaded"] is True
    assert "CAD" in data["available_targets"]
    assert "LAD" in data["available_targets"]
    assert "LCX" in data["available_targets"]
    assert "RCA" in data["available_targets"]
    assert "CardioVista AI" in data["disclaimer"]

def test_api_prefix_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

def test_model_info():
    response = client.get("/model-info")
    assert response.status_code == 200
    data = response.json()
    assert "CAD" in data["supported_targets"]
    assert data["total_features"] == 54
    assert data["patient_sample_size"] == 303
    assert len(data["numeric_features"]) > 20

def test_metrics():
    response = client.get("/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "CAD" in data["metrics"]
    assert "LAD" in data["metrics"]
    assert "LCX" in data["metrics"]
    assert "RCA" in data["metrics"]
    assert "cv_5fold" in data["metrics"]["CAD"]["model_comparison"]["Logistic Regression"]

def test_example_patients():
    response = client.get("/example-patients")
    assert response.status_code == 200
    data = response.json()
    assert "normal_low_risk" in data
    assert "lad_stenosis" in data
    assert "multivessel_cad" in data

def test_prediction_normal_patient():
    examples_resp = client.get("/example-patients")
    normal_case = examples_resp.json()["normal_low_risk"]["data"]
    
    response = client.post("/predict", json=normal_case)
    assert response.status_code == 200
    data = response.json()
    assert "predictions" in data
    assert "anatomical_mapping" in data
    assert "LAD" in data["anatomical_mapping"]
    assert "LCX" in data["anatomical_mapping"]
    assert "RCA" in data["anatomical_mapping"]
    assert data["disclaimer"] != ""
    # For a low-risk case, probability should be lower
    assert data["predictions"]["CAD"]["probability"] < 0.60

def test_prediction_multivessel_patient():
    examples_resp = client.get("/example-patients")
    severe_case = examples_resp.json()["multivessel_cad"]["data"]
    
    response = client.post("/predict", json=severe_case)
    assert response.status_code == 200
    data = response.json()
    # High risk case should predict CAD positive
    assert data["predictions"]["CAD"]["predicted_class"] == 1
    assert data["predictions"]["CAD"]["probability"] > 0.60
    assert data["vessel_stenosis_count"] >= 1

def test_explain_cad():
    response = client.post("/explain?target=CAD")
    assert response.status_code == 200
    data = response.json()
    assert data["target"] == "CAD"
    assert len(data["top_contributing_features"]) > 0
    assert "Typical Chest Pain" in [f["feature"] for f in data["top_contributing_features"]]

def test_validation_error_on_invalid_input():
    invalid_payload = {
        "Age": -5.0  # Invalid age < 18
    }
    response = client.post("/predict", json=invalid_payload)
    assert response.status_code == 422  # Unprocessable Entity
