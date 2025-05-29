# MoosicAPI – RESTful API Documentation

Base URL: `http://localhost:5000`

---

## Authentication & User Endpoints

### POST /api/register  
Registers a new user.  
**Request Body (JSON):**  
- `username`: string  
- `password`: string  

---

### POST /api/login  
Authenticates a user and returns a token.  
**Request Body (JSON):**  
- `username`: string  
- `password`: string  

---

### GET /api/user  
Retrieves the current user's profile information.  

---

### PUT /api/user  
Updates user preferences or profile details.  
**Request Body (JSON):**  
- Any user preference fields (e.g., `preferred_genre`, `theme`)

---

## Emotion Detection Endpoints

### POST /api/emotion/face  
Uploads a face image and returns detected emotion.  
**Request Body:** Multipart/form-data with image file

---

### POST /api/emotion/voice  
Uploads audio and returns detected emotion.  
**Request Body:** Multipart/form-data with audio file

---

### POST /api/emotion/multi  
Uploads both face and voice data and returns fused emotion.  
**Request Body:** Multipart/form-data with image and audio files

---

### GET /api/emotion/history  
Retrieves emotion detection history for the user.  
**Authorization:** Token (if implemented)

---

## Music Recommendation Endpoints

### GET /api/music/recommendation  
Returns music suggestions based on the latest detected emotion.

---

### GET /api/music/mood/<emotion>  
Returns a music list based on a manually selected emotion.  
**Path Parameter:**  
- `emotion`: string

---

### POST /api/music/feedback  
Submits feedback on song relevance.  
**Request Body (JSON):**  
- `song_id`: string  
- `relevance`: string or score

---

## Machine Learning Model Endpoints

### POST /api/model/retrain  
Triggers ML model retraining with new data.  
**Authorization:** Admin (if implemented)

---

### GET /api/model/status  
Returns current model version and health status.

---

### GET /api/model/logs  
Retrieves logs or error traces related to the model.

---

## Playlist Endpoint

### GET /api/music/playlist  
Returns the current playlist for the user.
