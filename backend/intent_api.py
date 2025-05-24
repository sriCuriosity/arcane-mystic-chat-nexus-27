from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional, Union
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import torch
from collections import defaultdict
import re

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Load state-of-the-art sentence transformer model
model = SentenceTransformer('all-mpnet-base-v2')  # Best general-purpose model as of 2023

# Enhanced intention database with embeddings precomputed
intention_data = [
    {
        "intention": "Creating Memes or Marketing Content",
        "tools": ["Meme Templates", "Branding Checklist", "Image Editing Shortcuts", "Color Palette Generator", "Font Pairing Guide", "Royalty-Free Image Libraries", "Content Calendar Template", "Swipe File", "Thumbnail Templates", "Hashtag Lists"],
        "embedding": None
    },
    {
        "intention": "Editing and Proofreading Text",
        "tools": ["Style Guide PDF", "Proofreading Checklist", "Readability Score Tools", "Common Error List", "Text-to-Speech Tools", "Redundancy List", "Consistency Tracker", "PDF Markup Guides"],
        "embedding": None
    },
    {
        "intention": "Improving Grammar and Vocabulary",
        "tools": ["Flashcard Decks", "Grammar Cheat Sheets", "Daily Writing Prompts", "Vocabulary Tracker", "Common Mistake Guides", "Idiom Dictionary", "Root Word List", "Synonym Wheels", "Grammar Quizzes", "Word-of-the-Day Calendar"],
        "embedding": None
    },
    {
        "intention": "Personalizing Learning",
        "tools": ["Learning Style Quiz PDF", "Goal-Setting Template", "Resource Library", "Progress Tracker", "Reflection Journal Template", "Skill Tree Diagram", "Time Audit Sheet", "Bookmark Organizer", "Note-Taking Templates", "Reward System Chart"],
        "embedding": None
    },
    {
        "intention": "Learning New Skills",
        "tools": ["Skill Roadmap PDF", "Project Checklist", "Resource Kit", "30-Day Challenge Calendar", "Troubleshooting Guide", "Project Templates", "Skill Assessment Quiz", "Habit Tracker", "Feedback Template", "Pomodoro Sheet"],
        "embedding": None
    },
    {
        "intention": "Creating Memes/Marketing Content (Enhanced)",
        "tools": ["Meme Template Gallery", "Brand Color Palette", "Hashtag Bank", "Caption Formulas", "Thumbnail Cheat Sheet", "Royalty-Free Image Links"],
        "embedding": None
    },
    {
        "intention": "Editing/Proofreading Text (Enhanced)",
        "tools": ["Common Error Alerts", "Readability Score", "Tone Checker", "Redundancy Remover", "Consistency Flag", "Passive Voice Alert"],
        "embedding": None
    },
    {
        "intention": "Improving Grammar/Vocabulary (Enhanced)",
        "tools": ["Vocab Flashcard", "Grammar Rule Cards", "Daily Word Challenge", "Mnemonic Generator", "Synonym Wheel", "Error Quiz"],
        "embedding": None
    },
    {
        "intention": "Personalizing Learning (Enhanced)",
        "tools": ["Learning Style Quiz", "Goal Tracker", "Resource Kit", "Progress Bar", "Habit Streak", "Custom Study Plan"],
        "embedding": None
    },
    {
        "intention": "Learning New Skills (Enhanced)",
        "tools": ["Project Idea Bank", "Cheat Sheet", "30-Day Challenge", "Expert Tip"],
        "embedding": None
    },
    {
        "intention": "Prioritizing Tasks or Overcoming Procrastination",
        "tools": ["Eisenhower Matrix", "Time Blocking Planner", "2-Minute Rule Prompt", "Priority Ranking", "Procrastination Triggers List", "Pomodoro Timer Link", "Reward System"],
        "embedding": None
    },
    {
        "intention": "Seeking Encouragement or Motivation",
        "tools": ["Progress Celebrator", "Motivational Quote Bank", "Streak Tracker", "Failure Reframer", "Energy Check-In", "Vision Board Snippets", "Self-Care Nudge"],
        "embedding": None
    },
    {
        "intention": "Providing Feedback on Assignments",
        "tools": ["Rubric Shortcut", "Glow & Grow Template", "Plagiarism Check Link", "Tone Adjuster", "Wordiness Score", "Structure Feedback"],
        "embedding": None
    },
    {
        "intention": "Simulating Characters for Games/Stories",
        "tools": ["Character Profile Template", "Archetype Bank", "Motivation Generator", "Relationship Web Map", "Appearance Builder", "Voice Test", "Alignment Chart"],
        "embedding": None
    },
    {
        "intention": "Exploring Philosophical/Ethical Questions",
        "tools": ["Thought Experiment Primer", "Ethical Framework Guide", "Quote Analyzer", "Argument Structure", "Fallacy Identifier", "Philosophy Glossary", "Historical Context"],
        "embedding": None
    },
    {
        "intention": "Generating Fictional Characters, Worlds, or Societies",
        "tools": ["Character Trait Generator", "World-Building Checklist", "Society Structure Template", "Magic/Technology System Builder", "Dialogue Style Guide", "Conflict Scenario Bank", "Species/Race Creator", "Faction Template"],
        "embedding": None
    },
    {
        "intention": "Planning Travel Itineraries",
        "tools": ["Day-by-Day Planner", "Packing Checklist", "Local Experience Guide", "Transportation Matrix", "Souvenir Tracker"],
        "embedding": None
    },
    {
        "intention": "Providing Shopping Advice or Product Comparisons",
        "tools": ["Pros vs. Cons Table", "Durability Score", "User Review Summary", "Sustainability Check", "Deal Tracker", "Use-Case Matcher", "Return Policy Cheat Sheet"],
        "embedding": None
    },
    {
        "intention": "Simplifying or Rewriting Complex Texts",
        "tools": ["Visual Analogy", "Readability Score", "Chunking Tool"],
        "embedding": None
    },
    {
        "intention": "Entertainment (Jokes, Stories, Games)",
        "tools": ["Joke Formula Templates", "Trivia Question Bank", "Role-Playing Scenario", "Puzzle Generator", "Mini-Game Rules", "Plot Twist Generator", "Choose-Your-Own-Adventure"],
        "embedding": None
    },
    {
        "intention": "Creating Lesson Plans",
        "tools": ["Lesson Objective Builder", "Activity Bank", "Timeline Scheduler", "Assessment Rubric", "Differentiation Guide", "Resource Links", "Homework Generator"],
        "embedding": None
    },
    {
        "intention": "Creating Scripts for Videos/Podcasts",
        "tools": ["Script Outline Template", "Hook Generator", "Dialogue Flowchart", "SEO Keyword Injector", "Tone Guide", "Call-to-Action Library", "Timing Calculator"],
        "embedding": None
    },
    {
        "intention": "Generating AI Art Prompts",
        "tools": ["Style Modifiers", "Mood Descriptors", "Composition Hacks", "Artist Reference Prompts", "Iteration Tracker"],
        "embedding": None
    },
    {
        "intention": "Designing User Interfaces",
        "tools": ["Wireframe Skeleton", "Color Palette Generator", "Component Library", "User Flow Map", "Accessibility Checklist", "Style Guide Template"],
        "embedding": None
    },
    {
        "intention": "Prototyping Software Tools",
        "tools": ["Clickable Mockup Links", "User Feedback Form", "Edge Case Simulator", "Version Comparison", "Performance Metrics"],
        "embedding": None
    },
    {
        "intention": "Writing Technical Documentation",
        "tools": ["API Reference Template", "Jargon Glossary", "Troubleshooting Guide", "Step-by-Step Tutorial", "Version History Log", "Visual Aid Integrator"],
        "embedding": None
    },
    {
        "intention": "Writing Essays Reports or Academic Papers (Overview Users)",
        "tools": ["AI Essay Builder Wizard", "Paragraph Expander", "Thesis Statement Generator", "Outline-to-Essay Converter", "Citation & Reference Formatter"],
        "embedding": None
    },
    {
        "intention": "Writing Essays Reports or Academic Papers (Deep Users)",
        "tools": ["Topic-Aware Essay Generation Using Fine-Tuned GPT", "Transformer-Based Section Generator", "Academic Style Transfer via Prompt Engineering", "Citation-Aware Essay Composer with RAG", "Multi-Modal Essay Drafting Assistant"],
        "embedding": None
    },
    {
        "intention": "Advanced Code Learning and Analysis (Deep Learners)",
        "tools": ["Step-by-Step Code Explanation", "Algorithm Optimization Suggestions", "Code Profiling & Bottleneck Identification", "Auto-Generate Unit Tests & Documentation", "Experiment with Code Variants"],
        "embedding": None
    },
    {
        "intention": "Practicing Conversation in Different Languages (Overview Users)",
        "tools": ["Roleplay Chatbots", "Daily Language Prompts", "Translation Flip Game", "Picture-Based Conversations", "Click-and-Listen Language Practice"],
        "embedding": None
    },
    {
        "intention": "Practicing Conversation in Different Languages (Deep Learning Users)",
        "tools": ["Multilingual Dialogue Agent with Context Memory", "Accent and Dialect Simulation", "Grammar Error Detection and Correction (Bi-Lingual)", "Voice-to-Text + TTS Feedback Loop", "Role-Based Scenarios with Multimodal Input"],
        "embedding": None
    },
    {
        "intention": "Summarizing Books and Articles (Skim Mode - Overview Users)",
        "tools": ["One Page Summary", "Animated Summary Video", "Bullet Point Summary"],
        "embedding": None
    },
    {
        "intention": "Summarizing Books and Articles (Skim Mode - Deep Learning)",
        "tools": ["Audio Summary", "Mind Map View"],
        "embedding": None
    },
    {
        "intention": "Summarizing Books and Articles (Dive Deep Mode)",
        "tools": ["Timer and Difficulty Indicator", "Meaning Translator in Reference to Book", "Make Your Own Notes", "Interactive Quiz", "Character Profiles", "Chapter-wise Notes with Thematic Messages"],
        "embedding": None
    },
    {
        "intention": "Studying for Exams",
        "tools": ["Custom Study Plan", "Flashcard Decks", "Pomodoro Sheet/Timer", "Skill Assessment Quiz", "Progress Tracker", "Resource Kit"],
        "embedding": None
    },
    {
        "intention": "Creative Writing",
        "tools": ["Character Profile Template", "Plot Twist Generator", "Dialogue Style Guide", "Writing Prompts", "Story Structure Templates"],
        "embedding": None
    },
    {
        "intention": "Language Translation",
        "tools": ["Translation Flip Game", "Grammar Error Detection", "Context-Aware Translation", "Cultural Context Guides"],
        "embedding": None
    },
    {
        "intention": "Math Problem Solving",
        "tools": ["Step-by-Step Solutions", "Formula Reference Sheets", "Practice Problem Generator", "Visual Math Explanations"],
        "embedding": None
    },
    {
        "intention": "Research and Fact-Checking",
        "tools": ["Source Verification Tools", "Citation Generator", "Research Methodology Guides", "Fact-Check Templates"],
        "embedding": None
    },
    {
        "intention": "Cooking and Recipe Assistance",
        "tools": ["Recipe Converter", "Substitution Guide", "Cooking Timer", "Nutritional Calculator", "Meal Planning Templates"],
        "embedding": None
    },
    {
        "intention": "Fitness and Health Planning",
        "tools": ["Workout Planner", "Progress Tracker", "Nutrition Guide", "Goal Setting Templates", "Exercise Library"],
        "embedding": None
    },
    {
        "intention": "Financial Planning and Budgeting",
        "tools": ["Budget Templates", "Expense Tracker", "Investment Calculator", "Debt Payoff Planner", "Financial Goal Tracker"],
        "embedding": None
    },
    {
        "intention": "Home Organization and Cleaning",
        "tools": ["Cleaning Checklists", "Organization Systems", "Decluttering Guides", "Maintenance Schedules", "Storage Solutions"],
        "embedding": None
    },
    {
        "intention": "Pet Care and Training",
        "tools": ["Training Schedules", "Health Tracking", "Behavior Guides", "Feeding Calculators", "Vet Appointment Trackers"],
        "embedding": None
    },
    {
        "intention": "Gardening and Plant Care",
        "tools": ["Planting Calendars", "Watering Schedules", "Plant Care Guides", "Garden Layout Planners", "Pest Identification"],
        "embedding": None
    },
    {
        "intention": "DIY and Home Improvement",
        "tools": ["Project Planners", "Tool Lists", "Safety Checklists", "Material Calculators", "Step-by-Step Guides"],
        "embedding": None
    },
    {
        "intention": "Photography and Image Editing",
        "tools": ["Composition Guides", "Editing Tutorials", "Equipment Recommendations", "Photo Organization Systems", "Lighting Tips"],
        "embedding": None
    },
    {
        "intention": "Music Learning and Practice",
        "tools": ["Practice Schedules", "Chord Charts", "Metronome Tools", "Progress Trackers", "Song Libraries"],
        "embedding": None
    },
    {
        "intention": "Event Planning and Organization",
        "tools": ["Event Checklists", "Timeline Templates", "Budget Planners", "Guest Management", "Vendor Comparison Sheets"],
        "embedding": None
    },
    {
        "intention": "Job Search and Career Development",
        "tools": ["Resume Templates", "Interview Preparation", "Skill Assessment", "Networking Guides", "Career Path Planners"],
        "embedding": None
    },
    {
        "intention": "Small Business Management",
        "tools": ["Business Plan Templates", "Marketing Strategies", "Financial Tracking", "Customer Management", "Inventory Systems"],
        "embedding": None
    },
    {
        "intention": "Mental Health and Wellness",
        "tools": ["Mood Trackers", "Meditation Guides", "Stress Management", "Self-Care Checklists", "Therapy Resources"],
        "embedding": None
    },
    {
        "intention": "Parenting and Child Development",
        "tools": ["Development Milestones", "Activity Ideas", "Discipline Strategies", "Educational Resources", "Health Trackers"],
        "embedding": None
    },
    {
        "intention": "Senior Care and Aging",
        "tools": ["Health Monitoring", "Safety Checklists", "Activity Planning", "Medication Management", "Support Resources"],
        "embedding": None
    }
]


# Precompute embeddings for all intentions at startup
for item in intention_data:
    item["embedding"] = model.encode(item["intention"], convert_to_tensor=True,show_progress_bar=False)

class IntentRequest(BaseModel):
    prompt: str
    threshold: Optional[float] = 0.35  # Lowered threshold for better matching

class ToolRecommendation(BaseModel):
    name: str
    description: str
    confidence: float

class AlternativeIntention(BaseModel):
    intention: str
    score: float

class IntentResponse(BaseModel):
    matched_intention: Optional[str]
    confidence: Optional[float]
    recommended_tools: List[ToolRecommendation]
    is_fallback: bool
    alternative_intentions: List[AlternativeIntention]

def preprocess_text(text: str) -> str:
    """Clean and normalize text for better matching"""
    # Convert to lowercase
    text = text.lower()
    # Remove special characters but keep important punctuation
    text = re.sub(r'[^a-z0-9\s.,!?-]', ' ', text)
    # Remove extra whitespace
    text = ' '.join(text.split())
    return text

def extract_keywords(text: str) -> List[str]:
    # Common words to exclude
    stop_words = {'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours',
                 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers',
                 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves',
                 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are',
                 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does',
                 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until',
                 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into',
                 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down',
                 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once'}
    
    # Split text into words and filter out stop words
    words = text.lower().split()
    keywords = [word for word in words if word not in stop_words and len(word) > 2]
    return keywords

def calculate_context_similarity(query: str, intention: str, tools: List[str]) -> float:
    
    # Combine intention and tools for context
    context = f"{intention} {' '.join(tools)}"
    
    # Get embeddings
    query_embedding = model.encode(query, convert_to_tensor=True)
    context_embedding = model.encode(context, convert_to_tensor=True)
    
    # Calculate similarity
    similarity = cosine_similarity(
        query_embedding.reshape(1, -1),
        context_embedding.reshape(1, -1)
    )[0][0]
    
    return float(similarity)

def semantic_search(query: str, intentions: List[Dict], threshold: float) -> Dict:
    """Enhanced semantic search with context awareness and keyword matching"""
    try:
        # Preprocess query
        processed_query = preprocess_text(query)
        query_keywords = extract_keywords(processed_query)
        
        similarities = []
        for item in intentions:
            # Basic semantic similarity
            base_similarity = cosine_similarity(
                model.encode(processed_query, convert_to_tensor=True).reshape(1, -1),
                item["embedding"].cpu().numpy().reshape(1, -1)
            )[0][0]
            
            # Context similarity
            context_similarity = calculate_context_similarity(
                processed_query,
                item["intention"],
                item["tools"]
            )
            
            keyword_matches = sum(1 for keyword in query_keywords 
                                if keyword in item["intention"].lower() or 
                                any(keyword in tool.lower() for tool in item["tools"]))
            keyword_bonus = min(0.1, keyword_matches * 0.02)  # Max 10% bonus
            
            # Combined score with weights
            final_score = (base_similarity * 0.6 + context_similarity * 0.4) + keyword_bonus
            
            similarities.append((item["intention"], final_score, item["tools"]))
        
        # Sort by similarity
        similarities.sort(key=lambda x: x[1], reverse=True)
        
        # Get top matches
        top_matches = similarities[:3]
        
        # If no matches above threshold, return top match with fallback
        if top_matches[0][1] < threshold:
            return {
                "matched_intention": top_matches[0][0],
                "confidence": float(top_matches[0][1]),
                "tools": top_matches[0][2],
                "is_fallback": True,
                "alternatives": [
                    {"intention": intent, "score": float(score)}
                    for intent, score, _ in top_matches[1:]
                ]
            }
        
        return {
            "matched_intention": top_matches[0][0],
            "confidence": float(top_matches[0][1]),
            "tools": top_matches[0][2],
            "is_fallback": False,
            "alternatives": [
                {"intention": intent, "score": float(score)}
                for intent, score, _ in top_matches[1:]
            ]
        }
    except Exception as e:
        print(f"Error in semantic search: {str(e)}")
        return {
            "matched_intention": None,
            "confidence": 0.0,
            "is_fallback": True,
            "alternatives": []
        }

@app.post("/classify-intent", response_model=IntentResponse)
async def classify_intent(request: IntentRequest):
    result = semantic_search(request.prompt, intention_data, request.threshold)
    
    if result["is_fallback"]:
        return IntentResponse(
            matched_intention=None,
            confidence=result["confidence"],
            recommended_tools=[],
            is_fallback=True,
            alternative_intentions=[]
        )
    
    # Prepare tool recommendations
    tools = []
    for tool_name in result["tools"][:3]:  # Top 3 tools
        tools.append(ToolRecommendation(
            name=tool_name,
            description=tools_database.get(tool_name, "Description not available"),
            confidence=min(1.0, result["confidence"] * 0.9)  # Slightly lower than intent confidence
        ))
    
    return IntentResponse(
        matched_intention=result["matched_intention"],
        confidence=result["confidence"],
        recommended_tools=tools,
        is_fallback=False,
        alternative_intentions=result["alternatives"]
    )

# Example tools database (should be complete)
tools_database = {
    # Creating Memes or Marketing Content
    "Meme Templates": "Pre-designed Canva/Adobe Spark templates for quick meme creation",
    "Branding Checklist": "A PDF checklist for consistency (fonts, colors, tone)",
    "Image Editing Shortcuts": "Cheat sheets for GIMP/Pixlr tools (e.g., layers, filters)",
    "Color Palette Generator": "Use Coolors.co to save hex codes for brand colors",
    "Font Pairing Guide": "A visual PDF of complementary fonts (e.g., Google Fonts)",
    "Royalty-Free Image Libraries": "Bookmark sites like Unsplash/Pexels for quick access",
    "Content Calendar Template": "A Google Sheets grid for scheduling posts",
    "Swipe File": "A folder of screenshots/PDFs for inspiration (ads, captions, designs)",
    "Thumbnail Templates": "Pre-sized YouTube/Instagram thumbnail designs in Canva",
    "Hashtag Lists": "Organized spreadsheets of niche hashtags for social media",
    
    # Editing and Proofreading Text
    "Style Guide PDF": "Downloadable AP/Chicago Manual rules for quick reference",
    "Proofreading Checklist": "A step-by-step list (grammar, punctuation, flow)",
    "Readability Score Tools": "Hemingway Editor's readability stats for clarity",
    "Common Error List": "A cheat sheet of frequent mistakes (e.g., your/you're)",
    "Text-to-Speech Tools": "Use NaturalReader to listen for awkward phrasing",
    "Redundancy List": "A PDF of phrases to avoid (e.g., 'absolutely essential')",
    "Consistency Tracker": "Spreadsheet to track terms (e.g., UK vs. US spelling)",
    "PDF Markup Guides": "Shortcuts for Adobe Acrobat's comment/highlight tools",
    
    # Improving Grammar and Vocabulary
    "Flashcard Decks": "Pre-made Anki decks for SAT/GRE vocabulary",
    "Grammar Cheat Sheets": "One-page PDFs for tenses, prepositions, articles",
    "Daily Writing Prompts": "A printable list of 30 prompts for practice",
    "Vocabulary Tracker": "Google Sheets template to log new words + examples",
    "Common Mistake Guides": "PDFs targeting errors (e.g., affect vs. effect)",
    "Idiom Dictionary": "A curated PDF of idioms with meanings/examples",
    "Root Word List": "Greek/Latin roots with definitions (e.g., 'bio' = life)",
    "Synonym Wheels": "Visual charts of word alternatives (e.g., 'happy')",
    "Grammar Quizzes": "Printable worksheets with answer keys",
    "Word-of-the-Day Calendar": "A PDF calendar with daily vocabulary",
    
    # Personalizing Learning
    "Learning Style Quiz PDF": "Self-assessment to identify visual/auditory preferences",
    "Goal-Setting Template": "A Notion/Google Docs table for SMART goals",
    "Resource Library": "A Notion database of bookmarked articles/videos",
    "Progress Tracker": "A Google Sheets bar chart for skill milestones",
    "Reflection Journal Template": "Prompts for weekly learning reviews",
    "Skill Tree Diagram": "A visual roadmap of sub-skills to master (e.g., coding)",
    "Time Audit Sheet": "Track daily activities to optimize study hours",
    "Bookmark Organizer": "Use Raindrop.io to tag/categorize learning links",
    "Note-Taking Templates": "Customizable layouts for Cornell/outline methods",
    "Reward System Chart": "A printable sticker chart for achieving mini-goals",
    
    # Learning New Skills
    "Skill Roadmap PDF": "Step-by-step guides (e.g., 'Learn Python in 6 Months')",
    "Project Checklist": "Break skills into projects (e.g., 'Build a website')",
    "Resource Kit": "Curated PDFs/links for free courses (Coursera, YouTube)",
    "30-Day Challenge Calendar": "A printable calendar with daily tasks",
    "Troubleshooting Guide": "Common errors + fixes for coding/DIY skills",
    "Project Templates": "Pre-designed Figma/Excel templates for practice",
    "Skill Assessment Quiz": "A self-test to gauge baseline knowledge",
    "Habit Tracker": "A Google Sheets grid to log daily practice",
    "Feedback Template": "A Google Form to collect peer reviews on projects",
    "Pomodoro Sheet": "Printable timetables for focused skill-building sessions",
    
    # Prioritizing Tasks or Overcoming Procrastination
    "Eisenhower Matrix": "Quadrant-based grid (Urgent/Important) for task sorting",
    "Time Blocking Planner": "Pre-formatted hourly schedule templates",
    "2-Minute Rule Prompt": "If it takes <2 mins, do it now ⏱️",
    "Priority Ranking": "Simple 1-5 scale labels (e.g., '🔥 High Priority')",
    "Procrastination Triggers List": "Common causes (e.g., fear of failure) + fixes",
    "Pomodoro Timer Link": "Pre-set timers for 25/5-minute cycles",
    "Reward System": "'Complete X → Reward Y' templates",
    
    # Seeking Encouragement or Motivation
    "Progress Celebrator": "Auto-highlight milestones (e.g., '50% done! 🎉')",
    "Motivational Quote Bank": "Categorized by themes (perseverance, creativity)",
    "Streak Tracker": "Visual counter (e.g., '🔥 7-Day Streak!')",
    "Failure Reframer": "Positive spins (e.g., 'Mistakes = Learning 📈')",
    "Energy Check-In": "Rate your focus [🟩🟩⬜⬜⬜] → Take a break?",
    "Vision Board Snippets": "Imagery/text snippets for goal visualization",
    "Self-Care Nudge": "Hydrate 🚰 | Stretch 🧘 | Breathe 🌬️",
    
    # Providing Feedback on Assignments
    "Rubric Shortcut": "Pre-defined criteria (e.g., 'Clarity: 4/5 ✅')",
    "Glow & Grow Template": "🌟 Strength: ... | 🌱 Improvement: ...",
    "Plagiarism Check Link": "Quick scan tool integration",
    "Tone Adjuster": "Suggestions (e.g., 'More formal/professional 📜')",
    "Wordiness Score": "Reduce 20% for conciseness ✂️",
    "Structure Feedback": "Intro ✅ | Body ➡️ Expand | Conclusion ❌ Missing",
    
    # Simulating Characters for Games/Stories
    "Character Profile Template": "Name, backstory, traits, flaws",
    "Archetype Bank": "Hero 🦸, Mentor 🧙, Villain 😈",
    "Motivation Generator": "Goal: Revenge | Fear: Failure",
    "Relationship Web Map": "Visualize character connections",
    "Appearance Builder": "Hair: wild | Scar: left cheek 🔪",
    "Voice Test": "How would they say 'Hello'? 🗣️",
    "Alignment Chart": "Lawful/Neutral/Chaotic + Good/Neutral/Evil",
    
    # Exploring Philosophical/Ethical Questions
    "Thought Experiment Primer": "Trolley Problem 🚃, Ship of Theseus ⛵",
    "Ethical Framework Guide": "Utilitarianism ⚖️, Deontology 📜, Virtue Ethics 🌟",
    "Quote Analyzer": "Nietzsche: 'What doesn't kill you...' → Discuss 💬",
    "Argument Structure": "Premise + Conclusion breakdown",
    "Fallacy Identifier": "Ad hominem ⚠️ | Strawman 🎭",
    "Philosophy Glossary": "Terms (e.g., 'Existentialism') + definitions",
    "Historical Context": "Link ideas to eras (e.g., Stoicism → Ancient Rome 🏛️)",
    
    # Generating Fictional Characters, Worlds, or Societies
    "Character Trait Generator": "Randomized lists of quirks, flaws, and motivations",
    "World-Building Checklist": "Geography, politics, culture, religion, technology",
    "Society Structure Template": "Hierarchy, laws, economy, conflicts",
    "Magic/Technology System Builder": "Rules, limitations, and consequences",
    "Dialogue Style Guide": "Formal, slang, or era-specific speech patterns",
    "Conflict Scenario Bank": "Wars, betrayals, natural disasters",
    "Species/Race Creator": "Biology, culture, and societal roles",
    "Faction Template": "Goals, allies, enemies, symbols",
    
    # Planning Travel Itineraries
    "Day-by-Day Planner": "Hourly activity slots with travel time estimates",
    "Packing Checklist": "Essentials sorted by climate/activity (e.g., beach vs. hiking)",
    "Local Experience Guide": "Must-try foods, festivals, hidden gems",
    "Transportation Matrix": "Compare trains, buses, rentals, or rideshares",
    "Souvenir Tracker": "Budget and space for gifts/keepsakes",
    
    # Providing Shopping Advice or Product Comparisons
    "Pros vs. Cons Table": "Side-by-side comparison of features",
    "Durability Score": "Material quality, warranty, brand reputation",
    "User Review Summary": "Aggregated ratings for ease of use, longevity",
    "Sustainability Check": "Eco-friendly materials, ethical sourcing",
    "Deal Tracker": "Price history, seasonal discounts, coupon codes",
    "Use-Case Matcher": "'Best for X' labels (e.g., 'gaming' vs. 'office work')",
    "Return Policy Cheat Sheet": "Time limits, restocking fees, conditions",
    
    # Simplifying or Rewriting Complex Texts
    "Visual Analogy": "Explain concepts using metaphors (e.g., 'DNS is a phonebook')",
    "Readability Score": "Simplify to a target grade level (e.g., Grade 8)",
    "Chunking Tool": "Split long paragraphs into digestible sections",
    
    # Entertainment (Jokes, Stories, Games)
    "Joke Formula Templates": "Setup + punchline structures (e.g., puns, wordplay)",
    "Trivia Question Bank": "Fun facts with multiple-choice answers",
    "Role-Playing Scenario": "Premise, characters, and conflicts for improvisation",
    "Puzzle Generator": "Riddles, logic puzzles, or escape-room challenges",
    "Mini-Game Rules": "Quick card/dice games (e.g., 'Roll for initiative')",
    "Plot Twist Generator": "Random unexpected events (e.g., 'The mentor is the villain!')",
    "Choose-Your-Own-Adventure": "Decision branches (e.g., 'Go left → page 2')",
    
    # Creating Lesson Plans
    "Lesson Objective Builder": "SMART goal templates (Specific, Measurable, Achievable)",
    "Activity Bank": "Quick engagement ideas (discussions, quizzes, group work)",
    "Timeline Scheduler": "Minute-by-minute breakdowns for class time",
    "Assessment Rubric": "Grading criteria for projects/exams",
    "Differentiation Guide": "Adapt activities for skill levels (e.g., ESL, advanced)",
    "Resource Links": "Curated videos, articles, or worksheets",
    "Homework Generator": "Practice questions aligned to objectives",
    
    # Creating Scripts for Videos/Podcasts
    "Script Outline Template": "Intro, segments, transitions, outro",
    "Hook Generator": "Attention-grabbing opening lines (e.g., 'Did you know...?')",
    "Dialogue Flowchart": "Visualize speaker interactions",
    "SEO Keyword Injector": "Optimize scripts for search algorithms",
    "Tone Guide": "Match voice (formal, humorous, conversational)",
    "Call-to-Action Library": "'Subscribe,' 'Visit our site,' etc.",
    "Timing Calculator": "Word count ↔ runtime estimates",
    
    # Generating AI Art Prompts
    "Style Modifiers": "Keywords (e.g., 'cyberpunk,' 'watercolor,' 'isometric')",
    "Mood Descriptors": "'Serene,' 'chaotic,' 'nostalgic.'",
    "Composition Hacks": "Rule of thirds, leading lines, negative space",
    "Artist Reference Prompts": "'In the style of Van Gogh 🎨.'",
    "Iteration Tracker": "Compare prompt versions and outputs",
    
    # Designing User Interfaces
    "Wireframe Skeleton": "Basic layout grids (header, body, footer)",
    "Color Palette Generator": "Accessible contrast ratios + hex codes",
    "Component Library": "Buttons, forms, icons, menus",
    "User Flow Map": "Steps for navigation (e.g., signup → dashboard)",
    "Accessibility Checklist": "Alt text, keyboard navigation, ARIA labels",
    "Style Guide Template": "Typography, spacing, hover states",
    
    # Prototyping Software Tools
    "Clickable Mockup Links": "Tools like Figma/Adobe XD for interactive demos",
    "User Feedback Form": "Template questions for usability testing",
    "Edge Case Simulator": "'What if the user inputs invalid data?'",
    "Version Comparison": "Side-by-side prototypes (A/B testing)",
    "Performance Metrics": "Load times, responsiveness checks",
    
    # Writing Technical Documentation
    "API Reference Template": "Endpoints, parameters, examples",
    "Jargon Glossary": "Simplify terms (e.g., 'RESTful API → web service rules')",
    "Troubleshooting Guide": "Error codes + solutions",
    "Step-by-Step Tutorial": "Code snippets with annotations",
    "Version History Log": "Track updates/changes",
    "Visual Aid Integrator": "Screenshots, diagrams, GIFs",
    
    # Writing Essays Reports or Academic Papers
    "AI Essay Builder Wizard": "Guided form for topic, tone, and key points to generate full essays",
    "Paragraph Expander": "Develops short ideas into full academic paragraphs",
    "Thesis Statement Generator": "Creates 2-3 thesis statements for essay topics",
    "Outline-to-Essay Converter": "Converts bullet-point outlines into complete essays",
    "Citation & Reference Formatter": "Formats sources in APA, MLA, or Chicago style",
    "Topic-Aware Essay Generation": "Fine-tuned GPT for domain-specific academic writing",
    "Transformer-Based Section Generator": "Generates essays section-by-section maintaining logical flow",
    "Academic Style Transfer": "Converts informal input into academic tone",
    "Citation-Aware Essay Composer": "RAG system that fetches real-time academic references",
    "Multi-Modal Essay Drafting Assistant": "Converts diagrams/mind maps into structured essay text",
    
    # Advanced Code Learning and Analysis
    "Step-by-Step Code Explanation": "Breaks down complex code into logical chunks with detailed explanations",
    "Algorithm Optimization Suggestions": "Analyzes code and suggests performance improvements",
    "Code Profiling & Bottleneck Identification": "Identifies bottlenecks and inefficient sections",
    "Auto-Generate Unit Tests & Documentation": "Generates thorough unit tests and documentation",
    "Experiment with Code Variants": "Provides alternative implementations using different paradigms",
    
    # Practicing Conversation in Different Languages
    "Roleplay Chatbots": "Chat with AI characters in different scenarios and languages",
    "Daily Language Prompts": "Daily sentences/phrases/situations for language practice",
    "Translation Flip Game": "Interactive translation and conversational practice",
    "Picture-Based Conversations": "Visual prompts for language description and roleplay",
    "Click-and-Listen Language Practice": "Audio clips for listening comprehension practice",
    "Multilingual Dialogue Agent": "Multi-turn conversation system with context memory",
    "Accent and Dialect Simulation": "Regional dialects and accent variations",
    "Grammar Error Detection and Correction": "Real-time feedback with grammatical corrections",
    "Voice-to-Text + TTS Feedback Loop": "Conversational feedback loop with speech recognition",
    "Role-Based Scenarios with Multimodal Input": "Immersive scenarios with visual and text input",
    
    # Summarizing Books and Articles
    "One Page Summary": "PDF-style compact summary with title, author, themes and overall concept",
    "Animated Summary Video": "Short video explanations under 3 minutes with YouTube links",
    "Bullet Point Summary": "Condensed version in short bullet points for quick glance",
    "Audio Summary": "2-3 minute narration for auditory learners",
    "Mind Map View": "Visual layout of key ideas, characters, and plot flow",
    "Timer and Difficulty Indicator": "Expected completion time and difficulty level",
    "Meaning Translator": "Context-specific meaning lookup within the book",
    "Make Your Own Notes": "Editable notepad for personal notes and references",
    "Interactive Quiz": "Chapter-based quizzes to promote active learning",
    "Character Profiles": "Detailed descriptions and evolution of key characters",
    "Chapter-wise Notes with Thematic Messages": "Chapter summaries with symbolism and author's message breakdowns"
}
