import pandas as pd
import spotipy
from spotipy.oauth2 import SpotifyOAuth
import config

scope = 'user-read-playback-state user-modify-playback-state user-read-private streaming'

target_valence = 9.7

df = pd.read_csv(r'muse_v3_clean_english.csv')
df = df[df['spotify_id'].notna() & df['valence_tags'].notna()]

df['valence_diff'] = (df['valence_tags'] - target_valence).abs()
closest_song = df.loc[df['valence_diff'].idxmin()]

track_name = closest_song['track']
artist_name = closest_song['artist']
valence_value = closest_song['valence_tags']
spotify_uri = f"spotify:track:{closest_song['spotify_id']}"

print(f"Target Valence: {target_valence}")
print(f"Closest match: '{track_name}' by {artist_name} (valence: {valence_value})")

sp = spotipy.Spotify(auth_manager=SpotifyOAuth(
    client_id=config.CLIENT_ID,
    client_secret=config.CLIENT_SECRET,
    redirect_uri=config.REDIRECT_URI,
    scope=scope
))

devices = sp.devices()
if not devices['devices']:
    print("No active Spotify devices found. Open Spotify on your device.")
    exit()

active_device_id = None
for device in devices['devices']:
    if device['is_active']:
        active_device_id = device['id']
        break

if not active_device_id:
    active_device_id = devices['devices'][0]['id']
    print(f"Switching playback to {devices['devices'][0]['name']}")

sp.start_playback(device_id=active_device_id, uris=[spotify_uri])
print("Playback started.")
