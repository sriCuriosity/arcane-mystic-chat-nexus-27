from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
import requests
import io
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

API_KEY = os.getenv('ELEVENLABS_API_KEY', 'sk_339f0f21eed6439fcfb045260e99cb4697147ee7bdd834b6')

# Default voice mappings for different roles
VOICE_MAPPING = {
    'child': '21m00Tcm4TlvDq8ikWAM',  # Example voice ID for child
    'teen': 'AZnzlk1XvdvUeBnXmlld',   # Example voice ID for teen
    'adult': 'EXAVITQu4vr4xnSDxMaL',  # Example voice ID for adult
    'senior': 'MF3mGyEYCl7XYWbV9V6O'  # Example voice ID for senior
}

@app.route('/classify-intent', methods=['POST'])
def classify_intent():
    try:
        data = request.get_json()
        prompt = data.get('prompt')
        
        if not prompt:
            return jsonify({"error": "No prompt provided"}), 400

        # For now, return a simple intent classification
        # In a real application, you would integrate with an actual intent classification service
        return jsonify({
            "matched_intention": "general_conversation",
            "confidence": 0.8,
            "recommended_tools": [
                {
                    "name": "chat",
                    "description": "General conversation tool",
                    "confidence": 0.8
                }
            ]
        })

    except Exception as e:
        print("Intent classification error:", e)
        return jsonify({"error": "Intent classification failed", "details": str(e)}), 500

@app.route('/speak', methods=['POST'])
def speak():
    try:
        data = request.get_json()
        print("Received JSON:", data)

        text = data.get('text')
        character = data.get('character')
        
        if not text:
            return jsonify({"error": "No text provided"}), 400

        # Get voice ID based on character role or use provided voiceId
        voice_id = character.get('voiceId')
        if not voice_id and character.get('role'):
            role = character['role'].lower()
            voice_id = VOICE_MAPPING.get(role)

        if not voice_id:
            return jsonify({"error": "No valid voice ID found"}), 400

        print(f"Using voice ID: {voice_id} for role: {character.get('role', 'default')}")

        eleven_response = requests.post(
            f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}",
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