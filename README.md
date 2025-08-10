# Moosic

AI-powered music recommendation platform that detects your mood from facial expressions and instantly plays songs that match your emotions – uses Spotify playback.

---

## Table of Contents
- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running Locally](#running-locally)
- [Usage](#usage)
- [License](#license)
- [Acknowledgements](#acknowledgements)

---

## About

**Moosic** is an AI-driven music streaming app designed to enhance emotional well-being through personalized music recommendations.  
It uses a **pretrained Py-Feat model** to detect facial expressions from an image and maps these to **valence** and **arousal** scores using a weighted average of five primary emotions.  
These emotion metrics are then matched to songs in a curated dataset containing valence and arousal values, with playback through Spotify.

During development, Moosic also experimented with a **custom TensorFlow deep learning model** for emotion recognition trained on labeled facial datasets.  
While the TensorFlow model showed promising results, the Py-Feat model was ultimately chosen for production due to its stability, ease of integration, and pretrained accuracy.

---

## Features

- **Facial Expression Recognition (Production)** — Detect emotions from facial images using the pretrained Py-Feat model.
- **Valence & Arousal Mapping** — Infer continuous emotional metrics from discrete emotions via weighted averages.
- **Spotify Integration** — Play songs directly via Spotify API with OAuth or personal credentials.
- **JWT-secured Authentication** — Secure login, registration, and token-based access.
- **Song Dataset with Valence & Arousal Metrics** — Match detected emotions to suitable music.
- **Experimental TensorFlow Model (R&D)** — Custom-trained CNN-based emotion recognition model tested during development.

---

## Tech Stack

- **Frontend:** React (Vite + TypeScript), TailwindCSS
- **Backend:** Python (Flask)
- **Machine Learning:** Py-Feat, TensorFlow, OpenCV
- **Database:** SQLite
- **Integration:** Spotify Web API
- **Other Tools:** Poetry, Docker, GitHub Actions

---

## Repository Structure

```
INFO8665-ProjectML-Moosic/
│
├── dev/
│   ├── backend/                  # Flask backend
│   │   ├── app.py                 # Main Flask application entry point
│   │   ├── config.py              # Application configuration
│   │   ├── models/                # Database models
│   │   ├── routes/                # API route blueprints
│   │   ├── utils/                 # Utility functions
│   │   ├── ai_models/             # TensorFlow models (if any)
│   │   ├── logs/                  # Application logs
│   │   └── requirements.txt       # Backend dependencies
│   │
│   └── frontend/                  # React frontend
│       ├── src/
│       │   ├── pages/              # Page components
│       │   ├── components/         # UI components
│       │   ├── App.tsx             # Main app router
│       │   ├── main.tsx            # Frontend entry point
│       │   └── index.css           # Global styles
│       ├── package.json
│       └── vite.config.ts
│
├── README.md
└── LICENSE
```

---

## Getting Started

### Prerequisites

- **Python** `3.10.11`
- **Node.js** `>=18`
- **Poetry** (if using Poetry setup)
- **Git**

---

### Installation

You can set up Moosic in two ways: **using Poetry** (recommended) or **using requirements.txt**.

---

#### Option 1 — Using Poetry (Recommended)

```bash
# Clone the repository
git clone https://github.com/Thuang6413/INFO8665-ProjectML-Moosic.git
cd INFO8665-ProjectML-Moosic

# Install backend dependencies
poetry install

# Install frontend dependencies
cd dev/frontend
npm install
```

---

#### Option 2 — Using requirements.txt

```bash
# Clone the repository
git clone https://github.com/Thuang6413/INFO8665-ProjectML-Moosic.git
cd INFO8665-ProjectML-Moosic

# Backend setup
cd dev/backend

# Create a virtual environment
python3 -m venv venv

# Activate the virtual environment
# macOS / Linux:
source venv/bin/activate
# Windows (PowerShell):
venv\Scripts\Activate.ps1

# Upgrade pip and install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Install frontend dependencies
cd ../frontend
npm install
```

---

## Running Locally

```bash
# Start backend
cd INFO8665-ProjectML-Moosic
poetry env activate | Invoke-Expression     # If using Poetry
# OR source venv/bin/activate (if using requirements.txt)
cd /dev/backend
python app.py

# Start frontend (in another terminal)
cd dev/frontend
npm run dev
```

---

## Usage

Once the application is running:

1. Open `http://localhost:5173` in your browser.
2. Register or Login.
3. Connect to Spotify via API creds (required, for playback).
4. Capture your mood via camera.
5. Receive an instant, mood-based recommendation.


---

## License

This project is licensed under the **MIT License** – see the [LICENSE](LICENSE) file for details.

---

## Acknowledgements

- [OpenAI](https://openai.com/) — for foundational AI research and tools.
- [Spotify Web API](https://developer.spotify.com/documentation/web-api/) — for music streaming integration.
- [TensorFlow](https://www.tensorflow.org/) — for ML experimentation during development.
- [Py-Feat](https://py-feat.org/) — for facial expression detection and emotion analysis.

## References

- Athavle, M., Mudale, D., Shrivastav, U., & Gupta, M. (2021). CNN-based facial emotion recognition for automated music playlist generation. *Journal of Informatics Electrical and Electronics Engineering, 2*(2), 1–11.
- Babua, T., Naira, R. R., & Geetha, A. (2023). Blockchain-integrated CNN model for emotion-based music recommendations. *Emotion-Aware Music Recommendation System*.
- Kambham, S., Hubert, A., & Reddy, S. P. (2025). Real-time emotion detection and automated music recommendation using DeepFace. In D. C. Wyld et al. (Eds.), *Proceedings of the 2025 International Conference on Software Technology and Applications (SOFTPA)* (pp. 139–151). Computer Science & IT (CS & IT).
- Leung, H. T., Law, M. H., & Horner, A. B. (2024). Enhancing emotional well-being through active music listening: A study on mood improvement effects of music rhythm games. *Proceedings of Meetings on Acoustics, 52*(1).
- Rajesh, B., Keerthana, V., Darapaneni, N., & Reddy, P. A. (2025). ResNet50-based facial emotion recognition with explainable AI for music recommendation. *EAI Endorsed Transactions on Scalable Information Systems*.
- Sheng, H., & Lau, M. (2024). Optimizing real-time facial expression recognition with ResNet architectures. *Journal of Machine Intelligence and Data Science, 5*(1).
- Singh, S. (2023). Music recommendation system based on facial emotion expression using ConvLSTM and CNN.

<b> *These can be found in /documentation.* </b>
