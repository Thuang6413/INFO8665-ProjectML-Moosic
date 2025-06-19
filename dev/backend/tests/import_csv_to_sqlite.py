# dev/backend/tests/import_csv_to_sqlite.py
import os
import pandas as pd
from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Dynamically load config.py to get the database path
config_path = os.path.join(os.path.dirname(__file__), '..', 'config.py')
with open(config_path, 'r') as f:
    config_code = compile(f.read(), config_path, 'exec')
    namespace = {'__file__': config_path}
    exec(config_code, namespace)
    Config = namespace['Config']

# Create SQLite database engine
db_path = Config.DATABASE_PATH
engine = create_engine(f'sqlite:///{db_path}')
Base = declarative_base()

# Define Song model independently, consistent with models/__init__.py
class Song(Base):
    __tablename__ = 'songs'
    id = Column(Integer, primary_key=True)
    lastfm_url = Column(String)
    track = Column(String)
    artist = Column(String)
    seeds = Column(String)
    number_of_emotion_tags = Column(Integer)
    valence_tags = Column(Float)
    arousal_tags = Column(Float)
    dominance_tags = Column(Float)
    mbid = Column(String)
    spotify_id = Column(String)
    genre = Column(String)

def import_csv_data(csv_path):
    """
    Import data from a CSV file into the SQLite database.
    """
    # Create table
    Base.metadata.create_all(engine)
    
    # Read CSV file
    df = pd.read_csv(csv_path)
    
    # If the CSV contains an 'id' column, remove it to let SQLAlchemy auto-generate it
    if 'id' in df.columns:
        df = df.drop(columns=['id'])
    
    # Import data into the 'songs' table, replacing existing data
    df.to_sql('songs', engine, if_exists='append', index=False)
    print(f"Successfully imported {len(df)} records into {db_path}")

if __name__ == "__main__":
    # Modify the CSV file path as needed
    csv_path = '/mnt/d/ConestogaCollegeWorkplaceLevel2/INFO8665-ProjectML/INFO8665-ProjectML-Moosic/data-collection/songs_dataset/muse_v3_spotify_names_100.csv'  # Replace with your CSV file path
    import_csv_data(csv_path)