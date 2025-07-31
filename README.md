# INFO8665-ProjectML-Moosic
> Moosic is an application designed to connect with users on an emotional level. It uses advanced AI to analyze a user's mood from their facial expression and then curates a personalized music playlist that matches their feelings. This project focuses on the core of Moosic: a deep learning model for real-time valence and arousal prediction.

---
## 🧠 The Emotion Prediction Model
This repository contains the complete workflow for training the deep learning model that powers the Moosic application. The model is a state-of-the-art **Convolutional Neural Network (CNN)**, built using **TensorFlow** and **Keras**, that predicts two key dimensions of emotion from a facial image:
* **Valence**: How positive or negative an emotion is (from -1.0 to +1.0).
* **Arousal**: The intensity or energy level of an emotion (from -1.0 to +1.0).

The primary training script for this model is `Moosic_Prediction_Model.ipynb`.

---
## 🛠️ Setting Up the Training Environment
To train the model from scratch, you will need a powerful environment with a GPU. This guide is based on using a **Google Cloud Platform (GCP) Deep Learning VM**, which provides a stable and pre-configured environment.

### **1. Prerequisites**
* A **Google Cloud Platform (GCP)** account with billing enabled.
* The **AffectNet dataset** from Kaggle. You will need a `kaggle.json` API key from your Kaggle account to download it.

### **2. Create a GCP Virtual Machine**
Because of the large dataset and intensive training, a powerful VM is required.
* **Instance Type**: Use a **Deep Learning VM** from the Compute Engine.
* **Machine Series**: **G2** (`g2-standard-4`) or **N1** (`n1-standard-4`).
* **GPU**: **NVIDIA L4** or **T4**.
* **Boot Disk Image**: Select an image with pre-installed drivers, such as **"Deep Learning VM with CUDA 11.8"**.
* **Disk Size**: **250 GB** or more to accommodate the dataset.
* **Firewall**: Ensure you **"Allow HTTP traffic"** and **"Allow HTTPS traffic"**.

### **3. Set Up the Python Environment**
The pre-built environments on the VM can sometimes have issues. The most reliable method is to create your own clean, isolated environment using **Conda**.

1.  Connect to your new VM's terminal via SSH.
2.  Create a new Conda environment:
    ```bash
    conda create --name moosic_env python=3.10 -y
    ```
3.  Activate the new environment:
    ```bash
    conda activate moosic_env
    ```
4.  Install all necessary libraries using a `requirements.txt` file. First, create the file:
    ```bash
    nano requirements.txt
    ```
    Then, paste the following into the file and save it:
    ```text
    tensorflow==2.14.0
    pandas==2.2.2
    numpy==1.26.4
    scikit-learn==1.4.2
    opencv-python==4.9.0.80
    matplotlib
    seaborn
    kaggle
    ipykernel
    ```
5.  Install the libraries:
    ```bash
    pip install -r requirements.txt
    ```
6.  Link this new environment to JupyterLab so it can be used as a notebook kernel:
    ```bash
    python -m ipykernel install --user --name=moosic_env --display-name="Python (Moosic Env)"
    ```
---
## 📦 Dataset Download
The model is trained on the **AffectNet** dataset. You will need to download it to your GCP virtual machine.

1.  **Upload your `kaggle.json` API key** to your JupyterLab environment.
2.  **Run the download and unzip commands** in the terminal (this will take several hours):
    ```bash
    # Configure Kaggle API
    mkdir -p ~/.kaggle
    mv kaggle.json ~/.kaggle/
    chmod 600 ~/.kaggle/kaggle.json

    # Create a folder and download the dataset
    mkdir -p ~/AffectNet
    kaggle datasets download -d minhtmnguyntrn/affectnet-new -p ~/AffectNet/ --unzip
    ```
---
## 🚀 Training the Model
Once your environment and dataset are ready, you can train the model using the `Moosic_Prediction_Model.ipynb` notebook.

1.  Open the `Moosic_Prediction_Model.ipynb` notebook in JupyterLab.
2.  In the menu, go to **Kernel > Change Kernel** and select your new **"Python (Moosic Env)"**.
3.  Run all the cells in the notebook in order.

The notebook is structured in several key stages:

* **Stage 1: Data Preparation**: Loads the dataset, cleans it by removing invalid entries, and applies **sample weights** to combat the data imbalance, which is crucial for preventing model bias.
* **Stage 2: Data Pipeline**: Builds a robust `tf.data` pipeline that efficiently loads and preprocesses images, and is designed to skip any corrupted files without crashing.
* **Stage 3: Model Building**: Defines a highly efficient model architecture using **EfficientNetV2** as a pre-trained base. The model has two outputs (valence and arousal) that use a `tanh` activation to ensure predictions are always in the correct `[-1, 1]` range.
* **Stage 4: Training**: The model is trained using a two-phase fine-tuning process for maximum accuracy.
    * **Phase 1**: Trains only the new layers on top of the frozen base model.
    * **Phase 2**: Unfreezes the base model and continues training with a very low learning rate to fine-tune all layers.

The best-performing model is automatically saved as **`mood_predictor.h5`**.

---
## 👨‍💻 Author
Developed by the Moosic Team.
