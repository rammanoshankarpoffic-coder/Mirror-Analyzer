import tensorflow as tf
import numpy as np
import cv2

CLASSES = {
    0: 'Actinic Keratosis (AK)',
    1: 'Basal Cell Carcinoma (BCC)',
    2: 'Benign Keratosis (BKL)',
    3: 'Dermatofibroma (DF)',
    4: 'Melanoma (MEL)',
    5: 'Nevus (NV)',
    6: 'Squamous Cell Carcinoma (SCC)',
    7: 'Vascular Lesion (VASC)'
}

URGENT = [1, 4, 6]

class SkinDiseaseDetector:
    def __init__(self, model_path):
        print("Loading skin disease model...")
        self.model = tf.keras.models.load_model(model_path)
        print("Model loaded!")

    def predict(self, image):
        img = cv2.resize(image, (224, 224))
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        img = img.astype(np.float32) / 255.0
        img = np.expand_dims(img, axis=0)
        predictions = self.model.predict(img, verbose=0)[0]
        class_id = int(np.argmax(predictions))
        confidence = float(predictions[class_id]) * 100
        disease = CLASSES[class_id]
        is_urgent = class_id in URGENT
        return {
            'disease': disease,
            'confidence': confidence,
            'urgent': is_urgent,
            'all_scores': {CLASSES[i]: round(float(predictions[i])*100, 1)
                          for i in range(8)}
        }
