# training_pipeline.py
import tensorflow as tf
import pandas as pd
import numpy as np
import os
import logging
from model import build_va_model
from utils import safe_load_and_preprocess

# Setup basic logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def create_tf_dataset(df, image_dir):
    """Creates a TensorFlow dataset from a dataframe."""
    image_paths = df['subDirectory_filePath'].apply(lambda x: os.path.join(image_dir, x)).values
    valences = df['valence'].values
    arousals = df['arousal'].values
    expressions = tf.keras.utils.to_categorical(df['expression'].values, num_classes=8)

    images = [safe_load_and_preprocess(path) for path in image_paths]
    # Filter out images that failed to load
    valid_indices = [i for i, img in enumerate(images) if img is not None]

    images = np.vstack([images[i] for i in valid_indices])
    valences = valences[valid_indices]
    arousals = arousals[valid_indices]
    expressions = expressions[valid_indices]

    dataset = tf.data.Dataset.from_tensor_slices((
        images,
        {'valence_output': valences, 'arousal_output': arousals, 'expression_output': expressions}
    ))
    return dataset.batch(32)

def run_training(model_save_path='mood_predictor.h5'):
    """
    Orchestrates the model training process.
    """
    logging.info("Starting model training pipeline...")

    # Define paths
    processed_data_dir = 'processed_data'
    image_dir = 'images' # Assumes images are in a folder named 'images'
    train_csv_path = os.path.join(processed_data_dir, 'train.csv')
    val_csv_path = os.path.join(processed_data_dir, 'val.csv')

    # Load data
    train_df = pd.read_csv(train_csv_path)
    val_df = pd.read_csv(val_csv_path)

    # Create TF Datasets
    logging.info("Creating TensorFlow datasets...")
    train_dataset = create_tf_dataset(train_df, image_dir)
    val_dataset = create_tf_dataset(val_df, image_dir)

    # Build model
    logging.info("Building the model...")
    model = build_va_model()

    # Define losses, weights, and metrics as in your notebook
    losses = {
        'valence_output': 'mean_squared_error',
        'arousal_output': 'mean_squared_error',
        'expression_output': 'categorical_crossentropy'
    }
    loss_weights = {
        'valence_output': 1.0,
        'arousal_output': 1.0,
        'expression_output': 0.5
    }
    metrics = {'expression_output': 'accuracy'}

    # === PHASE 1: Initial Training ===
    logging.info("Starting Phase 1: Training the top layers.")
    model.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
                  loss=losses, loss_weights=loss_weights, metrics=metrics)
    model.fit(train_dataset, epochs=5, validation_data=val_dataset) # Reduced epochs for example

    # === PHASE 2: Fine-tuning ===
    logging.info("Starting Phase 2: Fine-tuning the entire model.")
    model.trainable = True # Unfreeze all layers
    model.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=1e-5), # Lower learning rate
                  loss=losses, loss_weights=loss_weights, metrics=metrics)
    model.fit(train_dataset, epochs=5, validation_data=val_dataset) # Reduced epochs for example

    # Save the final model
    logging.info(f"Training complete. Saving model to {model_save_path}...")
    model.save(model_save_path)
    logging.info("Model training pipeline finished.")

if __name__ == '__main__':
    run_training()