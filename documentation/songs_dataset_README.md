## Dataset

This project uses the **MuSe: The Musical Sentiment Dataset**, which provides valence, arousal, and dominance scores for over 90,000 songs based on user-generated tags from Last.fm. The dataset is designed to facilitate research on music sentiment and emotion recognition.

**MuSe Dataset Key Features:**

- Sentiment annotations with Valence (pleasantness), Arousal (intensity), and Dominance (control)  
- Metadata including artist, track title, and identifiers (MusicBrainz, Spotify)  
- Large scale: 90,001 songs with mood-related tags  

---

## About the MuSe Dataset

The MuSe dataset was created by Christopher Akiki and Manuel Burghardt at Leipzig University. It is publicly available on Kaggle:  
[MuSe: The Musical Sentiment Dataset](https://www.kaggle.com/datasets/cakiki/muse-the-musical-sentiment-dataset)

Please refer to the original dataset page for detailed information and usage terms.

---

## Data Dictionary

| Column Name             | Description                                              |
|------------------------|----------------------------------------------------------|
| `lastfm_url`           | URL to the song's Last.fm page                           |
| `track`                | Title of the song                                        |
| `artist`               | Name of the artist                                       |
| `seeds`                | Initial mood tags used to collect data                   |
| `number_of_emotion_tags` | Number of mood-related tags associated with the song     |
| `valence_tags`         | Valence score (pleasantness level)                       |
| `arousal_tags`         | Arousal score (intensity level)                          |
| `dominance_tags`       | Dominance score (sense of control or influence)          |
| `mbid`                 | MusicBrainz Identifier (if available)                    |
| `spotify_id`           | Spotify Identifier (if available)                        |

---
