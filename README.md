# INFO8665-ProjectML-Moosic
> Moosic will be an app people use when they want music that matches how they feel. It will use AI to read your mood from your face, voice, or words, and then suggest songs that fit your feelings. This will help users feel better and keep them coming back
---

### Instructures
```
INFO8665-ProjectML-Moosic/
├── data-collection/ # Directory for dataset
├── dev/ # Directory for development
│   ├── backend/ # Backend files
│   ├── frontend/ # Frontend files
├── documentation/ # Directory for any documentation
├── training/ # Directory for trained model
├── orchestrator.ipynb
└── README.md
```
# Emotion Detection Use Case 


## Emotion Detection Using CNN (Valence & Arousal Regression)

This project captures real-time video frames, detects faces, and predicts emotional valence and arousal using a trained Convolutional Neural Network (CNN). It supports live camera capture, real-time predictions, saving captured images and scores, and visual display of results.

---

## 📁 Use Case Directory Structure

```
Emotion Detection use case 1/
├── Emotion_Recognition_Model_Training.ipynb               # Trains the emotion recognition model
├── Emotion_Detection_Model_Deployment.ipynb            # Runs webcam inference and captures data
├── Emotion_Recognition_Model.h5   # Trained Keras model
├── training.csv                   # Dataset for training (valence, arousal, image path)
├── requirements_Emotion_Recognition_Venv.txt               # All dependencies listed here
├── README.md                      # Project documentation
├── captured_data/
│   ├── emotion_scores.csv         # CSV of captured image scores
│   └── capture_*.jpg              # Captured frames from webcam

other than this we also have the HTML version of the same notebook files to host it on GitHub Pages
```

---

## 🛠️ Setup Instructions

1. **Clone or Download** the project.

2. **Install Dependencies**
   
run this on either your local terminal or virtual environment terminal.

```bash
pip install -r requirements_Emotion_Recognition_Venv.txt
```

This includes:
- TensorFlow
- OpenCV
- NumPy
- Pandas
- scikit-learn
- matplotlib
- tqdm

---

## 🧠 Model Training

To train the model:

```bash
motion_Recognition_Model_Training.ipynb
```

- Loads and preprocesses data from `training.csv`
- Trains two CNN models
- Saves the best performing model as `Emotion_Recognition_Model.h5`
- Plots training history comparison

---

## 🎥 Real-Time Emotion Detection

To start live emotion detection and capture:

```bash
Emotion_Detection_Model_Deployment
```

### Features:
- Detects face using Haar Cascade
- Predicts valence & arousal for the face
- Press `c` to capture an image + save its prediction
- Press `q` to quit

Saved data:
- Captured images: `captured_data/`
- Scores logged to: `captured_data/emotion_scores.csv`

---

## ⚠️ Notes

- Input image size: **96x96 grayscale**
- Valence & Arousal range: **[-1, 1]**
- Ensure webcam is enabled and accessible
- Close `emotion_scores.csv` if appending fails (PermissionError)

---

## 👨‍💻 Author

Developed by the Moosic Team
Built using TensorFlow, OpenCV, and Python.

---

## 📄 License

This project is licensed for educational and research purposes.
