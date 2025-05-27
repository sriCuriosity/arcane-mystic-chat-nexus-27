# project title

---chatbot

## Project Description

(chatbot) is an advanced conversational AI application designed to provide intelligent, context-aware interactions with users. This project combines a powerful Python backend API with a modern React and TypeScript frontend to deliver a seamless chat experience. The backend handles natural language understanding and intent processing, while the frontend offers a responsive and user-friendly interface.

---

## Newly Added Features

1. 🎯 **Immersive Domain Selector UI**  
   Visual selection of 4 domains:  
   🧠 Deep Research  
   💰 Finance  
   🧘‍♀️ Health  
   🎨 Fun/Creative  
   Interactive UI with node-style selector.

New in our Project: Most AI tools don't offer domain entry via immersive visual navigation.

2. 🧠 **Smart Filters by Intention**  
   Custom intent filters like:  
   🔍 “2 Mark Answers”  
   📝 “Exam Prep”  
   🎨 “Creative”  
   👨‍💻 “Code Help”  
   Users can add new filters dynamically.

New in our Project: Perplexity Sonar does not support custom user-defined filters or intent refinement like this.

3. 🧍‍♂️ **Multiple Personas**  
   AI personas include:  
   🕵️ Detective (for logic-based help)  
   👩‍🏫 Teacher (for educational support)  
   🎭 Funny/Friendly  
   🎤 Motivator  
   🎓 Professional (Career-focused)  
   🧠 Psychologist  
   ✨ Poetic

New in our Project: Each persona has a unique style, purpose, and emotional tone. No existing AI assistant supports this level of customization.

4.  **Personas by Age Group 👶👦🧑👴**  
    Tailored conversations for:  
    Kids  
    Teens  
    Adults  
    Seniors

New in our Project: Age-specific tone, vocabulary, and support based on user maturity — a first-of-its-kind feature.

5. 🖼️ **Library Modal for Image Access**  
   Built-in modal window to browse images visually.  
   Helps in storytelling, concept learning, and media-rich tasks.

New in our Project: Enhances multimedia learning; missing in Perplexity or standard chat UIs.

6. 🔊 **Text-to-Voice with Character Voices**  
   Each persona speaks with a unique voice.  
   Adds human-like emotion and personality to interactions.

New in our Project: Goes beyond generic TTS; emotional, character-driven vocal output.

7. 🌙🌞 **Dark / Light Theme Support**  
   UI theme switcher based on mood or time of day.  
   Improves user comfort and accessibility.

New in our Project: Most AI tools are locked in a single theme; this adds user control and aesthetic appeal.

---

## Why These Technologies Were Used

- **Python (Backend):** Selected for its extensive libraries and frameworks supporting AI and natural language processing, enabling efficient development of backend APIs.
- **Flask (or similar Python framework):** Facilitates building lightweight and scalable RESTful APIs for handling chatbot logic.
- **React + TypeScript (Frontend):** Offers a powerful, type-safe environment to build dynamic, reusable UI components with excellent developer tooling and maintainability.
- **Vite:** Chosen for its fast build times and hot module replacement, improving frontend development speed and experience.
- **Tailwind CSS:** Provides utility-first CSS for rapid, consistent, and responsive styling, allowing for a modern and visually appealing UI.
- **Node.js and npm:** Used for managing frontend dependencies and scripts, ensuring smooth build and deployment processes.
- **Modular Architecture:** Ensures clear separation of concerns between backend and frontend, enhancing scalability, maintainability, and ease of collaboration.

## --

## Project Structure

```
├── backend/                 # Python backend API source code
│   ├── app.py              # Main backend application entry point
│   ├── intent_api.py       # Intent recognition API module
│   ├── intent_api1.py      # Additional or experimental API module
│   └── requirements.txt    # Python dependencies
│
├── public/                  # Static assets served by the frontend
│   ├── favicon.ico         # Website favicon
│   ├── placeholder.svg     # Placeholder image
│   └── robots.txt          # Web crawler instructions
│
├── src/                     # Frontend React + TypeScript source code
│   ├── App.tsx             # Main React app component
│   ├── main.tsx            # Frontend entry point
│   ├── components/         # Reusable UI components
│   ├── contexts/           # React context providers
│   ├── hooks/              # Custom React hooks
│   ├── pages/              # Page components for routing
│   ├── services/           # API and business logic services
│   ├── types/              # TypeScript type definitions
│   ├── lib/                # Utility functions
│   ├── index.css           # Global styles
│   └── vite-env.d.ts       # Vite environment typings
│
├── README.md                # Project documentation
├── package.json             # Frontend dependencies and scripts
├── vite.config.ts           # Vite build configuration
└── tailwind.config.ts       # Tailwind CSS configuration
```

---

## Installation and Running the Project

### Prerequisites

- Node.js (v16 or higher recommended)
- Python (v3.8 or higher recommended)
- pip (Python package manager)

---

### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Create a virtual environment (optional but recommended):

```bash
python -m venv venv
```

3. Activate the virtual environment:

- On Windows:

```bash
venv\Scripts\activate
```

- On macOS/Linux:

```bash
source venv/bin/activate
```

4. Install backend dependencies:

```bash
pip install -r requirements.txt
```

5. Run the backend server:

```bash
python app.py
```

The backend API will start running, typically on `http://localhost:5000`.

---

### Frontend Setup

1. Navigate to the project root directory (if not already there):

```bash
cd ..
```

2. Install frontend dependencies:

```bash
npm install
```

3. Start the frontend development server:

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000` (or the port specified by Vite).

---

### Accessing the Application

Open your browser and navigate to:

```
http://localhost:3000
```

You should see the chatbot interface ready for interaction.

---

## Additional Notes

- For production deployment, consider building the frontend with:

```bash
npm run build
```

- Then serve the static files with a web server or integrate with the backend.

- Tailwind CSS is configured for utility-first styling; customize `tailwind.config.ts` as needed.

- The project uses TypeScript for type safety and better developer experience.
--

!

---
