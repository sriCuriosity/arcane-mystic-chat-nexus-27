from flask import Flask, request, send_file
import requests
import io

app = Flask(__name__)

API_KEY = 'sk_339f0f21eed6439fcfb045260e99cb4697147ee7bdd834b6'
VOICE_ID = 'IRHApOXLvnW57QJPQH2P' 

@app.route('/speak', methods=['POST'])
def speak():
    text = request.json.get('text')

    response = requests.post(
        f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}",
        headers={
            "xi-api-key": API_KEY,
            "Content-Type": "application/json",
            "Accept": "audio/mpeg"
        },
        json={
            "text": text,
            "model_id": "eleven_monolingual_v1"
        }
    )

    if response.status_code != 200:
        return {"error": "Text-to-speech failed"}, 500

    return send_file(
        io.BytesIO(response.content),
        mimetype="audio/mpeg",
        as_attachment=False,
        download_name="speech.mp3"
    )

if __name__ == '__main__':
    app.run(port=3000)
