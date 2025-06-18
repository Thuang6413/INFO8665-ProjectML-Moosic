# play_song_by_valence.py

## Overview

This Python script connects to the Spotify API to play a song whose valence (musical mood score) is closest to a given target valence value. It uses a dataset of songs annotated with valence scores and Spotify track IDs to find the best match.

---

## Features

- Loads a dataset of songs with valence scores and Spotify IDs.
- Finds the song with valence closest to the target valence.
- Authenticates with Spotify using OAuth and your app credentials.
- Detects active Spotify playback devices and selects one for playing.
- Starts playback of the selected song on the chosen device.

---

## Prerequisites

- Python 3.7+
- Spotipy (`pip install spotipy`)
- Pandas (`pip install pandas`)
- A Spotify Developer account with an app registered to obtain `CLIENT_ID`, `CLIENT_SECRET`, and set a `REDIRECT_URI`.

---

## Setup

1. Clone or download the repository.

2. Create a `config.py` file in the same directory (or accessible Python path) with your Spotify credentials:

```python
CLIENT_ID = 'your_spotify_client_id'
CLIENT_SECRET = 'your_spotify_client_secret'
REDIRECT_URI = 'your_redirect_uri'
