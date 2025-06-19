# dev/backend/tests/authorize_spotify.py
import os
from dotenv import load_dotenv
from spotipy.oauth2 import SpotifyOAuth

# 載入 .env 檔案
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

# 獲取環境變量
client_id = os.getenv('SPOTIFY_CLIENT_ID')
client_secret = os.getenv('SPOTIFY_CLIENT_SECRET')
redirect_uri = os.getenv('SPOTIFY_REDIRECT_URI')

if not all([client_id, client_secret, redirect_uri]):
    raise ValueError("Missing Spotify credentials in .env file")

def authorize_spotify():
    # 配置 Spotify OAuth
    scope = 'user-read-playback-state user-modify-playback-state user-read-private streaming'
    auth_manager = SpotifyOAuth(
        client_id=client_id,
        client_secret=client_secret,
        redirect_uri=redirect_uri,
        scope=scope,
        show_dialog=True,
        cache_path=os.path.join(os.path.dirname(__file__), '..', '.spotify_cache')  # 自定義緩存位置
    )

    # 獲取授權 URL
    auth_url = auth_manager.get_authorize_url()
    print(f"Please open this URL in your browser to authorize: {auth_url}")

    # 等待用戶授權，然後獲取令牌
    try:
        response = input("After authorizing, paste the full callback URL (e.g., http://127.0.0.1:5001/callback?code=...) here: ")
        code = auth_manager.parse_response_code(response)
        token_info = auth_manager.get_access_token(code)
        print(f"Authorization successful! Token info: {token_info}")
    except Exception as e:
        print(f"Authorization failed: {e}")

if __name__ == "__main__":
    authorize_spotify()