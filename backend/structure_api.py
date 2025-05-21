from fastapi import FastAPI
from pydantic import BaseModel
import spacy
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.text_rank import TextRankSummarizer
import yake
import nltk

nltk.download("punkt")

app = FastAPI()

# For structuring text
nlp = spacy.load("en_core_web_sm")

class StructureRequest(BaseModel):
    text: str

def generate_synopsis(text, num_sentences=3):
    parser = PlaintextParser.from_string(text, Tokenizer("english"))
    summarizer = TextRankSummarizer()
    summary = summarizer(parser.document, num_sentences)
    return " ".join(str(sentence) for sentence in summary)

def extract_topics(text, max_keywords=5):
    kw_extractor = yake.KeywordExtractor(top=max_keywords, stopwords=None)
    keywords = kw_extractor.extract_keywords(text)
    return [kw for kw, _ in keywords]

@app.post("/structure-text")
def structure_text(req: StructureRequest):
    text = req.text

    synopsis = generate_synopsis(text)
    topics = extract_topics(text)

    doc = nlp(text)
    sentences = list(doc.sents)

    subtopic_dict = {}
    for sent in sentences:
        ents = sent.ents
        key = ents[0].text if ents else "General"
        subtopic_dict.setdefault(key, []).append(sent.text)

    return {
        "synopsis": synopsis,
        "topics": topics,
        "details": subtopic_dict,
    }
