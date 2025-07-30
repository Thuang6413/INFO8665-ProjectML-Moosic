# How to Set Up the Project with Docker Compose

This guide walks you through the process of setting up the entire Moosic project (backend and frontend) using Docker Compose. Docker Compose allows you to run both services in containers, ensuring consistency across environments. This setup assumes you have the backend (Flask + TensorFlow) and frontend (Vite + React) configured as per the repository structure.

## Prerequisites

- Docker installed (check with `docker --version`).
- Docker Compose installed (check with `docker-compose --version` or `docker compose version` for v2).
- Git installed (check with `git --version`) (only required if cloning the repository).
- Access to the project repository: INFO8665-ProjectML-Moosic (only required if cloning).
- NVIDIA GPU drivers and CUDA/cuDNN for GPU support in the backend (optional, if using GPU).
- A Spotify Premium Developer account for API credentials.
- A `docker-compose.env` file with required environment variables (see repository for details) if using Docker CLI commands.

## Setup Options
### Option 1: Use Docker CLI Commands (Without Cloning the Repository)

If you prefer not to clone the entire project, you can pull and run the pre-built Docker images directly using Docker CLI commands. Ensure you have the `docker-compose.env` file with the necessary environment variables for the backend (e.g., Spotify API credentials).

#### 1. Create the Network

Create a bridge network for communication between the backend and frontend containers:

```bash
docker network create --driver bridge moosic-network
```

#### 2. Run the Backend Service

Follow the `docker-compose.env`:
```
JWT_SECRET_KEY=your-very-secure-random-key
SPOTIFY_REDIRECT_URI=http://127.0.0.1:5000/spotify/callback
FROENTEND_URL=http://127.0.0.1:3000
DATABASE_NAME=moosic.db
SPOTIFY_SCOPES="user-read-playback-state user-modify-playback-state user-read-private streaming"
```

Start the backend container:

```bash
docker run -d \
  --name moosic-backend \
  --env-file docker-compose.env \
  -p 5000:5000 \
  --network moosic-network \
  --restart unless-stopped \
  thuang6413/moosic-backend:3.2
```

#### 3. Run the Frontend Service

Start the frontend container, linking it to the backend:

```bash
docker run -d \
  --name moosic-frontend \
  -p 3000:3000 \
  --network moosic-network \
  --restart unless-stopped \
  thuang6413/moosic-frontend:3.2
```

- The backend will be available at `http://localhost:5000`, and the frontend at `http://localhost:3000`.
- **Note**: Ensure the `docker-compose.env` file is in your current directory or provide the full path to it when running the backend container. The frontend depends on the backend, so the backend must be running first.


### Option 2: Clone the Repository and Use Docker Compose

This is the recommended approach if you want to work with the full project source code.

#### 1. Clone the Repository

Clone the project repository to your local machine:

```bash
git clone https://github.com/Thuang6413/INFO8665-ProjectML-Moosic.git
cd INFO8665-ProjectML-Moosic/dev
```

#### 2. Build and Start the Services

Run the following command to build and start the services:

```bash
docker-compose up --build
```

- `--build`: Forces a rebuild of the images.
- The backend will be available at `http://localhost:5000`, and the frontend at `http://localhost:3000`.


## Notes

- If using the Docker CLI method, you must manually create or obtain the `docker-compose.env` file with the required environment variables (e.g., Spotify API credentials). Refer to the repository's documentation for the necessary variables.
- The Docker CLI commands assume the images `thuang6413/moosic-backend:3.2` and `thuang6413/moosic-frontend:3.2` are available on Docker Hub. Ensure they are publicly accessible or use the correct image names if hosted elsewhere.
- To stop the containers when using Docker CLI:

  ```bash
  docker stop moosic-backend moosic-frontend
  docker rm moosic-backend moosic-frontend
  docker network rm moosic-network
  ```
- For Docker Compose, stop the services with:

  ```bash
  docker-compose down
  ```
