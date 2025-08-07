FROM python:3.11-slim

WORKDIR /app

# Install system dependencies including curl for uv installation
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    zlib1g-dev \
    libhdf5-dev \
    libgl1-mesa-dev \
    libglib2.0-0 \
    build-essential \
    libfreetype6-dev \
    libatlas-base-dev \
    libopenblas-dev \
    liblapack-dev \
    gfortran \
    pkg-config \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install uv and add it to PATH
RUN curl -LsSf https://astral.sh/uv/install.sh | sh && \
    export PATH="/root/.local/bin:$PATH" && \
    uv --version

# Set PATH globally for subsequent commands
ENV PATH="/root/.local/bin:$PATH"

# Copy requirements first to leverage caching
COPY requirements.txt .
RUN uv pip install --system -r requirements.txt

# Copy the rest of the application
COPY . .

EXPOSE 5000

CMD ["python", "app.py"]