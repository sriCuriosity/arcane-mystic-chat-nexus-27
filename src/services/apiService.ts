// services/apiService.ts
import axios from "axios";

const SONAR_API_URL = "https://api.perplexity.ai/chat/completions";
// Read the API token from an environment variable
const SONAR_API_TOKEN = import.meta.env.REACT_APP_SONAR_API_TOKEN;
// Read the API URL from an environment variable
const INTENT_API_URL = "https://intent-api-ageucxh0c3bvewa5.canadacentral-01.azurewebsites.net";

export interface IntentResult {
  matched_intention: string | null;
  confidence: number;
  recommended_tools: Array<{
    name: string;
    description: string;
    confidence: number;
  }>;
}

export interface SpeechRequest {
  text: string;
  character: {
    role: string;
    voiceId: string;
  };
}

export class ApiService {
  static async classifyIntent(prompt: string): Promise<IntentResult> {
    try {
      const response = await axios.post(`${INTENT_API_URL}/classify-intent`, {
        prompt,
      });
      console.log("Intent API response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Intent classification failed:", error);
      return { matched_intention: null, confidence: 0, recommended_tools: [] };
    }
  }

  /**
   * Fetches AI response from Sonar API
   */
  static async getSonarResponse(userMessage: string, systemContent: string): Promise<string> {
    const requestPayload = {
      model: "sonar",
      messages: [
        { role: "system", content: systemContent },
        { role: "user", content: userMessage },
      ],
    };

    console.log("Sending request to Sonar AI:", requestPayload);

    const response = await fetch(SONAR_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SONAR_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestPayload),
    });

    if (!response.ok) throw new Error("Sonar API request failed");

    const data = await response.json();
    console.log("Sonar AI API response:", data);

    return data.choices?.[0]?.message?.content || "No response from Sonar AI.";
  }

  /**
   * Converts text to speech using the backend API
   */
  static async convertToSpeech(speechRequest: SpeechRequest): Promise<Blob> {
    const response = await fetch(`${INTENT_API_URL}/speak`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(speechRequest),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.details || 'Speech conversion failed');
    }

    return await response.blob();
  }
}