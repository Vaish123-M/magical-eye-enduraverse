import os
from pydub import AudioSegment
from pydub.playback import play
import threading

AUDIO_DIR = os.path.join(os.path.dirname(__file__), 'audio')

AUDIO_FILES = {
    'OK': {
        'hindi': 'ok_hindi.mp3',
        'marathi': 'ok_marathi.mp3',
    },
    'NOT_OK': {
        'hindi': 'not_ok_hindi.mp3',
        'marathi': 'not_ok_marathi.mp3',
    }
}

def play_audio(result: str, language: str = 'hindi'):
    """
    Play the audio file for the given result and language in a non-blocking way.
    :param result: 'OK' or 'NOT_OK'
    :param language: 'hindi' or 'marathi'
    """
    filename = AUDIO_FILES.get(result, {}).get(language)
    if not filename:
        return
    filepath = os.path.join(AUDIO_DIR, filename)
    if not os.path.exists(filepath):
        return
    def _play():
        audio = AudioSegment.from_file(filepath)
        play(audio)
    threading.Thread(target=_play, daemon=True).start()
