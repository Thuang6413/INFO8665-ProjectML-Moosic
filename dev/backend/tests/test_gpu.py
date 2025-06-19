# dev/backend/tests/test_gpu.py
import pytest
import tensorflow as tf
from backend.app import app
from backend.services.emotion_inference import predict_emotion
from backend.routes.emotion_routes import detect_emotion_face
from PIL import Image
import io

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        with app.app_context():
            yield client

def test_gpu_usage(client):
    gpus = tf.config.list_physical_devices('GPU')
    assert len(gpus) > 0, "No GPU detected"
    img = Image.new('RGB', (100, 100), color='gray')
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='JPEG')
    img_byte_arr = img_byte_arr.getvalue()
    response = client.post('/api/v1/emotion/face',
                        data={'image': (io.BytesIO(img_byte_arr), 'test.jpg'), 'model': 'emotion_face_fer2013'},
                        content_type='multipart/form-data')
    assert response.status_code == 200
    data = response.json
    assert "emotion" in data