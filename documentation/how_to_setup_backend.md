# How to Set Up the Backend

This guide walks you through the process of setting up the backend for the Moosic project. Follow these steps carefully to create a virtual environment, install dependencies, and configure the application.

## Prerequisites
- A Unix-based system (Linux, macOS) or Windows with WSL (Windows Subsystem for Linux).
- Python 3.12 installed (check with `python --version`).
- Git installed (check with `git --version`).
- Access to the project repository: [INFO8665-ProjectML-Moosic](https://github.com/Thuang6413/INFO8665-ProjectML-Moosic).

## Step-by-Step Instructions

### 1. Clone the Repository
Clone the project repository to your local machine:
```bash
git clone https://github.com/Thuang6413/INFO8665-ProjectML-Moosic.git
cd INFO8665-ProjectML-Moosic/dev/backend
```

### 2. Create a Virtual Environment
Create a virtual environment to isolate project dependencies:
```bash
python -m venv .venv
```

Activate the virtual environment:
- On macOS/Linux:
  ```bash
  source .venv/bin/activate
  ```
- On Windows (cmd):
  ```bash
  .venv\Scripts\activate
  ```

You should see `(.venv)` prepended to your terminal prompt, indicating the virtual environment is active.

### 3. Install Dependencies from `requirements.txt`
Ensure a `requirements.txt` file exists in the `dev/backend` directory. If not, create one with the necessary dependencies based on the project's needs. A sample `requirements.txt` might look like this:

```
flask==2.3.2
flask-sqlalchemy==3.1.1
spotipy==2.23.0
pandas==2.2.2
sqlalchemy==2.0.30
opencv-python==4.10.0
tensorflow==2.19.0
pillow==10.4.0
python-dotenv==1.0.1
```

Install the dependencies:
- On Windows CPU:
  ```bash
  pip install -r requirements_windows_cpu.txt
  ```
- On Windows GPU (cuda):
  ```bash
  pip install -r requirements_windows_gpu_cuda.txt
  ```
- macOS/Linux:
  ```bash
  TODO:: Should test for a macOS
  ```

Verify the installations:
```bash
pip list | grep -E "flask|sqlalchemy|spotipy|pandas|opencv|tensorflow|pillow|python-dotenv"
```

### 4. Configure Environment Variables
Copy the `example.env` file to create a `.env` file in the `dev/backend` directory to store sensitive configuration data:
```bash
cp example.env .env
```
Edit `.env` with a text editor (e.g., `nano .env` or `vim .env`) and modify the following content:
```
JWT_SECRET_KEY=your-very-secure-random-key
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
SPOTIFY_REDIRECT_URI=http://127.0.0.1:5001/callback
```
- Replace `your-very-secure-random-key` with a strong, unique secret key (e.g., generated using `openssl rand -hex 32`).
- Replace `your_client_id` and `your_client_secret` with values from your [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
- Ensure `SPOTIFY_REDIRECT_URI` matches the port used in `app.py` (default is `http://127.0.0.1:5001/callback`).


### 5. Set Up the Database
Import the initial song data into the SQLite database:
```bash
python tests/import_csv_to_sqlite.py
```
- Ensure the CSV file path in `import_csv_to_sqlite.py` (`\INFO8665-ProjectML-Moosic\data-collection\songs_dataset\muse_v3_spotify_names_100.csv`) matches your local setup. Update it if necessary.
- This script creates the `songs` table and populates it with data.

### 6. Authorize Spotify
Run the authorization script to obtain a Spotify access token:
```bash
python tests/authorize_spotify.py
```
- Open the provided URL in your browser (e.g., `https://accounts.spotify.com/authorize?...`), log in to Spotify, and authorize the app.
- Paste the full callback URL (e.g., `http://127.0.0.1:5001/callback?code=...`) into the terminal when prompted.
- The script will save the token to `.spotify_cache`.

### 7. Run the Application
Start the Flask application:
```bash
python app.py
```
- The application runs on `http://127.0.0.1:5000` (port 5000).
- Ensure your GPU is available (NVIDIA GeForce RTX 3070 in your logs) and TensorFlow is configured to use it.

### 8. Test the Endpoint
Test the emotion detection and music playback endpoint:
```bash
curl -X POST http://localhost:5000/api/v1/emotion/face -F "image=@/mnt/d/path/to/test_image.jpg" -F "model=emotion_face_fer2013"
```
- Expected response (JSON):
  ```json
  {
    "emotion": "happy",
    "valence": 9.5,
    "recommended_song_name": "Strip Tease",
    "recommended_song_url": "https://open.spotify.com/track/6kapmatG5ez3ceZ3dm3DdZ"
  }
  ```

- Open Spotify to verify playback if a device is active.

### 9. Troubleshooting
- **Dependency Issues**: If a package is missing, install it manually (e.g., `pip install <package>`).
- **Port Conflict**: If port 5001 is in use, change it in `app.py` (e.g., `app.run(port=5002)`) and update `SPOTIFY_REDIRECT_URI` in `.env`.
- **Authorization Failure**: If Spotify authorization fails, delete `.spotify_cache` (`rm -rf .spotify_cache`) and rerun `authorize_spotify.py`.
- **Database Errors**: Verify `moosic.db` permissions (`chmod 664 moosic.db`) and table structure (`python -c "from sqlalchemy import create_engine; print(create_engine('sqlite:///moosic.db').execute('PRAGMA table_info(songs)').fetchall())"`).

## Additional Notes
- **GPU Support**: Ensure CUDA and cuDNN are installed for TensorFlow GPU support (see TensorFlow documentation).
- **Development Mode**: The app runs with debug mode off by default; enable it by setting `app.debug = True` in `app.py` if needed.
- **Security**: Never commit `.env` or `.spotify_cache` to version control; use `.gitignore` to exclude them.
