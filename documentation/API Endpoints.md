# Moosic API Documentation

## User Authentication APIs

### POST /api/v1/user/register
**Description**: Register new user  
**Request Body**:  
```json
{ "email": string, "password": string, ... }
```  
**Response Body**:  
```json
{ "token": string, "user": object }
```

### POST /api/v1/user/login
**Description**: Login existing user  
**Request Body**:  
```json
{ "email": string, "password": string }
```  
**Response Body**:  
```json
{ "token": string, "user": object }
```

### GET /api/v1/user
**Description**: Get current user profile  
**Request Body**: None  
**Response Body**:  
```json
{ "username": string, "preferences": object }
```

### PUT /api/v1/user
**Description**: Update user preferences  
**Request Body**:  
```json
{ "preferences": object }
```  
**Response Body**:  
```json
{ "message": "updated" }
```

## Emotion Detection APIs

### POST /api/v1/emotion/face
**Description**: Detect emotion from image  
**Request Body**: multipart/form-data with image  
**Response Body**:  
```json
{ "emotion": "Happy" }
```

### POST /api/v1/emotion/voice
**Description**: Detect emotion from audio  
**Request Body**: multipart/form-data with audio  
**Response Body**:  
```json
{ "emotion": "Calm" }
```

### POST /api/v1/emotion/multi
**Description**: Detect emotion from image + audio  
**Request Body**: multipart/form-data with image, audio  
**Response Body**:  
```json
{ "emotion": "Neutral" }
```

### GET /api/v1/emotion/history
**Description**: Retrieve recent detection history  
**Request Body**: None  
**Response Body**:  
```json
{ "history": ["Happy", ...] }
```

## Music Recommendation APIs

### GET /api/v1/music/recommendation
**Description**: Get music recommendation  
**Request Body**: None  
**Response Body**:  
```json
{ "songs": ["Song A", "Song B"] }
```

### GET /api/v1/music/mood/{emotion}
**Description**: Get songs based on emotion  
**Request Body**: None  
**Response Body**:  
```json
{ "songs": [...] }
```

### POST /api/v1/music/feedback
**Description**: Submit music feedback  
**Request Body**:  
```json
{ "rating": number, "songId": string }
```  
**Response Body**:  
```json
{ "message": "Feedback submitted" }
```

### GET /api/v1/music/playlist
**Description**: Get user's current playlist  
**Request Body**: None  
**Response Body**:  
```json
{ "playlist": ["Song1", ...] }
```

## Model Management APIs

### POST /api/v1/model/retrain
**Description**: Trigger model retraining  
**Request Body**: None  
**Response Body**:  
```json
{ "message": "Model retraining triggered" }
```

### GET /api/v1/model/status
**Description**: Get model status  
**Request Body**: None  
**Response Body**:  
```json
{ "status": "ok", "version": "v1.0.0" }
```

### GET /api/v1/model/logs
**Description**: View model logs  
**Request Body**: None  
**Response Body**:  
```json
{ "logs": ["Log1", "Log2"] }
```

## Error Handling

- **400 Bad Request**  
  ```json
  {"error": "Missing 'image' parameter"}
  ```

- **401 Unauthorized**  
  ```json
  {"error": "Invalid credentials"}
  ```

- **403 Forbidden**  
  ```json
  {"error": "Access denied"}
  ```

- **404 Not Found**  
  ```json
  {"error": "Endpoint does not exist"}
  ```

- **500 Internal Server Error**  
  ```json
  {"error": "Unexpected server error"}
  ```