AffectNet-new Dataset
=====================

Facial Expression Dataset in the Wild • Approx. 1 million images • Total Size: ~54 GB

Overview
--------
AffectNet-new is a large-scale dataset designed for training and evaluating facial expression recognition models. It contains a total of approximately 54 GB of image data spread across 1,381 folders. Each folder holds a large number of facial images captured in the wild.

Dataset Link:
https://www.kaggle.com/datasets/minhtmnguyntrn/affectnet-new

The dataset is inspired by the original AffectNet dataset, which includes both categorical and dimensional emotion annotations.

Data Structure
--------------
- Total Size: ~54 GB
- Total Folders: 1,381
- Folder Content: Each folder contains numerous images (in .jpg/.png format)
- Folder Naming: Typically grouped by emotion category or collection batch

Sample Folder Structure:
AffectNet-new/
├── folder_0001/
│   ├── img_000001.jpg
│   ├── img_000002.jpg
│   └── ...
├── folder_0002/
│   ├── img_000034.jpg
│   ├── img_000035.jpg
│   └── ...
└── ...

Possible Annotations (if metadata is included):
- Emotion labels: Neutral, Happy, Angry, Sad, Fear, Surprise, Disgust, Contempt
- Valence (scale -1 to 1): How pleasant the emotion is
- Arousal (scale -1 to 1): How active/intense the emotion is

Use Cases
---------
- Facial expression recognition (FER)
- Valence-arousal prediction models
- Emotion-aware applications
- Deep learning for affective computing

Data Preparation Notes
----------------------
- Ensure all images are intact and non-corrupted
- Resize or normalize images as needed for ML pipelines
- Use metadata (if provided) to associate images with labels
- Consider face alignment or cropping for better accuracy

Citation
--------
If using this dataset, please cite:

Mollahosseini et al., "AffectNet: A Database for Facial Expression, Valence, and Arousal in the Wild", IEEE Transactions on Affective Computing, 2017.

License
-------
Check Kaggle dataset page for license terms. Generally for research and non-commercial use only.

Contact
-------
For questions about structure or usage, refer to the Kaggle discussion section or contact the dataset maintainer listed on the dataset page.
