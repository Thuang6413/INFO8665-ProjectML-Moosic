# How to Set Up the Project with Docker Compose

This guide walks you through the process of setting up the entire Moosic project (backend and frontend) using Docker Compose. Docker Compose allows you to run both services in containers, ensuring consistency across environments. This setup assumes you have the backend (Flask + TensorFlow) and frontend (Vite + React) configured as per the repository structure.

## Prerequisites

- Docker installed (check with `docker --version`).
- Docker Compose installed (check with `docker-compose --version` or `docker compose version` for v2).
- Git installed (check with `git --version`).
- Access to the project repository: [INFO8665-ProjectML-Moosic](https://github.com/Thuang6413/INFO8665-ProjectML-Moosic).
- NVIDIA GPU drivers and CUDA/cuDNN for GPU support in the backend (optional, if using GPU).
- A Spotify Premium Developer account for API credentials.

## Step-by-Step Instructions

### 1. Clone the Repository

Clone the project repository to your local machine:

```bash
git clone https://github.com/Thuang6413/INFO8665-ProjectML-Moosic.git
cd INFO8665-ProjectML-Moosic/dev
```

### 2. Build and start the services:

```bash
docker-compose up --build
```

- `--build`: Forces a rebuild of the images.
- The backend will be available at `http://localhost:5000`, and the frontend at `http://localhost:3000`.
