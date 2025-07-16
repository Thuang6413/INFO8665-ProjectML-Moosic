# Use TensorFlow CPU base image
FROM tensorflow/tensorflow:2.19.0

# Set working directory
WORKDIR /app

# Install system dependencies for opencv-python, h5py, etc.
RUN apt-get update && apt-get install -y \
    python3-dev \
    libpng-dev \
    libjpeg-dev \
    zlib1g-dev \
    libhdf5-dev \
    libgl1-mesa-dev \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy application code
COPY . .

# Install Python dependencies, ignoring distutils-installed packages
RUN pip install --no-cache-dir --ignore-installed -r requirements_linux_cpu.txt

# Expose port
EXPOSE 5000

# Run the application
CMD ["python", "app.py"]