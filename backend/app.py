from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
import requests
import io

app = Flask(__name__)
CORS(app)

API_KEY = 'sk_339f0f21eed6439fcfb045260e99cb4697147ee7bdd834b6'
VOICE_ID = 'IRHApOXLvnW57QJPQH2P'

@app.route('/speak', methods=['POST'])
def speak():
    try:
        data = request.get_json()
        print("Received JSON:", data)

        text = data.get('text')
        if not text:
            return jsonify({"error": "No text provided"}), 400

        eleven_response = requests.post(
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

        print("ElevenLabs Status Code:", eleven_response.status_code)
        if eleven_response.status_code != 200:
            print("ElevenLabs Error:", eleven_response.text)
            return jsonify({"error": "TTS API call failed", "details": eleven_response.text}), 500

        return send_file(
            io.BytesIO(eleven_response.content),
            mimetype="audio/mpeg",
            as_attachment=False,
            download_name="speech.mp3"
        )

    except Exception as e:
        print("Server exception:", e)
        return jsonify({"error": "Server error", "details": str(e)}), 500

if __name__ == '__main__':
    app.run(port=3000)