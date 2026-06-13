import cv2
import mediapipe as mp
import numpy as np

class FaceAnalyzer:
    def __init__(self):
        self.mp_face = mp.solutions.face_mesh
        self.face_mesh = self.mp_face.FaceMesh(
            static_image_mode=False,
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        self.mp_draw = mp.solutions.drawing_utils

    def analyze(self, frame):
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.face_mesh.process(rgb)

        if not results.multi_face_landmarks:
            return None

        landmarks = results.multi_face_landmarks[0]
        h, w = frame.shape[:2]

        # Get key points as pixel coordinates
        points = {}
        for i, lm in enumerate(landmarks.landmark):
            points[i] = (int(lm.x * w), int(lm.y * h))

        # Face symmetry score (0-100)
        left_x  = points[234][0]
        right_x = points[454][0]
        nose_x  = points[1][0]
        center  = (left_x + right_x) / 2
        symmetry = 100 - abs(nose_x - center) / (right_x - left_x) * 100

        return {
            'points': points,
            'symmetry': round(symmetry, 1),
            'face_detected': True
        }

    def draw_landmarks(self, frame, analysis):
        if analysis is None:
            return frame
        # Draw just a few key points
        key_points = [1, 33, 263, 61, 291, 199]
        for idx in key_points:
            pt = analysis['points'][idx]
            cv2.circle(frame, pt, 2, (0, 255, 0), -1)
        return frame
